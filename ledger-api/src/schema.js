import { pool } from './db.js';

const SQL = `
CREATE TABLE IF NOT EXISTS users (
  id text PRIMARY KEY,
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS teams (
  id text PRIMARY KEY,
  name text NOT NULL,
  prefix text NOT NULL,
  next_ticket integer NOT NULL DEFAULT 1,
  invite_code text UNIQUE
);

CREATE TABLE IF NOT EXISTS members (
  id text PRIMARY KEY,
  name text NOT NULL,
  initials text NOT NULL,
  color text NOT NULL,
  user_id text REFERENCES users(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS members_user_id_idx ON members (user_id) WHERE user_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS team_members (
  team_id text NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  member_id text NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  PRIMARY KEY (team_id, member_id)
);

CREATE TABLE IF NOT EXISTS tasks (
  id text PRIMARY KEY,
  team_id text NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  ticket_number integer NOT NULL,
  column_id text NOT NULL CHECK (column_id IN ('backlog', 'in-progress', 'review', 'done')),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  assignee_id text REFERENCES members(id) ON DELETE SET NULL,
  priority text NOT NULL CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  due_date date,
  tags text[] NOT NULL DEFAULT '{}',
  position integer NOT NULL DEFAULT 0,
  created_at date NOT NULL DEFAULT CURRENT_DATE
);

CREATE INDEX IF NOT EXISTS tasks_team_column_idx ON tasks (team_id, column_id, position);
`;

// Safe to run repeatedly — handles upgrading a database that already has the
// old (pre-auth) tables, since CREATE TABLE IF NOT EXISTS won't add columns
// to a table that already exists.
const MIGRATIONS_SQL = `
ALTER TABLE teams ADD COLUMN IF NOT EXISTS invite_code text UNIQUE;
ALTER TABLE members ADD COLUMN IF NOT EXISTS user_id text REFERENCES users(id) ON DELETE CASCADE;
CREATE UNIQUE INDEX IF NOT EXISTS members_user_id_idx ON members (user_id) WHERE user_id IS NOT NULL;
`;

export async function ensureSchema() {
  await pool.query(SQL);
  await pool.query(MIGRATIONS_SQL);
}
