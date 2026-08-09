# Ledger — Team Task Board (lite)

A lightweight team task-management front end. Teams are ledger tabs, tasks
are stamped index cards, columns are stations on the board.

**Only two runtime dependencies: `react` and `react-dom`.** No Tailwind, no
drag-and-drop library, no icon package — plain CSS and a dozen hand-rolled
SVG icons in `src/icons.tsx`. Drag-and-drop uses the browser's native HTML5
DnD API.

- React + TypeScript, built with Vite
- Plain CSS (`src/index.css`) — no build-step CSS framework
- Email/password login and signup, backed by the `ledger-api` server (JWT
  auth — see that project's README)
- Multiple teams, each with its own members, ticket prefix (e.g. `ENG-14`),
  invite code, and board
- Search, filter by assignee, priority flags, due dates, tags

## Run locally

You'll need the `ledger-api` backend running too (see its README) — this
frontend has no local-only mode anymore; it talks to that API for
everything.

```bash
npm install
cp .env.example .env   # set VITE_API_URL to your local/deployed API
npm run dev
```

Open the printed local URL (usually http://localhost:5173). You'll land on
a login/signup screen — sign up to create your first team (or join one with
an invite code from a teammate).

## Build

```bash
npm run build
```

Output goes to `dist/`.

## Deploy to Vercel

**Option A — Vercel dashboard**
1. Push this project to a GitHub/GitLab/Bitbucket repo.
2. In Vercel, click **Add New → Project** and import the repo.
3. Framework preset: **Vite** (auto-detected). Build command `npm run build`,
   output directory `dist` — Vercel fills these in automatically.
4. Under **Environment Variables**, add `VITE_API_URL` set to your deployed
   `ledger-api` URL (Railway), e.g. `https://your-api.up.railway.app` — no
   trailing slash.
5. Click **Deploy**.

**Option B — Vercel CLI**
```bash
npm install -g vercel
vercel        # first deploy, follow the prompts
vercel --prod # promote to production
```
Set `VITE_API_URL` the same way via the dashboard, or `vercel env add`.

Also set the backend's `FRONTEND_ORIGIN` to this Vercel URL so CORS allows
requests from it — see the `ledger-api` README.

## Notes on data

This is a front end only — all data lives in the `ledger-api` Postgres
database. The browser only stores your login token
(`localStorage`, key `ledger-auth-token-v1`) and your last-viewed team id,
nothing else. Logging out clears the token; your team's board still exists
on the server for whenever you log back in.

## Project structure

```
src/
  components/     Sidebar, TopBar, Board, Column, TaskCard, TaskModal, MemberAvatar, PriorityBadge, AuthScreen
  data/           Static column definitions
  lib/            api.ts — fetch wrapper for the backend
  store/          AuthContext (login/signup/session), BoardContext (teams/members/tasks — all via API)
  icons.tsx       Small hand-rolled SVG icons (no icon library)
  index.css       All styling, plain CSS with custom properties for theming
  types.ts        Shared TypeScript types
```
