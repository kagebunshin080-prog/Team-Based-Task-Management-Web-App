import { Router } from 'express';
import { pool, withTransaction } from '../db.js';
import { uid } from '../lib/id.js';
import { hashPassword, verifyPassword, signToken, randomInviteCode } from '../lib/auth.js';
import { serializeUser, serializeTeam, serializeMember } from '../lib/serialize.js';
import { requireAuth } from '../middleware/requireAuth.js';

export const authRouter = Router();

const PALETTE = ['#2F8F8B', '#C85A45', '#D89A34', '#3C5FDB', '#7A5FC0', '#4A9D5F'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function initialsOf(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

async function uniqueInviteCode(client) {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const code = randomInviteCode();
    const existing = await client.query('SELECT 1 FROM teams WHERE invite_code = $1', [code]);
    if (existing.rowCount === 0) return code;
  }
  throw new Error('Could not generate a unique invite code');
}

// POST /api/auth/signup
// Body: { email, password, name, teamName? , inviteCode? }
// Exactly one of teamName (create a new team) or inviteCode (join an
// existing one) should be provided.
authRouter.post('/signup', async (req, res, next) => {
  try {
    const { email, password, name, teamName, inviteCode } = req.body;

    if (!email || !EMAIL_RE.test(email)) return res.status(400).json({ error: 'a valid email is required' });
    if (!password || password.length < 8) {
      return res.status(400).json({ error: 'password must be at least 8 characters' });
    }
    if (!name || !name.trim()) return res.status(400).json({ error: 'name is required' });
    if (!teamName && !inviteCode) {
      return res.status(400).json({ error: 'provide either teamName (to create a team) or inviteCode (to join one)' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await pool.query('SELECT 1 FROM users WHERE email = $1', [normalizedEmail]);
    if (existing.rowCount > 0) {
      return res.status(409).json({ error: 'an account with that email already exists' });
    }

    const passwordHash = await hashPassword(password);

    const result = await withTransaction(async (client) => {
      let team;
      if (inviteCode) {
        const teamResult = await client.query('SELECT * FROM teams WHERE invite_code = $1', [
          inviteCode.trim().toUpperCase(),
        ]);
        if (teamResult.rowCount === 0) {
          throw Object.assign(new Error('invite code not recognized'), { status: 404 });
        }
        team = teamResult.rows[0];
      } else {
        const id = uid('team');
        const prefix = teamName.trim().slice(0, 3).toUpperCase() || 'GEN';
        const code = await uniqueInviteCode(client);
        const insertResult = await client.query(
          'INSERT INTO teams (id, name, prefix, invite_code) VALUES ($1, $2, $3, $4) RETURNING *',
          [id, teamName.trim(), prefix, code],
        );
        team = insertResult.rows[0];
      }

      const userId = uid('user');
      await client.query('INSERT INTO users (id, email, password_hash, name) VALUES ($1, $2, $3, $4)', [
        userId,
        normalizedEmail,
        passwordHash,
        name.trim(),
      ]);

      const countResult = await client.query('SELECT COUNT(*)::int AS n FROM members');
      const color = PALETTE[countResult.rows[0].n % PALETTE.length];
      const memberId = uid('m');
      await client.query(
        'INSERT INTO members (id, name, initials, color, user_id) VALUES ($1, $2, $3, $4, $5)',
        [memberId, name.trim(), initialsOf(name.trim()), color, userId],
      );
      await client.query(
        'INSERT INTO team_members (team_id, member_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [team.id, memberId],
      );

      return { userId, team, memberRow: { id: memberId, name: name.trim(), initials: initialsOf(name.trim()), color } };
    });

    const token = signToken(result.userId);
    res.status(201).json({
      token,
      user: serializeUser({ id: result.userId, email: normalizedEmail, name: name.trim() }),
      team: serializeTeam({ ...result.team, member_ids: [result.memberRow.id] }),
      member: serializeMember(result.memberRow),
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
// Body: { email, password }
authRouter.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password are required' });

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.trim().toLowerCase()]);
    if (result.rowCount === 0) return res.status(401).json({ error: 'invalid email or password' });

    const user = result.rows[0];
    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'invalid email or password' });

    const token = signToken(user.id);
    res.json({ token, user: serializeUser(user) });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
authRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [req.userId]);
    if (userResult.rowCount === 0) return res.status(404).json({ error: 'user not found' });

    const teamsResult = await pool.query(
      `SELECT t.id, t.name, t.prefix, t.invite_code,
              COALESCE(array_agg(tm.member_id) FILTER (WHERE tm.member_id IS NOT NULL), '{}') AS member_ids
       FROM teams t
       JOIN team_members mine ON mine.team_id = t.id AND mine.member_id = $1
       LEFT JOIN team_members tm ON tm.team_id = t.id
       GROUP BY t.id
       ORDER BY t.name`,
      [req.memberId],
    );

    res.json({
      user: serializeUser(userResult.rows[0]),
      memberId: req.memberId,
      teams: teamsResult.rows.map(serializeTeam),
    });
  } catch (err) {
    next(err);
  }
});
