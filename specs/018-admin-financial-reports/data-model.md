# Data Model: Admin Financial Reporting

## Scope

No new database tables are introduced. This feature defines read/derived reporting models built from existing Supabase tables.

## Source Tables

### bookings (existing)

- id: uuid (PK)
- player_phone_number: varchar(20), nullable, FK -> players.phone_number
- start_time: timestamptz, required
- end_time: timestamptz, required
- status: text, required (`AVAILABLE` | `PENDING` | `CONFIRMED` | `UNAVAILABLE` | `CANCELLED` | `NO_SHOW`)
- hourly_rate: numeric, nullable
- total_price: numeric, nullable
- payment_status: text, nullable (`PENDING` | `PAID`)

### players (existing)

- phone_number: varchar(20) (PK)
- name: text, nullable

## Derived Entities

### ReportDateRange

- startDate: string (ISO date, inclusive)
- endDate: string (ISO date, inclusive)

Validation rules:
- `startDate <= endDate`
- max range defaults to product policy (monthly typical; quarterly allowed)

### NormalizedFinancialBooking

- bookingId: string
- playerPhoneNumber: string | null
- playerName: string | null
- slotStart: string (ISO datetime)
- slotEnd: string (ISO datetime)
- durationHours: number (>= 0)
- bookingStatus: `PENDING` | `CONFIRMED` | `UNAVAILABLE` | `CANCELLED` | `NO_SHOW`
- paymentBucket: `PAID` | `PENDING`
- amount: number (>= 0)
- amountSource: `total_price` | `hourly_rate_x_duration` | `fallback_zero`

Validation rules:
- `slotEnd > slotStart` for billable/impact rows
- `durationHours = (slotEnd - slotStart)` in hours
- `amount >= 0`

### PaymentSummaryTotals

- paidHours: number
- paidAmount: number
- pendingHours: number
- pendingAmount: number

Invariant:
- `paidHours + pendingHours` equals total hours from included report rows
- `paidAmount + pendingAmount` equals total amount from included report rows

### PaymentBreakdownEntry

- paymentBucket: `PAID` | `PENDING`
- playerPhoneNumber: string | null
- playerName: string | null
- bookingCount: number
- totalHours: number
- totalAmount: number

Invariant:
- Sum of breakdown entries by bucket reconciles with summary bucket totals.

### OutstandingPendingPlayerRecord

- playerPhoneNumber: string | null
- playerName: string | null
- pendingHours: number
- pendingAmount: number
- slots: OutstandingPendingSlot[]

OutstandingPendingSlot:
- bookingId: string
- startTime: string
- endTime: string
- status: `PENDING` | `CONFIRMED` | `UNAVAILABLE` | `CANCELLED` | `NO_SHOW`
- amount: number

Validation rules:
- `slots.length >= 1` for non-empty records
- record totals equal sum of slot totals

### RevenueLossRecord

- impactType: `NO_SHOW` | `CANCELLED`
- lostHours: number
- lostAmount: number
- bookingCount: number
- fallbackAmountCount: number

Invariant:
- Impact totals include only rows where `bookingStatus` is in (`NO_SHOW`, `CANCELLED`).

## State Transitions

This feature is read-only and does not introduce new entity lifecycle transitions. It reflects current persisted booking/payment status at query time.

## Security / RLS Notes

- Existing RLS is reused; no policy changes in this feature.
- Access path remains admin-only via router guard.
- Player identity fields are shown only in protected admin context.