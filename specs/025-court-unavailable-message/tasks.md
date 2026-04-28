# Tasks: Court Unavailable Announcement

**Input**: Design documents from `/specs/025-court-unavailable-message/`
**Prerequisites**: `plan.md` (required), `spec.md` (required), `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: No explicit TDD or automated-test requirement was requested in the feature spec, so this task list focuses on implementation plus manual validation gates from `quickstart.md`.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare schema and feature scaffolding used by all stories.

- [X] T001 Create migration to extend court settings with player display fields in `supabase/migrations/20260428_add_player_display_mode_and_closure_message_to_court_settings.sql`
- [X] T002 Add migration verification notes for local/dev rollout in `specs/025-court-unavailable-message/quickstart.md`
- [X] T003 Add feature-level implementation notes and touched-file map in `specs/025-court-unavailable-message/plan.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Implement shared data contracts and base UI building blocks before story work.

**⚠️ CRITICAL**: Complete this phase before starting user story implementation.

- [X] T004 Add `PlayerDisplayMode` and closure-message fields to settings query/mutation contracts in `src/features/admin/useCourtSettings.ts`
- [X] T005 [P] Add reusable closure message rendering component shell in `src/components/shared/ClosureMessagePanel.tsx`
- [X] T006 [P] Add closure message typography and responsive container styles in `src/index.css`
- [X] T007 Wire `react-markdown`-based safe rendering and plain-text fallback handling in `src/components/shared/ClosureMessagePanel.tsx`
- [X] T008 Ensure court-settings cache invalidation/refetch covers mode and message updates in `src/features/admin/useCourtSettings.ts`

**Checkpoint**: Shared schema + rendering + settings contracts are ready.

---

## Phase 3: User Story 1 - Player Closure View (Priority: P1) 🎯 MVP

**Goal**: Show a deterministic full-court-unavailable message to players instead of calendar interactions when closure mode is active.

**Independent Test**: Activate `closure_message` mode and verify player page shows only closure UI with readable formatted content and no booking interactions.

### Implementation for User Story 1

- [X] T009 [US1] Add display-mode branch logic for player entry view in `src/features/players/PublicCalendarPage.tsx`
- [X] T010 [US1] Replace calendar/list interaction surfaces with closure panel in closure mode in `src/features/players/PublicCalendarPage.tsx`
- [X] T011 [US1] Connect closure message source data from court settings to closure panel props in `src/features/players/PublicCalendarPage.tsx`
- [X] T012 [US1] Render standardized closure heading plus markdown body via shared panel in `src/features/players/PublicCalendarPage.tsx`
- [X] T013 [US1] Guard against mixed render state so calendar and closure UI never appear together in `src/features/players/PublicCalendarPage.tsx`

**Checkpoint**: Player can clearly see closure state without calendar controls when mode is `closure_message`.

---

## Phase 4: User Story 2 - Admin Mode Selection (Priority: P1)

**Goal**: Allow admins to switch player-facing view between normal calendar and closure message.

**Independent Test**: Save mode as `calendar`, then `closure_message`, then back to `calendar`; verify player view follows the most recent save each time.

### Implementation for User Story 2

- [X] T014 [US2] Add admin form field for `playerDisplayMode` in settings form state in `src/features/admin/AdminSettingsPage.tsx`
- [X] T015 [US2] Add mode selector UI controls for `calendar` and `closure_message` in `src/features/admin/AdminSettingsPage.tsx`
- [X] T016 [US2] Map selector value into mutation payload and persist on save in `src/features/admin/AdminSettingsPage.tsx`
- [X] T017 [US2] Load and hydrate admin mode selector from fetched court settings defaults in `src/features/admin/AdminSettingsPage.tsx`
- [X] T018 [US2] Show save success and failure feedback for mode changes in `src/features/admin/AdminSettingsPage.tsx`

**Checkpoint**: Admin can reliably control the global player display mode.

---

## Phase 5: User Story 3 - Admin Formatted Message Management (Priority: P2)

**Goal**: Allow admins to author and maintain formatted closure content with required validation.

**Independent Test**: Save formatted markdown message in closure mode and verify player page renders updated formatting; verify empty content is blocked when closure mode is selected.

### Implementation for User Story 3

