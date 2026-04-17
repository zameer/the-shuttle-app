# Implementation Plan: Admin Booking Controls and Past Slot Visibility

**Branch**: `014-admin-booking-calendar-fixes` | **Date**: 2026-04-17 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/014-admin-booking-controls/spec.md`

## Summary

Feature 014 ships three admin workflow improvements in one branch:

1. **Booking Management (US1)** - Admin can change any booking's status (CONFIRMED, PENDING,
   CANCELLED, NO_SHOW, UNAVAILABLE) and manually edit pricing (`hourly_rate`, `total_price` as
   independent fields, any value >= 0). A "Revert to System Pricing" button resets both fields to
   the system-calculated values from `court_settings.default_hourly_rate`.

2. **Past Slot Hiding (US2)** - Available (unbooked) slot rows are suppressed for past dates in
   admin list view, player list view, and the shared calendar grid. Existing bookings on past
   dates remain visible.

3. **Admin Past Booking Creation (US3)** - A persistent "Add Booking" button in admin list view
   lets admin create bookings for past dates retroactively via the existing `BookingForm`,
   pre-populated with the selected date and all status options available.

**Technical Approach**: DB migration extends the `bookings.status` CHECK constraint to add
`CANCELLED` and `NO_SHOW`. A new `useUpdateBooking` hook supports partial updates of status,
payment_status, hourly_rate, and total_price in a single Supabase call. Two derivation pure
functions and the calendar grid gain an `isPastDate` guard to suppress available rows.
`BookingDetailsModal` gains a status dropdown, editable price inputs, and a revert button.

## Technical Context

**Language/Version**: TypeScript 6.0.2
**Primary Dependencies**: React 19.2.4, Vite 8.0, Tailwind CSS 3.4.17, shadcn/ui,
React Query 5.99.0, react-hook-form 7.72.1, Zod, date-fns 4.1.0, lucide-react 1.8,
Supabase 2.103.0
**Storage**: Supabase PostgreSQL with RLS (existing `bookings` and `court_settings` tables;
no new tables; one new migration)
**Testing**: `npm run lint` (ESLint + TypeScript strict); manual QA per quickstart.md
**Target Platform**: Web (desktop + mobile browsers; admin views primarily desktop)
**Project Type**: Web application (single-page app, admin + public pages)
**Performance Goals**: No new queries; all changes are display-layer or single-row mutations
**Constraints**: Must not break existing booking history; RLS policies unchanged;
`AVAILABLE` status remains a derivation-only concept, never stored in DB
**Scale/Scope**: Single badminton court; ~5-50 bookings per day

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. Spec-First**: `specs/014-admin-booking-controls/spec.md` exists with 3 prioritized
  user stories, 13 functional requirements, 6 acceptance scenarios, and 10 completed
  clarification Q&As. All implementation tasks will reference a parent user story.
- [x] **II. Type Safety**: `BookingStatus` union extended (no `any`). New `UpdateBookingPayload`
  interface typed. Zod schema in `BookingForm` updated. All status maps typed as
  `Record<BookingStatus, string>` - exhaustiveness enforced by TypeScript strict mode.
- [x] **III. Component Reusability**: `BookingDetailsModal` extended in place (feature
  component). `useUpdateBooking` hook in service layer. No business logic inside JSX render.
  shadcn/ui primitives (Select, Input, Button) used for new form controls.
- [x] **IV. Data Integrity & Security**: DB migration extends CHECK constraint - no data loss.
  RLS policies are role-based (not status-based) - no changes required. Price and status
  mutations are exclusively in the hook layer (`useUpdateBooking`). Admin routes already
  guarded by `AdminLayout` auth wrapper.
- [x] **V. Responsive Design**: `BookingDetailsModal` is already responsive (max-w-md dialog).
  New inputs use full-width Tailwind classes. "Add Booking" button in `AdminListView` uses
  existing `w-full` row pattern. No new layout primitives needed.

## Project Structure

### Documentation (this feature)

```
specs/014-admin-booking-controls/
  plan.md          <- This file
  research.md      <- Phase 0 (8 decisions; completed)
  data-model.md    <- Phase 1 (schema, types, hooks; completed)
  quickstart.md    <- Phase 1 (dev setup + test scenarios; completed)
  contracts/
    AdminBookingControls.ts  <- Phase 1 (interfaces; completed)
  tasks.md         <- Phase 2 (/speckit.tasks - not yet generated)
```

### Source Code (affected files)

```
supabase/
  migrations/
    20260417000000_extend_booking_status.sql  <- NEW: ALTER status CHECK constraint

src/
  features/
    booking/
      useBookings.ts              <- Extend BookingStatus; add useUpdateBooking
      BookingDetailsModal.tsx     <- Add status dropdown, price inputs, revert button
      BookingForm.tsx             <- Add CANCELLED/NO_SHOW; wire initialDate prop
    admin/
      AdminCalendarPage.tsx       <- Pass onAddBooking to AdminListView
      AdminListView.tsx           <- Add "Add Booking" button for past dates
      calendar/
        deriveAdminListRows.ts    <- Suppress available rows on past dates
    players/
      calendar/
        deriveSlotRows.ts         <- Suppress available rows on past dates
  components/
    shared/
      Calendar.tsx                <- Hide AVAILABLE hour blocks on past dates
```

**Structure Decision**: Single-project web app. All changes within `src/features/` and
`src/components/shared/`. One new DB migration. No new directories required.

## Phase 0: Research

See [research.md](research.md) - 8 decisions documented and resolved.

Key resolved items:
- CANCELLED and NO_SHOW require a DB migration (ALTER CHECK constraint)
- `useUpdateBooking` consolidates status + price into one Supabase call
- System pricing revert uses `useSettings().defaultRate x (duration / 60)`
- Past-slot suppression added at derivation layer (pure function guard), not in components
- Admin past booking creation uses existing `BookingForm` with `initialDate` prop wired

## Phase 1: Design Artifacts

- [data-model.md](data-model.md) - Schema migration, type extensions, hook interfaces, UI state
- [contracts/AdminBookingControls.ts](contracts/AdminBookingControls.ts) - TypeScript contracts
- [quickstart.md](quickstart.md) - Dev setup, key code patterns, manual QA test scenarios

### Constitution Re-check (Post-Design)

All five principles confirmed satisfied after design review:
- No new `any` types introduced in contracts or planned implementation
- All status maps (BOOKING_STATUS_STYLES, BOOKING_STATUS_LABELS) use Record<..., string>
- Price mutation exclusively in `useUpdateBooking` hook - modal only manages local state until Save
- DB migration uses ALTER (additive) - zero risk of data loss or RLS breakage
- "Add Booking" button in AdminListView uses existing onAvailableSlotClick-equivalent pattern
