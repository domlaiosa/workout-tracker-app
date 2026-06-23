# 03 — API Design

## Base URL

`/api/v1`

## Endpoints

### Workouts

| Method | Path | Description |
|--------|------|-------------|
| POST | /workouts | Start a new workout (creates record, returns id) |
| PATCH | /workouts/:id | Update workout (finish it, edit name/notes) |
| GET | /workouts | List all workouts (paginated, newest first) |
| GET | /workouts/:id | Get full workout with exercises and sets |
| DELETE | /workouts/:id | Delete a workout |

### Workout Exercises

| Method | Path | Description |
|--------|------|-------------|
| POST | /workouts/:id/exercises | Add an exercise to a workout |
| PATCH | /workout-exercises/:id | Update exercise (rest, tempo, order, notes) |
| DELETE | /workout-exercises/:id | Remove exercise from workout |

### Sets

| Method | Path | Description |
|--------|------|-------------|
| POST | /workout-exercises/:id/sets | Add a set |
| PATCH | /sets/:id | Update a set (reps, weight, notes) |
| DELETE | /sets/:id | Remove a set |

### Exercises (Library) ✅ Built

| Method | Path | Description |
|--------|------|-------------|
| GET | /exercises | List/search all exercises (supports `?search=` and `?category=` query params) |
| POST | /exercises | Create a custom exercise (requires `name` and `category` in body) |

### Templates / History

| Method | Path | Description |
|--------|------|-------------|
| GET | /workouts/recent | Get recent workouts for template picker |
| GET | /workouts/:id/compare | Get a workout with last session's weights for the same exercises |

## Response Shape (example)

`order_index` is 0-based in the API (`0` = first exercise). The UI displays it as 1, 2, 3… (`order_index + 1`).

```json
// GET /workouts/:id
{
  "id": 1,
  "name": "Back",
  "started_at": "2025-04-21T10:00:00Z",
  "finished_at": "2025-04-21T11:15:00Z",
  "duration_seconds": 4500,
  "exercises": [
    {
      "id": 1,
      "order_index": 0,
      "exercise": { "id": 10, "name": "Weighted Pull Up", "category": "Back" },
      "rest_seconds": 60,
      "tempo": "0:0:0",
      "sets": [
        { "set_number": 1, "reps": 2, "weight": 25 },
        { "set_number": 2, "reps": 2, "weight": 35 },
        { "set_number": 3, "reps": 2, "weight": 45 },
        { "set_number": 4, "reps": 2, "weight": 45 }
      ],
      "previous_sets": [
        { "set_number": 1, "reps": 2, "weight": 20 },
        { "set_number": 2, "reps": 2, "weight": 30 }
      ]
    }
  ]
}
```

## Open Decisions

- [ ] Pagination approach (offset vs cursor)
- [ ] Whether "compare" data comes embedded or as a separate call

## As Built

- **Error response format:** `{ error: string }` — returned by the global `errorHandler` middleware in `backend/src/middleware/errorHandler.js`. HTTP status comes from `err.status` (falls back to 500). Thrown via the `HttpError` helper in `backend/src/lib/httpError.js` (`badRequest` → 400, `notFound` → 404).
- **Base path:** Routes are mounted at `/api/v1/exercises` and `/api/v1/workouts` in `backend/src/index.js`.
- **Workouts implemented as a single aggregate resource** (not the granular sub-resource endpoints originally sketched above). A workout is read/written together with its exercises and sets:
  | Method | Path | Description |
  |--------|------|-------------|
  | GET | /workouts | List all workouts (newest first), each with nested exercises + sets |
  | GET | /workouts/:id | Get one full workout |
  | POST | /workouts | Create a workout with its exercises + sets (transactional) |
  | PUT | /workouts/:id | Replace a workout + children (children re-inserted in a transaction) |
  | DELETE | /workouts/:id | Delete a workout (cascades to exercises + sets) → 204 |
- **Validation:** request bodies are validated/normalized in `backend/src/validation/workout.js` before any DB write; unknown `exerciseId`s return 400. `user_id` is never accepted from the client (stays null until auth).
- The exercise library is read-only via `GET /exercises` (used by the picker); the FK from `workout_exercises.exercise_id` blocks deletion of seeded rows.
- Set/exercise CRUD within a workout is performed by editing the aggregate and re-sending it via `PUT`. The standalone set/exercise/template routes remain unbuilt.
