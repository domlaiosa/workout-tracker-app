# 04 — Core UI: Home Screen

## Purpose

The landing page. At a glance: how's training going? One tap to start lifting.

## Platform Context

This screen is used on a smartphone browser. Design for a ~390px wide viewport (iPhone-size). All interactive elements must be large enough to tap with a thumb — minimum 44px tap targets. Avoid any UI that requires precise tapping or hover states.

## Layout

```
┌─────────────────────────────┐
│         LiftLog             │
├─────────────────────────────┤
│                             │
│   🔥 12-day streak          │
│   Last workout: Back (Mon)  │
│   This week: 4 / 5 sessions │
│                             │
├─────────────────────────────┤
│                             │
│    [ Start Workout ]        │
│                             │
├─────────────────────────────┤
│   Recent Workouts           │
│   ─────────────────         │
│   Mon — Back      1h 15m    │
│   Sat — Shoulders 58m       │
│   Thu — Legs      1h 02m    │
│                             │
└─────────────────────────────┘
```

## Stats to Display

- Current workout streak (consecutive days/weeks — decide logic later)
- Last workout name + day
- Sessions this week vs. goal (if goals are set, otherwise just count)

## Interactions

- **"Start Workout" button** → navigates to workout setup (see doc 05)
  - Option 1: Pick from previous workouts (templates)
  - Option 2: Blank workout
- **Tap a recent workout** → view that session's details (read-only)

## Open Decisions

- [ ] How streak is calculated (daily? weekly? allow rest days?)
- [ ] Whether to show a weekly goal or just a count
- [ ] Design system / component library choice
