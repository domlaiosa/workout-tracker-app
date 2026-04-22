# 09 — Stats & Progress

**Status: Deferred — not part of MVP**

Stats features will be built after the core workout logging flow is solid.

## Planned Scope (future)

- **Personal records (PRs):** Track max weight lifted per exercise across all time
- **Volume tracking:** Total weight lifted per session or per week
- **Streak logic:** Consecutive workout days / weeks
- **Charts:** Progress over time per exercise (weight, reps, volume)

## Open Decisions

- [ ] Where to compute stats: in SQL queries, in the backend, or client-side?
- [ ] Chart library choice (if any)
- [ ] What counts as a "streak" — calendar days, or workout days?
- [ ] Whether PRs are stored explicitly or always computed from the `sets` table
