# Tasks: Sync Recurring Blocks

**Input**: Design documents from /specs/024-sync-recurring-blocks/
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Automated test tasks are omitted because the feature spec does not require TDD and this repository has no active `npm test` script. Validation is handled through targeted lint, type-check, and manual parity scenarios.

**Organization**: Tasks are grouped by user story to support independent implementation and validation.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Re-establish planning/task baseline after the plan template reset and align docs with current clarified scope.

- [X] T001 Capture current implementation baseline and known overlap symptom in specs/024-sync-recurring-blocks/quickstart.md
- [X] T002 Restore completed 024 implementation context in specs/024-sync-recurring-blocks/plan.md
- [X] T003 [P] Confirm clarified requirements including FR-015 and overlap merge behavior in specs/024-sync-recurring-blocks/spec.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Define and harden shared composition rules before role-specific list derivation logic.

**CRITICAL**: User story implementation starts only after this phase is complete.

- [X] T004 Align overlap-prevention and precedence invariants in specs/024-sync-recurring-blocks/research.md
- [X] T005 Align shared derivation validation rules for overlap handling in specs/024-sync-recurring-blocks/data-model.md
- [X] T006 Update shared composition guarantees for overlap prevention in specs/024-sync-recurring-blocks/contracts/list-derivation-composition.md
- [X] T007 [P] Update parity contract for overlap-free list rendering and 30-minute merge rule in specs/024-sync-recurring-blocks/contracts/recurring-block-list-parity.md
- [X] T008 Confirm shared availability contract exports remain complete in src/features/calendar/availability/index.ts

**Checkpoint**: Shared behavior and contracts are ready for role-level derivation updates.

---

## Phase 3: User Story 1 - Player View Consistency (Priority: P1)

**Goal**: Player list view remains parity-correct and never renders overlapping rows; 30-minute truncation artifacts are merged into previous AVAILABLE rows.

**Independent Test**: In player list view for a date with overlap-prone intervals, verify there are no overlapping rows and any 30-minute truncation remainder is merged into the previous AVAILABLE slot.

### Implementation for User Story 1

- [X] T009 [US1] Enforce overlap-safe slot expansion boundaries in src/features/players/calendar/deriveSlotRows.ts
- [X] T010 [US1] Implement 30-minute fragment merge into previous AVAILABLE slot in src/features/players/calendar/deriveSlotRows.ts
- [X] T011 [US1] Preserve player row mapping/actionability after merge logic in src/features/players/calendar/deriveSlotRows.ts
- [X] T012 [US1] Validate player recurring rule wiring still matches derivation expectations in src/features/players/PublicCalendarPage.tsx
- [X] T013 [US1] Validate player list props and derivation handoff for merged slots in src/features/players/calendar/PlayerListView.tsx
- [X] T014 [US1] Record player independent overlap-merge validation outcomes in specs/024-sync-recurring-blocks/quickstart.md

**Checkpoint**: Player story is independently functional with overlap-free list rows.

---

## Phase 4: User Story 2 - Admin View Consistency (Priority: P1)

**Goal**: Admin list view preserves parity and applies the same no-overlap rendering rule without regressing admin metadata rows.

**Independent Test**: In admin list view for overlap-prone intervals, verify there are no overlapping rows and booking metadata remains correct.

### Implementation for User Story 2

- [X] T015 [US2] Enforce overlap-safe slot expansion boundaries in src/features/admin/calendar/deriveAdminListRows.ts
- [X] T016 [US2] Implement 30-minute fragment merge into previous AVAILABLE slot in src/features/admin/calendar/deriveAdminListRows.ts
- [X] T017 [US2] Preserve admin booking/player/payment metadata mapping after merge logic in src/features/admin/calendar/deriveAdminListRows.ts
- [X] T018 [US2] Validate recurring rules handoff from page-level query in src/features/admin/AdminCalendarPage.tsx
- [X] T019 [US2] Validate list component input and row actions with merged slots in src/features/admin/AdminListView.tsx
- [X] T020 [US2] Record admin independent overlap-merge validation outcomes in specs/024-sync-recurring-blocks/quickstart.md

**Checkpoint**: Admin story is independently functional with overlap-free list rows.

---

## Phase 5: User Story 3 - Cross-View Data Parity (Priority: P2)

**Goal**: Ensure both roles and both views maintain deterministic parity across clarified precedence, boundaries, and overlap merge behavior.

