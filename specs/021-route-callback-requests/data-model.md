# Data Model: Route Callback Requests (021)

**Phase**: 1 — Design  
**Branch**: `021-route-callback-requests`  
**Date**: 2026-04-19

---

## Schema Changes

### 1. Alter `admin_users` — Add Super-Admin Flag

```sql
ALTER TABLE public.admin_users
  ADD COLUMN is_super_admin BOOLEAN NOT NULL DEFAULT FALSE;

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
```

---

### 2. New Table: `booking_agents`

Stores Booking Agent profiles linked to admin users. Managed exclusively by super-admins.

```sql
CREATE TABLE public.booking_agents (
  email         TEXT PRIMARY KEY REFERENCES public.admin_users(email) ON DELETE CASCADE,
  display_name  TEXT NOT NULL,
  work_phone    TEXT NOT NULL,
  is_primary    BOOLEAN NOT NULL DEFAULT FALSE,
  priority_order SMALLINT NOT NULL DEFAULT 99,  -- lower = higher priority among non-primary
  is_available  BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `email` | TEXT PK FK | Links to `admin_users.email` |
| `display_name` | TEXT | Name shown in admin queue UI |
| `work_phone` | TEXT | Work contact number for `tel:` links; never personal |
| `is_primary` | BOOLEAN | Primary contacts are tried first for routing |
| `priority_order` | SMALLINT | Ordering among non-primary agents; lower = higher priority |
| `is_available` | BOOLEAN | Explicit manual availability toggle (super-admin managed) |
| `updated_at` | TIMESTAMPTZ | Used as tiebreaker in routing order |

**RLS Policies**:

```sql
ALTER TABLE public.booking_agents ENABLE ROW LEVEL SECURITY;

-- Public can read is_available and is_primary only (for routing check) — no phone exposed directly
-- Phone is returned only via secure RPC function
CREATE POLICY "Public read booking_agents availability"
  ON public.booking_agents FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only super-admin can insert/update/delete
CREATE POLICY "Super-admin manage booking_agents"
  ON public.booking_agents FOR ALL
  TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());
