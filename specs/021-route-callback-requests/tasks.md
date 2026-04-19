# Tasks: Route Callback Requests (021)

**Branch**: `021-route-callback-requests` | **Date**: 2026-04-19  
**Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)  
**Total tasks**: 23 | **Parallelizable**: 10 | **User stories**: 4

---

## Phase 1 — Setup

> Goal: Apply the database migration so all downstream tasks have the schema they depend on.

- [X] T001 Write migration `supabase/migrations/20260419000000_booking_agents_callback_requests.sql` containing: `ALTER TABLE admin_users ADD COLUMN is_super_admin`; `CREATE FUNCTION is_super_admin()`; `CREATE TABLE booking_agents` with RLS; `CREATE TABLE callback_requests` with RLS; `CREATE FUNCTION get_next_available_agent_phone()`; `CREATE FUNCTION get_next_available_agent_email()`; `CREATE FUNCTION submit_callback_request(…)`; `CREATE FUNCTION claim_callback_request(…)`; `updated_at` triggers on both tables — exactly as specified in `specs/021-route-callback-requests/data-model.md`

---

## Phase 2 — Foundational

> Goal: Shared TypeScript types and Zod schemas that all later feature components depend on. Both are independent files and can be implemented in parallel.

- [X] T002 [P] Create `src/features/players/call/types.ts` exporting: `CallbackRequest`, `SubmitCallbackResult`, `CallbackRequestFormValues`; Zod schema `callbackRequestSchema` validating all required fields (playerName min 1, playerPhone 7–20 chars, slotFrom/slotTo ISO datetime with slotTo after slotFrom, playerLocation min 1) and optional fields (preferredCallbackTime max 100, note max 500)

- [X] T003 [P] Create `src/features/admin/booking-agents/types.ts` exporting: `BookingAgent` interface and Zod schema `bookingAgentSchema` validating displayName min 1 max 80, workPhone pattern `/^[+\d\s()\-]{7,20}$/`, priorityOrder 1–99, isPrimary boolean, isAvailable boolean; create `src/features/admin/callback-requests/types.ts` exporting `CallbackRequestStatus` union type and `CallbackRequest` interface matching the DB columns from data-model.md

---

## Phase 3 — User Story 1: Player Callback Request Flow

> **Story goal**: Player sees a persistent Call FAB on the availability screen, can initiate a direct mobile call to the next available Booking Agent, or fall back to submitting a callback request form with rules reminder.  
> **Independent test**: Open `/` (public calendar), verify Call FAB is visible at bottom-right at all scroll positions; tap FAB with agent available → native dialer opens; tap with no agent → feedback + callback form appears; submit form → confirmation message shown.

- [X] T004 [P] [US1] Create `src/features/players/call/useNextAvailableAgent.ts` — React Query hook calling Supabase RPC `get_next_available_agent_phone()`; return `{ phone: string | null, isLoading: boolean }`; use queryKey `['next-available-agent']` with `staleTime: 30_000`

- [X] T005 [P] [US1] Create `src/features/players/call/useSubmitCallbackRequest.ts` — React Query mutation calling Supabase RPC `submit_callback_request(p_player_name, p_player_phone, p_slot_from, p_slot_to, p_player_location, p_preferred_callback_time, p_note)`; validate RPC response with Zod against `SubmitCallbackResult`; invalidate `['callback-requests']` on success

- [X] T006 [US1] Create `src/features/players/call/CallFAB.tsx` — fixed-position (bottom-6 right-6 z-50) button using shadcn/ui `Button` and lucide-react `Phone` / `PhoneOff` icons; three visual states: loading (spinner, disabled), available (Phone icon + "Call Now", rendered as `<a href={\`tel:\${phone}\`}>`), unavailable (PhoneOff icon + "No Agent Available", tap shows inline message + "Request Callback" button that calls `onRequestCallback`); min 56×56 px touch target; props: `availableAgentPhone: string | null`, `isLoading: boolean`, `onRequestCallback: () => void` — per contract `specs/021-route-callback-requests/contracts/CallFAB.ts`

- [X] T007 [US1] Create `src/features/players/call/CallbackRequestForm.tsx` — react-hook-form with Zod resolver using `callbackRequestSchema`; fields: player name (text), phone (tel input), slot from (datetime-local), slot to (datetime-local), player location (text), preferred callback time (text, optional), note (textarea, optional); rules reminder banner at top: non-blocking info alert with link to court rules (route `/rules` or existing rules modal); submit via `useSubmitCallbackRequest`; show confirmation message after success based on returned status (`assigned` vs `pending`) per `ConfirmationVariant` in contract

