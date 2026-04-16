# Data Model: Admin List Hourly Available Slot Display

## Entity 1 — AdminListRow (Modified Available Variant)

The `AdminListRow` interface from feature 011 is **unchanged**. Only the derivation values for `type === 'available'` rows change.

| Field | Type | 011 Behaviour | 012 Behaviour |
|---|---|---|---|
| `type` | `'booking' \| 'available'` | unchanged | unchanged |
| `slotStart` | `Date` | 30-min grid | 60-min grid (or gap start) |
| `slotEnd` | `Date` | 30-min grid | 60-min grid (or gap end) |
| `durationMinutes` | `number` | always 30 | 60 (full hour) or partial (< 60) |
| `status` | `'AVAILABLE' \| …` | `'AVAILABLE'` | unchanged |
| `booking` | `Booking \| undefined` | undefined | undefined |
| `playerName` | `string \| null \| undefined` | undefined | undefined |
| `actionable` | `boolean` | `true` | `true` |

Booking rows (`type === 'booking'`) are fully unchanged — their `durationMinutes` is still the exact booking span.

---

## Entity 2 — SLOT_STEP_MINUTES Constant

| Constant | Feature 011 Value | Feature 012 Value |
|---|---|---|
| `SLOT_STEP_MINUTES` | `30` | `60` |
| `SCHEDULE_START_HOUR` | `6` | `6` (unchanged) |
| `SCHEDULE_END_HOUR` | `22` | `22` (unchanged) |

**Location**: `src/features/admin/calendar/deriveAdminListRows.ts`

---

## Derivation Algorithm (Updated)

```
SCHEDULE_START = 06:00, SCHEDULE_END = 22:00, SLOT_STEP_MINUTES = 60

Input: date D, bookings[] sorted ascending by start_time

Algorithm:
  cursor = dayStart(D, 06:00)
  rows = []

  for each booking B in bookings (filtered to day D):
    // Fill 60-min available rows while a full hour fits before the booking
    while cursor + 60min <= B.start_time:
      rows.push(available row: cursor → cursor+60min, durationMinutes=60)
      cursor += 60min

    // [NEW] Emit partial gap row if any remaining unbooked time before booking
    if cursor < B.start_time:
      partial = B.start_time - cursor (in minutes)
      rows.push(available row: cursor → B.start_time, durationMinutes=partial)
      cursor = B.start_time

    // Emit one merged booking row (unchanged from 011)
    rows.push(booking row: B.start_time → B.end_time, durationMinutes=exact span)
    cursor = max(cursor, B.end_time)

  // Fill 60-min available rows after the last booking
  while cursor + 60min <= dayEnd(D, 22:00):
    rows.push(available row: cursor → cursor+60min, durationMinutes=60)
    cursor += 60min

  // [NEW] Emit partial trailing gap if any unbooked time remains
  if cursor < dayEnd(D, 22:00):
    partial = 22:00 - cursor (in minutes)
    rows.push(available row: cursor → 22:00, durationMinutes=partial)

  return rows
```

### Row Count Examples

| Scenario | Expected Rows |
|---|---|
| Day with no bookings | 16 (one per hour 06:00–22:00) |
| One 30-min booking at 08:00–08:30 | 2 available (06–08, 1h each) + 1 booking + 1 partial (08:30–09:00, 30min) + 13 available (09–22) = 17 |
| One 90-min booking at 08:00–09:30 | 2 available (06–08) + 1 booking + 1 partial (09:30–10:00, 30min) + 12 available (10–22) = 16 |
| One 60-min booking at 08:00–09:00 | 2 available (06–08) + 1 booking + 13 available (09–22) = 16 |
| Back-to-back bookings with no gap | No available rows between them |

---

## No Schema Change

This feature modifies only the display-layer derivation function. No Supabase migrations, no new tables, no RLS changes are required.
