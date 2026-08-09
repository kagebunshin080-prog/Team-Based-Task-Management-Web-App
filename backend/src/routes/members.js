import { Router } from 'express';
import { pool, withTransaction } from '../db.js';
import { uid } from '../lib/id.js';
import { serializeMember } from '../lib/serialize.js';

export const membersRouter = Router();

const PALETTE = ['#2F8F8B', '#C85A45', '#D89A34', '#3C5FDB', '#7A5FC0', '#4A9D5F'];

function initialsOf(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

membersRouter.get('/', async (_req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM members ORDER BY name');
    res.json(result.rows.map(serializeMember));
  } catch (err) {
    next(err);
  }
});

membersRouter.post('/', async (req, res, next) => {
  try {
    const { name, teamId } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });

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
