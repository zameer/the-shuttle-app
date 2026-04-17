# Data Model: Admin Booking Controls and Past Slot Visibility

**Feature**: 014 — Admin Booking Controls and Past Slot Visibility  
**Branch**: `014-admin-booking-calendar-fixes`  
**Date**: 2026-04-17

---

## 1. Schema Changes

### 1.1 bookings.status CHECK Constraint (Migration Required)

**Current constraint** (from `20260412184908_initial_schema.sql`):
```sql
status TEXT NOT NULL CHECK (status IN ('AVAILABLE', 'PENDING', 'CONFIRMED', 'UNAVAILABLE'))
```

**New constraint** (new migration file):
```sql
-- Drop old constraint, add new one including CANCELLED and NO_SHOW
ALTER TABLE public.bookings
  DROP CONSTRAINT IF EXISTS bookings_status_check;

ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_status_check
  CHECK (status IN ('AVAILABLE', 'PENDING', 'CONFIRMED', 'UNAVAILABLE', 'CANCELLED', 'NO_SHOW'));
```

**No new tables or columns required.** All other fields (`hourly_rate`, `total_price`,
`payment_status`) already exist and support the new feature's price-editing requirements.

---

## 2. TypeScript Type Changes

### 2.1 BookingStatus Union (`src/features/booking/useBookings.ts`)

```ts
// BEFORE
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'UNAVAILABLE'

// AFTER
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'UNAVAILABLE' | 'CANCELLED' | 'NO_SHOW'
```

### 2.2 Canonical Status Semantics

| Status | Meaning | Who sets it |
|--------|---------|-------------|
| `PENDING` | Created, awaiting player confirmation | System / Admin |
| `CONFIRMED` | Confirmed; player is/was attending | Admin |
| `UNAVAILABLE` | Court blocked; no booking | Admin |
| `CANCELLED` | Cancelled by player or admin | Admin |
| `NO_SHOW` | Player did not attend a confirmed booking | Admin (post-session) |
| `AVAILABLE` | Derived slot with no booking (never stored) | Derivation functions only |

> `AVAILABLE` is never stored in the DB — it is emitted by `deriveSlotRows` and
> `deriveAdminListRows` to represent unbooked intervals in the schedule window.

---

## 3. Hook Interface Changes

### 3.1 New: `useUpdateBooking` (`src/features/booking/useBookings.ts`)

Replaces direct usage of `useUpdateBookingStatus` for admin edits. Accepts a partial payload:

```ts
interface UpdateBookingPayload {
  id: string
  status?: BookingStatus
  payment_status?: PaymentStatus
  hourly_rate?: number
  total_price?: number
}
```

Existing `useUpdateBookingStatus` is retained for backward compatibility with callers that
only need to change status/payment.

### 3.2 Updated: `BookingForm` Props (`src/features/booking/BookingForm.tsx`)

The `initialDate` prop already exists in the interface but is not consumed. It will be wired
to set the date portion of the `start_time` and `end_time` datetime-local inputs when
`initialStartTime` is not provided (admin "Add Booking for this date" flow).

---

## 4. Derivation Layer Changes

### 4.1 `deriveSlotRows` Signature (no change) — New Behaviour

Function signature unchanged. Internal behaviour adds:

```ts
// At the top of the function body:
const isPastDate = isBefore(startOfDay(date), startOfDay(new Date()))
// All 'available' row emissions are wrapped in: if (!isPastDate) { ... }
```

Booking rows are always emitted regardless of date.

### 4.2 `deriveAdminListRows` Signature (no change) — New Behaviour

Same `isPastDate` guard as above. Available rows suppressed; booking rows always shown.

### 4.3 Calendar Grid (`src/components/shared/Calendar.tsx`) — New Behaviour

In the hour-by-hour render loop, when `isBefore(startOfDay(date), startOfDay(new Date()))`:
- Skip rendering rows where resolved `status === 'AVAILABLE'`.
- Booking rows (CONFIRMED, PENDING, UNAVAILABLE, CANCELLED, NO_SHOW) always rendered.

---

## 5. UI State Additions

### 5.1 `BookingDetailsModal` — Local Edit State

New local state for in-modal price and status editing:

```ts
const [editStatus, setEditStatus] = useState<BookingStatus>(booking.status)
const [editRate, setEditRate] = useState<number>(booking.hourly_rate ?? 0)
const [editTotal, setEditTotal] = useState<number>(booking.total_price ?? 0)
```

"Save" button calls `useUpdateBooking` with the edited values. "Revert Pricing" sets
`editRate` and `editTotal` to system-computed values from `useSettings`.

### 5.2 Status Colour Map — New Entries

All status-to-colour maps across the codebase require new entries:

```ts
const STATUS_STYLES: Record<BookingStatus | 'AVAILABLE', string> = {
  CONFIRMED:   'bg-green-100 text-green-800',
  PENDING:     'bg-yellow-100 text-yellow-800',
  UNAVAILABLE: 'bg-gray-100 text-gray-600',
  CANCELLED:   'bg-red-100 text-red-700',
  NO_SHOW:     'bg-orange-100 text-orange-700',
  AVAILABLE:   'bg-blue-100 text-blue-700',  // unchanged
}
```

Affected files: `BookingDetailsModal.tsx`, `AdminListView.tsx`, `StatusBadge.tsx` (if used),
`Calendar.tsx` colour helper.

---

## 6. Entity Relationships (Unchanged)

```
court_settings (id=1)
  └── default_hourly_rate  ← used for pricing revert computation

bookings
  ├── status: BookingStatus  (extended: + CANCELLED, NO_SHOW)
  ├── hourly_rate: NUMERIC   (admin-editable, any value ≥ 0)
  ├── total_price: NUMERIC   (admin-editable, any value ≥ 0)
  └── payment_status: 'PENDING' | 'PAID'  (unchanged)

players
  └── phone_number → bookings.player_phone_number  (unchanged)
```
