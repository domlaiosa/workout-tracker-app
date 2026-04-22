# LiftLog — Workout Tracker App

## Overview

LiftLog is a personal workout tracking web app that replaces a Google Sheets–based logging workflow. Users can start a workout, pick exercises, log sets/reps/weight per set, time their rests, and review previous sessions to track progress over time.

**Target platform:** Web (browser-first, mobile-responsive)
**Stack:** React · Express · Node.js · PostgreSQL

---

## Project Philosophy

- Start small, ship early, iterate fast
- Each doc below is a living spec — update it as ideas solidify
- Build in phases: get core logging working before adding stats/auth/extras

---

## Docs

| # | Doc | Description | Status |
|---|-----|-------------|--------|
| 1 | [Tech Stack & Project Setup](./01-tech-stack.md) | Repo structure, tooling, dev environment, deployment notes | 🟢 Current |
| 2 | [Database Schema](./02-database-schema.md) | Tables, relationships, migrations strategy | 🟢 Current |
| 3 | [API Design](./03-api-design.md) | REST endpoints, request/response shapes | 🟡 Partial (exercises built; workout/set routes TBD) |
| 4 | [Core UI — Home Screen](./04-ui-home.md) | Dashboard with stats (streaks, recent workouts) and "Start Workout" entry point | 🟡 Spec only |
| 5 | [Core UI — Active Workout](./05-ui-active-workout.md) | Workout timer, exercise entry, set/rep/weight logging, rest timer | 🟡 Spec only |
| 6 | [Core UI — Workout Templates](./06-ui-templates.md) | Pick from previous workouts, pre-fill exercises, compare to last session's weights | 🟡 Spec only |
| 7 | [Exercise Library](./07-exercise-library.md) | Searchable exercise list, categories, custom exercises | 🟢 Current |
| 8 | [Auth & User Accounts](./08-auth.md) | Login, registration, session management (deferred until UI is solid) | 🔴 Deferred |
| 9 | [Stats & Progress](./09-stats-progress.md) | PR tracking, volume over time, charts, streak logic | 🔴 Deferred |
| 10 | [Future Ideas](./10-future-ideas.md) | Backlog of features to consider down the road | 🟡 Draft |

---

## Phase 1 — MVP Scope

The first buildable version covers docs 1–6:

1. Spin up the project (React frontend, Express API, Postgres DB)
2. Design the core tables (workouts, exercises, sets)
3. Build the Home screen with a "Start Workout" button
4. Build the Active Workout screen (exercise picker, set logging, timers)
5. Support loading a previous workout as a template with last session's weights visible
6. No auth yet — single-user, local-first

---

## How to Use These Docs

These docs are designed to be fed into Cursor or Claude Code as context when building each feature. The workflow:

1. Open the relevant doc(s) for the feature you're building
2. Paste into your AI coding tool as the prompt/context
3. Build the feature
4. Update the doc with any decisions or changes made during development
5. Move on to the next doc
