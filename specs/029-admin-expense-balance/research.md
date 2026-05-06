# Phase 0 Research: Admin Expense Balance

## Decision 1: Expense persistence model

- Decision: Add a dedicated `expenses` table in Supabase (`public.expenses`) with fields `id`, `expense_date`, `description`, `amount_lkr`, `created_by`, `created_at`, `updated_at`.
- Rationale: Current system has no expense storage entity. A dedicated table keeps expense accounting explicit, queryable, and auditable without overloading booking records.
- Alternatives considered:
  - Store expenses in client state only (rejected: would not survive reloads, breaks FR-010).
  - Store expenses in localStorage (rejected: device-local, not shared across admins, weak integrity guarantees).
  - Encode expenses into `bookings` metadata columns (rejected: mixes unrelated domains and complicates reporting queries).

## Decision 2: Validation and input shape

- Decision: Validate expense form input with Zod (`expense_date` required, `description` non-empty trimmed string, `amount_lkr` positive number) and use `react-hook-form` for controlled submission.
- Rationale: This matches the repository's strict type-safety principle and existing form architecture.
- Alternatives considered:
  - Native form validation only (rejected: inconsistent error messaging and weaker typed guarantees).
  - Custom ad-hoc checks in component state handlers (rejected: duplicates validation logic and increases drift risk).

## Decision 3: Balance display interaction

- Decision: Introduce explicit calculate flow with local UI state (`hasCalculated`) so balance is hidden until the calculate action is clicked.
- Rationale: Directly satisfies FR-008 and the user request that balance appears after button click.
- Alternatives considered:
  - Always display live balance (rejected: violates requested interaction model).
  - Display balance after first expense save automatically (rejected: still not explicit user intent for calculation).

## Decision 4: Balance formula and scope

- Decision: Compute balance as `paidAmount - totalExpenses` in a service/hook layer using the same date scope as the currently selected financial report date range.
- Rationale: Aligns with existing paid total semantics and keeps computation out of rendering components.
- Alternatives considered:
  - Compute in JSX render only (rejected: violates service-layer business logic expectation).
  - Use all-time expenses regardless of date filter (rejected: conflicts with report context consistency and SC-002).

## Decision 5: Navigation and route architecture

- Decision: Add a navigation/action row below Paid Breakdown that opens a dedicated page route for expenses and balance (e.g., `/admin/reports/expense-balance?start=...&end=...`).
- Rationale: Matches clarified requirement for a separate page like Paid Detail and keeps report overview screen focused.
- Alternatives considered:
  - Keep expenses inline in `AdminFinancialReportsPage` (rejected: conflicts with clarified user decision).
  - Add link in global admin sidebar only (rejected: does not satisfy "below PAID BREAKDOWN" placement requirement).

## Decision 6: Security and authorization model

- Decision: Restrict insert/select/update on `expenses` table to authenticated admin users through RLS policy checks (`public.is_admin()`) and keep the feature under existing `/admin` protected routes.
- Rationale: Expense data is financial data and must follow the same admin-only access model as existing reporting features.
- Alternatives considered:
  - Allow anonymous read for transparency (rejected: violates admin-only financial scope).
  - Client-side role checks without RLS policy enforcement (rejected: insufficient backend data protection).
