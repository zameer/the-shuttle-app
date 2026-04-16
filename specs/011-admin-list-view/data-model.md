# Data Model: Admin List View Booking Management

## Entity 1 — AdminListRow

Represents one row in the admin list view. Can be either a concrete booking or an available time slot.

| Field | Type | Description |
|---|---|---|
| `type` | `'booking' \| 'available'` | Discriminates booking rows from available slot rows |
| `slotStart` | `Date` | Exact start of the interval (ISO-parsed from booking or derived from 30-min grid) |
| `slotEnd` | `Date` | Exact end of the interval |
| `durationMinutes` | `number` | Computed: `(slotEnd - slotStart) / 60000` |
| `status` | `'AVAILABLE' \| 'PENDING' \| 'CONFIRMED' \| 'UNAVAILABLE'` | `'AVAILABLE'` when `type === 'available'`; booking status otherwise |
| `booking` | `Booking \| undefined` | Populated only when `type === 'booking'` |
| `playerName` | `string \| null \| undefined` | Populated when booking has player name (admin fetch) |
| `actionable` | `boolean` | `true` for available rows (create action) and booking rows (manage action) |

### Derivation Rules

```
SCHEDULE_START = 06:00, SCHEDULE_END = 22:00, SLOT_STEP_MINUTES = 30

Input: date D, bookings[] sorted ascending by start_time

Algorithm:
  cursor = dayStart(D, 06:00)
  rows = []

  for each booking B in bookings (filtered to day D):
    // Fill available slots before booking
    while cursor + 30min <= B.start_time:
      rows.push(available row: cursor → cursor+30min)
      cursor += 30min

    // Emit merged booking row
    rows.push(booking row: B.start_time → B.end_time)
    cursor = max(cursor, B.end_time)

  // Fill remaining available slots after last booking
  while cursor + 30min <= dayEnd(D, 22:00):
    rows.push(available row: cursor → cursor+30min)
    cursor += 30min

  return rows
```

**Boundary handling**: If a booking starts at a non-30-minute boundary (e.g., 08:15), available slots fill up to the booking start time. Bookings that overflow midnight are clipped to `22:00`.

---

## Entity 2 — AdminRowActionSet

The set of management actions exposed by each row's action control (⋮ button).

| Row Type | Available Actions |
|---|---|
| `booking` (CONFIRMED) | View Details, Change Status → Pending, Delete |
| `booking` (PENDING) | View Details, Confirm, Delete |
| `booking` (UNAVAILABLE) | View Details, Delete |
| `available` | Create Booking at this slot |

**Implementation**: Action dispatch is handled by `AdminCalendarPage` via existing `onSlotClick` callback pattern — no new API required for the action set itself. The `BookingDetailsModal` and `BookingForm` render the actual action UI.

---

## Entity 3 — AdminCalendarDisplayMode

The view-mode discriminant for `AdminCalendarPage`.

| Value | Description |
|---|---|
| `'calendar'` | Existing `CalendarContainer` rendered (default for feature 011 scope) |
| `'list'` | New `AdminListView` rendered with `ListDateNav` date controls |

**State**: `useState<AdminCalendarDisplayMode>('calendar')` inside `AdminCalendarPage`. Shared `currentDate` state drives both views — date navigation in list mode updates the same `currentDate` used by calendar mode.

---

## Entity 4 — AdminListQueryRange

The Supabase query date range derived from `displayMode` and `currentDate`.

| Display Mode | Query Start | Query End |
|---|---|---|
| `'calendar'` | `calendarRange.startDate` (week/month) | `calendarRange.endDate` |
| `'list'` | `startOfDay(currentDate)` | `endOfDay(currentDate)` |

**No schema change required.** Existing `useBookings(startDate, endDate, fetchPlayerNames=true)` hook is reused.
