# Tasks: Sync Recurring Blocks

**Input**: Design documents from /specs/024-sync-recurring-blocks/
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: No automated test framework is specified in this feature; validation tasks below use lint, type-check, and manual parity checks documented in quickstart.md.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm current baseline and prepare feature documentation for implementation tracking.

- [x] T001 Capture baseline behavior notes in specs/024-sync-recurring-blocks/quickstart.md
- [x] T002 Capture current touched-file scope in specs/024-sync-recurring-blocks/plan.md
- [x] T003 [P] Confirm prerequisite artifacts exist in specs/024-sync-recurring-blocks/spec.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Complete shared derivation groundwork used by both player and admin list flows.

**CRITICAL**: No user story implementation starts before this phase is done.

- [x] T004 Align shared segment contracts in src/features/calendar/availability/types.ts
- [x] T005 Align schedule window creation behavior in src/features/calendar/availability/scheduleWindow.ts
- [x] T006 Implement precedence rules for booking vs recurring in src/features/calendar/availability/composeAvailabilitySegments.ts
- [x] T007 [P] Ensure availability exports remain complete in src/features/calendar/availability/index.ts
- [x] T008 Document finalized precedence decisions in specs/024-sync-recurring-blocks/research.md

**Checkpoint**: Foundation ready - user stories can proceed.

---

## Phase 3: User Story 1 - Player View Consistency (Priority: P1)

**Goal**: Player list view shows recurring blocks and available slots correctly, with strict player start/end boundary enforcement and end-boundary truncation.

**Independent Test**: In player list view, recurring-unavailable intervals match calendar intervals, and no row crosses daily start/end boundaries; boundary-crossing final slot truncates to end time.

### Implementation for User Story 1

- [x] T009 [US1] Wire recurring rules query into player calendar page in src/features/players/PublicCalendarPage.tsx
- [x] T010 [US1] Pass recurring rules to player list derivation in src/features/players/calendar/PlayerListView.tsx
- [x] T011 [US1] Expand gap segments into slot rows in src/features/players/calendar/deriveSlotRows.ts
- [x] T012 [US1] Enforce player-only boundary clamp and end-boundary truncation in src/features/players/calendar/deriveSlotRows.ts
- [x] T013 [US1] Preserve player row mapping and actionability semantics in src/features/players/calendar/deriveSlotRows.ts
- [x] T014 [US1] Record player independent validation results in specs/024-sync-recurring-blocks/quickstart.md

**Checkpoint**: User Story 1 works independently in player views.

---

## Phase 4: User Story 2 - Admin View Consistency (Priority: P1)

**Goal**: Admin list view shows recurring blocks and availability parity with calendar, without applying player-only boundary truncation rules.

**Independent Test**: In admin list view, recurring-unavailable intervals match admin calendar intervals and preserve existing admin row semantics.

### Implementation for User Story 2

- [x] T015 [US2] Wire recurring rules query into admin calendar page in src/features/admin/AdminCalendarPage.tsx
- [x] T016 [US2] Pass recurring rules to admin list derivation in src/features/admin/AdminListView.tsx
- [x] T017 [US2] Expand admin gap segments into slot rows in src/features/admin/calendar/deriveAdminListRows.ts
- [x] T018 [US2] Preserve admin booking row metadata mapping in src/features/admin/calendar/deriveAdminListRows.ts
- [x] T019 [US2] Confirm recurring rows remain non-actionable in src/features/admin/calendar/deriveAdminListRows.ts
- [x] T020 [US2] Record admin independent validation results in specs/024-sync-recurring-blocks/quickstart.md

**Checkpoint**: User Story 2 works independently in admin views.

---

## Phase 5: User Story 3 - Cross-View Data Parity (Priority: P2)

**Goal**: Maintain deterministic parity between player/admin list and calendar views across edge conditions and clarified precedence rules.

**Independent Test**: Across a 14-day sample window, list and calendar show matching unavailable ranges for both roles, including CANCELLED/NO_SHOW overlap and boundary edge scenarios.

### Implementation for User Story 3

