import { pool } from '../db.js';
import { verifyToken } from '../lib/auth.js';

// Verifies the bearer token, then attaches req.userId and req.memberId
// (the member profile linked to that user) for downstream routes to use.
export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization ?? '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }

    let userId;
    try {
      userId = verifyToken(token);
    } catch {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const result = await pool.query('SELECT id FROM members WHERE user_id = $1', [userId]);
    if (result.rowCount === 0) {
      return res.status(401).json({ error: 'Account no longer exists' });
    }

    req.userId = userId;
    req.memberId = result.rows[0].id;
    next();
  } catch (err) {
    next(err);
  }
}

// Confirms req.memberId belongs to the given teamId. Call after requireAuth.
export async function assertTeamMember(teamId, memberId) {
  const result = await pool.query(
    'SELECT 1 FROM team_members WHERE team_id = $1 AND member_id = $2',
    [teamId, memberId],
  );
  return result.rowCount > 0;
}
