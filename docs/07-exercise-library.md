# 07 — Exercise Library

## Data Source

Exercises are seeded from [free-exercise-db](https://github.com/yuhonas/free-exercise-db) — an open-source dataset of ~800 exercises. It's available as both a JSON file and an npm package (`free-exercise-db`).

Seeding is a one-time operation. Once imported into Postgres, the data lives in our own DB — no runtime dependency on any third-party API, and exercise search is just a local query.

## Schema Updates (extends doc 02)

The base `exercises` table from doc 02 needs additional columns to accommodate the richer dataset:

| Column | Type | Notes |
|--------|------|-------|
| id | UUID / SERIAL | Primary key |
| name | VARCHAR | e.g. "Weighted Pull Up", "Lat Pulldown" |
| category | VARCHAR | Body-part grouping: "Back", "Chest", "Shoulders", "Arms", "Legs", "Cardio" |
| equipment | VARCHAR | e.g. "barbell", "dumbbell", "bodyweight", "cable" |
| primary_muscles | TEXT | Comma-separated or JSON array — from dataset's `primaryMuscles` field |
| is_custom | BOOLEAN | `false` for seeded exercises, `true` for user-created ones |
| created_at | TIMESTAMP | |

**Fields intentionally omitted from the dataset:**
- `instructions` — verbose, not needed for MVP
- `secondaryMuscles` — nice to have, defer until stats/filtering needs it
- `level` (beginner/intermediate/expert) — defer until exercise library UI is built out

## Category Mapping

The free-exercise-db uses activity-based categories (`strength`, `cardio`, `plyometrics`, `powerlifting`, etc.) which don't map 1:1 to body-part groupings. Our UI is organized by body part, so we derive `category` from `primaryMuscles` during the seed script rather than using the dataset's category field directly.

Mapping logic (applied in seed script):

| Primary Muscles (from dataset) | → Our Category |
|-------------------------------|----------------|
| chest | Chest |
| biceps, triceps, forearms | Arms |
| lats, middle back, lower back, traps | Back |
| shoulders, traps (upper) | Shoulders |
| quadriceps, hamstrings, glutes, calves | Legs |
| abdominals, abductors, adductors | Core |
| cardiovascular (category = cardio) | Cardio |

Exercises that don't fit cleanly default to "Other" and can be recategorized manually.

## Seeding Approach

Seed script lives at `backend/src/scripts/seed-exercises.js`. Run once after the first migration.

```
npm install free-exercise-db   # or pull the JSON directly from the repo
node backend/src/scripts/seed-exercises.js
```

The script:
1. Reads the exercise JSON from the package
2. Maps each entry to our schema (name, equipment, primary_muscles, derived category)
3. Bulk-inserts into the `exercises` table
4. Skips duplicates on re-run (upsert on `name`)

## Search & Filter (MVP)

- **Search by name** — simple `ILIKE '%query%'` on the `name` column
- **Filter by category** — WHERE clause on `category`
- No full-text search needed at MVP scale (~800 rows)
- Search input should auto-focus when the picker opens, and the mobile keyboard should appear immediately so the user can type quickly
- Results list should use large row heights (48px+) for easy thumb tapping

API endpoint (from doc 03): `GET /exercises?search=pull&category=Back`

## Custom Exercises

Users can add exercises not in the library. These are inserted into the same `exercises` table with `is_custom = true`. No separate table needed.

Custom exercises:
- Require `name` (required) and `category` (required)
- `equipment` and `primary_muscles` are optional
- Appear in search results alongside seeded exercises

## Open Decisions

- [ ] Surface `equipment` as a filter in the exercise picker UI, or just show it as metadata?

## As Built

- **`primary_muscles` storage:** Plain `TEXT` column with a comma-separated string (e.g. `"lats, middle back"`). Chosen for simplicity at MVP scale; can migrate to an array/JSONB later if filtering by muscle becomes needed.
- **Category list:** "Core" is included as a category. Final list: Back, Chest, Shoulders, Arms, Legs, Core, Cardio, Other.
- **Unmatched exercises:** Default to "Other" category. No manual recategorization done yet.
- **Seed script:** Located at `backend/src/scripts/seed-exercises.js`. Uses `free-exercise-db` npm package. Run once after first migration.
