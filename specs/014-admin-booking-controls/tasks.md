# Tasks: Admin Booking Controls and Past Slot Visibility

**Input**: Design documents from /specs/014-admin-booking-controls/
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Automated tests are not explicitly requested in the specification. This plan includes implementation tasks plus manual validation checkpoints from quickstart.md.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

## Format: [ID] [P?] [Story] Description

- [P] indicates tasks that can run in parallel (different files, no blocking dependency)
- [Story] labels are used only in user-story phases
- Every task includes concrete file path(s)

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish migration and shared status surface required by all stories.

- [X] T001 Create migration file supabase/migrations/20260417000000_extend_booking_status.sql to extend bookings_status_check with CANCELLED and NO_SHOW values
- [X] T002 [P] Add canonical booking status labels and style mappings in src/features/booking/bookingStatusMeta.ts for CONFIRMED, PENDING, UNAVAILABLE, CANCELLED, NO_SHOW, AVAILABLE
- [X] T003 [P] Update src/features/booking/useBookings.ts BookingStatus type union to include CANCELLED and NO_SHOW

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build shared mutation and plumbing that all user stories depend on.

**CRITICAL**: Complete this phase before user story work.

- [X] T004 Implement UpdateBookingPayload type and useUpdateBooking mutation hook in src/features/booking/useBookings.ts for partial updates of status, payment_status, hourly_rate, and total_price
- [X] T005 [P] Keep backward compatibility by refactoring useUpdateBookingStatus in src/features/booking/useBookings.ts to delegate to the new unified mutation
- [X] T006 [P] Update shared status rendering in src/components/shared/StatusBadge.tsx to support CANCELLED and NO_SHOW color and label display
- [X] T007 Wire shared status metadata usage in src/features/admin/AdminListView.tsx and src/features/booking/BookingDetailsModal.tsx to avoid duplicated status maps

**Checkpoint**: Migration and shared status/update infrastructure are ready.

---

## Phase 3: User Story 1 - Admin Booking Management (Priority: P1) MVP

**Goal**: Allow admins to independently change booking status, manually edit pricing (including zero), and revert to system pricing from one interface.

**Independent Test**: Open any booking in admin details, set status to CANCELLED/PENDING/NO_SHOW, edit hourly rate and total price, save, and verify values persist and display correctly.

### Implementation for User Story 1

- [X] T008 [US1] Replace status-only save flow with unified payload save in src/features/admin/AdminCalendarPage.tsx by switching from useUpdateBookingStatus to useUpdateBooking
- [X] T009 [US1] Add editable status control in src/features/booking/BookingDetailsModal.tsx with options CONFIRMED, PENDING, UNAVAILABLE, CANCELLED, NO_SHOW
- [X] T010 [US1] Add editable hourly_rate and total_price numeric inputs (allowing zero and non-negative values) in src/features/booking/BookingDetailsModal.tsx
- [X] T011 [US1] Integrate useSettings and implement Revert to System Pricing calculation using booking duration in src/features/booking/BookingDetailsModal.tsx
- [X] T012 [US1] Implement unified Save action in src/features/booking/BookingDetailsModal.tsx to submit changed status and pricing fields via onSave payload
- [X] T013 [US1] Ensure booking financial and status updates are reflected after mutation by validating invalidateQueries usage in src/features/booking/useBookings.ts and consumer refresh in src/features/admin/AdminCalendarPage.tsx

**Checkpoint**: User Story 1 is fully functional and independently testable.

---

## Phase 4: User Story 2 - Hide Past-Day Available Slots (Priority: P2)

**Goal**: Hide available rows/slots on past dates for both admin and player views while keeping bookings visible.

**Independent Test**: On a past date, confirm no available rows appear in admin list, player list, and calendar grid; on today/future dates, available slots still render.

### Implementation for User Story 2

- [X] T014 [US2] Add isPastDate guard and suppress available row emissions in src/features/admin/calendar/deriveAdminListRows.ts
- [X] T015 [US2] Add isPastDate guard and suppress available row emissions in src/features/players/calendar/deriveSlotRows.ts
- [X] T016 [US2] Hide AVAILABLE hour blocks for past dates in src/components/shared/Calendar.tsx while keeping booking status blocks visible
- [X] T017 [US2] Verify admin list view rendering still shows booking rows only for past dates in src/features/admin/AdminListView.tsx
- [X] T018 [US2] Verify player-facing list/calendar integration remains unchanged for current/future dates in src/features/players/PlayersCalendarPage.tsx

**Checkpoint**: User Story 2 behavior is independently correct in admin and player flows.

---

## Phase 5: User Story 3 - Admin Add Past Bookings (Priority: P2)

