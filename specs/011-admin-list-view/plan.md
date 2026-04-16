# Implementation Plan: Admin List View Booking Management

**Branch**: `011-admin-list-view` | **Date**: 2026-04-16 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/011-admin-list-view/spec.md`

## Summary

Add a list-view mode to the admin booking interface alongside the existing calendar. The list renders one merged row per booking (exact duration, including 30-, 90-, 150-minute bookings) and 30-minute available-slot rows filling schedule gaps. Admins navigate dates with `ListDateNav` (prev/next + date picker), and each row exposes a ⋮ action button that opens the existing `BookingDetailsModal` (manage bookings) or `BookingForm` (create from available slot). Implementation introduces one new pure-function module, one new admin component, and modifies `AdminCalendarPage` to support the toggle and list branch.

## Technical Context

**Language/Version**: TypeScript 6.0.2  
**Primary Dependencies**: React 19.2.4 + Vite 8.0, Tailwind CSS 3.4.17, shadcn/ui, React Query 5.99.0, date-fns 4.1.0, lucide-react 1.8  
**Storage**: Supabase PostgreSQL — no schema change; existing `bookings` table + `useBookings(startDate, endDate, true)` hook  
**Testing**: `npm run lint` (ESLint); manual quickstart verification  
**Target Platform**: Web SPA — mobile (≥375 px) and desktop (≥1280 px)  
**Project Type**: Web application (SPA admin panel)  
**Performance Goals**: List renders within one React render cycle from query cache; no additional network requests beyond the single-day booking query  
**Constraints**: No new Supabase tables or migrations; no new npm packages; reuse `ListDateNav`, `BookingDetailsModal`, `BookingForm`  
**Scale/Scope**: Admin-only; single active session; up to ~32 rows per day (30-min slots, 06:00–22:00)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. Spec-First**: `specs/011-admin-list-view/spec.md` exists with 3 prioritized user stories and acceptance scenarios. All implementation tasks reference a parent user story.
- [x] **II. Type Safety**: No `any` introduced. `AdminListRow`, `AdminCalendarDisplayMode`, `AdminListViewProps` are explicitly typed (see contracts/). Boundary data validated by existing `useBookings` + `normalizePaymentStatus`.
- [x] **III. Component Reusability**: `AdminListView` is feature-specific → `src/features/admin/`. `deriveAdminListRows` is a pure function with no JSX. No business logic embedded in UI layers.
- [x] **IV. Data Integrity & Security**: No new tables; existing RLS policies apply. `useBookings(..., true)` is admin-authenticated. `BookingDetailsModal` and `BookingForm` handle all writes via existing hooks.
- [x] **V. Responsive Design**: `AdminListView` rows use `min-h-[44px]` touch targets. `ListDateNav` is already mobile-responsive from feature 010. Three breakpoints addressed in quickstart.md.

Post-design re-check: ✅ all five gates remain satisfied.

## Project Structure

### Documentation (this feature)

```text
specs/011-admin-list-view/
├── plan.md              ← this file
├── research.md          ← Phase 0: 6 decisions resolved
├── data-model.md        ← Phase 1: AdminListRow, AdminRowActionSet, AdminCalendarDisplayMode
├── quickstart.md        ← Phase 1: US1, US2, US3 verification steps
├── contracts/
│   └── AdminListViewContract.ts
└── tasks.md             ← Phase 2 output (speckit.tasks)
```

### Source Code (new and modified files)

```text
src/features/admin/
├── calendar/
│   └── deriveAdminListRows.ts     ← NEW: pure row-derivation function
├── AdminListView.tsx              ← NEW: admin list component with ⋮ row actions
└── AdminCalendarPage.tsx          ← MODIFIED: toggle, date nav, list branch
```

**Structure Decision**: Single-project SPA. All new code lives under `src/features/admin/` (feature-specific), consistent with Constitution III.

## Implementation Details

### `deriveAdminListRows.ts` (NEW)

Pure TypeScript module — no React, no side effects.

```
Exports:
  AdminListRow (interface)
  deriveAdminListRows(date: Date, bookings: Booking[]): AdminListRow[]

Algorithm:
  - Filter bookings to those overlapping date's 06:00–22:00 window
  - Sort by start_time ascending
  - Walk cursor from 06:00; for each booking, fill gap with 30-min available
    slots, emit one merged booking row, advance cursor to booking.end_time
  - Fill remaining gap to 22:00 with 30-min available slots

Constants (align with deriveSlotRows.ts):
  SCHEDULE_START_HOUR = 6
  SCHEDULE_END_HOUR = 22
  SLOT_STEP_MINUTES = 30
```

### `AdminListView.tsx` (NEW)

```
Props: AdminListViewProps (from contracts/AdminListViewContract.ts)
  - currentDate: Date
  - bookings: Booking[]
  - onAvailableSlotClick(date: Date): void
  - onBookingClick(booking: Booking): void

Behavior:
  - Calls deriveAdminListRows(currentDate, bookings)
  - <ul role="list"> with one <li> per AdminListRow
  - Booking row: status dot + time range + duration + player name + ⋮ button
    → onBookingClick(row.booking)
  - Available row: time range + "Available" + ⋮/+ button
    → onAvailableSlotClick(row.slotStart)
  - Duration label format: "30 min" | "1h" | "1h 30min" | "2h 30min"
  - Status colors: CONFIRMED=green, PENDING=yellow, UNAVAILABLE=gray, AVAILABLE=blue
  - min-h-[44px] touch targets, focus-visible ring on all rows
```

### `AdminCalendarPage.tsx` (MODIFIED)

```
Changes:
  1. Add: displayMode state — useState<AdminCalendarDisplayMode>('calendar')
  2. Add: useMemo for queryRange:
       list   → { startDate: startOfDay(currentDate), endDate: endOfDay(currentDate) }
       calendar → existing calendarRange (week/month, unchanged)
  3. Add: toggle button group (List | Calendar) above the booking area
  4. Conditional render:
       list mode:
         <ListDateNav value={currentDate} onChange={setCurrentDate} />
         <AdminListView
           currentDate={currentDate}
           bookings={bookings}
           onAvailableSlotClick={(d) => { setSelectedSlotHour(d); setIsBookingFormOpen(true) }}
           onBookingClick={(b) => setActiveBooking(b)}
         />
       calendar mode → existing DateRangeFilter + CalendarContainer (unchanged)
  5. All existing modal state and rendering remain unchanged
```

## Complexity Tracking

No Constitution violations. No exceptions required.
