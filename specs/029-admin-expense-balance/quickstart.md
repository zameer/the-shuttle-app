# Quickstart: Admin Expense Balance (Dedicated Page)

**Feature**: 029-admin-expense-balance  
**Branch**: `031-create-feature-branch`  
**Date**: 2026-05-06

This guide implements expense entry and on-demand balance calculation on a dedicated admin detail page, reached from below Paid Breakdown.

---

## Prerequisites

- Dev server available: `npm run dev`
- Lint command: `npm run lint`
- Supabase environment configured
- Admin login access

---

## User Story 1 - Record Expense Items (P1)

### Step 1: Add expenses migration

Create/update `supabase/migrations/20260506_add_expenses_table.sql`:

- Create `public.expenses` table
- Add positive amount constraint
- Enable RLS
- Add admin-only `SELECT`/`INSERT`/`UPDATE` policies
- Add `updated_at` trigger

### Step 2: Add schemas + types

Update:

- `src/features/admin/financial-reports/schemas.ts`
- `src/features/admin/financial-reports/types.ts`

Add:

- `expenseFormSchema`
- `expenseRowSchema`, `expensesResponseSchema`
- `ExpenseRecord`, `ExpenseFormInput`, `BalanceComputation`

### Step 3: Add expenses hook + service helpers

Create/update:

- `src/features/admin/financial-reports/useExpenses.ts`
- `src/features/admin/financial-reports/financialReportService.ts`

Implement:

- Date-range expense query
- Create expense mutation
- `sumExpenses` and `buildBalanceComputation`

### Step 4: Build dedicated page component

Create `src/features/admin/financial-reports/components/ExpenseBalancePage.tsx`:

- Form fields: date, description, amount
- Inline validation and submit feedback
- Expense list for active range
- Calculate Balance action (hidden until click)

---

## User Story 2 - Navigate from Paid Breakdown (P2)

### Step 5: Add route-level navigation from Reports page

Edit `src/features/admin/AdminFinancialReportsPage.tsx`:

- Keep control below Paid Breakdown
- Navigate to dedicated route: `/admin/reports/expense-balance?start=...&end=...`

### Step 6: Register dedicated route

Edit `src/App.tsx`:

- Add route path `reports/expense-balance`
- Render `ExpenseBalancePage` under existing `AdminProtectedRoute`

---

## User Story 3 - Calculate Balance On Demand (P3)

### Step 7: Wire paid total and expenses on detail page

In `ExpenseBalancePage`:

- Read `start`/`end` search params
- Load paid total for same range via existing report hook or equivalent service
- Load expenses via `useExpenses`
- Show balance only after Calculate button click
- Reset calculated visibility when range changes or new expense is saved

---

## Verification Checklist

- [ ] `npm run lint` passes for touched files
- [ ] Reports page shows navigation option below Paid Breakdown
- [ ] Navigation opens dedicated `/admin/reports/expense-balance` page
- [ ] Page initializes range from `start`/`end` query params
- [ ] Expense form requires date/description/amount
- [ ] Invalid amount (<=0) is rejected
- [ ] Valid expense saves and appears in list
- [ ] Balance is hidden before click
- [ ] Balance appears after click and equals paid minus expenses
- [ ] Negative balance renders correctly
- [ ] Layout works at 375 px, 768 px, and 1280 px
