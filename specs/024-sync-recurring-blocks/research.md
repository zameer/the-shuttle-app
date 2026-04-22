# Research: 024 - Sync Recurring Blocks

**Date**: 2026-04-22 | **Branch**: `024-setup-specify-invocation`
**Resolves**: Technical context unknowns for recurring unavailable parity across calendar and list views

---

## Decision 1: Root Cause of View Mismatch

**Decision**: Treat the issue as a derivation parity defect, not a data-fetch defect.

**Rationale**:
- Calendar week rendering already includes recurring blocks by loading `useRecurringBlocks()` and overlaying each day match in `WeekView.tsx`.
- Player and admin list views are generated via `deriveSlotRows()` and `deriveAdminListRows()`, which currently derive only from booking records and do not ingest recurring block data.
- Therefore, recurring blocks appear in calendar but are missing in list because list derivation has no recurring block path.

**Alternatives considered**:
- Duplicate recurring overlay logic directly inside both list view components: rejected due to logic drift risk.
- Convert recurring blocks into persistent booking rows in DB: rejected as out of scope and unnecessary schema/workflow change.

---

## Decision 2: Canonical Availability Composition

**Decision**: Build a shared composition step that merges two sources before list-row derivation:
1. explicit bookings from booking query
2. recurring unavailable blocks expanded for the active day/date range

**Rationale**:
- The mismatch is caused by independent derivation paths.
- A shared composition utility enables one availability truth for both player/admin list rendering.
- Keeps parity with existing calendar semantics without requiring DB migrations.

**Alternatives considered**:
- Keep separate derive functions and patch each independently: rejected because parity regressions likely recur.

---

## Decision 3: Recurring Block Expansion Rules

**Decision**: Expand recurring blocks into synthetic unavailable segments only for matching `day_of_week` and only within schedule window boundaries.

**Rationale**:
- Mirrors week-view behavior and existing court-hours constraints.
- Avoids synthetic rows outside visible schedule.
- Supports edge cases around overlap and boundaries through deterministic interval clamping.

**Alternatives considered**:
- Expand all recurring blocks then trim in UI component: rejected; pushes business logic into UI and increases inconsistency risk.

---

## Decision 4: Conflict/Overlap Precedence

**Decision**: Apply deterministic precedence when composing list segments:
- Explicit booking segments remain source-of-truth when they overlap recurring synthetic segments.
- Recurring synthetic segments fill only uncovered intervals.
- Final output must not contain contradictory statuses for the same interval.

**Rationale**:
- Prevents dual-status rendering in list rows.
- Preserves existing operational edits represented by booking records.

**Alternatives considered**:
- Always prioritize recurring block over booking: rejected; may hide intentionally overridden booking state.

---

## Decision 5: Scope and Storage

**Decision**: No schema changes and no API contract changes.

**Rationale**:
- Existing table `recurring_unavailable_blocks` and `useRecurringBlocks()` provide required data.
- Defect is in client composition path.
- Faster and lower-risk fix consistent with feature scope.

**Alternatives considered**:
- Add server-side combined endpoint/view: rejected for this feature due to extra backend coupling and migration effort.

---

## Decision 6: Validation Strategy

**Decision**: Validate parity with deterministic cross-view checks for both roles.

**Rationale**:
- Feature success criteria require parity, not only correctness within one view.
- Validation includes date-window edges, overlap, and week transitions.

**Alternatives considered**:
- Manual visual check on one role only: rejected; does not satisfy spec FR-002/FR-004/FR-008.

---

## Best-Practice Summary

- Keep availability derivation in pure functions, not component JSX.
- Reuse one recurring expansion/composition utility for both player/admin list derivation.
- Clamp to schedule boundaries before row emission.

---

## Decision 7: CANCELLED/NO_SHOW Booking Precedence (2026-04-22 clarification)

**Decision**: When a booking has status CANCELLED or NO_SHOW, its sub-interval is treated as AVAILABLE even if a recurring block covers the same window.

**Rationale**:
- Cancelled slot is operationally free; the admin voided it.
- A recurring block should not silently re-block a slot whose booking was explicitly cancelled.
- This makes the list view accurately reflect that a player can book the time.

**Updated priority order**:
1. CONFIRMED / PENDING / UNAVAILABLE booking -> booking status wins
2. CANCELLED / NO_SHOW booking -> AVAILABLE (recurring block check skipped)
3. Recurring block (no booking) -> UNAVAILABLE
4. Pure gap -> AVAILABLE