- [X] T019 [US3] Add closure message markdown input control and help text in `src/features/admin/AdminSettingsPage.tsx`
- [X] T020 [US3] Persist `closureMessageMarkdown` value through settings mutation flow in `src/features/admin/AdminSettingsPage.tsx`
- [X] T021 [US3] Enforce trimmed non-empty closure message validation when mode is `closure_message` in `src/features/admin/AdminSettingsPage.tsx`
- [X] T022 [US3] Preserve stored closure message when switching mode back to `calendar` in `src/features/admin/AdminSettingsPage.tsx`
- [X] T023 [US3] Add inline validation messaging for missing closure content in `src/features/admin/AdminSettingsPage.tsx`

**Checkpoint**: Admin can manage formatted closure content safely, and invalid empty closure state is blocked.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final hardening, docs sync, and end-to-end validation across stories.

- [X] T024 [P] Update feature quickstart steps to match final admin/player UX wording in `specs/025-court-unavailable-message/quickstart.md`
- [X] T025 [P] Align data model notes with implemented field names and validation behavior in `specs/025-court-unavailable-message/data-model.md`
- [X] T026 Run lint for touched frontend files and record outcomes in `specs/025-court-unavailable-message/quickstart.md`
- [X] T027 Run type-check for touched frontend files and record outcomes in `specs/025-court-unavailable-message/quickstart.md`
- [ ] T028 Execute manual acceptance walkthrough for US1-US3 and capture results in `specs/025-court-unavailable-message/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies, starts immediately.
- **Phase 2 (Foundational)**: Depends on Phase 1 and blocks all user stories.
- **Phase 3 (US1)**: Depends on Phase 2.
- **Phase 4 (US2)**: Depends on Phase 2.
- **Phase 5 (US3)**: Depends on Phase 2 and integrates with US2 admin settings flow.
- **Phase 6 (Polish)**: Depends on completion of selected user stories.

### User Story Dependencies

- **US1 (P1)**: Depends only on foundational work; independently testable by setting mode to `closure_message`.
- **US2 (P1)**: Depends only on foundational work; independently testable via admin save flow.
- **US3 (P2)**: Depends on US2 form/mutation path but remains independently verifiable for message formatting and validation.

### Suggested Delivery Order

1. Complete Phase 1 and Phase 2.
2. Implement US2 to establish admin control path.
3. Implement US1 to consume controlled mode in player UI (MVP is US1 + US2 together).
4. Implement US3 for formatted content quality and validation hardening.
5. Run Phase 6 polish and validation.

---

## Parallel Opportunities

- **Setup**: T002 and T003 can run in parallel after T001.
- **Foundational**: T005 and T006 can run in parallel; T007 follows T005.
- **US1**: T009 can start while US2 is in progress after Phase 2 completion.
- **US2**: T015 and T017 can run in parallel once T014 establishes form field shape.
- **Polish**: T024 and T025 can run in parallel; T026 and T027 can run in parallel.

---

## Parallel Example: User Story 2

```bash
# Parallelizable once T014 is complete:
Task: "T015 [US2] Add mode selector UI controls in src/features/admin/AdminSettingsPage.tsx"
Task: "T017 [US2] Load and hydrate admin mode selector defaults in src/features/admin/AdminSettingsPage.tsx"
```

## Parallel Example: User Story 3

```bash
# Coordinate independently owned concerns:
Task: "T019 [US3] Add closure message markdown input control in src/features/admin/AdminSettingsPage.tsx"
Task: "T023 [US3] Add inline validation messaging for missing closure content in src/features/admin/AdminSettingsPage.tsx"
```

---

## Implementation Strategy

### MVP First (Core closure communication)

1. Finish Setup + Foundational.
2. Deliver US2 (admin mode toggle) and US1 (player closure rendering).
3. Validate player/admin mode switching and no mixed UI state.

### Incremental Delivery

1. Ship US2 + US1 as operational closure toggle.
2. Add US3 for improved formatted messaging and stricter validation.
3. Finish with polish tasks and documented validation evidence.

### Team Parallel Plan

1. Developer A: Foundational shared closure panel (T005-T007) and player view (US1).
2. Developer B: Admin mode and message management (US2, US3).
3. Developer C: Migration/docs/validation evidence (Phase 1 and Phase 6).

---

## Notes

- All checklist items follow required format: `- [ ] T### [P?] [US?] Description with file path`.
- `[US#]` labels appear only in user-story phases.
- Tests were not added because the specification did not request TDD or new automated tests.
