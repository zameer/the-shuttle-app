# Tasks: Calendar Range and Payment Status

**Input**: Design documents from `/specs/005-calendar-range-payment-status/`
**Prerequisites**: `plan.md` (required), `spec.md` (required)

**Tests**: Automated tests are not explicitly requested in the specification. This task list uses implementation + manual validation tasks tied to each user story.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Align feature docs and prepare implementation scaffolding.

- [x] T001 Reconcile feature metadata and branch references in `specs/005-calendar-range-payment-status/spec.md` and `specs/005-calendar-range-payment-status/plan.md`
- [x] T002 Create feature validation log in `specs/005-calendar-range-payment-status/quickstart.md`
- [x] T003 [P] Confirm admin calendar integration points in `src/features/admin/AdminCalendarPage.tsx` and `src/layouts/AdminLayout.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build shared date-range and booking query foundations required by all user stories.

**CRITICAL**: No user story work should start before this phase is complete.

- [x] T004 Add reusable date range state + validation hook in `src/hooks/useDateRangeFilter.ts`
- [x] T005 [P] Create date range filter UI component in `src/components/shared/calendar/DateRangeFilter.tsx`
- [x] T006 Extend booking query API to support default and custom ranges in `src/features/booking/useBookings.ts`
- [x] T007 [P] Add payment status normalization helper with fallback mapping in `src/features/booking/paymentStatus.ts`
- [x] T008 Wire shared range/filter types across calendar components in `src/components/shared/calendar/CalendarContainer.tsx` and `src/features/admin/AdminCalendarPage.tsx`

**Checkpoint**: Shared filtering and payment-status foundations are ready.

---

## Phase 3: User Story 1 - Unfiltered Default Calendar Dashboard (Priority: P1) MVP

**Goal**: Show a multi-day booking context by default without forcing a specific day filter.

**Independent Test**: Load admin calendar without setting filters and verify bookings across multiple days are visible.

- [x] T009 [US1] Refactor default calendar state to separate navigation date from filter state in `src/features/admin/AdminCalendarPage.tsx`
- [x] T010 [US1] Implement multi-day default fetch window when no date filter is active in `src/features/admin/AdminCalendarPage.tsx`
- [x] T011 [US1] Ensure default range query behavior is applied in `src/features/booking/useBookings.ts`
- [x] T012 [US1] Record US1 validation evidence in `specs/005-calendar-range-payment-status/quickstart.md`

**Checkpoint**: US1 is independently functional and testable.

---

## Phase 4: User Story 2 - Optional Date Range Filtering (Priority: P1)

**Goal**: Allow admins to apply and clear custom date range filters safely.

**Independent Test**: Apply a valid date range and confirm only bookings inside that range render; clear filter and verify default view returns.

- [x] T013 [P] [US2] Implement start/end date controls and apply/clear actions in `src/components/shared/calendar/DateRangeFilter.tsx`
- [x] T014 [US2] Integrate date range filter controls into admin calendar toolbar in `src/features/admin/AdminCalendarPage.tsx`
- [x] T015 [US2] Enforce invalid-range validation and guidance messaging in `src/hooks/useDateRangeFilter.ts` and `src/features/admin/AdminCalendarPage.tsx`
- [x] T016 [US2] Implement clear-filter reset back to default multi-day mode in `src/features/admin/AdminCalendarPage.tsx`
- [x] T017 [US2] Record US2 validation evidence in `specs/005-calendar-range-payment-status/quickstart.md`

**Checkpoint**: US2 is independently functional and testable.

---

## Phase 5: User Story 3 - Admin Calendar Payment Visibility (Priority: P1)

**Goal**: Show clear payment status indicators for each booking in admin calendar views, including fallback labels.

**Independent Test**: Open admin calendar with mixed payment states and verify each booking displays paid/pending/fallback status.

- [x] T018 [P] [US3] Ensure booking payload mapping always includes payment status values for admin reads in `src/features/booking/useBookings.ts`
- [x] T019 [US3] Render payment status badge and fallback label for admin booking slots in `src/components/shared/calendar/CalendarSlot.tsx`
- [x] T020 [US3] Use unified payment status labels/colors in booking details panel in `src/features/booking/BookingDetailsModal.tsx`
- [x] T021 [US3] Record US3 validation evidence in `specs/005-calendar-range-payment-status/quickstart.md`

**Checkpoint**: US3 is independently functional and testable.

---

## Phase 6: User Story 4 - Combined Filtering and Payment Monitoring (Priority: P2)

**Goal**: Keep payment status visibility accurate while date-range filters are active.

**Independent Test**: Apply different ranges and verify all filtered bookings keep correct payment indicators.

- [x] T022 [US4] Preserve payment status fields across filtered query states in `src/features/booking/useBookings.ts`
- [x] T023 [US4] Ensure filtered calendar rendering keeps payment badges in `src/components/shared/calendar/MonthView.tsx` and `src/components/shared/calendar/WeekView.tsx`
- [x] T024 [US4] Add filtered empty-state handling and guidance in `src/features/admin/AdminCalendarPage.tsx`
- [x] T025 [US4] Handle timezone-safe inclusive range boundaries in `src/features/admin/AdminCalendarPage.tsx` and `src/features/booking/useBookings.ts`
- [x] T026 [US4] Record US4 validation evidence in `specs/005-calendar-range-payment-status/quickstart.md`

**Checkpoint**: US4 is independently functional and testable.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup, verification, and requirements traceability.

- [x] T027 [P] Update requirement traceability checklist for FR-001 through FR-008 in `specs/005-calendar-range-payment-status/checklists/requirements.md`
- [x] T028 Run lint and calendar smoke verification for range + payment flows and log results in `specs/005-calendar-range-payment-status/quickstart.md`
- [x] T029 [P] Document implementation notes and follow-up risks in `specs/005-calendar-range-payment-status/plan.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (Phase 1): No dependencies.
- Foundational (Phase 2): Depends on Setup and blocks all user stories.
- User Stories (Phase 3-6): Depend on Phase 2 completion.
- Polish (Phase 7): Depends on completion of all user stories.

