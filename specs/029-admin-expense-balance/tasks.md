# Tasks: Admin Expense Balance

**Input**: Design documents from `/specs/029-admin-expense-balance/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`

**Tests**: No explicit TDD/test-first requirement in spec; implementation includes lint and manual verification tasks.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare the feature files for the dedicated expense detail page flow.

- [X] T001 Create expense migration scaffold in `supabase/migrations/20260506_add_expenses_table.sql`
- [X] T002 Create dedicated expense page scaffold in `src/features/admin/financial-reports/components/ExpenseBalancePage.tsx`
- [X] T003 [P] Create expenses hook scaffold in `src/features/admin/financial-reports/useExpenses.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Add shared data contracts, storage, and helpers required by all user stories.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T004 Implement `expenses` table DDL and constraints in `supabase/migrations/20260506_add_expenses_table.sql`
- [X] T005 Add RLS policies and `updated_at` trigger for `expenses` in `supabase/migrations/20260506_add_expenses_table.sql`
- [X] T006 [P] Add expense form, expense response, and route-param schemas in `src/features/admin/financial-reports/schemas.ts`
- [X] T007 [P] Add `ExpenseRecord`, `ExpenseFormInput`, `BalanceComputation`, and route-param types in `src/features/admin/financial-reports/types.ts`
- [X] T008 Implement expense aggregation and balance builder helpers in `src/features/admin/financial-reports/financialReportService.ts`
- [X] T009 Implement `useExpenses` query/mutation with Zod parsing in `src/features/admin/financial-reports/useExpenses.ts`

**Checkpoint**: Foundation ready; user story work can now proceed.

---

## Phase 3: User Story 1 - Record Expense Items (Priority: P1) 🎯 MVP

**Goal**: Enable admins to open the dedicated page and submit/persist simple expense entries.

**Independent Test**: Open the expense page, submit valid date/description/amount, and verify the expense is saved and shown; invalid or non-positive amounts are blocked with clear feedback.

- [X] T010 [US1] Build the expense form and expense list layout in `src/features/admin/financial-reports/components/ExpenseBalancePage.tsx`
- [X] T011 [US1] Wire expense form validation and submission to `useExpenses` in `src/features/admin/financial-reports/components/ExpenseBalancePage.tsx`
- [X] T012 [US1] Initialize page date range from query params and local state in `src/features/admin/financial-reports/components/ExpenseBalancePage.tsx`
- [X] T013 [US1] Add back-navigation and expense data loading states in `src/features/admin/financial-reports/components/ExpenseBalancePage.tsx`

**Checkpoint**: US1 is fully functional and independently testable.

---

## Phase 4: User Story 2 - Navigate from Paid Breakdown (Priority: P2)

**Goal**: Add a discoverable navigation action below Paid Breakdown that opens the dedicated expense page.

**Independent Test**: From Financial Reports, use the control below Paid Breakdown and confirm it opens `/admin/reports/expense-balance` with the current date range.

- [X] T014 [US2] Replace inline expense navigation behavior with route navigation in `src/features/admin/AdminFinancialReportsPage.tsx`
- [X] T015 [US2] Pass `start` and `end` query params to the expense route in `src/features/admin/AdminFinancialReportsPage.tsx`
- [X] T016 [US2] Register the `reports/expense-balance` route in `src/App.tsx`
- [X] T017 [US2] Remove obsolete inline expense-section integration from `src/features/admin/AdminFinancialReportsPage.tsx`

**Checkpoint**: US2 is fully functional and independently testable.

---

## Phase 5: User Story 3 - Calculate Balance On Demand (Priority: P3)

**Goal**: Show balance only after explicit button click on the dedicated expense page.

**Independent Test**: On the dedicated expense page, balance is hidden before click and displayed after click as paid total minus expense total for the active date range.

- [X] T018 [US3] Load the paid total for the selected range in `src/features/admin/financial-reports/components/ExpenseBalancePage.tsx`
- [X] T019 [US3] Add the Calculate Balance action and hidden-until-click state in `src/features/admin/financial-reports/components/ExpenseBalancePage.tsx`
- [X] T020 [US3] Render computed balance output from service helpers in `src/features/admin/financial-reports/components/ExpenseBalancePage.tsx`
- [X] T021 [US3] Reset calculated visibility when range or expenses change in `src/features/admin/financial-reports/components/ExpenseBalancePage.tsx`

**Checkpoint**: US3 is fully functional and independently testable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup, consistency checks, and validation across all stories.

- [X] T022 [P] Delete the obsolete inline component in `src/features/admin/financial-reports/components/ExpenseBalanceSection.tsx`
- [X] T023 [P] Align dedicated-page labels and button copy in `src/features/admin/AdminFinancialReportsPage.tsx`
- [X] T024 Run lint and fix any new violations across `src/` and `supabase/migrations/` in `specs/029-admin-expense-balance/quickstart.md`
- [ ] T025 Execute end-to-end manual verification checklist in `specs/029-admin-expense-balance/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies; starts immediately.
- **Phase 2 (Foundational)**: Depends on Phase 1 and blocks all user stories.
- **Phase 3 (US1)**: Depends on Phase 2.
- **Phase 4 (US2)**: Depends on Phase 2; can proceed in parallel with US1 if staffed.
- **Phase 5 (US3)**: Depends on Phase 2 and benefits from US1 completion because the page needs real expense data flow.
- **Phase 6 (Polish)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **US1 (P1)**: No dependency on other stories after Foundational phase.
- **US2 (P2)**: No dependency on US1 or US3 after Foundational phase.
- **US3 (P3)**: Depends on US1 data-entry flow and dedicated page wiring from US2.

### Within Each User Story

- Build route/page structure before wiring interactions.
- Wire data access before final UI states.
- Complete story checkpoint before moving to polish.

---

## Parallel Opportunities

- T003 can run in parallel with T001 and T002.
- T006 and T007 can run in parallel after setup.
- US1 and US2 can be worked in parallel after Foundational phase completes.
- T022 and T023 can run in parallel during polish.

---

## Parallel Example: User Story 1

```bash
Task: "Build the expense form and expense list layout in src/features/admin/financial-reports/components/ExpenseBalancePage.tsx"
Task: "Initialize page date range from query params and local state in src/features/admin/financial-reports/components/ExpenseBalancePage.tsx"
```

## Parallel Example: User Story 2

```bash
Task: "Pass start and end query params to the expense route in src/features/admin/AdminFinancialReportsPage.tsx"
Task: "Register the reports/expense-balance route in src/App.tsx"
```

## Parallel Example: User Story 3

```bash
Task: "Load the paid total for the selected range in src/features/admin/financial-reports/components/ExpenseBalancePage.tsx"
Task: "Add the Calculate Balance action and hidden-until-click state in src/features/admin/financial-reports/components/ExpenseBalancePage.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: User Story 1.
4. Validate US1 independently before expanding scope.

### Incremental Delivery

1. Ship US1 with dedicated page expense capture.
2. Add US2 route entry from Paid Breakdown.
3. Add US3 on-demand balance calculation.
4. Finish with polish and verification.

### Parallel Team Strategy

1. Developer A: Foundational storage/types/hooks tasks (T004-T009).
2. Developer B: Dedicated page expense-entry UI (T010-T013).
3. Developer C: Route wiring and navigation tasks (T014-T017), then balance interaction tasks (T018-T021).
