# Tasks: Responsive Player Calendar

**Input**: Design documents from `/specs/004-responsive-calendar/`  
**Prerequisites**: `plan.md` (required), `spec.md` (required), `research.md`, `data-model.md`, `contracts/ui-responsive-contract.md`, `quickstart.md`

**Tests**: This feature requires viewport/device/performance validation tasks derived from spec success criteria (SC-001 through SC-007).

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Align implementation context and prepare baseline artifacts.

- [x] T001 Confirm feature inputs are current in `specs/004-responsive-calendar/spec.md` and `specs/004-responsive-calendar/plan.md`
- [x] T002 Create or refresh baseline audit notes in `specs/004-responsive-calendar/AUDIT.md`
- [x] T003 [P] Verify responsive utility availability in `tailwind.config.js` and existing scroll styles in `src/index.css`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish core responsive and scroll architecture used by all stories.

**CRITICAL**: Story implementation starts only after this phase is complete.

- [x] T004 Implement single internal calendar scroller foundation in `src/components/shared/calendar/CalendarContainer.tsx`
- [x] T005 [P] Normalize page-level width constraints in `src/layouts/PublicLayout.tsx` and `src/features/players/PublicCalendarPage.tsx`
- [x] T006 [P] Standardize sticky header layering and overflow boundaries in `src/components/shared/calendar/MonthView.tsx` and `src/components/shared/calendar/WeekView.tsx`
- [x] T007 Create responsive validation checklist scaffold in `specs/004-responsive-calendar/TEST_RESULTS.md`

**Checkpoint**: Shared responsive/scroll foundation is ready.

---

## Phase 3: User Story 1 - Responsive Calendar Layout (Priority: P1)

**Goal**: Ensure calendar adapts to viewport sizes without fixed-layout breakage.

**Independent Test**: Open calendar at 375px, 768px, and 1920px and verify usable layout with internal content scrolling only.

- [x] T008 [P] [US1] Refactor month layout width behavior in `src/components/shared/calendar/MonthView.tsx` to avoid fixed desktop-only constraints
- [x] T009 [P] [US1] Refactor week layout column sizing in `src/components/shared/calendar/WeekView.tsx` for mobile/tablet/desktop adaptability
- [x] T010 [US1] Update responsive min-width strategy for week/month containers in `src/components/shared/calendar/CalendarContainer.tsx`
- [x] T011 [US1] Validate US1 viewport behavior and record pass/fail matrix in `specs/004-responsive-calendar/TEST_RESULTS.md`

**Checkpoint**: US1 is independently functional and testable.

---

## Phase 4: User Story 2 - Calendar Grid Optimization (Priority: P1)

**Goal**: Improve cell readability and touch ergonomics across devices.

**Independent Test**: Verify minimum 44px interaction targets and minimum readable text (12px equivalent) on mobile.

- [x] T012 [P] [US2] Apply touch-target sizing (`min-h-[44px]` and responsive padding) in `src/components/shared/calendar/CalendarSlot.tsx`
- [x] T013 [P] [US2] Apply responsive font scaling for month headers and day cells in `src/components/shared/calendar/MonthView.tsx`
- [x] T014 [US2] Tune week header and time-label readability in `src/components/shared/calendar/WeekView.tsx`
- [x] T015 [US2] Validate visual distinctness and tap usability for US2 in `specs/004-responsive-calendar/TEST_RESULTS.md`

**Checkpoint**: US2 is independently functional and testable.

---

## Phase 5: User Story 3 - Flexible Container Sizing (Priority: P1)

**Goal**: Use viewport space efficiently with no unnecessary horizontal overflow.

**Independent Test**: Confirm 95-100% width usage on mobile and 80-100% width usage on desktop with no unnecessary page-level scrollbar.

- [x] T016 [P] [US3] Refactor public main container width behavior in `src/layouts/PublicLayout.tsx`
- [x] T017 [P] [US3] Refactor public calendar wrapper/skeleton sizing in `src/features/players/PublicCalendarPage.tsx`
- [x] T018 [US3] Measure width utilization and scrollbar behavior for US3 in `specs/004-responsive-calendar/TEST_RESULTS.md`

