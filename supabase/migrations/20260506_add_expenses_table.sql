-- ============================================================
-- Migration: 029 - add expenses table for admin financial reports
-- ============================================================

CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expense_date DATE NOT NULL,
  description TEXT NOT NULL,
  amount_lkr NUMERIC(12,2) NOT NULL CHECK (amount_lkr > 0),
  created_by TEXT NOT NULL DEFAULT (auth.jwt() ->> 'email'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin read expenses"
  ON public.expenses FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admin insert expenses"
  ON public.expenses FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin update expenses"
  ON public.expenses FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP TRIGGER IF EXISTS expenses_updated_at ON public.expenses;

CREATE TRIGGER expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
