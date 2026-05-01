// contracts/PaidDetailFiltersContract.ts
// Feature: 027-paid-detail-status-filter
// Scope: Draft vs applied filter contracts for manual load behavior

export type DetailStatusScope = 'PAID' | 'OUTSTANDING'
export type OutstandingBookingStatus = 'CONFIRMED' | 'CANCELLED' | 'NO_SHOW'

export interface PaidDetailDraftFilters {
  startDate: string
  endDate: string
  scope: DetailStatusScope
  outstandingStatuses: OutstandingBookingStatus[]
}

export interface PaidDetailAppliedFilters {
  startDate: string
  endDate: string
  scope: DetailStatusScope
  outstandingStatuses: OutstandingBookingStatus[]
}

// Interaction contract:
// 1. Editing draft filters MUST NOT trigger data fetch.
// 2. Clicking Load Details copies draft filters into applied filters.
// 3. Query and rendered results are based only on applied filters.
// 4. Pagination resets on each load action.

export {}
