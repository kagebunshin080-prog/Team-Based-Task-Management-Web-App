import { Router } from 'express';
import { pool } from '../db.js';
import { uid } from '../lib/id.js';
import { serializeTeam } from '../lib/serialize.js';

export const teamsRouter = Router();

const LIST_SQL = `
  SELECT t.id, t.name, t.prefix,
         COALESCE(array_agg(tm.member_id) FILTER (WHERE tm.member_id IS NOT NULL), '{}') AS member_ids
  FROM teams t
  LEFT JOIN team_members tm ON tm.team_id = t.id
  GROUP BY t.id
  ORDER BY t.name;
`;

teamsRouter.get('/', async (_req, res, next) => {
  try {
    const result = await pool.query(LIST_SQL);
    res.json(result.rows.map(serializeTeam));
  } catch (err) {
    next(err);
  }
});

teamsRouter.post('/', async (req, res, next) => {
  try {
    const { name, prefix } = req.body;
    if (!name || !prefix) {
      return res.status(400).json({ error: 'name and prefix are required' });
    }
    const id = uid('team');
    await pool.query('INSERT INTO teams (id, name, prefix) VALUES ($1, $2, $3)', [
      id,
      name,
      prefix.toUpperCase(),
    ]);
    res.status(201).json(serializeTeam({ id, name, prefix: prefix.toUpperCase(), member_ids: [] }));
  } catch (err) {
    next(err);
  }
});

teamsRouter.post('/:teamId/members/:memberId', async (req, res, next) => {
  try {
    const { teamId, memberId } = req.params;
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
    await pool.query('DELETE FROM team_members WHERE team_id = $1 AND member_id = $2', [
      teamId,
      memberId,
    ]);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
