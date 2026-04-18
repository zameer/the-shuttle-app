# Tasks: Admin Financial Reporting

**Input**: Design documents from `/specs/018-admin-financial-reports/`  
**Prerequisites**: `plan.md` (required), `spec.md` (required), `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: No mandatory new automated test tasks were explicitly requested in the specification. Validation is via lint and manual QA scenarios from `quickstart.md`.

**Organization**: Tasks are grouped by user story to support independent implementation and validation.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Parallelizable (different files, no unresolved dependency)
- **[Story]**: User story mapping (`US1`, `US2`, `US3`, `US4`)
- Every task includes an exact file path

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create feature entry points and reporting module structure.

- [X] T001 Create admin reporting module folders and placeholder exports in `src/features/admin/financial-reports/`
- [X] T002 Create report page shell in `src/features/admin/AdminFinancialReportsPage.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Implement shared typed reporting core used by all user stories.

- [X] T003 Define feature DTOs and section output models in `src/features/admin/financial-reports/types.ts`
- [X] T004 Define Zod input/row normalization schemas in `src/features/admin/financial-reports/schemas.ts`
- [X] T005 Implement normalized booking mapping and shared aggregation utilities in `src/features/admin/financial-reports/financialReportService.ts`
- [X] T006 Implement `useFinancialReport` React Query hook with date-range input and all-players default scope in `src/features/admin/financial-reports/useFinancialReport.ts`
- [X] T007 Wire admin-protected route and page registration in `src/App.tsx`
- [X] T008 Add admin navigation link/entry for financial reports in `src/layouts/AdminLayout.tsx`

**Checkpoint**: Shared report infrastructure is complete; user story sections can be added independently.

---

## Phase 3: User Story 1 - Date-Range Payment Summary (Priority: P1) 🎯 MVP

**Goal**: Show PAID vs PENDING totals (hours + amount) for selected date range, with no required player selection.

**Independent Test**: Select a date range and verify summary cards return paid/pending hours and amounts, including zero-state behavior for empty ranges.

### Implementation for User Story 1

- [X] T009 [US1] Implement summary totals calculation (`paidHours`, `paidAmount`, `pendingHours`, `pendingAmount`) in `src/features/admin/financial-reports/financialReportService.ts`
- [X] T010 [US1] Add date-range controls and summary section UI in `src/features/admin/AdminFinancialReportsPage.tsx`
- [X] T011 [US1] Render explicit zero-state summary values for empty datasets in `src/features/admin/AdminFinancialReportsPage.tsx`

**Checkpoint**: US1 delivers standalone value for financial overview.

---

## Phase 4: User Story 2 - Detailed Paid/Pending Breakdown with Player Information (Priority: P1)

**Goal**: Display paid/pending breakdown entries with player information and totals that reconcile to summary.

**Independent Test**: For a selected range, verify each breakdown row shows player information and that section totals reconcile to summary totals.

### Implementation for User Story 2

- [X] T012 [US2] Implement paid/pending breakdown aggregation with player info in `src/features/admin/financial-reports/financialReportService.ts`
- [X] T013 [US2] Create breakdown section component showing PAID and PENDING entries with player information in `src/features/admin/financial-reports/components/PaymentBreakdownSection.tsx`
- [X] T014 [US2] Integrate breakdown section into report page and show zero-value counterparts when one bucket is empty in `src/features/admin/AdminFinancialReportsPage.tsx`

**Checkpoint**: US2 adds reconciled, player-identifiable breakdown insight.

---

## Phase 5: User Story 3 - Outstanding Pending by Player with Slot Details (Priority: P1)

**Goal**: Provide pending list by player including slot-level details for collection follow-up.

**Independent Test**: Verify each outstanding record shows player info, pending totals, and slot details; verify empty-state behavior when no pending exists.

### Implementation for User Story 3

- [X] T015 [US3] Implement outstanding-pending-by-player aggregation with slot detail array in `src/features/admin/financial-reports/financialReportService.ts`
- [X] T016 [P] [US3] Create outstanding pending section component with slot detail rendering in `src/features/admin/financial-reports/components/OutstandingPendingSection.tsx`
- [X] T017 [US3] Integrate outstanding section and total outstanding amount into `src/features/admin/AdminFinancialReportsPage.tsx`

**Checkpoint**: US3 supports actionable collections workflow.

---

## Phase 6: User Story 4 - No-Show/Cancellation Financial Impact (Priority: P2)

**Goal**: Quantify lost revenue and lost hours for no-show and cancellation statuses.

**Independent Test**: Verify impact section reports `NO_SHOW` and `CANCELLED` totals separately and displays zero states when not present.

### Implementation for User Story 4

- [X] T018 [US4] Implement no-show/cancellation impact aggregation with fallback amount resolution order in `src/features/admin/financial-reports/financialReportService.ts`
- [X] T019 [P] [US4] Create revenue impact section component for lost hours/amount output in `src/features/admin/financial-reports/components/RevenueImpactSection.tsx`
- [X] T020 [US4] Integrate revenue impact section and fallback counters into `src/features/admin/AdminFinancialReportsPage.tsx`

**Checkpoint**: US4 provides explicit revenue-loss visibility by impact type.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Validate reconciliation, quality gates, and manual feature acceptance.

- [X] T021 Verify reconciliation invariants in hook/service wiring (breakdown sums == summary totals) in `src/features/admin/financial-reports/useFinancialReport.ts`
- [X] T022 Run lint and resolve issues for reporting files via `npm run lint`
- [ ] T023 Execute manual QA scenarios from `specs/018-admin-financial-reports/quickstart.md` and record outcomes in `specs/018-admin-financial-reports/quickstart.md`

---

## Dependencies

- T001 -> T002
- T003, T004 -> T005 -> T006
- T006, T007, T008 -> T009 -> T010 -> T011
- T009 -> T012 -> T013 -> T014
- T012 -> T015 -> T016 -> T017
- T012 -> T018 -> T019 -> T020
- T014, T017, T020 -> T021 -> T022 -> T023

### User Story Completion Order

1. US1 (T009-T011) for MVP summary reporting
2. US2 (T012-T014) for player-aware payment breakdown
3. US3 (T015-T017) for outstanding pending follow-up workflow
4. US4 (T018-T020) for no-show/cancellation impact reporting

---

## Parallel Execution Examples

- T003 and T004 can run in parallel (types vs schema definitions).
- T016 and T019 can run in parallel (separate report section components).
- After T012, US3 and US4 aggregation/component work can proceed in parallel streams.

Example split:
- Engineer A: T015 -> T016 -> T017
- Engineer B: T018 -> T019 -> T020

---

## Implementation Strategy

### MVP First

1. Complete T001-T011 (Setup + Foundational + US1).
2. Validate summary behavior for date-range and zero-state output.
3. Ship if only core PAID/PENDING totals are required initially.

### Incremental Delivery

1. Add US2 for reconciled player-aware breakdown.
2. Add US3 for outstanding pending follow-up with slot details.
3. Add US4 for no-show/cancellation impact metrics.
4. Finish with T021-T023 quality and QA closure.