**Alternatives considered**:
- Recurring block wins over CANCELLED/NO_SHOW: rejected (would show UNAVAILABLE on a bookable slot).
- Third state "Cancelled-Blocked": rejected (unnecessary complexity, no UI support).

---

## Decision 8: 60-Min AVAILABLE Slot Granularity (2026-04-22 clarification)

**Decision**: AVAILABLE gap segments from `composeAvailabilitySegments` must be expanded into fixed 60-minute AVAILABLE slots in the derive functions. Expansion anchors at the gap's actual start time (not aligned to hour grid). Each slot is always exactly 60 minutes regardless of gap size.

**Rationale**:
- Pre-024 derivation produced hourly AVAILABLE slots via a cursor loop; this must be preserved (FR-012).
- Partial gaps adjacent to recurring block boundaries (e.g., gap starts at 07:30) must emit a full 60-min slot from 07:30 to 08:30, not a truncated 30-min slot (FR-010).

**Alternatives considered**:
- Produce variable-length AVAILABLE segments: rejected (breaks UI display contract; pre-024 regression).
- Align partial gaps to hour grid: rejected (would silently suppress or overlap slots at non-hour boundaries).

---

## Decision 9: Empty recurringRules Regression Guard (2026-04-22 clarification)

**Decision**: When `recurringRules = []`, the final derive output must be structurally identical to the pre-024 derivation in slot count, boundary timestamps, and status values.

**Rationale**:
- The common production case is no recurring blocks. Any deviation would be a silent regression for all courts not using recurring blocks.
- FR-012 formalises this as a hard acceptance criterion (SC-005).

**Proof**: gap [06:00, 22:00) expanded to 16 x 60-min slots 06:00-07:00...21:00-22:00 matches the pre-024 cursor output exactly.

---

## Decision 10: Recurring Row Actionability (2026-04-22 clarification)

**Decision**: Recurring-block rows are `actionable: false` for all roles in both player and admin list views.

**Rationale**:
- Recurring blocks are admin-configured non-bookable periods.
- Marking non-actionable is consistent with how UNAVAILABLE booking rows are already handled.
- No edit-in-place interaction on recurring rows in list view.

**Already correct**: Current implementation emits `actionable: false` for recurring segments. No code change needed. Confirmed by 2026-04-22 clarification session.

---

## Decision 11: Strict Player Window Clamping and End-Boundary Truncation (2026-04-22 clarification)

**Decision**: Strict schedule start/end boundary enforcement applies to player list view only. If the final player AVAILABLE slot would cross daily end time, truncate it to end exactly at the configured boundary.

**Rationale**:
- Clarification requires player-visible slots to remain strictly within configured operating hours.
- Truncation keeps the slot discoverable for boundary-adjacent gaps while preventing out-of-window rendering.
- Scope remains role-specific to avoid introducing admin behavior changes not requested in clarification.

**Alternatives considered**:
- Omit partial boundary slot: rejected because it hides valid residual player availability near close time.
- Shift slot earlier to keep 60 minutes: rejected because it misrepresents actual gap start.

---

## Implementation Outcome (2026-04-22)

**Status**: First implementation pass complete (all 27 tasks marked [x]). However, the clarification session identified three regressions requiring a follow-up code fix:

1. `composeAvailabilitySegments` does not split booking branch by status -> CANCELLED/NO_SHOW incorrectly block recurring-covered slots
2. No 60-min slot expansion in derive functions -> AVAILABLE outputs are variable-length (regression vs pre-024)
3. Both issues confirmed by live inspection; fix plan documented in `plan.md` Phase 1.1 and 1.2
- Ensure deterministic sorting and non-overlapping final row intervals.
- Preserve strict TypeScript models for synthetic vs persisted segments.

## Implementation Outcome (2026-04-22)

- Implemented shared recurring-aware composition in `src/features/calendar/availability/composeAvailabilitySegments.ts`.
- Implemented shared schedule window normalization in `src/features/calendar/availability/scheduleWindow.ts`.
- Refactored player and admin list derivation paths to consume shared composition.
- Wired recurring rule query data into both `PublicCalendarPage` and `AdminCalendarPage` list-mode flows.
- Verified feature-touched files with ESLint and project type-check (`npx tsc --noEmit`).
- Implemented player-only strict boundary clamping and end-boundary truncation in `deriveSlotRows.ts` (FR-013, FR-014).
