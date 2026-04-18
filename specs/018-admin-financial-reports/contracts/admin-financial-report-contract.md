# Contract: Admin Financial Report Interface

Feature: 018
Scope: Admin financial reporting UI and hook/service output contract

## 1. Access Contract

- Route is admin-only and must be nested under existing protected admin router tree.
- Non-admin or unauthenticated users must not receive financial report payloads from UI route.

## 2. Input Contract

Report request input (conceptual):

- startDate: ISO date string, required
- endDate: ISO date string, required
- playerFilter: omitted (feature requires all players in scope by default)

Input rules:

- startDate <= endDate
- Invalid range returns controlled UI validation state and no crash

## 3. Data Fetch Contract

Primary data source:

- Supabase `bookings` rows overlapping selected range
- Player name enrichment from `players` relation where available

Required row fields:

- id, player_phone_number, start_time, end_time, status, payment_status, hourly_rate, total_price
- players(name) when join is enabled

## 4. Output Contract

Hook/service must return a deterministic object containing:

- summary:
  - paidHours
  - paidAmount
  - pendingHours
  - pendingAmount
- breakdown:
  - paidEntries[] (with player info)
  - pendingEntries[] (with player info)
- outstandingPending:
  - players[] with pending totals + slot details
  - totalOutstandingAmount
- revenueLoss:
  - noShow: { lostHours, lostAmount, bookingCount }
  - cancelled: { lostHours, lostAmount, bookingCount }
  - fallbackAmountCount

## 5. Reconciliation Contract

- Sum(breakdown.paidEntries.totalAmount) == summary.paidAmount
- Sum(breakdown.pendingEntries.totalAmount) == summary.pendingAmount
- Sum(breakdown.paidEntries.totalHours) == summary.paidHours
- Sum(breakdown.pendingEntries.totalHours) == summary.pendingHours

## 6. Empty/Zero-State Contract

- If no rows match the selected range, all numeric fields return zero.
- Each report section still renders with explicit zero/empty messaging.

## 7. No-Show/Cancellation Impact Contract

- Impact includes only booking statuses `NO_SHOW` and `CANCELLED`.
- Lost amount resolution order per row:
  1. total_price
  2. hourly_rate * durationHours
  3. 0 (counted in fallbackAmountCount)

## 8. Responsive UI Contract

- Mobile (>=375): stacked cards with expandable slot lists.
- Tablet (>=768): hybrid card/table sections where row density increases.
- Desktop (>=1280): tabular breakdown and pending-slot detail without horizontal clipping.

## 9. Non-Goals

- No schema migrations or new SQL views in this feature.
- No player-selection filter in report generation.
- No mutation/update endpoint for financial records.