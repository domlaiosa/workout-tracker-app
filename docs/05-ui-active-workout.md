# 05 — Core UI: Active Workout

## Purpose

The main screen while lifting. Log exercises, sets, weights, and time rests — all while a session timer runs.

## Platform Context

This is the most-used screen and is operated one-handed at the gym, often mid-exercise. Priorities:
- Large number inputs — weight and reps fields must be easy to tap and edit with one thumb
- Numeric keyboard should auto-open for number inputs (`inputMode="numeric"`)
- Avoid small tap targets; buttons should be at least 48px tall
- The rest timer and session timer must remain visible without scrolling
- Assume the user's hands may be sweaty or occupied — keep interactions simple and forgiving

## Workout Timer

- Starts automatically when the workout begins
- Counts up (stopwatch style) — displayed at the top of the screen
- Stops when user taps "Finish Workout"
- Elapsed time saved to the workout record

## Adding an Exercise

1. Tap "Add Exercise"
2. Search or browse exercise list (see doc 07 for library details)
3. Exercise is appended to the workout with an order label (A, B, C...)

## Logging a Set

For each exercise, the user fills in per-set data:

```
┌─────────────────────────────────────┐
│ A. Weighted Pull Up     Rest: 1 min │
│    Tempo: 0 : 0 : 0                │
│ ┌─────┬──────┬────────┬──────────┐  │
│ │ Set │ Reps │ Weight │  Notes   │  │
│ ├─────┼──────┼────────┼──────────┤  │
│ │  1  │  2   │  25    │          │  │
│ │  2  │  2   │  35    │          │  │
│ │  3  │  2   │  45    │          │  │
│ │  4  │  2   │  45    │ tough    │  │
│ └─────┴──────┴────────┴──────────┘  │
│         [ + Add Set ]               │
└─────────────────────────────────────┘
```

### Input fields per exercise:
- **Rest time** — seconds (displayed as "1 min", "30s", etc.)
- **Tempo** — structured 3-field input: eccentric : pause : concentric

### Input fields per set:
- **Reps** — integer
- **Weight** — number (one entry per set, not shared across sets)
- **Notes** — optional, freeform text per set

### Previous session comparison

If this exercise was done in a recent workout, show last session's weights as ghost/reference text so the user can compare:

```
│ Set │ Reps │ Weight │ Last Time │
│  1  │  2   │  ___   │   20      │
│  2  │  2   │  ___   │   30      │
```

## Rest Timer

- Counts **up** from 0 (stopwatch style)
- User can start it after completing a set
- Displays prominently so it's visible while resting
- Optional: subtle alert/vibration when rest exceeds the target rest time for that exercise

## Finishing a Workout

- "Finish Workout" button stops the session timer
- Saves everything
- Navigates back to home or a quick summary view

## Open Decisions

- [ ] How to handle cardio entries (e.g. "4 mile run" — no sets/reps, just duration/distance)
- [ ] Reorder exercises mid-workout?
- [ ] Swipe-to-delete sets?
- [ ] Confirm before finishing (prevent accidental taps)?
