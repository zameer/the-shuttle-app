# Tasks: Mobile Booking Manage Sections

**Input**: Design documents from /specs/015-booking-manage-mobile-sections/
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Automated tests are not explicitly requested in the specification. This task list focuses on implementation and manual validation workflows.

**Organization**: Tasks are grouped by user story to enable independent implementation and validation.

## Format: [ID] [P?] [Story] Description

- [P] indicates tasks that can run in parallel (different files, no blocking dependency)
- [Story] labels are used only in user-story phases
- Every task includes concrete file path(s)

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish shared section model and reusable UI scaffolding for all stories.

- [X] T001 Create typed section identifiers and default visibility config in src/features/booking/bookingManageSections.ts
- [X] T002 [P] Create reusable section panel component for mobile expand/collapse behavior in src/features/booking/components/BookingManageSectionPanel.tsx
- [X] T003 [P] Add section title and icon metadata map for booking manage UI in src/features/booking/bookingManageSections.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Implement modal-level state and action reachability primitives required before story work.

**CRITICAL**: Complete this phase before user story work.

- [X] T004 Add SectionVisibilityState model and toggle handlers in src/features/booking/BookingDetailsModal.tsx
- [X] T005 [P] Add sticky primary action bar container structure in src/features/booking/BookingDetailsModal.tsx
- [X] T006 [P] Add accessible expand/collapse semantics (aria-expanded, aria-controls, keyboard handling) in src/features/booking/components/BookingManageSectionPanel.tsx
- [X] T007 Preserve in-session edited field values across section toggles in src/features/booking/BookingDetailsModal.tsx
- [X] T008 Add optional section-level fallback rendering to keep core summary usable in src/features/booking/BookingDetailsModal.tsx

**Checkpoint**: Shared section system and sticky action framework are in place.

---

## Phase 3: User Story 1 - Keep Primary Actions Reachable on Mobile (Priority: P1) MVP

**Goal**: Ensure common booking updates can be completed quickly on mobile without excessive scrolling.

**Independent Test**: On a 375px-wide viewport, open booking manage modal and complete a status update while primary actions remain reachable throughout interaction.

### Implementation for User Story 1

- [X] T009 [US1] Refactor modal body into core summary-first layout in src/features/booking/BookingDetailsModal.tsx
- [X] T010 [US1] Keep player info, status control, and contact details visible by default in src/features/booking/BookingDetailsModal.tsx
- [X] T011 [US1] Move Save Changes and critical action controls into sticky action area in src/features/booking/BookingDetailsModal.tsx
- [X] T012 [US1] Adjust mobile spacing and scroll container boundaries for reachable actions in src/features/booking/BookingDetailsModal.tsx
- [X] T013 [US1] Verify modal invocation and save callbacks remain intact in src/features/admin/AdminCalendarPage.tsx

**Checkpoint**: User Story 1 is independently functional and validates action reachability.

---

## Phase 4: User Story 2 - Progressive Section-Based Details (Priority: P2)

**Goal**: Provide on-demand access to non-core details using clear expandable sections.

**Independent Test**: Confirm default visible core summary and independent expand/collapse behavior for time, financial, and advanced sections.

### Implementation for User Story 2

- [X] T014 [US2] Convert time-adjustment block into collapsible section in src/features/booking/BookingDetailsModal.tsx
- [X] T015 [US2] Convert financials block into collapsible section in src/features/booking/BookingDetailsModal.tsx
- [X] T016 [US2] Convert advanced actions block into collapsible section in src/features/booking/BookingDetailsModal.tsx
- [X] T017 [US2] Integrate BookingManageSectionPanel wrapper for each non-core section in src/features/booking/BookingDetailsModal.tsx
- [X] T018 [US2] Ensure independent section state persistence map is used for all sections in src/features/booking/BookingDetailsModal.tsx

**Checkpoint**: User Story 2 behavior works independently with clear section interactions.

---

## Phase 5: User Story 3 - PWA-Friendly Mobile Responsiveness (Priority: P2)

**Goal**: Keep interactions stable across PWA usage, orientation changes, and repeated section toggles.

