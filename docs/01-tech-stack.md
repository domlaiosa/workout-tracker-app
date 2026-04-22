# 01 — Tech Stack & Project Setup

## Target Platform

**Primary use case:** Mobile browser on a smartphone, used during a workout at the gym. The UI must be fully operable one-handed, with large tap targets and minimal typing. No native app — browser-only.

## Stack

| Layer | Tech | Notes |
|-------|------|-------|
| Frontend | React 19 (Vite 8) + TypeScript | Mobile-first SPA, optimized for smartphone browsers |
| Backend | Express 5 + Node.js + TypeScript | REST API, ES modules (`"type": "module"`); runs via `tsx` |
| Database | PostgreSQL | Relational, good fit for structured workout data |
| ORM | Drizzle ORM + Drizzle Kit | Schema in `backend/src/db/schema.ts`; `drizzle-kit` for migrations |
| DB Driver | `postgres` (pg) | Used by Drizzle to connect to PostgreSQL |
| CSS | Tailwind CSS v4 | Via `@tailwindcss/vite` plugin — no separate config file needed |
| State | React Context | Sufficient for MVP scope; revisit if complexity grows |
| Env | dotenv | Backend env vars loaded via `dotenv/config` |
| CORS | cors | Enabled globally in `backend/src/index.ts` |
| Dev server | nodemon + tsx | Auto-restarts backend on `.ts` file changes |

## Repo Structure

```
workout-tracking-app/
├── frontend/                    # React frontend (Vite + TypeScript)
│   ├── src/
│   │   ├── App.tsx              # Root component (placeholder)
│   │   └── main.tsx             # Entry point
│   ├── tsconfig.json
│   └── package.json
├── backend/                     # Express backend (TypeScript)
│   ├── src/
│   │   ├── db/
│   │   │   ├── index.ts         # Drizzle client + connection
│   │   │   └── schema.ts        # All table definitions + inferred types
│   │   ├── routes/
│   │   │   └── exercises.ts     # GET/POST /api/v1/exercises
│   │   ├── middleware/
│   │   │   └── errorHandler.ts  # Global error handler
│   │   ├── scripts/
│   │   │   └── seed-exercises.ts  # One-time exercise seeder
│   │   └── index.ts             # Express app entry point
│   ├── tsconfig.json
│   ├── drizzle.config.ts
│   └── package.json
├── docs/                        # Spec docs
└── README.md
```

> Note: `controllers/` and `models/` directories from the original spec do not exist yet — business logic currently lives directly in route handlers. These will be extracted as complexity grows.

## Dev Environment

- Node.js 20+
- PostgreSQL 15+
- Package manager: npm

## Deployment

TBD — keep it simple for now. Options to consider later:
- Railway, Render, or Fly.io for backend + DB
- Vercel or Netlify for frontend

## Dev Scripts

| Command | What it does |
|---------|-------------|
| `cd backend && npm run dev` | Start backend with nodemon + tsx on port 3000 |
| `cd backend && npm run db:generate` | Generate Drizzle migration files from schema |
| `cd backend && npm run db:migrate` | Apply migrations to the database |
| `cd backend && npm run db:studio` | Open Drizzle Studio (DB browser) |
| `cd frontend && npm run dev` | Start Vite dev server |
| `cd backend && npx tsx src/scripts/seed-exercises.ts` | Seed exercise library (run once after first migration) |

## Open Decisions

- [ ] Deployment target (Railway / Render / Fly.io for backend, Vercel for frontend)
