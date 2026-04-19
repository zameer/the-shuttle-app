-- ============================================================
-- Migration: 021 – booking_agents & callback_requests
-- ============================================================

-- 1. Extend admin_users with super-admin flag
ALTER TABLE public.admin_users
  ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN NOT NULL DEFAULT FALSE;

-- Helper function: returns TRUE if the calling JWT belongs to a super-admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE email = (SELECT auth.jwt() ->> 'email')
      AND is_super_admin = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. booking_agents table
CREATE TABLE IF NOT EXISTS public.booking_agents (
  email          TEXT PRIMARY KEY REFERENCES public.admin_users(email) ON DELETE CASCADE,
  display_name   TEXT NOT NULL,
  work_phone     TEXT NOT NULL,
  is_primary     BOOLEAN NOT NULL DEFAULT FALSE,
  priority_order SMALLINT NOT NULL DEFAULT 99,
  is_available   BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.booking_agents ENABLE ROW LEVEL SECURITY;

-- Public/anon can read agent availability (no phone exposed directly)
CREATE POLICY "Public read booking_agents availability"
  ON public.booking_agents FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only super-admins can insert/update/delete agents
CREATE POLICY "Super-admin manage booking_agents"
  ON public.booking_agents FOR ALL
  TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- 3. callback_requests table
CREATE TABLE IF NOT EXISTS public.callback_requests (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_name             TEXT NOT NULL,
  player_phone            TEXT NOT NULL,
  slot_from               TIMESTAMPTZ NOT NULL,
  slot_to                 TIMESTAMPTZ NOT NULL,
  player_location         TEXT NOT NULL,
  preferred_callback_time TEXT,
  note                    TEXT,
  status                  TEXT NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending', 'assigned', 'claimed', 'resolved')),
  assigned_agent_email    TEXT REFERENCES public.booking_agents(email) ON DELETE SET NULL,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.callback_requests ENABLE ROW LEVEL SECURITY;

-- Players (anon) can INSERT
CREATE POLICY "Public insert callback_requests"
  ON public.callback_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Authenticated admins can SELECT and UPDATE
CREATE POLICY "Admin read callback_requests"
  ON public.callback_requests FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admin update callback_requests"
  ON public.callback_requests FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 4. updated_at triggers
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER booking_agents_updated_at
  BEFORE UPDATE ON public.booking_agents
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER callback_requests_updated_at
  BEFORE UPDATE ON public.callback_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 5. RPC: get_next_available_agent_phone
-- Returns work_phone of next available agent (primary-first); callable by anon
CREATE OR REPLACE FUNCTION public.get_next_available_agent_phone()
RETURNS TEXT AS $$
DECLARE
  v_phone TEXT;
BEGIN
  SELECT work_phone INTO v_phone
  FROM public.booking_agents
  WHERE is_available = TRUE
  ORDER BY is_primary DESC, priority_order ASC, updated_at ASC
  LIMIT 1;

  RETURN v_phone;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.get_next_available_agent_phone() TO anon, authenticated;

-- 6. RPC: get_next_available_agent_email
-- Returns email of next available agent; used internally by submit_callback_request
CREATE OR REPLACE FUNCTION public.get_next_available_agent_email()
RETURNS TEXT AS $$
DECLARE
  v_email TEXT;
BEGIN
  SELECT email INTO v_email
  FROM public.booking_agents
  WHERE is_available = TRUE
  ORDER BY is_primary DESC, priority_order ASC, updated_at ASC
  LIMIT 1;

  RETURN v_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.get_next_available_agent_email() TO anon, authenticated;

-- 7. RPC: submit_callback_request
-- Atomically inserts request and auto-assigns to next available agent if one exists
CREATE OR REPLACE FUNCTION public.submit_callback_request(
  p_player_name             TEXT,
  p_player_phone            TEXT,
  p_slot_from               TIMESTAMPTZ,
  p_slot_to                 TIMESTAMPTZ,
  p_player_location         TEXT,
  p_preferred_callback_time TEXT DEFAULT NULL,
  p_note                    TEXT DEFAULT NULL
)
RETURNS TABLE(id UUID, status TEXT, assigned_agent_email TEXT) AS $$
DECLARE
  v_agent_email TEXT;
  v_status      TEXT;
  v_id          UUID;
BEGIN
  v_agent_email := public.get_next_available_agent_email();
  v_status := CASE WHEN v_agent_email IS NOT NULL THEN 'assigned' ELSE 'pending' END;

  INSERT INTO public.callback_requests (
    player_name, player_phone, slot_from, slot_to,
    player_location, preferred_callback_time, note,
    status, assigned_agent_email
  ) VALUES (
    p_player_name, p_player_phone, p_slot_from, p_slot_to,
    p_player_location, p_preferred_callback_time, p_note,
    v_status, v_agent_email
  )
  RETURNING callback_requests.id INTO v_id;

  RETURN QUERY SELECT v_id, v_status, v_agent_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.submit_callback_request(TEXT,TEXT,TIMESTAMPTZ,TIMESTAMPTZ,TEXT,TEXT,TEXT) TO anon, authenticated;

-- 8. RPC: claim_callback_request
-- Atomically claims a pending request; returns TRUE on success, FALSE if already claimed
CREATE OR REPLACE FUNCTION public.claim_callback_request(
  p_request_id  UUID,
  p_agent_email TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_rows INTEGER;
BEGIN
  UPDATE public.callback_requests
  SET status               = 'claimed',
      assigned_agent_email = p_agent_email,
      updated_at           = NOW()
  WHERE id     = p_request_id
    AND status = 'pending';

  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RETURN v_rows > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.claim_callback_request(UUID, TEXT) TO authenticated;
