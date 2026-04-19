# Implementation Plan: Route Callback Requests

**Branch**: `021-route-callback-requests` | **Date**: 2026-04-19 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `/specs/021-route-callback-requests/spec.md`

## Summary

Add a persistent floating Call FAB to the player availability/calendar screen that lets players
initiate a direct mobile call to the next available primary Booking Agent, or fall back to
submitting a structured callback request form when no agent is available. On the admin side,
Booking Agents see a real-time queue of pending callback requests and can claim them atomically.
A super-admin config area manages Booking Agent phone numbers, availability toggles, and
primary-contact designation. All routing logic runs in PostgreSQL RPC functions, keeping phone
numbers and routing order server-side. New DB tables: `booking_agents`, `callback_requests`.
Supabase Realtime subscriptions drive instant admin notifications.

## Technical Context

**Language/Version**: TypeScript 6.0.2  
**Primary Dependencies**: React 19.2.4, React Query 5.99.0, react-hook-form 7.72.1, Zod 4.x, Supabase 2.103.0, Tailwind CSS 3.4.17, shadcn/ui, lucide-react 1.8, date-fns 4.1.0  
**Storage**: Supabase PostgreSQL with RLS — 2 new tables (`booking_agents`, `callback_requests`); 4 new RPC functions; `admin_users` extended with `is_super_admin` column  
**Testing**: `npm test` (unit/integration), `npm run lint` (ESLint)  
**Target Platform**: Web SPA — mobile-first (players use mobile); admin on tablet/desktop  
**Project Type**: Web application — single-project React SPA  
**Performance Goals**: Realtime queue refresh within ~2 s of new callback request insert  
**Constraints**: Phone numbers must never be exposed directly to unauthenticated clients; single-claim atomicity enforced at DB level; no third-party telephony services  
**Scale/Scope**: Small badminton court operation; 1–2 primary Booking Agents; up to ~10 admins; low-volume callback requests

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. Spec-First**: `specs/021-route-callback-requests/spec.md` exists with 4 prioritized user stories and independently testable acceptance scenarios.
- [x] **II. Type Safety**: No `any` types introduced. Zod schemas planned for callback form submission and booking-agent form. All RPC return types defined in `data-model.md`. TypeScript interfaces co-located with features.
- [x] **III. Component Reusability**: Call FAB under `src/features/players/call/`; callback form as a standalone component; admin queue page under `src/features/admin/callback-requests/`; super-admin config under `src/features/admin/booking-agents/`. All built on shadcn/ui primitives. No business logic in UI components — routing/submission in service/hook layer.
- [x] **IV. Data Integrity & Security**: RLS policies documented in `data-model.md` for both new tables. Routing RPC functions are `SECURITY DEFINER`. Admin callback-request routes protected by existing `AdminProtectedRoute`. Super-admin config route guarded by `isSuperAdmin` check. Phone numbers returned only via server-side RPC.
- [x] **V. Responsive Design**: Call FAB is fixed-position, mobile-first (min 56×56 px touch target). Callback form modal uses responsive dialog. Admin queue page inherits AdminLayout responsive grid. All three breakpoints (≥375 px, ≥768 px, ≥1280 px) covered.

**Post-design re-check**: All gates still pass after Phase 1 design.

## Project Structure

### Documentation (this feature)

```text
specs/021-route-callback-requests/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
├── contracts/
│   ├── CallFAB.ts
│   ├── CallbackRequestForm.ts
│   ├── BookingAgentConfig.ts
│   └── CallbackRequestQueue.ts
└── tasks.md             ← Phase 2 output (/speckit.tasks)
```

### Source Code

```text
src/
├── features/
│   ├── players/
│   │   ├── PublicCalendarPage.tsx          (modified — add CallFAB)
│   │   └── call/
│   │       ├── CallFAB.tsx                 (new — floating action button)
│   │       ├── CallbackRequestModal.tsx    (new — modal wrapper)
│   │       ├── CallbackRequestForm.tsx     (new — form fields + rules reminder)
│   │       ├── useNextAvailableAgent.ts    (new — RPC: get_next_available_agent_phone)
│   │       ├── useSubmitCallbackRequest.ts (new — RPC: submit_callback_request)
│   │       └── types.ts                    (new — CallbackRequest, SubmitResult types + Zod schema)
│   └── admin/
│       ├── callback-requests/
│       │   ├── CallbackRequestsPage.tsx    (new — queue + my-requests view)
│       │   ├── CallbackRequestCard.tsx     (new — single request card with claim/resolve)
│       │   ├── useCallbackRequests.ts      (new — React Query + Realtime subscription)
│       │   └── useClaimRequest.ts          (new — RPC: claim_callback_request)
│       └── booking-agents/
│           ├── BookingAgentConfigPage.tsx  (new — super-admin CRUD for booking_agents)
│           ├── BookingAgentForm.tsx        (new — create/edit form)
│           ├── useBookingAgents.ts         (new — CRUD hooks for booking_agents)
│           └── types.ts                    (new — BookingAgent type + Zod schema)
├── App.tsx                                 (modified — add /admin/callback-requests, /admin/booking-agents routes)
└── layouts/
    └── AdminLayout.tsx                     (modified — add nav links for queue + agent config)

supabase/
└── migrations/
    └── 20260419000000_booking_agents_callback_requests.sql   (new)
```

**Structure Decision**: Single-project React SPA. Player call feature under `src/features/players/call/`. Admin queue and super-admin config each under their own subdirectory of `src/features/admin/`. Migration as a single SQL file.

## Phase 0: Research

See [research.md](research.md) for full decision log.

Key decisions resolved:
1. **Mobile call initiation**: `<a href="tel:...">` inside Call FAB — no backend required for dial action itself.
2. **Server-side routing (FR-013)**: PostgreSQL RPC `get_next_available_agent_phone()` with `SECURITY DEFINER`; phone never exposed via direct table query to `anon`.
3. **Atomic single-claim (FR-009)**: `claim_callback_request()` RPC with `WHERE status = 'pending'` UPDATE; atomicity guaranteed by PostgreSQL statement-level locking.
4. **Realtime notifications (FR-007)**: Supabase Realtime `postgres_changes` on `callback_requests`; React Query `invalidateQueries` on event; toast on pending INSERT.
5. **Super-admin concept**: `is_super_admin BOOLEAN` column added to `admin_users`; new `is_super_admin()` SECURITY DEFINER function mirrors existing `is_admin()` pattern.

## Phase 1: Design

### Data Model

See [data-model.md](data-model.md) for full schema, RLS policies, and RPC function signatures.

New tables: `booking_agents`, `callback_requests`  
Altered table: `admin_users` (add `is_super_admin`)  
New functions: `is_super_admin`, `get_next_available_agent_phone`, `get_next_available_agent_email`, `submit_callback_request`, `claim_callback_request`

### Interface Contracts

See [contracts/](contracts/) for all four TypeScript contract files:

| Contract | Purpose |
|----------|---------|
| `CallFAB.ts` | Player floating call button — props, states, layout |
| `CallbackRequestForm.ts` | Callback form fields, Zod schema shape, submission result |
| `BookingAgentConfig.ts` | Super-admin CRUD for booking agents |
| `CallbackRequestQueue.ts` | Admin real-time queue, claim result, toast |

### Quickstart

See [quickstart.md](quickstart.md) for migration steps, seed SQL, and feature verification checklist.
