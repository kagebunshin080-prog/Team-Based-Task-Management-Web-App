# Ledger — Team Task Board (lite)

A lightweight team task-management front end. Teams are ledger tabs, tasks
are stamped index cards, columns are stations on the board.

**Only two runtime dependencies: `react` and `react-dom`.** No Tailwind, no
drag-and-drop library, no icon package — plain CSS and a dozen hand-rolled
SVG icons in `src/icons.tsx`. Drag-and-drop uses the browser's native HTML5
DnD API.

- React + TypeScript, built with Vite
- Plain CSS (`src/index.css`) — no build-step CSS framework
- State persisted to `localStorage` — no backend required
- Multiple teams, each with its own members, ticket prefix (e.g. `ENG-14`),
  and board
- Search, filter by assignee, priority flags, due dates, tags

## Run locally

```bash
npm install
npm run dev
```

Open the printed local URL (usually http://localhost:5173).

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
4. Click **Deploy**.

**Option B — Vercel CLI**
```bash
npm install -g vercel
vercel        # first deploy, follow the prompts
vercel --prod # promote to production
```

No environment variables are required.

## Notes on data

This is a front end only. Each browser stores its own board in
`localStorage` under the key `ledger-board-state-v1`, seeded with a demo
"Product Engineering" and "Marketing" team. To wire it up to a real backend
later, replace the logic in `src/store/BoardContext.tsx` with API calls —
the rest of the app only talks to that context.

## Project structure

```
src/
  components/     Sidebar, TopBar, Board, Column, TaskCard, TaskModal, MemberAvatar, PriorityBadge
  data/           Seed data and static column definitions
  hooks/          useLocalStorage
  store/          BoardContext — all state and mutations live here
  icons.tsx       Small hand-rolled SVG icons (no icon library)
  index.css       All styling, plain CSS with custom properties for theming
  types.ts        Shared TypeScript types
```
