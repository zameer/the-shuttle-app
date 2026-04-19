# Research: Route Callback Requests (021)

**Phase**: 0 — Pre-design research  
**Branch**: `021-route-callback-requests`  
**Date**: 2026-04-19

---

## Decision 1 — Mobile Call Initiation Mechanism

**Decision**: Use an `<a href="tel:{phone}">` element rendered inside the Call FAB. On mobile browsers this triggers the native dialer automatically. No backend call is required for the initiation itself; only the phone number retrieval is server-side.

**Rationale**: The `tel:` URI scheme is universally supported on iOS Safari, Chrome Android, and all modern mobile browsers. It is the simplest, most reliable mechanism and does not require a third-party relay or proxy service, which are out of scope for MVP.

**Alternatives considered**:
- Proxy/relay service (e.g., Twilio) — adds recurring cost and infrastructure complexity for a small court operation; rejected.
- Direct `window.location.href = 'tel:...'` — equivalent but `<a href>` degrades better on desktop (shows as non-interactive link).

---

## Decision 2 — Server-Side Routing Logic (FR-013)

**Decision**: Implement a PostgreSQL function `get_next_available_agent_phone()` with `SECURITY DEFINER` callable by `anon` role. It evaluates `booking_agents` ordered by `is_primary DESC, priority_order ASC, updated_at ASC` and returns the work phone of the first available agent. The client receives only a phone string (or `null`); it never has access to the full `booking_agents` table.

**Rationale**: FR-013 requires routing decisions to be server-controlled. An RPC function keeps all routing logic in the database and prevents clients from inspecting or manipulating routing order. `SECURITY DEFINER` allows `anon` callers without exposing underlying table structure.

**Alternatives considered**:
- Supabase Edge Function — adds a runtime layer; more complex to maintain; rejected for MVP.
- Client-side query of `booking_agents` — violates FR-013 and exposes all agent records to unauthenticated players; rejected.

---

## Decision 3 — Atomic Single-Claim Enforcement (FR-009)

**Decision**: Implement a PostgreSQL function `claim_callback_request(request_id UUID, agent_email TEXT)` with `SECURITY DEFINER`. It runs an `UPDATE … WHERE id = request_id AND status = 'pending' RETURNING id`. If zero rows are returned, the claim fails (another agent already claimed it). This is atomic at the PostgreSQL statement level without requiring explicit `SELECT FOR UPDATE`.

**Rationale**: A `WHERE status = 'pending'` predicate on UPDATE is atomic in PostgreSQL under `READ COMMITTED` isolation (the default). Two concurrent updates will serialize; only one will find `status = 'pending'` and succeed. The function returns a boolean indicating success, which the client uses to show feedback.

**Alternatives considered**:
- `SELECT FOR UPDATE SKIP LOCKED` + separate UPDATE — more complex; requires a transaction; no benefit over the simpler predicate approach.
- Optimistic UI with refetch — not atomic; leaves a window for double-claim; rejected.

---

## Decision 4 — Realtime Notifications for Booking Agents (FR-007)

**Decision**: Use Supabase Realtime channel subscriptions on the `callback_requests` table. Booking Agents subscribe to `postgres_changes` events for `INSERT` and `UPDATE` on `callback_requests` filtered by `status=eq.pending`. On event, React Query's `invalidateQueries` is called to refresh the queue list. A toast notification is shown for new `pending` inserts.

**Rationale**: Supabase Realtime is already the project's chosen backend infrastructure. Using `postgres_changes` requires no additional services. The existing codebase uses React Query for data; the combination of Realtime trigger + `invalidateQueries` is the established pattern in this stack.

**Alternatives considered**:
- Polling — works but adds latency and database load; rejected.
- Supabase webhooks to external endpoint — requires external server infrastructure not available in this project; rejected.

---

## Decision 5 — Super-Admin Concept

**Decision**: Add `is_super_admin BOOLEAN NOT NULL DEFAULT FALSE` to the existing `admin_users` table via migration. Add a `public.is_super_admin()` SECURITY DEFINER helper function mirroring `is_admin()`. Use this in RLS policies for `booking_agents` write access. The `BookingAgentConfigPage` is only accessible to super-admin users (router-level guard + RLS).

**Rationale**: The spec requires a dedicated super-admin–only config area (FR-012b). Extending `admin_users` is the minimal approach — no new auth table, no new auth system. The existing `is_admin()` pattern is simply extended.

**Alternatives considered**:
- Separate `super_admin_users` table — duplicates the whitelist pattern unnecessarily; rejected.
- Role-based access control via Supabase Auth — adds complexity beyond current auth model; rejected for MVP.
