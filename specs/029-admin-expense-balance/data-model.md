# Data Model: Admin Expense Balance

**Feature**: 029-admin-expense-balance  
**Date**: 2026-05-06  
**Source**: spec.md + research.md

---

## Overview

This feature introduces one new persisted entity (`Expense`), two derived in-app entities (`ExpenseFormInput`, `BalanceComputation`), and one route-state entity for the dedicated expense detail page (`ExpenseBalanceRouteParams`). The `PaidTotal` source remains the existing financial report summary from booking data.

---

## 1. Expense (persisted)

**Purpose**: Captures a single admin-entered cost item used in report-time balance calculations.

**Proposed storage**: `public.expenses`

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| `id` | `uuid` | yes | generated (`uuid_generate_v4()`) | Primary key |
| `expense_date` | `date` | yes | valid calendar date | User-entered date |
| `description` | `text` | yes | trimmed length >= 1 | Free-text short description |
| `amount_lkr` | `numeric(12,2)` | yes | `> 0` | Positive expense amount |
| `created_by` | `text` | yes | defaults to JWT email | Admin audit field |
| `created_at` | `timestamptz` | yes | default `now()` | Audit field |
| `updated_at` | `timestamptz` | yes | trigger-managed | Audit field |

**RLS intent**:
- `SELECT`, `INSERT`, `UPDATE` allowed for authenticated admins only (`public.is_admin()`).
- `DELETE` excluded from v1 scope.

---

## 2. ExpenseFormInput (transient)

**Purpose**: Validated payload submitted from the admin expense form.

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `date` | `string` (`YYYY-MM-DD`) | yes | non-empty, valid date format |
| `description` | `string` | yes | trimmed, min length 1 |
| `amount` | `number` | yes | finite numeric, `> 0` |

**Validation source**: Zod schema in `src/features/admin/financial-reports/schemas.ts`.

---

## 3. BalanceComputation (derived)

**Purpose**: Encapsulates on-demand balance result displayed after button click.

| Field | Type | Description |
|-------|------|-------------|
| `paidAmount` | `number` | Existing paid total for current date range |
| `expenseAmount` | `number` | Sum of expenses in current date range |
| `balanceAmount` | `number` | `paidAmount - expenseAmount` |
| `calculatedAt` | `string` (ISO timestamp) | When admin requested calculation |

**Computation rule**:
- `balanceAmount = round2(paidAmount - expenseAmount)`

---

## 4. ExpenseBalanceRouteParams (route state)

**Purpose**: Carries report date-range context from Financial Reports page to dedicated Expense & Balance page.

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `start` | `string` (`YYYY-MM-DD`) | optional | valid date string |
| `end` | `string` (`YYYY-MM-DD`) | optional | valid date string |

**Usage**:
- Reports page navigation passes `start` and `end` in query string.
- Expense page uses params as initial filter defaults, with fallback to current month behavior.

---

## Relationships

- `BalanceComputation` depends on one `PaidTotal` aggregate (existing booking-derived summary) and many `Expense` rows in the same active date range.
- `ExpenseFormInput` maps 1:1 to insert payload for `Expense` (with audit fields added server-side defaults).
- `ExpenseBalanceRouteParams` initializes both expense query range and paid-total query range on dedicated page.

---

## State Transitions

### Expense capture lifecycle

1. `Draft` -> Admin enters `date`, `description`, `amount`.
2. `Validated` -> Zod + form validation passes.
3. `Persisted` -> Supabase insert succeeds; row appears in expense list/query.
4. `Failed` -> Validation or API error; form remains editable with feedback.

### Balance display lifecycle

1. `Hidden` -> Initial state (`hasCalculated = false`).
2. `Requested` -> Admin clicks Calculate Balance.
3. `Visible` -> Balance value renders with latest paid/expense totals.
4. `RecalculateNeeded` -> Any new expense save or date-range change returns UI to hidden until next click.

---

## Type Additions (planned)

Add to financial report feature types:

```ts
export interface ExpenseRecord {
  id: string
  expenseDate: string
  description: string
  amountLkr: number
  createdBy: string | null
  createdAt: string
}

export interface ExpenseFormInput {
  date: string
  description: string
  amount: number
}

export interface BalanceComputation {
  paidAmount: number
  expenseAmount: number
  balanceAmount: number
  calculatedAt: string
}
```

These are implementation targets only; exact naming can remain feature-local if existing conventions prefer snake_case at the schema boundary.
