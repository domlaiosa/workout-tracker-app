# LiftLog

A personal workout tracking web app. React + Express + PostgreSQL.

## Setup

### Prerequisites
- Node.js 20+
- Docker (for the PostgreSQL database)

### Database

The database runs in Docker, defined in [`docker-compose.yml`](./docker-compose.yml) and pre-configured to match `backend/.env.example`:

```bash
docker compose up -d        # start PostgreSQL on localhost:5432 (data persists in a named volume)
```

Other handy commands:

```bash
docker compose down         # stop the database (keeps data)
docker compose down -v      # stop and wipe the database volume
```

### Backend

```bash
cd backend
cp .env.example .env        # defaults already match docker-compose.yml
npm install
npm run db:setup            # apply migrations + seed the exercise library
npm run dev                 # starts on http://localhost:3000
```

Database scripts (run from `backend/`):

| Script | What it does |
|--------|--------------|
| `npm run db:setup` | `db:migrate` then `db:seed` (use on a fresh database) |
| `npm run db:migrate` | Apply pending Drizzle migrations |
| `npm run db:seed` | Seed/refresh the exercise library (idempotent) |
| `npm run db:generate` | Generate a new migration after editing `src/db/schema.ts` |
| `npm run db:studio` | Open Drizzle Studio to browse the database |

### Frontend

```bash
cd frontend
npm install
npm run dev                 # starts on http://localhost:5173
```

API requests from the frontend proxy to `localhost:3000` automatically (configured in `vite.config.ts`).

## Docs

See the [`docs/`](./docs/README.md) folder for the full spec.