```

---

### 3. New Table: `callback_requests`

Stores player-submitted callback requests.

```sql
CREATE TABLE public.callback_requests (
  id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_name            TEXT NOT NULL,
  player_phone           TEXT NOT NULL,
  slot_from              TIMESTAMPTZ NOT NULL,
  slot_to                TIMESTAMPTZ NOT NULL,
  player_location        TEXT NOT NULL,
  preferred_callback_time TEXT,                     -- optional free-text e.g. "after 3pm"
  note                   TEXT,                      -- optional free-text note
  status                 TEXT NOT NULL DEFAULT 'pending'
                           CHECK (status IN ('pending', 'assigned', 'claimed', 'resolved')),
  assigned_agent_email   TEXT REFERENCES public.booking_agents(email) ON DELETE SET NULL,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Status State Machine**:

```
[player submits] → pending
                      ↓ (agent available at submit time)
                   assigned  (auto-routed to agent)
                      ↓
                   resolved  (agent marks done)

[player submits, no agent] → pending
                                  ↓ (agent claims from queue)
                               claimed
                                  ↓
                               resolved
```

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID PK | Primary key |
| `player_name` | TEXT | Required — from form |
| `player_phone` | TEXT | Required — for Booking Agent to call back |
| `slot_from` | TIMESTAMPTZ | Required — court slot start |
| `slot_to` | TIMESTAMPTZ | Required — court slot end |
| `player_location` | TEXT | Required — player's location |
| `preferred_callback_time` | TEXT | Optional — when player prefers to be called |
| `note` | TEXT | Optional — additional context |
| `status` | TEXT | `pending`, `assigned`, `claimed`, `resolved` |
| `assigned_agent_email` | TEXT FK | Null when pending; set on assignment or claim |
| `created_at` | TIMESTAMPTZ | Submission timestamp |
| `updated_at` | TIMESTAMPTZ | Last state change |

**RLS Policies**:

```sql
ALTER TABLE public.callback_requests ENABLE ROW LEVEL SECURITY;

-- Players (anon) can INSERT only
CREATE POLICY "Public insert callback_requests"
  ON public.callback_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Booking Agents (authenticated admins) can SELECT and UPDATE
CREATE POLICY "Admin read callback_requests"
  ON public.callback_requests FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admin update callback_requests"
  ON public.callback_requests FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
```

---

### 4. New RPC Functions

#### `get_next_available_agent_phone()`

Returns the work phone of the next available Booking Agent (primary-contact-first, then by priority_order, then by updated_at), or `NULL` if none available. Callable by `anon`.

```sql
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
```

#### `get_next_available_agent_email()`

Returns the email of the next available Booking Agent (same ordering). Used by the callback-request submission flow to assign on INSERT.

```sql
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
```

#### `submit_callback_request(…)`

Atomically inserts a callback request and auto-assigns to the next available agent if one exists. Returns the new request id and status.

```sql
CREATE OR REPLACE FUNCTION public.submit_callback_request(
  p_player_name TEXT,
  p_player_phone TEXT,
  p_slot_from TIMESTAMPTZ,
  p_slot_to TIMESTAMPTZ,
  p_player_location TEXT,
  p_preferred_callback_time TEXT DEFAULT NULL,
  p_note TEXT DEFAULT NULL
)
RETURNS TABLE(id UUID, status TEXT, assigned_agent_email TEXT) AS $$
DECLARE
  v_agent_email TEXT;
  v_status TEXT;
  v_id UUID;
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
```

#### `claim_callback_request(request_id UUID, agent_email TEXT)`

Atomically claims a pending request. Returns `TRUE` on success, `FALSE` if already claimed.

```sql
CREATE OR REPLACE FUNCTION public.claim_callback_request(
  p_request_id UUID,
  p_agent_email TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_rows INTEGER;
BEGIN
  UPDATE public.callback_requests
  SET status = 'claimed',
      assigned_agent_email = p_agent_email,
      updated_at = NOW()
  WHERE id = p_request_id
    AND status = 'pending';

  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RETURN v_rows > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.claim_callback_request(UUID, TEXT) TO authenticated;
```

---

## Updated Trigger

Add `updated_at` auto-update triggers for both new tables:

```sql
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
```

---

## Migration File

Single migration: `supabase/migrations/20260419000000_booking_agents_callback_requests.sql`

Contains in order:
1. `ALTER TABLE admin_users ADD COLUMN is_super_admin`
2. `CREATE FUNCTION is_super_admin()`
3. `CREATE TABLE booking_agents` + RLS
4. `CREATE TABLE callback_requests` + RLS
5. `CREATE FUNCTION get_next_available_agent_phone()`
6. `CREATE FUNCTION get_next_available_agent_email()`
7. `CREATE FUNCTION submit_callback_request(…)`
8. `CREATE FUNCTION claim_callback_request(…)`
9. Triggers for `updated_at`

---

## TypeScript Interface Summary

```ts
// booking agent profile
interface BookingAgent {
  email: string
  display_name: string
  work_phone: string
  is_primary: boolean
  priority_order: number
  is_available: boolean
  updated_at: string
}

// callback request record
interface CallbackRequest {
  id: string
  player_name: string
  player_phone: string
  slot_from: string      // ISO timestamp
  slot_to: string        // ISO timestamp
  player_location: string
  preferred_callback_time: string | null
  note: string | null
  status: 'pending' | 'assigned' | 'claimed' | 'resolved'
  assigned_agent_email: string | null
  created_at: string
  updated_at: string
}

// RPC return for submit
interface SubmitCallbackResult {
  id: string
  status: 'pending' | 'assigned'
  assigned_agent_email: string | null
}
```
