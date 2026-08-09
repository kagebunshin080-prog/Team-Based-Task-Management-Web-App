import { Router } from 'express';
import { pool } from '../db.js';
import { uid } from '../lib/id.js';
import { serializeTeam } from '../lib/serialize.js';
import { requireAuth, assertTeamMember } from '../middleware/requireAuth.js';

export const teamsRouter = Router();

teamsRouter.use(requireAuth);

const LIST_SQL = `
  SELECT t.id, t.name, t.prefix, t.invite_code,
         COALESCE(array_agg(tm.member_id) FILTER (WHERE tm.member_id IS NOT NULL), '{}') AS member_ids
  FROM teams t
  JOIN team_members mine ON mine.team_id = t.id AND mine.member_id = $1
  LEFT JOIN team_members tm ON tm.team_id = t.id
  GROUP BY t.id
  ORDER BY t.name;
`;

// Only returns teams the authenticated user actually belongs to.
teamsRouter.get('/', async (req, res, next) => {
  try {
    const result = await pool.query(LIST_SQL, [req.memberId]);
    res.json(result.rows.map(serializeTeam));
  } catch (err) {
    next(err);
  }
});

// Create an additional team; the creator is added as its first member.
teamsRouter.post('/', async (req, res, next) => {
  try {
    const { name, prefix } = req.body;
    if (!name || !prefix) {
      return res.status(400).json({ error: 'name and prefix are required' });
    }
    const id = uid('team');

    let code;
    for (let attempt = 0; attempt < 10 && !code; attempt += 1) {
      const candidate = Array.from({ length: 7 }, () =>
        'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 33)],
      ).join('');
      const existing = await pool.query('SELECT 1 FROM teams WHERE invite_code = $1', [candidate]);
      if (existing.rowCount === 0) code = candidate;
    }

    await pool.query('INSERT INTO teams (id, name, prefix, invite_code) VALUES ($1, $2, $3, $4)', [
      id,
      name,
      prefix.toUpperCase(),
      code,
    ]);
    await pool.query(
      'INSERT INTO team_members (team_id, member_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [id, req.memberId],
    );
    res.status(201).json(
      serializeTeam({ id, name, prefix: prefix.toUpperCase(), invite_code: code, member_ids: [req.memberId] }),
    );
  } catch (err) {
    next(err);
  }
});

// Join an existing team using its invite code.
teamsRouter.post('/join', async (req, res, next) => {
  try {
    const { inviteCode } = req.body;
    if (!inviteCode) return res.status(400).json({ error: 'inviteCode is required' });

    const teamResult = await pool.query('SELECT * FROM teams WHERE invite_code = $1', [
      inviteCode.trim().toUpperCase(),
    ]);
    if (teamResult.rowCount === 0) return res.status(404).json({ error: 'invite code not recognized' });
    const team = teamResult.rows[0];

    await pool.query(
      'INSERT INTO team_members (team_id, member_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [team.id, req.memberId],
    );

    const memberIdsResult = await pool.query('SELECT member_id FROM team_members WHERE team_id = $1', [
      team.id,
    ]);
    res.status(200).json(
      serializeTeam({ ...team, member_ids: memberIdsResult.rows.map((r) => r.member_id) }),
    );
  } catch (err) {
    next(err);
  }
});

teamsRouter.post('/:teamId/members/:memberId', async (req, res, next) => {
  try {
    const { teamId, memberId } = req.params;
    if (!(await assertTeamMember(teamId, req.memberId))) {
      return res.status(403).json({ error: 'not a member of this team' });
    }
    await pool.query(
      'INSERT INTO team_members (team_id, member_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [teamId, memberId],
    );
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

teamsRouter.delete('/:teamId/members/:memberId', async (req, res, next) => {
  try {
    const { teamId, memberId } = req.params;
    if (!(await assertTeamMember(teamId, req.memberId))) {
      return res.status(403).json({ error: 'not a member of this team' });
    }
    await pool.query('DELETE FROM team_members WHERE team_id = $1 AND member_id = $2', [
      teamId,
      memberId,
    ]);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
