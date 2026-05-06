// contracts/ExpenseStorageContract.ts
// Feature: 029-admin-expense-balance
// Scope: Supabase schema + RLS contract for expenses data

// ---------------------------------------------------------------------------
// Table Contract: public.expenses
// ---------------------------------------------------------------------------
// Columns:
// - id uuid primary key default uuid_generate_v4()
// - expense_date date not null
// - description text not null
// - amount_lkr numeric(12,2) not null check (amount_lkr > 0)
// - created_by text not null default (auth.jwt() ->> 'email')
// - created_at timestamptz not null default now()
// - updated_at timestamptz not null default now()

// ---------------------------------------------------------------------------
// Constraints
// ---------------------------------------------------------------------------
// - amount_lkr must be positive
// - description must not be empty after trim (enforce app-side; optional DB check)

// ---------------------------------------------------------------------------
// RLS Policy Contract
// ---------------------------------------------------------------------------
// Enable RLS on table.
// Policies:
// - Admin read expenses:
//     FOR SELECT TO authenticated USING (public.is_admin())
// - Admin insert expenses:
//     FOR INSERT TO authenticated WITH CHECK (public.is_admin())
// - Admin update expenses (optional v1):
//     FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin())
//
// No anon access.

// ---------------------------------------------------------------------------
// Query Contract (App)
// ---------------------------------------------------------------------------
// Date-range query:
//   .from('expenses')
//   .select('id,expense_date,description,amount_lkr,created_by,created_at')
//   .gte('expense_date', startDate)
//   .lte('expense_date', endDate)
//   .order('expense_date', { ascending: false })
//
// Insert payload:
//   { expense_date, description, amount_lkr }

export {}
