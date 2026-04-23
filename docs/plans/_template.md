# Plan: [Feature Name]

**Status:** Draft | Ready | In Progress | Done  
**Spec docs to reference:** `docs/XX-....md`  
**Type:** Frontend | Backend | Full-stack

---

> This template is a guide, not a strict requirement. Include the sections that are relevant, skip or rename ones that aren't, and add new sections if the feature needs them. The only mandatory sections are **Overview & Goals**, **Out of Scope**, and **Acceptance Criteria**.
>
> **Acceptance Criteria checkboxes are required in every plan.** The agent must check each box off as it completes that item — do not mark the plan as Done until all boxes are checked.

---

<!--
## Table of Contents (optional — include for large plans only)

1. [Overview & Goals](#1-overview--goals)
2. [Section Name](#section-name)
3. [Out of Scope](#out-of-scope)
4. [Acceptance Criteria](#acceptance-criteria)
-->

---

## 1. Overview & Goals

> What is this feature and why does it exist? 1–3 sentences max.

---

<!--
─────────────────────────────────────────────
  OPTIONAL SECTIONS — include what applies,
  delete the rest before handing to the agent
─────────────────────────────────────────────

## Assumptions
> What is this plan taking for granted that isn't explicitly in the spec docs?
> List any judgment calls made so the agent doesn't have to guess.

-

─────────────────────────────────────────────

## Files Affected
> Every file that will be created or modified. Be explicit — this is the
> most important thing for the agent to think through before writing code.

```
CREATE  server/src/routes/example.js   — description
MODIFY  server/src/index.js            — description
CREATE  client/src/pages/Example.jsx   — description
```

─────────────────────────────────────────────

## UI Layout & Behavior
> Describe screens, layouts, and interactions. Mobile-first (375px baseline).

**Screen / Route:** `/example`

```
┌─────────────────────────┐
│  Header                 │
├─────────────────────────┤
│  [Component A]          │
│  [Component B]          │
└─────────────────────────┘
```

**Interactions:**
- What happens when the user taps X?
- What triggers navigation to the next screen?

─────────────────────────────────────────────

## Component Breakdown
> List React components needed. Note new vs. reuse.

| Component | New / Reuse | Notes |
|-----------|-------------|-------|
| `ExampleScreen` | New | Top-level route component |
| `SomeButton` | Reuse | Already exists in `src/components/` |

─────────────────────────────────────────────

## API Needs
> Which endpoints does this feature call, and are any new ones needed?

**Endpoints used:**
- `GET /some-resource` — returns X

**New endpoints needed:**
- `POST /some-resource` — describe shape

```json
// Request
{ "field": "value" }

// Response
{ "id": 1, "field": "value" }
```

─────────────────────────────────────────────

## Schema Changes
> New tables, columns, or relationships needed. Reference doc 02 for existing schema.

| Table | Change | Notes |
|-------|--------|-------|
| `workouts` | Add column `notes TEXT` | Optional user note per session |

─────────────────────────────────────────────

## Edge Cases & Constraints
> What could go wrong? What behavior is expected in unusual states?

- Empty state?
- API failure handling?
- Input validation rules?
- Mobile-specific concerns (keyboard, scroll, thumb reach)?

─────────────────────────────────────────────
-->

---

## Out of Scope

> Explicitly list what this plan does NOT cover.

-
-

---

## Acceptance Criteria

> Checklist to verify the feature is complete.

- [ ]
- [ ] Spec docs updated to reflect any changes made