- [X] T008 [US1] Create `src/features/players/call/CallbackRequestModal.tsx` — wraps `CallbackRequestForm` in a shadcn/ui `Dialog`; controlled by `isOpen` / `onClose` props; title "Request Callback"; full-width on mobile (max-w-lg on sm+); close button in header

- [X] T009 [US1] Modify `src/features/players/PublicCalendarPage.tsx` — import `useNextAvailableAgent`, `CallFAB`, `CallbackRequestModal`; add `isModalOpen` state; render `<CallFAB>` and `<CallbackRequestModal>` inside the page root div; pass `onRequestCallback={() => setIsModalOpen(true)}` to FAB; pass `onClose={() => setIsModalOpen(false)}` to modal

---

## Phase 4 — User Story 2: Booking Agent Routing Configuration (Super-Admin)

> **Story goal**: Super-admin can create, edit, and delete Booking Agent records including work phone, is_primary flag, priority order, and availability toggle. Routing uses these records (primary-contact-first) when players submit requests.  
> **Independent test**: Log in as super-admin → navigate to `/admin/booking-agents` → create an agent record → verify it appears in the table → toggle availability → verify routing reflects change via `get_next_available_agent_phone()` RPC.

- [X] T010 [P] [US2] Create `src/features/admin/booking-agents/useBookingAgents.ts` — React Query hooks: `useBookingAgents()` selects all rows from `booking_agents` ordered by `is_primary DESC, priority_order ASC`; `useCreateBookingAgent()` mutation inserts row; `useUpdateBookingAgent()` mutation updates row by email; `useDeleteBookingAgent()` mutation deletes row by email; all mutations invalidate `['booking-agents']` on success

- [X] T011 [US2] Create `src/features/admin/booking-agents/BookingAgentForm.tsx` — react-hook-form with Zod resolver using `bookingAgentSchema`; create mode: all fields editable including email; edit mode: email readonly; fields: email, display name, work phone, is primary (checkbox), priority order (number 1–99), is available (toggle); submit triggers `useCreateBookingAgent` or `useUpdateBookingAgent`

- [X] T012 [US2] Create `src/features/admin/booking-agents/BookingAgentConfigPage.tsx` — renders only if `isSuperAdmin` (from `useAuth` `is_super_admin` check against `admin_users`); shows table of `BookingAgent` rows with columns: display name, email, work phone, primary, priority, available; action buttons: edit (opens `BookingAgentForm` in a Dialog), delete (confirm then `useDeleteBookingAgent`); "Add Booking Agent" button opens create form; loading/empty states

- [X] T013 [US2] Add route `/admin/booking-agents` to `src/App.tsx` inside the `AdminProtectedRoute` block rendering `<BookingAgentConfigPage />`

- [X] T014 [US2] Add "Booking Agents" nav link (PhoneCall icon from lucide-react) to `src/layouts/AdminLayout.tsx` pointing to `/admin/booking-agents`; visible only when `isSuperAdmin` is true (use `useAuth` and check `is_super_admin` column)

---

## Phase 5 — User Story 3: Queue and Claim Requests

> **Story goal**: Booking Agents see pending (unclaimed) callback requests in real time and can claim them atomically; only one agent succeeds when two claim simultaneously.  
> **Independent test**: Mark all agents unavailable → submit callback request → verify it appears as pending in admin queue within ~2 s (Realtime); have two agents claim the same request simultaneously → verify only one succeeds; claimed request disappears from pending list for both agents.

- [X] T015 [P] [US3] Create `src/features/admin/callback-requests/useCallbackRequests.ts` — React Query hook selecting all `callback_requests` ordered by `created_at DESC`; on mount, subscribe to Supabase Realtime `postgres_changes` on `callback_requests` table for INSERT and UPDATE events; on event call `queryClient.invalidateQueries(['callback-requests'])`; on INSERT with `new.status === 'pending'` emit a toast notification with player name and slot time; unsubscribe on unmount

- [X] T016 [P] [US3] Create `src/features/admin/callback-requests/useClaimRequest.ts` — React Query mutation calling Supabase RPC `claim_callback_request(p_request_id, p_agent_email)`; parse boolean return value; on `false` show "Request already claimed" toast; on success invalidate `['callback-requests']`

- [X] T017 [US3] Create `src/features/admin/callback-requests/CallbackRequestCard.tsx` — displays: player name, phone, slot from/to formatted with date-fns, player location, preferred callback time, note, status badge (using existing `StatusBadge` or inline Tailwind), assigned agent email; "Claim" button shown only when `status === 'pending'` calls `useClaimRequest`; "Mark Resolved" button shown when request is assigned/claimed and `assignedAgentEmail === currentAgentEmail` — updates status to `resolved` via direct Supabase update

