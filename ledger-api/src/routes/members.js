import { Router } from 'express';
import { pool, withTransaction } from '../db.js';
import { uid } from '../lib/id.js';
import { serializeMember } from '../lib/serialize.js';
import { requireAuth, assertTeamMember } from '../middleware/requireAuth.js';

export const membersRouter = Router();

membersRouter.use(requireAuth);

const PALETTE = ['#2F8F8B', '#C85A45', '#D89A34', '#3C5FDB', '#7A5FC0', '#4A9D5F'];

function initialsOf(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

// Lists members of teams the authenticated user belongs to (not every
// member in the whole database).
membersRouter.get('/', async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT m.*
       FROM members m
       JOIN team_members tm ON tm.member_id = m.id
       JOIN team_members mine ON mine.team_id = tm.team_id AND mine.member_id = $1
       ORDER BY m.name`,
      [req.memberId],
    );
    res.json(result.rows.map(serializeMember));
  } catch (err) {
    next(err);
  }
});

// Adds a placeholder member (no login) to one of your teams — useful for
// assigning tasks to people who don't have an account yet.
membersRouter.post('/', async (req, res, next) => {
  try {
    const { name, teamId } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    if (teamId && !(await assertTeamMember(teamId, req.memberId))) {
      return res.status(403).json({ error: 'not a member of this team' });
    }

    const countResult = await pool.query('SELECT COUNT(*)::int AS n FROM members');
    const color = PALETTE[countResult.rows[0].n % PALETTE.length];
    const id = uid('m');
    const member = { id, name, initials: initialsOf(name), color };

    await withTransaction(async (client) => {
      await client.query('INSERT INTO members (id, name, initials, color) VALUES ($1, $2, $3, $4)', [
        member.id,
        member.name,
        member.initials,
        member.color,
      ]);
      if (teamId) {
        await client.query(
          'INSERT INTO team_members (team_id, member_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [teamId, id],
        );
      }
    });

    res.status(201).json(serializeMember(member));
  } catch (err) {
    next(err);
  }
});
