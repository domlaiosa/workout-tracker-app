# 02 — Database Schema

## Core Tables

### workouts
| Column | Type | Notes |
|--------|------|-------|
| id | SERIAL | Primary key |
| name | VARCHAR | e.g. "Back", "Push Day", "Shoulders" |
| started_at | TIMESTAMP | When the user tapped "Start Workout" |
| finished_at | TIMESTAMP | When the user tapped "Finish" |
| duration_seconds | INT | Computed or stored for convenience |
| notes | TEXT | Optional session-level notes |
| created_at | TIMESTAMP | Row creation time |

### exercises (library)
| Column | Type | Notes |
|--------|------|-------|
| id | SERIAL | Primary key |
| name | VARCHAR(255) | e.g. "Weighted Pull Up", "Lat Pulldown" |
| category | VARCHAR(100) | Body-part grouping: "Back", "Chest", "Shoulders", "Arms", "Legs", "Core", "Cardio", "Other" |
| equipment | VARCHAR(100) | e.g. "barbell", "dumbbell", "bodyweight", "cable" |
| primary_muscles | TEXT | Comma-separated string from the seed dataset's `primaryMuscles` field |
| is_custom | BOOLEAN | `false` for seeded exercises, `true` for user-created ones. Defaults to `false` |
| created_at | TIMESTAMP | Defaults to `now()` |

### workout_exercises
| Column | Type | Notes |
|--------|------|-------|
| id | SERIAL | Primary key |
| workout_id | FK → workouts | |
| exercise_id | FK → exercises | |
| order_index | INT | A., B., C. ordering from the spreadsheet |
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
- The `exercises` table was extended beyond the original spec (see doc 07) to include `equipment`, `primary_muscles`, and `is_custom`.
