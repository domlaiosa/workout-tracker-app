# 02 — Database Schema

## Core Tables

### workouts
| Column | Type | Notes |
|--------|------|-------|
| id | SERIAL | Primary key |
| user_id | VARCHAR(255) | Nullable for now; ready for future auth integration |
| name | VARCHAR | e.g. "Back", "Push Day", "Shoulders" |
| started_at | TIMESTAMP | When the user tapped "Start Workout" |
| finished_at | TIMESTAMP | When the user tapped "Finish" |
| duration_seconds | INT | Computed or stored for convenience |
| notes | TEXT | Optional session-level notes |
| created_at | TIMESTAMP | Row creation time |

### exercise_library
| Column | Type | Notes |
|--------|------|-------|
| id | SERIAL | Primary key |
| name | VARCHAR(255) | e.g. "Weighted Pull Up", "Lat Pulldown" |
| category | VARCHAR(100) | Body-part grouping: "Back", "Chest", "Shoulders", "Arms", "Legs", "Core", "Cardio", "Other" |
| equipment | VARCHAR(100) | e.g. "barbell", "dumbbell", "bodyweight", "cable" |
| primary_muscles | TEXT | Comma-separated string from the seed dataset's `primaryMuscles` field |
| is_custom | BOOLEAN | `false` for seeded exercises, `true` for user-created ones. Defaults to `false` |
| created_at | TIMESTAMP | Defaults to `now()` |

> Exercises are **never deleted**. There is no DELETE endpoint for this table. The FK from `workout_exercises.exercise_id` defaults to `RESTRICT` as a DB-level safety net.

### workout_exercises
| Column | Type | Notes |
|--------|------|-------|
| id | SERIAL | Primary key |
| workout_id | FK → workouts | |
| exercise_id | FK → exercise_library | |
| order_index | INT | 0-based position in the workout (UI displays as 1, 2, 3…) |
| rest_seconds | INT | Target rest time (e.g. 60, 30) |
| tempo | VARCHAR | Structured as "eccentric:pause:concentric" e.g. "3:0:0" |
| notes | TEXT | Per-exercise notes |

### sets
| Column | Type | Notes |
|--------|------|-------|
| id | SERIAL | Primary key |
| workout_exercise_id | FK → workout_exercises | |
| set_number | INT | 1, 2, 3... |
| reps | INT | |
| weight | DECIMAL | Weight used for this specific set |
| notes | TEXT | e.g. "last one was a fight" |

## Relationships

```
workouts 1───M workout_exercises M───1 exercises
                    │
                    1
                    │
                    M
                   sets
```

## Migration Strategy

Using **Drizzle Kit** for migrations. Schema is defined in `backend/src/db/schema.js`. Run `drizzle-kit push` to apply schema to the database during development.

## Open Decisions

- [ ] Whether to store duration or always compute from timestamps
- [ ] Weight unit handling (lbs vs kg — store raw, let UI handle display?)

## As Built

- Primary keys: **SERIAL** (not UUID). Chosen for simplicity at MVP scale.
- ORM: **Drizzle** — schema lives in `backend/src/db/schema.js`.
- The `exercises` table was extended beyond the original spec (see doc 07) to include `equipment`, `primary_muscles`, and `is_custom`, and has since been renamed to `exercise_library` for clarity.
- `workouts` gained `body_parts` (JSONB string array — the setup-screen target chips), `updated_at` (bumped on every edit), and an index on `user_id` (`workouts_user_id_idx`) so per-user queries stay fast once auth lands. `created_at`/`updated_at` are now `NOT NULL`.
- `sets` gained `completed` (BOOLEAN, default false) to persist which sets were checked off during the session.
- Migrations: `0001_careless_hercules.sql` adds the columns/index above. `user_id` remains nullable until auth.
