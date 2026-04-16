# Data Model: Merge Booking Rows in Player Check Screen

## Entity 1 — PlayerSlotRow

Represents one visible row in the player booking check screen.

| Field | Type | Description |
|---|---|---|
| `type` | `'booking' \| 'available'` | Distinguishes reserved periods from free periods |
| `slotStart` | `Date` | Exact start of the displayed interval |
| `slotEnd` | `Date` | Exact end of the displayed interval |
| `durationMinutes` | `number` | Computed interval length in minutes |
| `status` | `'AVAILABLE' \| 'PENDING' \| 'CONFIRMED' \| 'UNAVAILABLE'` | `'AVAILABLE'` for free rows; booking status for reserved rows |
| `booking` | `Booking \| undefined` | Populated only for booking rows |
| `actionable` | `boolean` | Remains `true` for available rows; booking actionability follows current behavior |

---

## Schedule Window

| Constant | Value |
|---|---|
| `SCHEDULE_START_HOUR` | `6` |
| `SCHEDULE_END_HOUR` | `22` |
| `SLOT_STEP_MINUTES` | `60` for full available rows |

The player view remains bounded to 06:00–22:00. Full-hour available rows are emitted when possible; partial rows are emitted when a booking boundary falls within an hour.

---

## Derivation Algorithm

```text
Input: date D, bookings[] sorted ascending by start_time
Window: 06:00–22:00

cursor = 06:00 on D
rows = []

for each booking B overlapping the window:
  effectiveStart = clamp(B.start_time, windowStart, windowEnd)
  effectiveEnd = clamp(B.end_time, windowStart, windowEnd)

  while cursor + 60min <= effectiveStart:
    rows.push(available row: cursor → cursor+60min)
    cursor += 60min

  if cursor < effectiveStart:
    rows.push(available row: cursor → effectiveStart)
    cursor = effectiveStart

  rows.push(booking row: effectiveStart → effectiveEnd)
  cursor = max(cursor, effectiveEnd)

while cursor + 60min <= windowEnd:
  rows.push(available row: cursor → cursor+60min)
  cursor += 60min

if cursor < windowEnd:
  rows.push(available row: cursor → windowEnd)

return rows
```

---

## Expected Behaviour Examples

| Scenario | Expected Rows |
|---|---|
| 08:00–09:30 booking | `08:00–09:30` shown as one booking row |
| 08:00–08:30 booking | booking row `08:00–08:30`, next available row begins at `08:30` |
| 09:00–10:00 then 10:00–11:30 | two adjacent booking rows, no available row between |
| no bookings | hourly available rows covering 06:00–22:00 |

---

## No Schema Change

This feature only changes client-side row derivation and rendering in the player list view. No database, API, or permission changes are required.
