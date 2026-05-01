# Tasks: Paid Detail Status + Booking-Status Filters

**Input**: Design documents from `/specs/027-paid-detail-status-filter/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/, quickstart.md

**Tests**: No explicit test-first/TDD requirement in spec. This task list uses lint + manual verification tasks only.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Validate baseline and confirm implementation entry points.

- [X] T001 Run baseline lint check with `npm run lint` using scripts defined in `package.json`
- [X] T002 Review and align current paid-detail implementation against feature contracts in `specs/027-paid-detail-status-filter/contracts/PaidDetailPageContract.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared filter contracts and data flow required by both user stories.

**⚠️ CRITICAL**: Complete this phase before US1 and US2 work.

- [X] T003 [P] Add `DetailStatusScope`, `OutstandingBookingStatus`, and paid-detail filter input types in `src/features/admin/financial-reports/types.ts`
- [X] T004 [P] Add scope/status/filter Zod schemas in `src/features/admin/financial-reports/schemas.ts`
- [X] T005 Extend detail filtering service logic for scope + outstanding booking statuses in `src/features/admin/financial-reports/financialReportService.ts`
- [X] T006 Update `usePaidDetail` hook input, query key, and validation path for new filters in `src/features/admin/financial-reports/usePaidDetail.ts`

**Checkpoint**: Shared filter model and hook/service plumbing is ready.

---

## Phase 3: User Story 1 - Switch Payment Status Scope (Priority: P1) 🎯 MVP

**Goal**: Admin can switch between PAID and OUTSTANDING in Paid Detail page filter area, with PAID default.

**Independent Test**: Open `/admin/reports/paid-detail`, verify default scope is PAID, switch to OUTSTANDING, and confirm table + summary reflect selected scope.

### Implementation for User Story 1

- [X] T007 [US1] Initialize `scope` state with default `PAID` and default outstanding status set in `src/features/admin/financial-reports/components/PaidDetailPage.tsx`
- [X] T008 [US1] Add status-scope selector UI in the existing filter section next to date inputs in `src/features/admin/financial-reports/components/PaidDetailPage.tsx`
- [X] T009 [US1] Wire scope changes to `usePaidDetail` input and reset pagination on scope/date changes in `src/features/admin/financial-reports/components/PaidDetailPage.tsx`
- [X] T010 [US1] Ensure summary cards, rows, and empty state are rendered from scope-filtered hook output in `src/features/admin/financial-reports/components/PaidDetailPage.tsx`

**Checkpoint**: Scope switching works with PAID default and consistent summary/table behavior.

---

## Phase 4: User Story 2 - Booking-Status Multi-Select for OUTSTANDING (Priority: P1)

**Goal**: Under OUTSTANDING scope, admin can multi-select booking statuses (`CONFIRMED`, `CANCELLED`, `NO_SHOW`) with all selected by default.

**Independent Test**: Select OUTSTANDING, verify all three status options are selected by default, toggle selections, and confirm table shows only rows matching selected statuses.

### Implementation for User Story 2

- [X] T011 [US2] Add conditional booking-status multi-select UI shown only for OUTSTANDING scope in `src/features/admin/financial-reports/components/PaidDetailPage.tsx`
- [X] T012 [US2] Implement booking-status toggle handlers with minimum-one-selected guard and page reset behavior in `src/features/admin/financial-reports/components/PaidDetailPage.tsx`
- [X] T013 [US2] Pass selected `outstandingStatuses` from page state into `usePaidDetail` filter input in `src/features/admin/financial-reports/components/PaidDetailPage.tsx`
- [X] T014 [US2] Apply outstanding booking-status filtering in detail service output and keep summary totals aligned in `src/features/admin/financial-reports/financialReportService.ts`
- [X] T015 [US2] Ensure hook-level filter validation/error handling supports outstanding status arrays in `src/features/admin/financial-reports/usePaidDetail.ts`

**Checkpoint**: OUTSTANDING mode supports multi-select status filtering with correct data and summary results.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: End-to-end validation and quality gate.

- [X] T016 Validate quickstart scenarios and UX behavior checklist in `specs/027-paid-detail-status-filter/quickstart.md`
- [X] T017 Verify reports-to-detail and detail-to-reports navigation remains intact in `src/features/admin/AdminFinancialReportsPage.tsx` and `src/features/admin/financial-reports/components/PaidDetailPage.tsx`
- [X] T018 Run final lint gate with `npm run lint` using scripts defined in `package.json` and confirm no new errors in touched files

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: Start immediately.
- **Phase 2 (Foundational)**: Depends on Phase 1; blocks user stories.
- **Phase 3 (US1)**: Depends on Phase 2 completion.
- **Phase 4 (US2)**: Depends on Phase 2 completion; can begin after US1 core wiring (T007-T010) is in place because same page file is heavily shared.
- **Phase 5 (Polish)**: Depends on US1 + US2 completion.

### User Story Dependencies

- **US1 (P1)**: No dependency on US2.
- **US2 (P1)**: Uses same page/hook/service surface as US1; best executed after US1 scope baseline is stable.

### Within-Story Order

- Foundational types/schemas before service/hook changes.
- Service/hook changes before full page wiring.
- Page state and filter controls before validation polish.

## Parallel Opportunities

- T003 and T004 can run in parallel (different files).
- After T003/T004 complete, T005 and T006 can proceed in parallel if coordinated on shared type imports.

## Parallel Example: User Story 1

```bash
# Shared prep tasks that can run together before US1 UI wiring
Task: "T003 Add filter-related types in src/features/admin/financial-reports/types.ts"
Task: "T004 Add filter-related schemas in src/features/admin/financial-reports/schemas.ts"
```

## Parallel Example: User Story 2

```bash
# After US1 is stable, service and hook refinements can be split
Task: "T014 Apply outstanding booking-status filtering in src/features/admin/financial-reports/financialReportService.ts"
Task: "T015 Ensure hook-level validation for status arrays in src/features/admin/financial-reports/usePaidDetail.ts"
```

## Implementation Strategy

### MVP First (US1)

1. Complete Phase 1 and Phase 2.
2. Deliver US1 scope selector with PAID default (T007-T010).
3. Validate US1 independently before moving to US2.

### Incremental Delivery

1. Foundation complete (T003-T006).
2. Ship US1 (scope switch).
3. Add US2 (outstanding booking-status multi-select).
4. Run polish verification and lint gate.

### Notes

- Keep business filtering logic in service/hook layer, not UI-only transforms.
- Keep control layout responsive at 375/768/1280 breakpoints.
- Avoid introducing new dependencies or schema migrations for this feature.
