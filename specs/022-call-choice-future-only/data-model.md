# Data Model: 022 — Player Call Choice and Future-Only Dates

**Date**: 2026-04-19

## Overview

This feature introduces no new database tables, migrations, or RLS policies. All changes are in the client-side display layer. This document captures the component state model, derived data structures, and date-window logic that replace the previous 021 `CallFAB` behaviour and restrict public date visibility.

---

## Component State Model

### CallFABChooser (replaces CallFAB)

| State field | Type | Default | Description |
|---|---|---|---|
| `isOpen` | `boolean` | `false` | Whether the speed-dial chooser is expanded above the FAB |

**Derived values** (computed from props, not stored in state):

| Derived | Source | Rule |
|---|---|---|
| `callNowHref` | `availableAgentPhone` prop | `tel:${phone}` if phone is non-null, else `null` |
| `callNowDisabled` | `availableAgentPhone` prop | `true` when `phone === null` |
| `callNowLabel` | `availableAgentPhone` prop | `"Call Now"` when available, `"No agent available"` when not |

**Visual state matrix**:

| `isLoading` | `availableAgentPhone` | `isOpen` | FAB appearance | "Call Now" action | "Request Callback" action |
|---|---|---|---|---|---|
| `true` | any | any | Spinner, disabled | — | — |
| `false` | non-null | `false` | Phone icon (green) | — | — |
| `false` | non-null | `true` | X icon (close) | Green button, `<a href="tel:...">` | Blue button, opens modal |
| `false` | `null` | `false` | Phone icon (gray) | — | — |
| `false` | `null` | `true` | X icon (close) | Greyed-out disabled button + "No agent available" label | Blue button, opens modal |

### PublicCalendarPage (date window)

| State field | Type | Default | Constraint added |
|---|---|---|---|
| `currentDate` | `Date` | `startOfToday()` | Was `new Date()` — now clamped to today on init |

**Date window rules**:

| View | Minimum selectable date | Slot filter |
|---|---|---|
| List view | `startOfToday()` | Slots where `slotEnd < now()` are hidden when `isToday(currentDate)` |
| Calendar (week) | `startOfWeek(startOfToday())` | No intra-day slot filter (calendar shows full day blocks) |
| Calendar (month) | `startOfMonth(startOfToday())` | No intra-day slot filter |

---

## Derived Data: Slot Filtering

### `deriveSlotRows` output (existing, unchanged)

`deriveSlotRows(currentDate, bookings, scheduleEndTime)` returns:

```ts
interface SlotRow {
  slotStart: Date
  slotEnd: Date
  status: 'AVAILABLE' | 'CONFIRMED' | 'PENDING' | 'UNAVAILABLE' | 'CANCELLED' | 'NO_SHOW'
  booking?: Booking
}
```

### Added filter in `PlayerListView` (new)

Applied after `deriveSlotRows`, only when `isToday(currentDate)`:

```ts
const now = new Date()
const visibleRows = isToday(currentDate)
  ? rows.filter(row => !isBefore(row.slotEnd, now))
  : rows
```

- **`isBefore(slotEnd, now)`** — hides slots that have fully ended before current time
- Slots currently in progress (`slotStart < now < slotEnd`) remain visible
- Future dates: all slots visible (no filter applied)

---

## Component Props Contract Summary

### ListDateNav (updated)

```ts
interface ListDateNavProps {
  value: Date
  onChange: (date: Date) => void
  minDate?: Date   // NEW — defaults to undefined (no restriction)
}
```

### CalendarContainer (updated)

```ts
interface CalendarContainerProps {
  currentDate: Date
  view: CalendarView
  onDateChange: (date: Date) => void
  onViewChange: (view: CalendarView) => void
  bookings?: Booking[]
  onSlotClick?: (date: Date, booking?: Booking) => void
  readOnly?: boolean
  isAdmin?: boolean
  minDate?: Date   // NEW — defaults to undefined (no restriction)
}
```

### CallFAB → CallFABChooser (renamed/replaced)

```ts
interface CallFABProps {
  availableAgentPhone: string | null
  isLoading: boolean
  onRequestCallback: () => void
  // No new props — behaviour changes are internal
}
```

---

## Security & RLS

No changes. Public page continues to strip PII fields (`player_phone_number`, `player_name`, `payment_status`, `total_price`, `hourly_rate`) before rendering. No new data access patterns.
