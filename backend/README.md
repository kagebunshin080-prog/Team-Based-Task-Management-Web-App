# Ledger API

A small REST API for the Ledger team task board — Node.js, Express, and
Postgres, built to deploy on Railway. Only 4 runtime dependencies
(`express`, `pg`, `cors`, `dotenv`), no ORM, no build step.

## Data model

- **teams** — `id`, `name`, `prefix` (ticket prefix like `ENG`), `next_ticket`
- **members** — `id`, `name`, `initials`, `color`
- **team_members** — join table linking members to teams
- **tasks** — belongs to a team and a column (`backlog` / `in-progress` /
  `review` / `done`), with title, description, assignee, priority, due date,
  tags, and a `position` for ordering within its column

Tables are created automatically (`CREATE TABLE IF NOT EXISTS`) the first
time the server boots — no separate migration step needed.

## API

| Method | Path                              | Description                          |
|--------|-----------------------------------|---------------------------------------|
| GET    | `/health`                         | Health check                          |
| GET    | `/api/teams`                      | List teams (with `memberIds`)         |
| POST   | `/api/teams`                      | Create team `{ name, prefix }`        |
| POST   | `/api/teams/:teamId/members/:memberId` | Add member to team               |
| DELETE | `/api/teams/:teamId/members/:memberId` | Remove member from team          |
| GET    | `/api/members`                    | List all members                      |
| POST   | `/api/members`                    | Create member `{ name, teamId? }`     |
| GET    | `/api/tasks?teamId=...`           | List tasks for a team                 |
| POST   | `/api/tasks`                      | Create task                           |
| PATCH  | `/api/tasks/:id`                  | Update task fields                    |
| PATCH  | `/api/tasks/:id/move`             | Move/reorder `{ columnId, beforeTaskId }` |
| DELETE | `/api/tasks/:id`                  | Delete task                           |

Task shape matches the frontend's `Task` type: `id`, `ticketNumber`,
`teamId`, `columnId`, `title`, `description`, `assigneeId`, `priority`,
`dueDate`, `tags`, `order`, `createdAt`.

## Run locally

You'll need a Postgres database (local install, Docker, or a free instance
from Railway/Neon/Supabase).

```bash
npm install
cp .env.example .env   # then fill in DATABASE_URL
npm run seed            # optional: populate demo teams/members/tasks
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
5. Also add `FRONTEND_ORIGIN` set to your deployed Vercel URL, e.g.
   `https://your-app.vercel.app` (comma-separate multiple origins if needed).
6. Railway auto-detects Node via `package.json` and runs `npm install` then
   `npm start` — no extra config needed (a `railway.json` is included for
   clarity and sets a `/health` healthcheck).
7. Once deployed, optionally run the seed script once from Railway's shell
   (Service → the `...` menu → "Open Shell", then `npm run seed`).

## Connecting the frontend

The Ledger frontend currently stores everything in the browser's
`localStorage` (see `src/store/BoardContext.tsx` there). To point it at
this API instead, replace the state logic in that file with `fetch` calls
to these endpoints — the rest of the frontend only talks to that one file,
so no other component needs to change.
