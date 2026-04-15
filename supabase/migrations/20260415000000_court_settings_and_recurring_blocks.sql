-- Migration: court_settings and recurring_unavailable_blocks tables

-- Single-row config table for court settings
CREATE TABLE public.court_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1), -- enforces single row
  court_open_time TIME NOT NULL DEFAULT '06:00:00',
  court_close_time TIME NOT NULL DEFAULT '23:00:00',
  default_hourly_rate NUMERIC NOT NULL DEFAULT 600,
  available_rates JSONB NOT NULL DEFAULT '[600, 500]',
  terms_and_conditions TEXT DEFAULT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recurring unavailable blocks (e.g., every Monday 2PM–4PM)
CREATE TABLE public.recurring_unavailable_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sun, 6=Sat
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  label TEXT DEFAULT 'Maintenance',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.court_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_unavailable_blocks ENABLE ROW LEVEL SECURITY;

-- court_settings: public readonly, admin full access
CREATE POLICY "Public read court_settings"
  ON public.court_settings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admin manage court_settings"
  ON public.court_settings FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- recurring_unavailable_blocks: public readonly, admin full access
CREATE POLICY "Public read recurring_blocks"
  ON public.recurring_unavailable_blocks FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admin manage recurring_blocks"
  ON public.recurring_unavailable_blocks FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Insert default single row for court_settings
INSERT INTO public.court_settings (id, court_open_time, court_close_time, default_hourly_rate, available_rates)
VALUES (1, '06:00:00', '23:00:00', 600, '[600, 500]')
ON CONFLICT (id) DO NOTHING;