**Checkpoint**: US3 is independently functional and testable.

---

## Phase 6: User Story 4 - Mobile-Specific Optimizations (Priority: P2)

**Goal**: Improve mobile controls, navigation spacing, and discoverability.

**Independent Test**: Verify navigation controls are tap-friendly and mobile interactions work in portrait/landscape without accidental triggers.

- [x] T019 [US4] Implement mobile-sized nav controls and spacing in `src/components/shared/calendar/CalendarContainer.tsx`
- [x] T020 [US4] Add mobile swipe guidance in `src/features/players/PublicCalendarPage.tsx` and scrollbar polish in `src/index.css`
- [x] T021 [US4] Validate mobile portrait/landscape behavior and touch reliability in `specs/004-responsive-calendar/TEST_RESULTS.md`

**Checkpoint**: US4 is independently functional and testable.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final quality pass across all stories.

- [x] T022 [P] Update responsive behavior documentation comments in `src/components/shared/calendar/CalendarContainer.tsx`, `src/components/shared/calendar/MonthView.tsx`, and `src/features/players/PublicCalendarPage.tsx`
- [x] T023 [P] Execute quickstart validation flow and capture outcomes in `specs/004-responsive-calendar/TEST_RESULTS.md`
- [x] T024 Run development smoke check (`npm run dev`) and log final status in `specs/004-responsive-calendar/TEST_RESULTS.md`
- [ ] T025 [P] Run throttled performance check for SC-007 and record findings in `specs/004-responsive-calendar/TEST_RESULTS.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (Phase 1): no dependencies
- Foundational (Phase 2): depends on Setup
- User Stories (Phases 3-6): depend on Foundational completion
- Polish (Phase 7): depends on all user stories

### User Story Dependencies

- US1 (P1): starts after Phase 2
- US2 (P1): starts after Phase 2
- US3 (P1): starts after Phase 2
- US4 (P2): starts after Phase 2; benefits from US1 layout base

### Execution Graph

`Phase 1 -> Phase 2 -> (US1 || US2 || US3 || US4) -> Phase 7`

---

## Parallel Execution Examples

### US1

- T008 [P] [US1] Refactor month layout width behavior in `src/components/shared/calendar/MonthView.tsx` to avoid fixed desktop-only constraints
- T009 [P] [US1] Refactor week layout column sizing in `src/components/shared/calendar/WeekView.tsx` for mobile/tablet/desktop adaptability

### US2

- T012 [P] [US2] Apply touch-target sizing (`min-h-[44px]` and responsive padding) in `src/components/shared/calendar/CalendarSlot.tsx`
- T013 [P] [US2] Apply responsive font scaling for month headers and day cells in `src/components/shared/calendar/MonthView.tsx`

### US3

- T016 [P] [US3] Refactor public main container width behavior in `src/layouts/PublicLayout.tsx`
- T017 [P] [US3] Refactor public calendar wrapper/skeleton sizing in `src/features/players/PublicCalendarPage.tsx`

### US4

- T019 [US4] Implement mobile-sized nav controls and spacing in `src/components/shared/calendar/CalendarContainer.tsx`
- T020 [US4] Add mobile swipe guidance in `src/features/players/PublicCalendarPage.tsx` and scrollbar polish in `src/index.css`

---

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2
2. Deliver US1 (responsive layout baseline)
3. Validate US1 independently before expanding

### Incremental Delivery

1. Add US2 (grid readability + touch targets)
2. Add US3 (container efficiency + width correctness)
3. Add US4 (mobile-specific interaction polish)
4. Execute final cross-story validation and performance checks

### Format Validation

- All tasks follow required checklist format: `- [ ] TXXX [P?] [US?] Description with file path`
- Setup/Foundational/Polish tasks intentionally do not include story labels
- User story phase tasks include required labels (`[US1]` ... `[US4]`)
