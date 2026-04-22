# 08 — Auth & User Accounts

**Status: Deferred — not part of MVP**

Authentication is intentionally excluded from Phase 1. The app runs as a single-user, local-first tool with no login required.

## Planned Scope (future)

- User registration and login
- Session management (JWT or cookie-based)
- Per-user data isolation (workouts, exercises scoped to a user_id)

## Open Decisions

- [ ] Auth strategy: JWT vs session cookies
- [ ] Library: Passport.js, Lucia, or hand-rolled?
- [ ] Whether to support OAuth (Google login) or email/password only
- [ ] Schema changes needed: add `user_id` FK to `workouts` and `exercises` tables
