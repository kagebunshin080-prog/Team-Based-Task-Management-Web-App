# Waypoint — Task Management Frontend (MVP)

A Next.js frontend for a team task management app, built from the project plan.
This is the **frontend MVP** only — landing, auth, dashboard, and Kanban board —
using mock data. It's designed to plug into the Railway/Node backend described
in the plan once that's built.

## Stack
- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4
- Self-hosted fonts (Space Grotesk / Inter / IBM Plex Mono) — no external font
  fetching at build time
- Mock data in `lib/data.ts` (swap for real API calls later)

## Pages included in this MVP
- `/` — Landing page
- `/login`, `/register` — Auth screens (UI only, no backend wired up yet)
- `/dashboard` — Stats, upcoming deadlines, activity feed
- `/board` — Kanban board with drag-and-drop between lanes

Calendar, Reports, and Settings are stubbed as "on the roadmap" placeholders —
next in line after this MVP.

## Run locally
```bash
npm install
npm run dev
```
Visit http://localhost:3000

## Build
```bash
npm run build
npm run start
```

## Deploy to Vercel
1. Push this repo to GitHub (see commands below).
2. Go to https://vercel.com/new, import the repo.
3. Framework preset: Next.js (auto-detected). No env vars needed yet.
4. Deploy.

## Next steps
- Wire up auth forms to the Node/Express (or NestJS) backend on Railway
- Replace `lib/data.ts` mock data with real API calls (React Query recommended)
- Build Calendar, Reports, and Admin Panel pages
- Add Socket.io client for realtime board updates
