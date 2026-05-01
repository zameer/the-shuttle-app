// contracts/PaidDetailFiltersContract.ts
// Feature: 027-paid-detail-status-filter
// Scope: Filter state and interaction contract for PaidDetailPage

export type DetailStatusScope = 'PAID' | 'OUTSTANDING'
export type OutstandingBookingStatus = 'CONFIRMED' | 'CANCELLED' | 'NO_SHOW'

export interface PaidDetailFilterInput {
  startDate: string
  endDate: string
  scope: DetailStatusScope
  outstandingStatuses: OutstandingBookingStatus[]
}

// UI Contract:
// 1. Scope selector appears in PaidDetailPage filter section with Start Date and End Date.
// 2. Default scope is PAID.
// 3. Booking-status multi-select is visible only when scope=OUTSTANDING.
// 4. Default multi-select values: CONFIRMED, CANCELLED, NO_SHOW (all selected).
// 5. Any filter change resets currentPage to 1.

export {}
