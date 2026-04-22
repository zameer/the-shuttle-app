# Quickstart: 024 - Sync Recurring Blocks

Validate recurring unavailable parity between calendar and list views for player and admin.

## 0. Baseline notes (captured before this implementation pass)

- Existing recurring parity wiring was already present in both player and admin list paths.
- Core remaining gap from clarify outcomes was player-only strict boundary behavior (FR-013, FR-014).
- A reported overlap symptom existed in list rows when a generated AVAILABLE row crossed into a later booking start.
- Clarified FR-015 adds two strict rules: no overlapping rows, and merge short trailing AVAILABLE remainders (for example 30 minutes) into the previous AVAILABLE row.
- `npm test` is not available in this repository; quality checks rely on lint, type-check, and manual scenario walkthroughs.

## Prerequisites

- Existing development environment configured.
- Supabase local or connected environment seeded with:
  - court settings
  - at least one recurring unavailable block
  - representative booking records

## 1. Install and run

```bash
npm install
npm run dev
```

Open the app and sign in as admin for admin scenarios.

## 2. Baseline parity check (player)

1. Go to public calendar page.
2. Select a date matching an existing recurring block day.
3. In calendar mode, confirm recurring block is visible at expected time range.
4. Switch to list mode for the same date.
5. Verify the same time range appears as `Unavailable` in list rows.

Expected: No recurring block visible in calendar without corresponding unavailable list row.

## 3. Baseline parity check (admin)

1. Go to admin calendar page.
2. Select the same date.
3. Confirm recurring block appears in calendar mode.
4. Switch to list mode.
5. Verify list shows matching unavailable range.

Expected: Admin list and calendar have identical recurring unavailable coverage for that date.

## 4. Update propagation check

1. In admin settings, create a new recurring block for another weekday/time.
2. Return to admin calendar/list and verify parity for that weekday.
3. Open public page and verify parity for player view as well.
4. Delete the new recurring block.
5. Confirm both views remove it consistently.

Expected: Create/update/delete are reflected in both modes without mismatch.

## 5. Edge-case checks

1. Boundary start/end (at court open/close times).
2. Overlap with existing booking records.
3. Navigation across at least 14 consecutive days (SC-003).

Expected:
- Boundaries remain visible in both modes.
- Overlap does not create contradictory statuses for same interval.
- No cross-view mismatch in tested window.

## 6. Quality gates

```bash
npm run lint
npx eslint src/features/calendar/availability src/features/players/calendar/deriveSlotRows.ts src/features/players/calendar/PlayerListView.tsx src/features/players/PublicCalendarPage.tsx src/features/admin/calendar/deriveAdminListRows.ts src/features/admin/AdminListView.tsx src/features/admin/AdminCalendarPage.tsx
npx tsc --noEmit
```

Expected:
- Workspace-wide lint may fail on pre-existing unrelated issues.
- Feature-touched files lint clean.
- Type-check passes.

## 7. Regression checks (FR-009, FR-010, FR-012, FR-013, FR-014, FR-015)

After the Phase 1.2 fix (`expandGapTo60MinSlots`) is applied:

1. **Empty recurring rules** (FR-012): Open list view on a date with no recurring blocks. Count
   AVAILABLE rows. Expected: 16 rows of exactly 60 minutes each (06:00-07:00 through 21:00-22:00).
2. **Partial gap at non-hour** (FR-010): Configure a recurring block ending at 07:30. Open list
   view. Expected: first AVAILABLE row is 07:30-08:30 (full 60 min, not truncated to 07:30-08:00).
3. **No variable-length AVAILABLE rows** (FR-009): Inspect all AVAILABLE rows in the rendered
   list. Expected: every AVAILABLE row shows exactly 60 minutes.
4. **Player strict schedule boundaries** (FR-013): In player list view, verify no row starts
  before configured open time and no row ends after configured close time.
5. **Player end-boundary truncation** (FR-014): Configure a boundary-adjacent available gap where
  full 60-min expansion would cross daily close. Expected: final player row is truncated to end
  exactly at close time (example: 21:30-22:00).
6. **No overlap + merge remainder** (FR-015): Reproduce an interval where naive 60-min expansion
  would overlap an upcoming blocking booking. Expected: no overlap in rendered rows and any short
  tail remainder is merged into the previous contiguous AVAILABLE row.

## 8. Validation log (2026-04-22 -- implementation pass)

- Dev server startup: pass (`npm run dev`, Vite served on `http://localhost:5173`).
- Targeted feature lint (availability + player/admin derivation flows): pass.
- Type-check (`npx tsc --noEmit`): pass.
- Workspace lint (`npm run lint`): fails on 9 pre-existing unrelated errors; no new errors in 024 touched files.
- Changes applied:
  - `composeAvailabilitySegments.ts`: `BLOCKING_STATUSES` constant added; CANCELLED/NO_SHOW now yield AVAILABLE (FR-007).
  - `deriveSlotRows.ts`: `expandGapTo60MinSlots` helper added; gap segments expand to 60-min slots and final player boundary slot is truncated at `scheduleEnd` (FR-009, FR-010, FR-013, FR-014).
  - `deriveAdminListRows.ts`: same `expandGapTo60MinSlots` helper added (FR-009, FR-010, FR-012).
  - `deriveSlotRows.ts`: overlap-safe expansion now stops at true gap boundary and merges short trailing AVAILABLE remainder into previous AVAILABLE row (FR-015).
  - `deriveAdminListRows.ts`: same overlap-safe expansion and remainder merge behavior applied for admin list parity (FR-015).
- T014-T017 (manual browser regression checks): pending QA on seeded Supabase environment.
  See Section 7 for exact test steps.
- FR-013/FR-014 boundary logic: implemented in `deriveSlotRows.ts` by clamping expanded player gap rows to `window.scheduleEnd`.
- Manual UI confirmation for FR-013/FR-014 remains pending QA in seeded environment.
- `npm test`: not available in this repository (`Missing script: test`).
- Manual 14-day parity walkthrough remains a release-checklist activity for QA using steps in sections 2-5.
