# 01 — Tech Stack & Project Setup

## Target Platform

**Primary use case:** Mobile browser on a smartphone, used during a workout at the gym. The UI must be fully operable one-handed, with large tap targets and minimal typing. No native app — browser-only.

## Stack

| Layer | Tech | Notes |
|-------|------|-------|
| Frontend | React (Vite) | Mobile-first SPA, optimized for smartphone browsers |
| Backend | Express + Node.js | REST API |
| Database | PostgreSQL | Relational, good fit for structured workout data |
| ORM | Drizzle | Lightweight, stays close to SQL, great TS types |
| CSS | Tailwind CSS | Utility-first, ideal for mobile-first UI |
| State | React Context | Sufficient for MVP scope; revisit if complexity grows |

## Repo Structure

```
liftlog/
├── frontend/        # React frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── App.jsx
│   └── package.json
├── backend/         # Express backend
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── middleware/
│   │   └── index.js
│   └── package.json
├── docs/            # These spec docs
└── README.md
```

## Dev Environment

- Node.js 20+
- PostgreSQL 15+
- Package manager: npm

## Deployment

TBD — keep it simple for now. Options to consider later:
- Railway, Render, or Fly.io for backend + DB
- Vercel or Netlify for frontend

## Open Decisions

- [ ] Deployment target (Railway / Render / Fly.io for backend, Vercel for frontend)