- [X] T018 [US3] Create `src/features/admin/callback-requests/CallbackRequestsPage.tsx` — two sections: "Pending Requests" (status=pending, claimable by any agent) and "My Requests" (assigned_agent_email = currentAgentEmail, status in assigned|claimed|resolved); uses `useCallbackRequests()` and filters client-side; shows empty-state messages; renders `CallbackRequestCard` per item

- [X] T019 [US3] Add route `/admin/callback-requests` to `src/App.tsx` inside `AdminProtectedRoute` rendering `<CallbackRequestsPage />`

- [X] T020 [US3] Add "Callback Requests" nav link (PhoneIncoming icon from lucide-react) to `src/layouts/AdminLayout.tsx` pointing to `/admin/callback-requests`; visible to all admins (not super-admin gated)

---

## Phase 6 — User Story 4: Manage Callback Requests as Reservation Work

> **Story goal**: Booking Agents can mark their assigned/claimed requests as resolved and always distinguish pending vs active vs resolved states in one place.  
> **Independent test**: Open `/admin/callback-requests` as a Booking Agent with assigned requests → confirm "My Requests" section shows assigned/claimed items → click "Mark Resolved" → confirm item status changes to resolved and moves out of active queue.

- [X] T021 [US4] Update `src/features/admin/callback-requests/CallbackRequestCard.tsx` to add `useResolveRequest` inline mutation (direct Supabase UPDATE setting `status = 'resolved'` and `updated_at = now()` where `id = requestId`); "Mark Resolved" button triggers this mutation and invalidates `['callback-requests']`; add resolved status display: show resolved items in "My Requests" section with muted styling to distinguish from active items

---

## Phase 7 — Polish & Cross-Cutting Concerns

> Cross-cutting: Realtime toast, responsive verification, lint gate.

- [X] T022 Verify the new-request toast notification in `src/features/admin/callback-requests/useCallbackRequests.ts` renders player name, slot from/to, and a "Claim" quick-action button using the project's existing toast utility; confirm it does not duplicate on rapid reconnects (debounce or deduplicate by request id)

- [X] T023 Run `npm run lint` and `npx tsc --noEmit` against all files touched in T001–T022; fix any errors; confirm zero lint errors and zero TypeScript errors remain before marking complete

---

## Dependencies

```
T001 (migration) → T002, T003

T002 → T004, T005, T006, T007, T008
T003 → T010, T011, T015, T016, T017

T004, T005 → T006
T006, T007 → T008
T008 → T009

T010 → T011
T011 → T012
T012 → T013
T013, T014 → (US2 complete)

T015, T016 → T017
T017 → T018
T018 → T019
T019 → T020

T017, T018 → T021

T001–T021 → T022, T023
```

**User story completion order** (all P1 stories can be implemented in parallel once T001–T003 are done):
1. US1 (T004–T009) — player-facing; no dependency on US2, US3, US4
2. US2 (T010–T014) — super-admin config; no dependency on US1, US3, US4
3. US3 (T015–T020) — admin queue; no dependency on US1, US2
4. US4 (T021) — depends on US3 (extends CallbackRequestCard)

---

## Parallel Execution Examples

**After T001 and T002/T003 complete, these can run in parallel**:

| Session A (US1) | Session B (US2) | Session C (US3) |
|-----------------|-----------------|-----------------|
| T004 useNextAvailableAgent | T010 useBookingAgents | T015 useCallbackRequests |
| T005 useSubmitCallbackRequest | T011 BookingAgentForm | T016 useClaimRequest |
| T006 CallFAB | T012 BookingAgentConfigPage | T017 CallbackRequestCard |
| T007 CallbackRequestForm | T013 App.tsx route | T018 CallbackRequestsPage |
| T008 CallbackRequestModal | T014 AdminLayout nav | T019 App.tsx route |
| T009 PublicCalendarPage | | T020 AdminLayout nav |

**After all user story phases**, T021 (US4) then T022–T023 (Polish) are sequential.

---

## Implementation Strategy

**MVP scope** (suggested minimum viable slice):
- T001 (migration) — required first
- T002, T004, T005, T006, T008, T009 — Call FAB + direct call via tel: link only (no form yet)
- T015, T016, T017, T018, T019, T020 — Admin queue + claim

This gives a working player→call→agent flow and admin queue without the full super-admin config page.

**Incremental delivery**:
1. Migration + types (T001–T003)
2. US1 player call flow (T004–T009)
3. US2 super-admin agent config (T010–T014)
4. US3 real-time queue + claim (T015–T020)
5. US4 resolve lifecycle (T021)
6. Polish (T022–T023)