- [x] T021 [US3] Validate CANCELLED and NO_SHOW override behavior in src/features/calendar/availability/composeAvailabilitySegments.ts
- [x] T022 [US3] Validate empty-recurring regression parity in src/features/players/calendar/deriveSlotRows.ts
- [x] T023 [US3] Validate partial-gap expansion parity in src/features/admin/calendar/deriveAdminListRows.ts
- [x] T024 [P] [US3] Sync parity invariants with implementation in specs/024-sync-recurring-blocks/contracts/recurring-block-list-parity.md
- [x] T025 [P] [US3] Sync composition guarantees with implementation in specs/024-sync-recurring-blocks/contracts/list-derivation-composition.md
- [x] T026 [US3] Sync validation rules with implementation in specs/024-sync-recurring-blocks/data-model.md
- [x] T027 [US3] Record cross-view parity walkthrough results in specs/024-sync-recurring-blocks/quickstart.md

**Checkpoint**: Cross-view parity requirements are validated and documented.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final quality gate execution and release-readiness documentation.

- [x] T028 Run targeted lint for touched files and log results in specs/024-sync-recurring-blocks/quickstart.md
- [x] T029 Run TypeScript no-emit check and log results in specs/024-sync-recurring-blocks/quickstart.md
- [x] T030 Run workspace lint and log pre-existing vs new issues in specs/024-sync-recurring-blocks/quickstart.md
- [x] T031 Run dev-server smoke check and log results in specs/024-sync-recurring-blocks/quickstart.md
- [x] T032 [P] Mark completed implementation tasks in specs/024-sync-recurring-blocks/tasks.md

---

## Dependencies & Execution Order

### Phase Dependencies

- Phase 1 (Setup): no dependencies.
- Phase 2 (Foundational): depends on Phase 1 and blocks all user stories.
- Phase 3 (US1): depends on Phase 2.
- Phase 4 (US2): depends on Phase 2.
- Phase 5 (US3): depends on completion of US1 and US2 validations.
- Phase 6 (Polish): depends on all story phases.

### User Story Dependencies

- US1: independent after foundational phase.
- US2: independent after foundational phase.
- US3: depends on behavior delivered by US1 and US2.

### Within Each User Story

- Data wiring tasks before derivation behavior tasks.
- Derivation behavior tasks before validation/documentation tasks.
- Story checkpoint must pass before moving to lower-priority work.

## Parallel Opportunities

- T003 can run in parallel with T001-T002.
- T007 can run in parallel with T006 once T004-T005 are complete.
- After Phase 2, US1 and US2 can run in parallel by separate implementers.
- T024 and T025 can run in parallel during US3 documentation sync.
- T032 can run in parallel with final polish verification once T028-T031 pass.

## Parallel Example: User Story 1

- T009 plus T010 can run in parallel after T008 because they touch different files:
	- src/features/players/PublicCalendarPage.tsx
	- src/features/players/calendar/PlayerListView.tsx

## Parallel Example: User Story 2

- T015 plus T016 can run in parallel after T008 because they touch different files:
	- src/features/admin/AdminCalendarPage.tsx
	- src/features/admin/AdminListView.tsx

## Parallel Example: User Story 3

- T024 plus T025 can run in parallel during documentation sync:
	- specs/024-sync-recurring-blocks/contracts/recurring-block-list-parity.md
	- specs/024-sync-recurring-blocks/contracts/list-derivation-composition.md

## Implementation Strategy

### MVP First (User Story 1)

1. Complete Phase 1 and Phase 2.
2. Deliver US1 through T014.
3. Validate player-only strict boundary behavior before expanding scope.

### Incremental Delivery

1. Deliver US1 (player parity + strict boundary behavior).
2. Deliver US2 (admin parity without player-only truncation side effects).
3. Deliver US3 (cross-view parity checks and documentation sync).
4. Run Phase 6 quality gates.

### Parallel Team Strategy

1. Team aligns on Phase 1 and Phase 2.
2. Developer A implements US1 while Developer B implements US2.
3. Both converge on US3 parity validation and final polish.
