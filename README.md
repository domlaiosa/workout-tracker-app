# LiftLog

A personal workout tracking web app. React + Express + PostgreSQL.

## Setup

### Prerequisites
- Node.js 20+
- PostgreSQL 15+ running locally

### Backend

```bash
cd backend
cp .env.example .env        # edit DATABASE_URL with your Postgres credentials
npm install
npm run db:generate         # generate migrations from schema
npm run db:migrate          # apply migrations
node src/scripts/seed-exercises.js   # seed exercise library (run once)
npm run dev                 # starts on http://localhost:3000
```

### Frontend

```bash
cd frontend
npm install
npm run dev                 # starts on http://localhost:5173
```

API requests from the frontend proxy to `localhost:3000` automatically (configured in `vite.config.js`).

## Docs

See the [`docs/`](./docs/README.md) folder for the full spec.
