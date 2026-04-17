# Research: Admin Booking Controls and Past Slot Visibility

**Feature**: 014 — Admin Booking Controls and Past Slot Visibility  
**Branch**: `014-admin-booking-calendar-fixes`  
**Date**: 2026-04-17

---

## Decision 1: Booking Status Schema Extension (CANCELLED, NO_SHOW)

**Context**: The spec defines four admin-manageable statuses: CONFIRMED, CANCELLED, PENDING,
NO_SHOW. The database CHECK constraint in `20260412184908_initial_schema.sql` only allows
`('AVAILABLE', 'PENDING', 'CONFIRMED', 'UNAVAILABLE')`. CANCELLED and NO_SHOW do not exist.

**Decision**: New Supabase migration to ALTER the `bookings.status` CHECK constraint to include
`'CANCELLED'` and `'NO_SHOW'`.

**Rationale**: Minimal, backward-compatible migration. No existing rows are affected. New statuses
extend the existing lifecycle without replacing any value. RLS policies are status-agnostic (they
filter by auth role, not status value) and need no changes.

**Alternatives Considered**:
- Use `cancellation_reason` or `admin_notes` field to encode sub-states (rejected: adds a second
  source of truth and requires UI to interpret both fields simultaneously).
- Keep UNAVAILABLE as the "cancelled" stand-in (rejected: semantically incorrect and makes status
  display ambiguous to admins).

---

## Decision 2: TypeScript BookingStatus Union Extension

**Context**: `src/features/booking/useBookings.ts` exports:
```ts
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'UNAVAILABLE'
```
This must be extended to include `'CANCELLED'` and `'NO_SHOW'`.

**Decision**: Extend `BookingStatus` to:
```ts
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'UNAVAILABLE' | 'CANCELLED' | 'NO_SHOW'
```
Also update `BookingForm`'s Zod schema enum and status dropdown to include all five values.
Existing `statusColor` maps in `BookingDetailsModal.tsx`, `AdminListView.tsx`, and
`StatusBadge.tsx` will need new entries for CANCELLED and NO_SHOW.

**Rationale**: Single-source-of-truth type drives exhaustiveness checks across all status
rendering surfaces. TypeScript strict mode will surface every map/switch that needs updating.

**Alternatives Considered**:
- Runtime string check without union extension (rejected: violates Constitution Principle II —
  Type Safety; no exhaustiveness checking).

---

## Decision 3: Unified Booking Update Hook (useUpdateBooking)

**Context**: `useUpdateBookingStatus()` only accepts `status` and `payment_status`. Feature 014
requires updating `hourly_rate` and `total_price` independently (manual price) and together
with `status`.

**Decision**: Create `useUpdateBooking()` hook accepting a partial payload:
```ts
{ id: string; status?: BookingStatus; payment_status?: PaymentStatus;
  hourly_rate?: number; total_price?: number }
```
The existing `useUpdateBookingStatus` can call this hook or remain for backward compat with
existing callers (`AdminCalendarPage`). The new hook issues a single `supabase.update()` with
only the fields provided.

**Rationale**: One mutation call per admin save; no partial-update conflicts. Keeps business
logic (price calculation) in the hook layer per Constitution Principle IV.

**Alternatives Considered**:
- Separate `useUpdatePrice` and `useUpdateStatus` hooks (rejected: two round-trips for a combined
  save; complicates BookingDetailsModal state management).

---

## Decision 4: System Pricing Revert Formula

**Context**: "Revert pricing" must reset to the system-calculated value. The system default rate
comes from `court_settings.default_hourly_rate` (fetched via `useSettings()` — already cached
in React Query). Duration is deterministic from `booking.start_time` and `booking.end_time`.

**Decision**: In `BookingDetailsModal`, import `useSettings`. On "Revert Pricing" click, compute:
```ts
const durationMinutes = differenceInMinutes(new Date(booking.end_time), new Date(booking.start_time))
const systemPrice = (durationMinutes / 60) * (settings?.defaultRate ?? booking.hourly_rate ?? 0)
const systemRate = settings?.defaultRate ?? booking.hourly_rate ?? 0
// Set local state: manualRate = systemRate, manualTotal = systemPrice
```
Admin then saves to persist.

**Rationale**: No additional API call; `useSettings` result is already cached at 5-minute
stale time. Pure client-side computation. No new DB column required.

**Alternatives Considered**:
- Store `system_price` as a separate column on creation (rejected: redundant data; price changes
  if settings change after booking creation).
- Fetch default rate fresh on revert click (rejected: unnecessary round-trip when cached).

---

## Decision 5: Manual Price Input in BookingDetailsModal

**Context**: Admins must be able to manually enter any price value (including zero) for any
booking regardless of status. Currently `BookingDetailsModal` shows `hourly_rate` and
`total_price` as read-only text.

**Decision**: Add two editable numeric inputs in the Financials section of `BookingDetailsModal`:
- `Hourly Rate (LKR)` — editable number input, any value ≥ 0
- `Total Price (LKR)` — editable number input, any value ≥ 0 (does NOT auto-calculate; admin
  enters freely or uses "Revert" to set system values)

