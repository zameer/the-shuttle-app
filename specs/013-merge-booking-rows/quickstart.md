# Quickstart: Merge Booking Rows in Player Check Screen

## Goal

Ensure the player-facing list view shows each booking exactly once using its full time range, and keeps availability accurate around 30-minute bookings.

## Files Expected To Change

- `src/features/players/calendar/deriveSlotRows.ts`
- `src/features/players/calendar/PlayerListView.tsx`

## Verification Steps

### US1 — Long Booking Appears As One Row

1. Open the public booking check screen.
2. Switch to list view.
3. Use a date with a 90-minute booking and a 150-minute booking.
4. Confirm each booking appears once with its full time range, for example:
   - `8:00 AM – 9:30 AM`
   - `3:00 PM – 5:30 PM`
5. Confirm the same booking is not repeated in the next hour row.

### US2 — 30-Minute Booking Preserves Following Availability

1. Use a date with a booking from `8:00 AM – 8:30 AM`.
2. Open the public list view for that date.
3. Confirm the booking row appears as `8:00 AM – 8:30 AM`.
4. Confirm the next row begins at `8:30 AM`, not `9:00 AM`.
5. Confirm no time gap or duplicated interval appears.

### Edge Cases

1. Back-to-back bookings: `9:00 AM – 10:00 AM` and `10:00 AM – 11:30 AM`
   - Expect two booking rows, no available row between.
2. No bookings for the day
   - Expect the full available schedule from `6:00 AM – 10:00 PM`.
3. Mixed durations in one day
   - Expect rows to stay strictly chronological with no overlaps or gaps.

## Validation

Run:

```bash
npx eslint src/features/players/calendar/deriveSlotRows.ts src/features/players/calendar/PlayerListView.tsx
```

Expected: 0 errors.
