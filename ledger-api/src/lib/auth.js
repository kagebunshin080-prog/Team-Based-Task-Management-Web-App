import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_TTL = '30d';

if (!JWT_SECRET) {
  console.warn(
    '[auth] JWT_SECRET is not set. Set it to a long random string — tokens cannot be signed without it.',
  );
}

export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function signToken(userId) {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: TOKEN_TTL });
}

export function verifyToken(token) {
  const payload = jwt.verify(token, JWT_SECRET);
  return payload.sub;
}

export function randomInviteCode() {
  // Unambiguous alphabet (no 0/O/1/I) so codes are easy to read/share.
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 7; i += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}
