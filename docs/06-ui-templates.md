# 06 — Core UI: Workout Templates

## Purpose

Let the user start a new workout based on a previous session so they don't have to re-enter the same exercises every time. This is the main way workouts will be started after the first few sessions.

## Platform Context

Used on a smartphone browser at the start of a gym session. The template picker should be a simple, scrollable list — large row heights, easy to tap. Minimize the number of taps required to get into an active workout.

## Flow

```
Tap "Start Workout"
       │
       ├──→ "Blank Workout" → empty session, add exercises manually
       │
       └──→ "From Previous" → show list of recent workouts
                │
                └──→ Select one → new workout created with:
                     • Same workout name (editable)
                     • Same exercises in same order
                     • Same rest times and tempos
                     • Empty set rows (weights not pre-filled)
                     • Last session's weights shown as reference
```

## Template Picker UI

```
┌─────────────────────────────────┐
│  Pick a Workout                 │
│  ───────────────                │
│  Back         Mon Apr 21        │
│  Shoulders    Sat Apr 19        │
│  Legs         Thu Apr 17        │
│  Push         Tue Apr 15        │
│  Back         Mon Apr 14        │
│                                 │
│  [ Blank Workout ]              │
└─────────────────────────────────┘
```

## What Gets Copied

| Field | Copied? | Notes |
|-------|---------|-------|
| Workout name | ✅ | User can rename |
| Exercises | ✅ | Same list, same order |
| Rest times | ✅ | Per-exercise |
| Tempos | ✅ | Per-exercise |
| Sets (rows) | ✅ | Same number of set rows, but weight/reps are blank |
| Previous weights | Shown as reference | Ghost text, not editable |
| Notes | ❌ | Start fresh |

## Comparing to Last Session

When loading from a template, the API should return the most recent workout that shares the same exercises (or same workout name — TBD) so that last session's weights can be displayed as reference values in the set rows.

## Open Decisions

- [ ] Match "last session" by workout name or by exercise overlap?
- [ ] How far back to search for templates (last 10? last 30 days?)
- [ ] Allow saving named templates separate from workout history?
- [ ] Can the user modify the template before starting (remove/add exercises)?