**Goal**: Enable admin to create bookings for any past date despite hidden available rows.

**Independent Test**: On a past date in admin list mode, use Add Booking, create booking with selected status, save, and verify the booking appears in admin and player history.

### Implementation for User Story 3

- [X] T019 [US3] Add persistent Add Booking for this date button and onAddBooking callback handling in src/features/admin/AdminListView.tsx
- [X] T020 [US3] Pass onAddBooking handler from src/features/admin/AdminCalendarPage.tsx to open booking form with selected past date context
- [X] T021 [US3] Fix initialDate prop consumption for datetime defaults in src/features/booking/BookingForm.tsx when initialStartTime is not provided
- [X] T022 [US3] Extend booking creation status enum and dropdown options to include CANCELLED and NO_SHOW in src/features/booking/BookingForm.tsx
- [X] T023 [US3] Ensure past-date booking create flow preserves existing create mutation and player visibility behavior in src/features/booking/useBookings.ts and src/features/players/PlayersCalendarPage.tsx
- [X] T024 [US3] Confirm audit logging compatibility for admin-created past bookings by verifying existing insert path in src/features/booking/useBookings.ts uses authenticated admin context

**Checkpoint**: User Story 3 is independently usable for unlimited historical dates.

---

## Phase 6: Polish and Cross-Cutting Concerns

**Purpose**: Final validation and cleanup across all stories.

- [ ] T025 [P] Update quick usage notes for status semantics and pricing revert behavior in specs/014-admin-booking-controls/quickstart.md if implementation details changed
- [X] T026 [P] Run lint and address issues related to this feature using package.json command npm run lint
- [ ] T027 Execute manual QA scenarios for US1, US2, and US3 from specs/014-admin-booking-controls/quickstart.md and record outcomes in specs/014-admin-booking-controls/IMPLEMENTATION_NOTES.md
- [ ] T028 Validate migration locally with Supabase CLI and confirm status constraint is applied using supabase/migrations/20260417000000_extend_booking_status.sql

---

## Dependencies and Execution Order

### Phase Dependencies

- Phase 1 Setup has no dependencies and starts immediately.
- Phase 2 Foundational depends on Phase 1 and blocks all user stories.
- Phase 3 US1 depends on Phase 2 completion.
- Phase 4 US2 depends on Phase 2 completion and can proceed in parallel with Phase 3 if staffed.
- Phase 5 US3 depends on Phase 2 completion and can proceed in parallel with Phase 4.
- Phase 6 Polish depends on completion of all targeted user stories.

### User Story Dependencies

- US1 has no dependency on US2 or US3 and is the MVP scope.
- US2 depends only on foundational status/type updates and remains independently testable.
- US3 depends on foundational updates and the existing booking form flow, but not on US2 completion.

### Within Each User Story

- Update core types and interfaces before UI wiring.
- Implement behavior changes before final integration checks.
- Finish story checkpoint validation before starting polish tasks.

---

## Parallel Opportunities

- T002 and T003 can run in parallel in Phase 1.
- T005 and T006 can run in parallel in Phase 2.
- After Phase 2, US1, US2, and US3 can be worked by different developers.
- T025 and T026 can run in parallel in Polish phase.

## Parallel Example: User Story 1

- Task T009 in src/features/booking/BookingDetailsModal.tsx
- Task T013 in src/features/booking/useBookings.ts and src/features/admin/AdminCalendarPage.tsx

## Parallel Example: User Story 2

- Task T014 in src/features/admin/calendar/deriveAdminListRows.ts
- Task T015 in src/features/players/calendar/deriveSlotRows.ts

## Parallel Example: User Story 3

- Task T019 in src/features/admin/AdminListView.tsx
- Task T021 in src/features/booking/BookingForm.tsx

---

## Implementation Strategy

### MVP First (User Story 1)

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 (US1) and validate independently.
3. Demo or release MVP for admin booking management.

### Incremental Delivery

1. Deliver US1 for immediate operational value.
2. Deliver US2 for cleaner historical calendar views.
3. Deliver US3 for retroactive booking correction workflows.
4. Run polish tasks and final lint/manual validation.

### Team Parallel Strategy

1. Developer A: US1 modal and mutation integration.
2. Developer B: US2 derivation and calendar visibility logic.
3. Developer C: US3 past booking entry and booking form updates.
4. Merge after shared foundational tasks are complete.

---

## Notes

- All checklist items follow required format: checkbox, ID, optional P marker, optional US label, and file path.
- Story labels are applied only to user-story phases.
- Tasks are scoped to avoid cross-story coupling and keep each story testable on its own.

