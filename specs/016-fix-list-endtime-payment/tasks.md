# Tasks: List End-Time and Payment Visibility

**Input**: Design documents from `specs/016-fix-list-endtime-payment/`
**Prerequisites**: [plan.md](./plan.md) ✅ | [spec.md](./spec.md) ✅ | [research.md](./research.md) ✅ | [data-model.md](./data-model.md) ✅ | [contracts/](./contracts/) ✅

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Exact file paths included in all descriptions

---

## Phase 1: Setup

> No setup phase required — this is a pure display/derivation layer fix with no new infrastructure, dependencies, or configuration changes.

---

## Phase 2: Foundational

> No foundational phase required — all prerequisite infrastructure exists. Player and admin derivation functions, court_settings query, and payment utilities are all in place.

---

## Phase 3: User Story 1 — Align List End-Time Window (Priority: P1) 🎯 MVP

**Goal**: Fix the 30-minute end shortfall by removing the hardcoded `SCHEDULE_END_HOUR = 22` clamp from player list derivation and passing `scheduleEndHour` from `court_settings`.

**Independent Test**: Open player list view for any date and verify the final visible slot matches the intended schedule end boundary (no 30-minute truncation). Confirm admin and player list views show the same end boundary for the same date.

### Implementation for User Story 1

- [X] T001 [US1] Add optional `scheduleEndHour` param and remove `effectiveEnd` booking-row clamp (`effectiveEnd = bookingEnd > scheduleEnd ? scheduleEnd : bookingEnd` → `const effectiveEnd = bookingEnd`) in `src/features/players/calendar/deriveSlotRows.ts`
- [X] T002 [US1] Read `court_close_time` from court_settings in the caller and pass `scheduleEndHour: Math.ceil(timeStrToHours(settings.court_close_time))` to `deriveSlotRows` in `src/features/players/calendar/PlayerListView.tsx` (depends on T001)

**Checkpoint**: Player list view end boundary now matches court_settings; no 30-minute shortfall. US1 acceptance scenarios SC-001 and SC-005 pass.

---

## Phase 4: User Story 2 — Show Late-Ending Bookings Correctly in Admin List (Priority: P1)

**Goal**: Fix booking-row truncation in admin list derivation so bookings whose end time crosses the schedule boundary remain visible — matching calendar view behavior.

**Independent Test**: Create or view a booking overlapping the end boundary (e.g., 21:30–23:00). Open admin list view and calendar view for the same date. Confirm the booking is visible in both views and represented consistently.

### Implementation for User Story 2

- [X] T003 [P] [US2] Add optional `scheduleEndHour` param and remove `effectiveBEnd` booking-row clamp (`effectiveBEnd = bEnd > scheduleEnd ? scheduleEnd : bEnd` → `const effectiveBEnd = bEnd`) in `src/features/admin/calendar/deriveAdminListRows.ts`
- [X] T004 [US2] Read `court_close_time` from court_settings in the caller and pass `scheduleEndHour: Math.ceil(timeStrToHours(settings.court_close_time))` to `deriveAdminListRows` in `src/features/admin/AdminListView.tsx` (depends on T003)

**Checkpoint**: Admin list shows boundary-overlapping bookings consistently with calendar. US2 acceptance scenarios SC-002 pass.

---

## Phase 5: User Story 3 — Display Payment Status in Admin List View (Priority: P2)

**Goal**: Add `paymentStatus` field to `AdminListRow`, populate it in `deriveAdminListRows`, and render a payment status pill on booking rows in `AdminListView`.

**Independent Test**: Open admin list view on a date with bookings in mixed payment states. Verify each booking row shows a payment status indicator (paid/pending/unpaid). Verify available-slot rows show no payment indicator.

### Implementation for User Story 3

- [X] T005 [US3] Add `paymentStatus?: NormalizedPaymentStatus` to the `AdminListRow` interface and populate via `normalizePaymentStatus(booking.payment_status)` for `type === 'booking'` rows in `src/features/admin/calendar/deriveAdminListRows.ts` (depends on T003)
- [X] T006 [US3] Import `normalizePaymentStatus`, `getPaymentStatusLabel`, and `getPaymentStatusPillClassName` from `src/features/booking/paymentStatus.ts` and render payment status pill on booking rows (`row.type === 'booking' && row.paymentStatus && row.paymentStatus !== 'UNKNOWN'`) in `src/features/admin/AdminListView.tsx` (depends on T004, T005)

**Checkpoint**: Admin booking rows display payment status. Available rows show no payment label. UNKNOWN/missing status renders no badge (clean fallback). US3 acceptance scenarios SC-003, SC-004 pass.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Goal**: Validate all changes are lint-clean and confirm no regressions in existing booking visibility behavior.

- [X] T007 Run `npx eslint src/features/players/calendar/deriveSlotRows.ts src/features/admin/calendar/deriveAdminListRows.ts src/features/admin/AdminListView.tsx src/features/players/calendar/PlayerListView.tsx` and resolve any ESLint errors

---

## Dependencies

```
T001 (deriveSlotRows fix)
  └─► T002 (PlayerListView caller update)

T003 (deriveAdminListRows fix) ──[P with T001]
  ├─► T004 (AdminListView caller update)
  │     └─► T006 (AdminListView payment badge render)
  └─► T005 (AdminListRow paymentStatus field)
        └─► T006 (AdminListView payment badge render)

T006 ──► T007 (lint gate)
T002 ──► T007 (lint gate)
```

### User Story Completion Order

1. **US1** (T001 → T002): Player list window fix — MVP, no dependencies on US2/US3
2. **US2** (T003 → T004): Admin list window + booking visibility fix — parallel with US1 (different files)
3. **US3** (T005 → T006): Payment status display — depends on US2 (same file, different concern)

---

## Parallel Execution Examples

**Run in parallel** (different files, no dependencies between):
```
T001 deriveSlotRows.ts changes  ║  T003 deriveAdminListRows.ts changes
```

**Sequential** (same-file or caller updates):
```
T001 → T002       (deriveSlotRows → PlayerListView caller)
T003 → T004       (deriveAdminListRows → AdminListView caller)
T003 → T005       (deriveAdminListRows type + populate)
T004 + T005 → T006 (AdminListView payment badge render)
```

---

## Implementation Strategy

**MVP scope (recommended first delivery)**: US1 + US2 (T001–T004) — fixes the two P1 boundary bugs visible to both players and admins.

**Full delivery**: US1 + US2 + US3 (T001–T006) — adds payment status visibility for admins.

**Lint gate**: T007 must pass before marking feature complete.

---

## Summary

| Phase | User Story | Tasks | Parallelizable | Files |
|-------|-----------|-------|----------------|-------|
| Phase 3 | US1 (P1) | T001–T002 | T001 parallel with T003 | `deriveSlotRows.ts`, `PlayerListView.tsx` |
| Phase 4 | US2 (P1) | T003–T004 | T003 parallel with T001 | `deriveAdminListRows.ts`, `AdminListView.tsx` |
| Phase 5 | US3 (P2) | T005–T006 | — | `deriveAdminListRows.ts`, `AdminListView.tsx` |
| Phase 6 | Polish | T007 | — | All modified files |
| **Total** | 3 stories | **7 tasks** | 2 parallel pairs | 4 files |
