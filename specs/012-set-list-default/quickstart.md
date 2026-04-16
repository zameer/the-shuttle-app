# Quickstart: Admin List Hourly Available Slot Display

## What Changed

Feature 012 changes `SLOT_STEP_MINUTES` from `30` to `60` in `deriveAdminListRows.ts` and adds partial-gap row emission. The result: available slots in the admin list view display as 1-hour blocks instead of 30-minute blocks.

**Files modified**: `src/features/admin/calendar/deriveAdminListRows.ts` (1 constant + partial-gap logic)  
**Files unchanged**: `AdminListView.tsx`, `AdminCalendarPage.tsx`, all public-view files

---

## Verification Steps

### US1 — Available Slots as Hourly Blocks

1. Open the admin booking page.
2. Navigate to a date with **no bookings**.
3. Switch to **List** view.
4. **Expected**: Exactly 16 rows visible, each showing a 1-hour range: 6:00 AM – 7:00 AM, 7:00 AM – 8:00 AM … 9:00 PM – 10:00 PM.
5. Count rows — must be exactly 16 (not 32).

### US1 — Partial Gap Adjacent to Non-Hour Booking

1. Ensure a booking exists from **08:30 AM – 09:30 AM**.
2. Open list view for that date.
3. **Expected row order**:
   - 6:00 AM – 7:00 AM (available, 1h)
   - 7:00 AM – 8:00 AM (available, 1h)
   - 8:00 AM – 8:30 AM (available, 30 min — partial gap before booking)
   - 8:30 AM – 9:30 AM (booking row — status color, player name, ⋮ button)
   - 9:30 AM – 10:00 AM (available, 30 min — partial gap after booking)
   - 10:00 AM – 11:00 AM … (1h available rows continue to 10:00 PM)
4. Confirm no time is missing between 6:00 AM and 10:00 PM.

### US2 — Reserved Bookings Are Single Rows

1. Create the following test bookings (or use existing):
   - 30-min booking: 10:00 – 10:30
   - 60-min booking: 11:00 – 12:00
   - 90-min booking: 13:00 – 14:30
   - 150-min booking: 15:00 – 17:30
2. Open list view for that date.
3. **Expected**: Each booking appears as **exactly one row** with its full time range. The 150-min booking is NOT split at 16:00, 17:00, etc.
4. Each booking row has the ⋮ action button on the right edge.

### Edge Case — Back-to-Back Bookings

1. Create two bookings: 09:00–10:00 and 10:00–11:00.
2. Open list view.
3. **Expected**: Two booking rows with no available row between them.

### Edge Case — Full Day Booked

1. Arrange bookings covering 06:00–22:00 continuously.
2. Open list view.
3. **Expected**: Only booking rows, zero available rows.

### Lint Gate

```bash
npx eslint src/features/admin/calendar/deriveAdminListRows.ts
```

Expected: 0 errors, 0 warnings.

---

## Row Count Formula

> Total rows = (available hourly slots) + (partial gap rows ≤ 2 per booking) + (number of bookings)
>
> Empty day: 16 rows exactly.
> Day with N hour-aligned bookings: 16 − (booking hours) + N rows.
> Each non-hour-aligned booking may add up to 2 partial gap rows (one before, one after).