**Independent Test**: Across a 14-day sample, list and calendar are parity-consistent; list has zero overlapping rows; overlap truncation artifacts are merged correctly.

### Implementation for User Story 3

- [X] T021 [US3] Verify composition precedence still honors CANCELLED/NO_SHOW override in src/features/calendar/availability/composeAvailabilitySegments.ts
- [X] T022 [US3] Verify empty-recurring regression parity and no-overlap output in src/features/players/calendar/deriveSlotRows.ts
- [X] T023 [US3] Verify admin no-overlap output parity with recurring/booking overlaps in src/features/admin/calendar/deriveAdminListRows.ts
- [X] T024 [P] [US3] Synchronize overlap/merge guarantees with final behavior in specs/024-sync-recurring-blocks/contracts/list-derivation-composition.md
- [X] T025 [P] [US3] Synchronize parity invariants with final behavior in specs/024-sync-recurring-blocks/contracts/recurring-block-list-parity.md
- [X] T026 [US3] Update data-model validation rules for overlap-free merged outputs in specs/024-sync-recurring-blocks/data-model.md
- [X] T027 [US3] Record cross-view parity walkthrough including overlap cases in specs/024-sync-recurring-blocks/quickstart.md

**Checkpoint**: Cross-view parity is validated and documented for all clarified rules.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Complete quality gates and finish release-ready documentation.

- [X] T028 Run targeted lint for touched feature files and log results in specs/024-sync-recurring-blocks/quickstart.md
- [X] T029 Run TypeScript no-emit check and log results in specs/024-sync-recurring-blocks/quickstart.md
- [X] T030 Run workspace lint and document pre-existing versus new issues in specs/024-sync-recurring-blocks/quickstart.md
- [X] T031 Run dev-server smoke check and log startup result in specs/024-sync-recurring-blocks/quickstart.md
- [X] T032 [P] Mark completed task checklist items in specs/024-sync-recurring-blocks/tasks.md

---

## Dependencies & Execution Order

### Phase Dependencies

- Phase 1: No dependencies.
- Phase 2: Depends on Phase 1 and blocks all user story execution.
- Phase 3 (US1): Depends on Phase 2.
- Phase 4 (US2): Depends on Phase 2.
- Phase 5 (US3): Depends on completion of US1 and US2 behavior.
- Phase 6: Depends on completion of all story phases.

### User Story Dependencies

- US1: Starts after foundational completion.
- US2: Starts after foundational completion.
- US3: Depends on completed US1 and US2 behavior for parity verification.

### Within Each User Story

- Derivation logic updates before component validation updates.
- Component wiring validation before documentation logging.
- Story checkpoint validation before next-priority story execution.

## Parallel Opportunities

- T003 can run in parallel with T001 and T002.
- T007 can run in parallel with T006 after T004 and T005.
- After Phase 2, US1 and US2 can proceed in parallel by separate implementers.
- T024 and T025 can run in parallel during US3 contract sync.
- T032 can run in parallel after T028 through T031 are complete.

## Parallel Example: User Story 1

Run T012 and T013 in parallel after T009 through T011 because they touch separate player files:
- src/features/players/PublicCalendarPage.tsx
- src/features/players/calendar/PlayerListView.tsx

## Parallel Example: User Story 2

Run T018 and T019 in parallel after T015 through T017 because they touch separate admin files:
- src/features/admin/AdminCalendarPage.tsx
- src/features/admin/AdminListView.tsx

## Parallel Example: User Story 3

Run T024 and T025 in parallel during contract synchronization:
- specs/024-sync-recurring-blocks/contracts/list-derivation-composition.md
- specs/024-sync-recurring-blocks/contracts/recurring-block-list-parity.md

## Implementation Strategy

### MVP First (User Story 1)

1. Complete Setup and Foundational phases.
2. Deliver US1 overlap-prevention and merge behavior.
3. Validate player behavior independently before expanding scope.

### Incremental Delivery

1. Deliver US1 (player overlap-free merge behavior).
2. Deliver US2 (admin overlap-free merge behavior).
3. Deliver US3 parity validation and documentation sync.
4. Run final quality gates and close checklist.

### Parallel Team Strategy

1. Complete Setup + Foundational as a shared baseline.
2. Split into parallel US1 and US2 execution.
3. Converge for US3 parity verification and final polish.
