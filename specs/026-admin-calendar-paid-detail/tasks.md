# Tasks: Admin Calendar Landing & Paid Report Detail

**Input**: Design documents from `/specs/026-admin-calendar-paid-detail/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓, quickstart.md ✓

**Feature Branch**: `026-admin-calendar-paid-detail`  
**User Stories**: US1 (Calendar Landing, P1), US2 (Paid Detail Page, P1)  
**No tests requested** — no test tasks generated.

---

## Phase 1: Setup

**Purpose**: No new packages, no migrations, no scaffolding required. This feature modifies existing files and adds new feature files only. The setup phase confirms the working environment before any changes are made.

- [X] T001 Verify `npm run lint` passes with zero errors on the current codebase (baseline check before any changes)

**Checkpoint**: Lint is clean — implementation can begin.

---

## Phase 2: Foundational (Blocking Prerequisites for Both Stories)

**Purpose**: No shared foundational work is required across both user stories — US1 (route/nav) and US2 (type layer, service, hook, UI) are fully independent. Phase 2 is not applicable for this feature.

*No foundational tasks — proceed directly to user story phases.*

---

## Phase 3: User Story 1 — Calendar as Admin Landing Page (Priority: P1) 🎯

**Goal**: Make the Calendar the default admin landing page by changing the `/admin` index route and updating the navigation bar. The Dashboard remains accessible at `/admin/dashboard`.

**Independent Test**: Navigate to `/admin` — Calendar page loads. Navigate to `/admin/dashboard` — Dashboard loads. The "Dashboard" entry is absent from the nav bar. The "Calendar" nav item is first and active when on `/admin`. All existing calendar interactions (list/calendar toggle, booking management) remain functional.

### Implementation for User Story 1

- [X] T002 [US1] Update `/admin` index child route from `AdminDashboardPage` to `AdminCalendarPage` and add `{ path: 'dashboard', element: <AdminDashboardPage /> }` in `src/App.tsx`
- [X] T003 [US1] Add `import CalendarDays from 'lucide-react'` to `src/layouts/AdminLayout.tsx`, replace the nav items array so "Calendar" (icon: CalendarDays, to: "/admin", end: true) is the first entry, remove the "Dashboard" and standalone "Calendar" entries per `specs/026-admin-calendar-paid-detail/contracts/AdminLayoutNav.ts`
- [X] T004 [US1] Run `npm run lint` and confirm zero errors after US1 changes

**Checkpoint**: US1 complete — `/admin` shows Calendar, `/admin/dashboard` shows Dashboard, nav bar has no Dashboard entry.

---

## Phase 4: User Story 2 — Paid Booking Detail Page (Priority: P1)

**Goal**: Add a separate page at `/admin/reports/paid-detail` showing one row per paid booking with date, time, player, contact, confirmation status, payment status, and amount. The page has its own date range filter (two `<input type="date">` fields), a 3-card summary header, client-side pagination (15 rows/page), and a back link to `/admin/reports`. The parent `AdminFinancialReportsPage` gains a "View Paid Detail" navigation button; the existing `PaidBreakdownModal` trigger is removed from that page.

**Independent Test**: Open `/admin/reports`, confirm the "View Paid Detail" button is present. Click it — navigated to `/admin/reports/paid-detail?start=...&end=...`. Confirm per-booking rows (not grouped by player), summary header, pagination, and "← Back to Reports" link all work. Change dates — rows update. Navigate back — Reports page retains its original date range.

### Implementation for User Story 2 — Type & Schema Layer

- [X] T005 [P] [US2] Add `PaidDetailRow`, `PaidDetailSummary`, and `PaidDetailOutput` type definitions to `src/features/admin/financial-reports/types.ts` per `specs/026-admin-calendar-paid-detail/data-model.md` sections 1–3
- [X] T006 [P] [US2] Add `paidDetailSearchParamsSchema` (Zod) to `src/features/admin/financial-reports/schemas.ts` per `specs/026-admin-calendar-paid-detail/data-model.md` section 4

### Implementation for User Story 2 — Service Layer

- [X] T007 [US2] Add `buildPaidDetail(rows: NormalizedFinancialBooking[]): PaidDetailOutput` to `src/features/admin/financial-reports/financialReportService.ts`

### Implementation for User Story 2 — Hook Layer

- [X] T008 [US2] Create `src/features/admin/financial-reports/usePaidDetail.ts`

### Implementation for User Story 2 — UI Components

- [X] T009 [P] [US2] Create `src/features/admin/financial-reports/components/PaidDetailStatusBadge.tsx`
- [X] T010 [US2] Create `src/features/admin/financial-reports/components/PaidDetailPage.tsx`

### Implementation for User Story 2 — Route Wiring

- [X] T011 [US2] Add `import PaidDetailPage` and route `{ path: 'reports/paid-detail', element: <PaidDetailPage /> }` inside the `AdminProtectedRoute` children in `src/App.tsx`

### Implementation for User Story 2 — Parent Page Update

- [X] T012 [US2] In `src/features/admin/AdminFinancialReportsPage.tsx`: replace modal trigger with navigation button, remove modal state and imports

- [X] T013 [US2] Run `npm run lint` and confirm zero errors after all US2 changes

**Checkpoint**: US2 complete — paid detail page renders per-booking rows, date filter works, pagination works, back navigation works, modal trigger replaced.

---

## Phase 5: Polish & Cross-Cutting Concerns

- [X] T014 [P] Verify `/admin/calendar` (existing bookmark path) still loads correctly
- [X] T015 [P] Verify existing admin features are unaffected
- [X] T016 Run `npm run lint` one final time to confirm zero errors across all changed files

---

## Dependencies

```
T001 (baseline lint)
  ├── T002 (App.tsx index route) ──── US1 ──── T003 (AdminLayout nav) ──── T004 (lint)
  └── T005 (types.ts) ─┐
      T006 (schemas.ts) ┤──── T007 (service) ──── T008 (hook) ──────────── T010 (PaidDetailPage)
      T009 (badge) ─────┘                                                      │
                                                                T011 (route) ─┤
                                                                T012 (parent) ─┘
                                                                T013 (lint)
                                                          T014, T015, T016 (polish — parallel)
```

**Parallelizable within US2**: T005, T006, and T009 can be implemented simultaneously (different files, no mutual dependency).

---

## Implementation Strategy

**MVP scope**: Both US1 and US2 are Priority P1 and should be delivered together. US1 (2 file changes, ~30 min) can be completed and verified first, then US2 (7 file changes, ~2–3 hrs) independently.

**Suggested execution order**:
1. T001 — baseline lint check
2. T002 + T003 + T004 — US1 complete (fast wins, independent)
3. T005 + T006 + T009 in parallel — type/schema/badge scaffolding
4. T007 → T008 → T010 — service → hook → page (sequential within US2)
5. T011 → T012 → T013 — wire route, update parent, lint check
6. T014 + T015 + T016 — final verification

**Reference**: See `specs/026-admin-calendar-paid-detail/quickstart.md` for step-by-step implementation detail for each task.