### User Story Dependencies

- US1 (P1): Starts after Phase 2; establishes MVP default behavior.
- US2 (P1): Starts after Phase 2; depends on shared filter foundation, independent from US3.
- US3 (P1): Starts after Phase 2; depends on shared payment mapping, independent from US2.
- US4 (P2): Starts after US2 and US3 to verify combined behavior.

### Execution Graph

`Phase 1 -> Phase 2 -> (US1 || US2 || US3) -> US4 -> Phase 7`

---

## Parallel Execution Examples

### US2

- T013 [P] [US2] Implement start/end date controls and apply/clear actions in `src/components/shared/calendar/DateRangeFilter.tsx`
- T015 [US2] Enforce invalid-range validation and guidance messaging in `src/hooks/useDateRangeFilter.ts` and `src/features/admin/AdminCalendarPage.tsx`

### US3

- T018 [P] [US3] Ensure booking payload mapping always includes payment status values for admin reads in `src/features/booking/useBookings.ts`
- T019 [US3] Render payment status badge and fallback label for admin booking slots in `src/components/shared/calendar/CalendarSlot.tsx`

### Polish

- T027 [P] Update requirement traceability checklist for FR-001 through FR-008 in `specs/005-calendar-range-payment-status/checklists/requirements.md`
- T029 [P] Document implementation notes and follow-up risks in `specs/005-calendar-range-payment-status/plan.md`

---

## Implementation Strategy

### MVP First (US1)

1. Complete Phase 1 and Phase 2.
2. Deliver US1 default multi-day unfiltered behavior.
3. Validate US1 before expanding.

### Incremental Delivery

1. Add US2 optional filtering and validation.
2. Add US3 payment status visibility and fallback behavior.
3. Add US4 combined filtering + payment verification.
4. Execute Phase 7 polish and traceability checks.

### Format Validation

- All tasks follow checklist format: `- [ ] TXXX [P?] [US?] Description with file path`.
- Setup/Foundational/Polish tasks intentionally omit story labels.
- User story tasks include required labels (`[US1]` to `[US4]`).
