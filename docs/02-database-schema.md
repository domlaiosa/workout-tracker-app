# 02 — Database Schema

## Core Tables

### workouts
| Column | Type | Notes |
|--------|------|-------|
| id | UUID / SERIAL | Primary key |
| name | VARCHAR | e.g. "Back", "Push Day", "Shoulders" |
| started_at | TIMESTAMP | When the user tapped "Start Workout" |
| finished_at | TIMESTAMP | When the user tapped "Finish" |
| duration_seconds | INT | Computed or stored for convenience |
| notes | TEXT | Optional session-level notes |
| created_at | TIMESTAMP | Row creation time |

### exercises (library)
| Column | Type | Notes |
|--------|------|-------|
| id | UUID / SERIAL | Primary key |
| name | VARCHAR | e.g. "Weighted Pull Up", "Lat Pulldown" |
| category | VARCHAR | e.g. "Back", "Chest", "Shoulders", "Arms", "Legs", "Cardio" |
| created_at | TIMESTAMP | |

### workout_exercises
| Column | Type | Notes |
|--------|------|-------|
| id | UUID / SERIAL | Primary key |
| workout_id | FK → workouts | |
| exercise_id | FK → exercises | |
| order_index | INT | A., B., C. ordering from the spreadsheet |
| rest_seconds | INT | Target rest time (e.g. 60, 30) |
| tempo | VARCHAR | Structured as "eccentric:pause:concentric" e.g. "3:0:0" |
| notes | TEXT | Per-exercise notes |

### sets
| Column | Type | Notes |
|--------|------|-------|
| id | UUID / SERIAL | Primary key |
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

TBD — depends on ORM choice. Options: Prisma Migrate, Drizzle Kit, or raw SQL migration files.

## Open Decisions

- [ ] UUID vs SERIAL for primary keys
- [ ] Whether to store duration or always compute from timestamps
- [ ] Weight unit handling (lbs vs kg — store raw, let UI handle display?)
