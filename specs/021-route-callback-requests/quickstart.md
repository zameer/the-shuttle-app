# Quickstart: Route Callback Requests (021)

**Branch**: `021-route-callback-requests`  
**Date**: 2026-04-19

---

## Prerequisites

- Node.js ≥ 20, npm ≥ 10
- Supabase CLI installed (`npm i -g supabase`)
- Local Supabase instance running (`supabase start`)
- `.env.local` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

---

## Setup Steps

### 1. Apply the migration

```bash
supabase db push
# or for local dev:
supabase migration up
```

Migration file: `supabase/migrations/20260419000000_booking_agents_callback_requests.sql`

This migration:
- Adds `is_super_admin` to `admin_users`
- Creates `booking_agents` table with RLS
- Creates `callback_requests` table with RLS
- Creates 4 RPC functions (`get_next_available_agent_phone`, `get_next_available_agent_email`, `submit_callback_request`, `claim_callback_request`)

### 2. Seed a super-admin and a Booking Agent

```sql
-- Promote an existing admin to super-admin (run in Supabase SQL editor or seed)
UPDATE admin_users SET is_super_admin = TRUE WHERE email = 'owner@example.com';

-- Insert a Booking Agent record
INSERT INTO booking_agents (email, display_name, work_phone, is_primary, priority_order, is_available)
VALUES ('agent@example.com', 'Agent Name', '+60123456789', TRUE, 1, TRUE);
```

### 3. Install dependencies (none new required)

All dependencies (React Query, shadcn/ui, lucide-react, Zod, react-hook-form) are already installed.

### 4. Start the dev server

```bash
npm run dev
```

---

## Feature Verification

### Player side (Call FAB)
1. Open the public availability page (`/`)
2. Confirm a phone icon FAB is visible at bottom-right at all scroll positions
3. If a Booking Agent is available: tapping the FAB should offer to dial (native dialer prompt on mobile)
4. If no Booking Agent is available: tapping shows "No agent available" + "Request Callback" button
5. Tapping "Request Callback" opens the callback form modal with the rules reminder banner
6. Fill in required fields and submit — confirm the success toast and correct status message

### Admin side (Queue)
1. Log in as an admin at `/admin/login`
2. Navigate to `/admin/callback-requests`
3. Confirm pending and assigned requests are visible in separate sections
4. Click "Claim" on a pending request — confirm it moves to "My Requests"
5. Attempt to claim the same request from a second admin session — confirm the second claim fails with feedback

### Super-admin side (Booking Agent config)
1. Log in as a super-admin
2. Navigate to `/admin/booking-agents`
3. Create a new Booking Agent record (display name, work phone, is_primary, priority, availability)
4. Toggle a Booking Agent's availability and verify routing reflects the change

---

## Lint & Type Check

```bash
npm run lint
npx tsc --noEmit
```

Both must pass with zero errors before marking any task complete.

---

## Realtime Verification

1. Open two browser sessions — one as Booking Agent A, one as Booking Agent B
2. Both on `/admin/callback-requests`
3. From the player view, submit a new callback request while all agents are unavailable
4. Confirm both admin sessions show the new pending request within ~2 seconds (Supabase Realtime)
5. Have Agent A claim the request — confirm Agent B's view removes it from the pending list