**Independent Test**: In installed PWA mode, rotate device orientation during editing and confirm values and section state remain intact.

### Implementation for User Story 3

- [X] T019 [US3] Preserve section visibility state across orientation changes in src/features/booking/BookingDetailsModal.tsx
- [X] T020 [US3] Preserve edited form values across orientation changes and section toggles in src/features/booking/BookingDetailsModal.tsx
- [X] T021 [US3] Add lazy-render gating for non-core section content in src/features/booking/BookingDetailsModal.tsx
- [X] T022 [US3] Add mobile safe-area and viewport-height resilience classes for PWA mode in src/features/booking/BookingDetailsModal.tsx
- [X] T023 [US3] Validate optional section error isolation keeps core summary and actions usable in src/features/booking/BookingDetailsModal.tsx

**Checkpoint**: User Story 3 is independently reliable in mobile/PWA contexts.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finalize documentation and quality checks across all stories.

- [X] T024 [P] Update usage notes and validation guidance in specs/015-booking-manage-mobile-sections/quickstart.md
- [X] T025 [P] Run lint and fix feature-related issues in src/features/booking/BookingDetailsModal.tsx and src/features/booking/components/BookingManageSectionPanel.tsx using package.json command npm run lint
- [ ] T026 Execute manual QA scenarios from specs/015-booking-manage-mobile-sections/quickstart.md and record outcomes in specs/015-booking-manage-mobile-sections/IMPLEMENTATION_NOTES.md

---

## Dependencies & Execution Order

### Phase Dependencies

- Phase 1 Setup has no dependencies and starts immediately.
- Phase 2 Foundational depends on Phase 1 and blocks all user stories.
- Phase 3 US1 depends on Phase 2 completion.
- Phase 4 US2 depends on Phase 2 completion and can proceed in parallel with Phase 3.
- Phase 5 US3 depends on Phase 2 completion and can proceed in parallel with Phase 4.
- Phase 6 Polish depends on completion of all targeted user stories.

### User Story Dependencies

- User Story 1 (P1) is the MVP and has no dependency on US2 or US3.
- User Story 2 (P2) depends only on foundational section primitives and remains independently testable.
- User Story 3 (P2) depends on foundational state management and US2 section patterns but remains independently testable.

### Within Each User Story

- Build and verify layout/state structure before interaction refinement.
- Complete accessibility and state persistence behavior before final manual validation.
- Validate each story independently before moving to polish tasks.

---

## Parallel Opportunities

- T002 and T003 can run in parallel in Phase 1.
- T005 and T006 can run in parallel in Phase 2.
- After Phase 2, US1, US2, and US3 can be developed in parallel by separate contributors.
- T024 and T025 can run in parallel in Phase 6.

## Parallel Example: User Story 1

- Task T010 in src/features/booking/BookingDetailsModal.tsx
- Task T013 in src/features/admin/AdminCalendarPage.tsx

## Parallel Example: User Story 2

- Task T014 in src/features/booking/BookingDetailsModal.tsx
- Task T016 in src/features/booking/BookingDetailsModal.tsx

## Parallel Example: User Story 3

- Task T021 in src/features/booking/BookingDetailsModal.tsx
- Task T022 in src/features/booking/BookingDetailsModal.tsx

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 Setup.
2. Complete Phase 2 Foundational.
3. Complete Phase 3 User Story 1.
4. Stop and validate User Story 1 on mobile viewport before extending scope.

### Incremental Delivery

1. Deliver US1 for immediate action-reachability value.
2. Deliver US2 for improved progressive disclosure and reduced scrolling.
3. Deliver US3 for robust PWA and orientation reliability.
4. Complete polish tasks and manual validation report.

### Parallel Team Strategy

1. Developer A: Core summary and sticky action implementation (US1).
2. Developer B: Section panel behavior and collapsible content (US2).
3. Developer C: PWA/orientation resilience and lazy rendering (US3).
4. Merge all streams after foundational tasks are complete.

---

## Notes

- All tasks follow strict checklist format with IDs and explicit file paths.
- Story labels are applied only in user story phases.
- Task order supports independent story validation and incremental delivery.

