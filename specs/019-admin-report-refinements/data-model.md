# Data Model: Admin Report Refinements

## 1. ReportDateRange

- Purpose: Defines the date boundaries applied to all report sections.
- Fields:
  - `startDate`: ISO date string, required
  - `endDate`: ISO date string, required
- Validation rules:
  - `startDate` must be less than or equal to `endDate`
  - Invalid ranges must not trigger uncontrolled rendering or fetch failures in UI

## 2. PaymentSummaryTotals

- Purpose: High-level totals for paid and pending amounts and hours.
- Fields:
  - `paidAmount`: number, non-negative
  - `paidHours`: number, non-negative
  - `pendingAmount`: number, non-negative
  - `pendingHours`: number, non-negative
- Relationships:
  - Derived from the same normalized booking set as `PaidBreakdownEntry`
  - `pending*` values remain visible even after removing the standalone pending breakdown section

## 3. PaidBreakdownEntry

- Purpose: Player-identifiable paid record used in the paid-detail modal.
- Fields:
  - `playerName`: string | null
  - `playerPhoneNumber`: string | null
  - `totalAmount`: number, non-negative
  - `totalHours`: number, non-negative
  - `bookingCount`: integer, non-negative
- Relationships:
  - Aggregates into `PaymentSummaryTotals.paidAmount` and `PaymentSummaryTotals.paidHours`
  - Presented through `PaidBreakdownModalState`

## 4. PaidBreakdownModalState

- Purpose: UI state controlling paid-detail visibility and page selection.
- Fields:
  - `isOpen`: boolean
  - `currentPage`: integer, minimum 1
  - `pageSize`: integer, fixed positive value chosen by implementation
  - `totalEntries`: integer, non-negative
  - `totalPages`: integer, minimum 1 when entries exist, otherwise 1 for empty-state handling
- State transitions:
  - Closed -> Open when admin triggers paid detail
  - Open page N -> Open page N+1 / N-1 when pagination control is activated within valid bounds
  - Open -> Closed when admin dismisses modal

## 5. OutstandingPendingPlayerRecord

- Purpose: Actionable pending balance view retained from feature 018.
- Fields:
  - `playerName`: string | null
  - `playerPhoneNumber`: string | null
  - `totalOutstandingAmount`: number, non-negative
  - `totalOutstandingHours`: number, non-negative
  - `slots`: array of pending slot details
- Pending slot detail fields:
  - `startTime`: ISO datetime string
  - `endTime`: ISO datetime string
  - `amount`: number, non-negative
  - `status`: booking status string
- Relationships:
  - Supports collections follow-up independent of the removed pending breakdown section

## 6. RevenueImpactSummary

- Purpose: Captures no-show and cancellation financial loss totals preserved in this refinement.
- Fields:
  - `noShow.lostHours`: number, non-negative
  - `noShow.lostAmount`: number, non-negative
  - `noShow.bookingCount`: integer, non-negative
  - `cancelled.lostHours`: number, non-negative
  - `cancelled.lostAmount`: number, non-negative
  - `cancelled.bookingCount`: integer, non-negative
  - `fallbackAmountCount`: integer, non-negative

## 7. AdminBookingViewState

- Purpose: Controls which admin booking layout is shown first and which layout is active.
- Fields:
  - `displayMode`: enum `list | calendar`
  - `currentDate`: date object or equivalent selected-date state
  - `view`: existing calendar sub-view enum for calendar mode
- State transitions:
  - Initial state starts at `list`
  - Toggle updates `displayMode` between `list` and `calendar`
  - `currentDate` remains shared across both modes when switching

## Security and Integrity Notes

- No new tables or RLS policies are introduced in this feature.
- Admin-only access continues to rely on the existing router guard and current Supabase RLS-protected data access.
- Financial totals must continue to be derived in service/hook logic rather than recalculated ad hoc in presentation components.