A "Revert to System Pricing" button appears adjacent to set both fields to system-computed values.

**Rationale**: Meets FR-003a (any value including zero, any status, no restriction). Keeping
`hourly_rate` and `total_price` as separate editable fields matches the existing DB schema
and preserves existing reconciliation reports.

**Alternatives Considered**:
- Only edit `total_price` (rejected: `hourly_rate` is stored separately and affects display).
- Auto-calculate `total_price` from `hourly_rate` on change (rejected: spec says any value
  including zero is valid; auto-calc would override intentional custom totals).

---

## Decision 6: Past Slot Hiding — Derivation Layer Approach

**Context**: US2 requires hiding `available` type rows on past dates. Three rendering surfaces:
1. **Admin list view**: driven by `deriveAdminListRows.ts`
2. **Player list view**: driven by `deriveSlotRows.ts`
3. **Calendar grid**: driven by `Calendar.tsx` (shared component) which renders an hour-by-hour
   grid and calls `getSlotDetails(hour)` → returns `{ status: 'AVAILABLE' | ... }`

**Decision**:
- In `deriveAdminListRows(date, bookings)` and `deriveSlotRows(date, bookings)`: add a check
  `const isPastDate = isBefore(startOfDay(date), startOfDay(new Date()))`. If true, skip all
  `available` row emissions entirely.
- In `Calendar.tsx`: add `isPastDate` check in the render loop; for past dates, skip rendering
  hour blocks where `status === 'AVAILABLE'` (show nothing in those slots, or collapse them).

**Rationale**: Single decision point per view type. List derivation functions are pure — easy
to test. Calendar component already receives `date` prop.

**Alternatives Considered**:
- Filter in component `useMemo` after derivation (rejected: derivation functions emit rows that
  consumers then discard — wasteful and splits derivation semantics).
- Pass `hidePastAvailable` prop to components (rejected: adds an optional prop that every caller
  must remember to set; always-on behaviour is simpler and matches spec).

---

## Decision 7: Admin Past Booking Creation Entry Point

**Context**: In list mode on past dates, US2 hides all available slot rows — leaving no clickable
"+" targets for the admin to create a booking. Admin calendar mode is unaffected (slot cells still
visible). US3 requires admin to be able to create bookings for any past date.

**Decision**: In `AdminListView`, add a persistent "Add Booking for this date" button that is
always rendered (regardless of whether rows are shown). When clicked, it invokes the existing
`onAvailableSlotClick` callback with `startOfDay(currentDate)` as the slot start, opening
`BookingForm` pre-set to that date at 06:00. The admin then adjusts the time manually.

**Rationale**: Minimal surface change. Reuses the existing `BookingForm` flow without any new
component. Admin is already on the correct date via `ListDateNav`.

**Alternatives Considered**:
- Re-show available slot rows on past dates for admin only (rejected: spec US2 explicitly hides
  slots in admin views too; makes behaviour inconsistent with spec).
- Separate "New Booking" modal entry point in page header (rejected: over-engineering for a
  single button that already has a flow via `onAvailableSlotClick`).

---

## Decision 8: BookingForm Status Options for Past Booking Creation

**Context**: When creating a past booking, admin should choose from CONFIRMED, PENDING,
CANCELLED, NO_SHOW (per spec FR-013). Current `BookingForm` status dropdown only shows
CONFIRMED, PENDING, UNAVAILABLE.

**Decision**: Update `BookingForm` status dropdown to include all five values:
CONFIRMED, PENDING, UNAVAILABLE, CANCELLED, NO_SHOW. Update Zod enum accordingly.

**Rationale**: Consistent with extended `BookingStatus` type. Admin can create a historical
record with the accurate status (e.g., creating a NO_SHOW for a missed confirmed session).

**Alternatives Considered**:
- Separate "Past Booking Form" (rejected: duplication of form logic; existing form already
  accepts `initialStartTime` to pre-populate date and time).

---

## Summary Table

| # | Decision | Implementation Location |
|---|----------|-------------------------|
| 1 | DB migration: add CANCELLED, NO_SHOW to status CHECK | `supabase/migrations/` |
| 2 | Extend `BookingStatus` type + status UI surfaces | `useBookings.ts`, `BookingForm.tsx`, modal, badges |
| 3 | `useUpdateBooking` hook (status + price in one call) | `useBookings.ts` |
| 4 | System pricing revert via `useSettings` + formula | `BookingDetailsModal.tsx` |
| 5 | Manual price inputs (rate + total) in modal financials | `BookingDetailsModal.tsx` |
| 6 | Past slot filter in derivation functions + Calendar | `deriveSlotRows.ts`, `deriveAdminListRows.ts`, `Calendar.tsx` |
| 7 | "Add Booking" button in `AdminListView` for past dates | `AdminListView.tsx`, `AdminCalendarPage.tsx` |
| 8 | Full status options in `BookingForm` | `BookingForm.tsx` |
