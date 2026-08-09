# Ledger API

A small REST API for the Ledger team task board — Node.js, Express, and
Postgres, built to deploy on Railway. Only 4 runtime dependencies
(`express`, `pg`, `cors`, `dotenv`), no ORM, no build step.

## Data model

- **users** — `id`, `email`, `password_hash`, `name` — login accounts
- **teams** — `id`, `name`, `prefix` (ticket prefix like `ENG`), `next_ticket`,
  `invite_code` (shareable code teammates use to join)
- **members** — `id`, `name`, `initials`, `color`, `user_id` (nullable — links
  to a login account; members without one are unregistered placeholders you
  can still assign tasks to)
- **team_members** — join table linking members to teams
- **tasks** — belongs to a team and a column (`backlog` / `in-progress` /
  `review` / `done`), with title, description, assignee, priority, due date,
  tags, and a `position` for ordering within its column

Tables are created automatically (`CREATE TABLE IF NOT EXISTS`, plus a small
set of `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` migrations) the first time
the server boots — no separate migration step needed, even when upgrading an
existing database.

## Authentication

Auth is email/password with JSON Web Tokens (no sessions, no cookies — this
plays nicely with the frontend and backend living on different domains, e.g.
Vercel + Railway).

- Sign up either **creates a new team** (`teamName`) or **joins an existing
  one** (`inviteCode`) — every signup also creates a linked `members` row so
  the new user can be assigned tasks.
- The client stores the returned JWT and sends it as
  `Authorization: Bearer <token>` on every request after that.
- All `/api/teams`, `/api/members`, and `/api/tasks` routes require a valid
  token, and scope results to the teams the caller actually belongs to.

**You must set `JWT_SECRET`** (a long random string) — see `.env.example`.
Without it, tokens can't be signed or verified.

## API

| Method | Path                              | Description                          |
|--------|-----------------------------------|---------------------------------------|
| GET    | `/health`                         | Health check                          |
| POST   | `/api/auth/signup`                | Create account `{ email, password, name, teamName? \| inviteCode? }` |
| POST   | `/api/auth/login`                 | Log in `{ email, password }` → `{ token, user }` |
| GET    | `/api/auth/me`                    | Current user + their teams (auth required) |
| GET    | `/api/teams`                      | List *your* teams (with `memberIds`, `inviteCode`) |
| POST   | `/api/teams`                      | Create an additional team `{ name, prefix }` |
| POST   | `/api/teams/join`                 | Join a team `{ inviteCode }`          |
| POST   | `/api/teams/:teamId/members/:memberId` | Add member to team               |
| DELETE | `/api/teams/:teamId/members/:memberId` | Remove member from team          |
| GET    | `/api/members`                    | List members of your teams            |
| POST   | `/api/members`                    | Add a placeholder member (no login) `{ name, teamId? }` |
| GET    | `/api/tasks?teamId=...`           | List tasks for a team you belong to   |
| POST   | `/api/tasks`                      | Create task                           |
| PATCH  | `/api/tasks/:id`                  | Update task fields                    |
| PATCH  | `/api/tasks/:id/move`             | Move/reorder `{ columnId, beforeTaskId }` |
| DELETE | `/api/tasks/:id`                  | Delete task                           |

Every route except `/health` and `/api/auth/*` requires
`Authorization: Bearer <token>`.

Task shape matches the frontend's `Task` type: `id`, `ticketNumber`,
`teamId`, `columnId`, `title`, `description`, `assigneeId`, `priority`,
`dueDate`, `tags`, `order`, `createdAt`.

## Run locally

You'll need a Postgres database (local install, Docker, or a free instance
from Railway/Neon/Supabase).

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL and JWT_SECRET
npm run seed            # optional: populate demo teams/members/tasks (no login for these)
npm run dev
```

Server listens on `http://localhost:4000` by default.

## Deploy to Railway

1. Push this project to a GitHub repo (make sure `node_modules` and `.env`
   are NOT committed — `.gitignore` already excludes them).
2. In Railway, **New Project → Deploy from GitHub repo**, pick this repo.
3. Click **+ New → Database → Add PostgreSQL** in the same project.
4. Open your API service → **Variables** tab → add a reference to the
   Postgres database's `DATABASE_URL` (Railway will suggest this
   automatically, or click "Add Variable Reference" and pick
   `Postgres.DATABASE_URL`).
5. Also add:
   - `FRONTEND_ORIGIN` set to your deployed Vercel URL, e.g.
     `https://your-app.vercel.app` (comma-separate multiple origins if needed).
   - `JWT_SECRET` — a long random string, e.g. generate one with
     `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.
     Keep this the same across deploys, or everyone gets logged out.
6. Railway auto-detects Node via `package.json` and runs `npm install` then
   `npm start` — no extra config needed (a `railway.json` is included for
   clarity and sets a `/health` healthcheck).
7. Once deployed, optionally run the seed script once from Railway's shell
   (Service → the `...` menu → "Open Shell", then `npm run seed`) — note the
   seeded demo teams/members have no login accounts attached; sign up for a
   real account to actually use the app.

## Connecting the frontend

The Ledger frontend now talks directly to this API — see
`src/lib/api.ts` and `src/store/AuthContext.tsx` /
`src/store/BoardContext.tsx` there. Set `VITE_API_URL` in the frontend's
environment to point it at this API's URL.
