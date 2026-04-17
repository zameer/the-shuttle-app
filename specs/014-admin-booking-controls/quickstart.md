# Quickstart: Admin Booking Controls and Past Slot Visibility

**Feature**: 014  
**Branch**: `014-admin-booking-calendar-fixes`

---

## What This Feature Adds

Three admin/calendar improvements shipped in one branch:

1. **Unified Booking Management** — Admin can change any booking's status (CONFIRMED /
   CANCELLED / PENDING / NO_SHOW / UNAVAILABLE) and manually edit pricing (any value
   including zero) in the booking details modal. A "Revert to System Pricing" button
   restores the system-calculated rate.

2. **Past-Day Available Slot Hiding** — Available (unbooked) slots are hidden for past
   dates in both admin and player calendar/list views. Existing bookings remain visible.

3. **Admin Past Booking Creation** — An "Add Booking" button appears in admin list view
   for past dates (where available slots are hidden), allowing admins to retroactively
   record missed bookings via the existing booking form with all status options.

---

## Files Changed

### Database (Migration)
| File | Change |
|------|--------|
| `supabase/migrations/20260417000000_extend_booking_status.sql` | ALTER bookings.status CHECK to add CANCELLED and NO_SHOW |

### Types / Hooks
| File | Change |
|------|--------|
| `src/features/booking/useBookings.ts` | Extend `BookingStatus` union; add `useUpdateBooking` hook |

### UI Components
| File | Change |
|------|--------|
| `src/features/booking/BookingDetailsModal.tsx` | Add status dropdown, manual price inputs, Revert Pricing button, unified Save action |
| `src/features/booking/BookingForm.tsx` | Add CANCELLED and NO_SHOW to status dropdown; wire `initialDate` prop |
| `src/features/admin/AdminListView.tsx` | Add `onAddBooking` prop; render "Add Booking" button on past dates |
| `src/features/admin/AdminCalendarPage.tsx` | Pass `onAddBooking` handler to `AdminListView` |

### Derivation / Calendar
| File | Change |
|------|--------|
| `src/features/players/calendar/deriveSlotRows.ts` | Suppress available rows on past dates |
| `src/features/admin/calendar/deriveAdminListRows.ts` | Suppress available rows on past dates |
| `src/components/shared/Calendar.tsx` | Hide AVAILABLE hour blocks on past dates |

### Status Colour Maps (Update where they appear)
- `src/features/booking/BookingDetailsModal.tsx` — add CANCELLED, NO_SHOW entries
- `src/features/admin/AdminListView.tsx` — add CANCELLED, NO_SHOW entries
- `src/components/shared/StatusBadge.tsx` — add CANCELLED, NO_SHOW entries (if used)

---

## Key Patterns

### System Pricing Revert
```ts
// In BookingDetailsModal, after loading useSettings():
const systemRate = settings?.defaultRate ?? booking.hourly_rate ?? 0
const durationMinutes = differenceInMinutes(
  new Date(booking.end_time),
  new Date(booking.start_time)
)
const systemTotal = (durationMinutes / 60) * systemRate
// Sets editRate = systemRate, editTotal = systemTotal
```

### Past-Date Guard in Derivation Functions
```ts
import { isBefore, startOfDay } from 'date-fns'

const isPastDate = isBefore(startOfDay(date), startOfDay(new Date()))
// Wrap all available-row push() calls:
if (!isPastDate) {
  rows.push({ type: 'available', ... })
}
```

### useUpdateBooking Hook
```ts
export function useUpdateBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status, payment_status, hourly_rate, total_price }: UpdateBookingPayload) => {
      const updates: Record<string, unknown> = {}
      if (status !== undefined) updates.status = status
      if (payment_status !== undefined) updates.payment_status = payment_status
      if (hourly_rate !== undefined) updates.hourly_rate = hourly_rate
      if (total_price !== undefined) updates.total_price = total_price
      const { data, error } = await supabase
        .from('bookings')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw new Error(error.message)
      return data as Booking
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookings'] }),
  })
}
```

---

## Local Development

```powershell
# 1. Apply the DB migration (local Supabase)
supabase db reset  # or supabase migration up

# 2. Start dev server
npm run dev

# 3. Lint check (must pass before marking any task complete)
npm run lint
```

---

## Test Scenarios (Manual QA)

### US1 — Status + Pricing Management
1. Open admin → click any confirmed booking → modal opens
2. Change status to "Cancelled" → Save → verify booking shows "CANCELLED" badge in list/calendar
3. Edit Hourly Rate to 0 → Total Price to 0 → Save → verify financials updated
4. Click "Revert to System Pricing" → verify rate resets to `court_settings.default_hourly_rate`
   and total recalculates from duration × rate

### US2 — Hide Past Available Slots
1. Navigate to any past date in admin list view → verify no available slot rows appear
2. Navigate to same past date in player calendar/list → verify no available slot rows appear
3. Navigate to today or future date → verify available slots still appear normally
4. Navigate to a past date with bookings → verify bookings still visible

### US3 — Admin Create Past Booking
1. Navigate to a past date in admin list view
2. Verify "Add Booking" button is present (no available slots shown)
3. Click "Add Booking" → booking form opens with past date pre-populated
4. Choose status (e.g., NO_SHOW), select player, set time, save
5. Verify booking appears in admin list for that past date
6. Verify booking is visible in player's booking history for that date
