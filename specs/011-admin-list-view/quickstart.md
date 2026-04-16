# Quickstart: Admin List View Booking Management

## Prerequisites

- Admin user credentials available for the local dev environment
- Supabase local dev running (`supabase start`) or remote dev project accessible
- Seed data includes bookings of varying durations (30, 60, 90, 150 min) on at least one date
- `npm run dev` serving the app at `http://localhost:5173`

---

## Verification: US1 — Calendar ↔ List Toggle with Shared Date

1. Log in as admin and open the admin booking page (e.g. `/admin/calendar`).
2. Confirm the **Calendar** view is active by default (List/Calendar toggle visible in top-right of the booking area).
3. Navigate the calendar to a specific date, e.g. pick a date with known bookings.
4. Click **List** in the toggle. Confirm the list view appears for the same date.
5. Use **Previous / Next day** arrows in list mode to move to a different date.
6. Click **Calendar** in the toggle. Confirm the calendar is positioned on the date you navigated to in list mode.
7. Change the date in list mode via the date input picker. Switch back to calendar and confirm it matches.

**Expected**: Zero date-sync mismatches. Toggle switches view without losing the selected date.

---

## Verification: US2 — Merged Booking Rows

### 30-minute booking
1. Create a booking from 09:00 to 09:30.
2. Switch to list view for that date.
3. **Expected**: One row labeled "9:00 AM – 9:30 AM (30 min)" in the booking's status color.

### 90-minute booking
1. Create a booking from 10:00 to 11:30.
2. Switch to list view.
3. **Expected**: One merged row "10:00 AM – 11:30 AM (90 min)" — NOT three separate rows.

### 150-minute booking
1. Create a booking from 14:00 to 16:30.
2. Switch to list view.
3. **Expected**: One merged row "2:00 PM – 4:30 PM (2h 30min)".

### Multiple adjacent bookings (no merge across records)
1. Create booking A: 08:00–09:00, booking B: 09:00–10:30.
2. Switch to list view.
3. **Expected**: Two separate rows (A and B), each with its own action button.

### Available slots between bookings
1. With booking A: 08:00–09:00 and booking B: 10:00–11:00 on the same date.
2. Switch to list view.
3. **Expected**: Row A (08:00–09:00, booking), then two available rows (09:00–09:30, 09:30–10:00), then row B (10:00–11:00, booking).

---

## Verification: US3 — Row-Level Booking Actions

### Manage an existing booking
1. In list view, locate a booking row (CONFIRMED, PENDING, or UNAVAILABLE).
2. Tap/click the ⋮ action icon on the right side of the row.
3. **Expected**: `BookingDetailsModal` opens for that booking, showing player name, status controls, and management actions (Confirm / Cancel / Delete as applicable).

### Create a booking from an available slot
1. In list view, locate an available slot row (e.g., "2:00 PM – 2:30 PM — Available").
2. Tap/click the + or action icon on the row.
3. **Expected**: `BookingForm` opens pre-filled with the slot's start time.

### Post-action refresh
1. In list view, delete an existing booking via the ⋮ action.
2. **Expected**: After modal closes, the list refreshes automatically. The deleted booking's row is replaced by available slot rows.

---

## Edge Case Checks

| Scenario | Expected |
|---|---|
| Date with zero bookings | Full schedule window (06:00–22:00) as 30-min available rows |
| Booking ends at non-30-min boundary (e.g. 09:15) | Available slots start from 09:15, not forced to 09:30 |
| Rapid date navigation (10 prev/next clicks) | Rows update per click; no stale booking data visible |
| Desktop viewport (≥1280 px) | Row layout remains readable; action icon reachable |
| Mobile viewport (375 px) | Rows readable; action icon reachable with touch target ≥44 px |

---

## Lint Verification

```bash
npx eslint src/features/admin/calendar/deriveAdminListRows.ts src/features/admin/AdminListView.tsx src/features/admin/AdminCalendarPage.tsx
```

Expected: zero errors.
