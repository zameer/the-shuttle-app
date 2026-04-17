# Tasks: Player List End-Time Enforcement

**Input**: Design documents from /specs/017-player-list-endtime/
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/, quickstart.md

**Tests**: No automated test tasks included because the specification did not request TDD/new automated tests; verification is via lint plus manual QA scenarios in quickstart.md.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

## Format: [ID] [P?] [Story] Description

- [P]: Parallelizable task (different files, no unresolved dependency)
- [Story]: User story label (US1, US2)
- Each task includes an exact file path

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm feature-ready state and active artifacts.

- [X] T001 Verify feature artifacts and baseline scope in specs/017-player-list-endtime/plan.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish derivation boundary contract used by all stories.

- [X] T002 Define/align close-boundary derivation contract (minute precision + fallback behavior) in specs/017-player-list-endtime/contracts/player-list-endtime-contract.md

**Checkpoint**: Boundary contract is clear; story implementation can proceed.

---

## Phase 3: User Story 1 - Stop Player List at Closing Time (Priority: P1) 🎯 MVP

**Goal**: Ensure player list rows never render beyond configured closing boundary.

**Independent Test**: Open player list for a date with late bookings and verify no row end-time exceeds configured close boundary.

### Implementation for User Story 1

- [X] T003 [US1] Clamp booking row end-time to schedule close boundary and preserve chronological row output in src/features/players/calendar/deriveSlotRows.ts
- [X] T004 [US1] Exclude post-close booking rows and guard against non-positive boundary-overlap segments in src/features/players/calendar/deriveSlotRows.ts

**Checkpoint**: Player list hard stop at closing time works for normal and boundary-overlap bookings.

---

## Phase 4: User Story 2 - Preserve Clear End-of-Day Visibility (Priority: P2)

**Goal**: Keep end-of-day output precise (including minute boundaries) and resilient when settings are unavailable.

**Independent Test**: Compare player list output for close times with and without minute components; verify fallback rendering if settings are unavailable.

### Implementation for User Story 2

- [X] T005 [US2] Parse and pass close-boundary input from court settings without losing minute precision in src/features/players/calendar/PlayerListView.tsx
- [X] T006 [US2] Preserve safe fallback to default close boundary when settings are unavailable in src/features/players/calendar/PlayerListView.tsx

**Checkpoint**: Minute-precision end boundary and fallback behavior are both verified in player list rendering.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Validate quality gate and feature acceptance coverage.

- [X] T007 Run focused lint validation for touched files with npx eslint src/features/players/calendar/deriveSlotRows.ts src/features/players/calendar/PlayerListView.tsx
- [ ] T008 Execute manual validation scenarios and regression checks in specs/017-player-list-endtime/quickstart.md

---

## Dependencies & Execution Order

1. T001 -> T002
2. T002 -> T003 -> T004
3. T002 -> T005 -> T006
4. T004 + T006 -> T007 -> T008

Story completion order:
1. US1 (T003-T004) for MVP compliance outcome
2. US2 (T005-T006) for precision/fallback reliability

---

## Parallel Execution Examples

- Parallel option A: T003 and T005 can run in parallel after T002 (different files).
- Parallel option B: T004 and T006 can run in parallel once their predecessor tasks complete.

Example sequence:
- Engineer A: T003 -> T004 in src/features/players/calendar/deriveSlotRows.ts
- Engineer B: T005 -> T006 in src/features/players/calendar/PlayerListView.tsx
- Shared finish: T007 -> T008

---

## Implementation Strategy

### MVP First (US1 only)

1. Complete T001-T004.
2. Run T007 and validate US1 scenarios from quickstart.
3. Ship if only strict close-boundary compliance is needed immediately.

### Incremental Full Delivery

1. Add US2 precision/fallback tasks (T005-T006).
2. Re-run T007 and complete T008 manual checks.
3. Mark feature complete with all stories satisfied.
