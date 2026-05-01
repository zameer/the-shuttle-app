// contracts/PaidDetailServiceContract.ts
// Feature: 027-paid-detail-status-filter
// Scope: Service and hook contracts for load-triggered filtering

export type DetailStatusScope = 'PAID' | 'OUTSTANDING'
export type OutstandingBookingStatus = 'CONFIRMED' | 'CANCELLED' | 'NO_SHOW'

export interface PaidDetailAppliedFilters {
  startDate: string
  endDate: string
  scope: DetailStatusScope
  outstandingStatuses: OutstandingBookingStatus[]
}

// Hook contract:
// usePaidDetail(appliedFilters, enabled)
// - enabled=false before first load action
// - enabled=true after load action with applied filters

// Service contract:
// buildPaidDetailByFilter(rows, appliedFilters)
// - PAID scope: paid + active financial statuses
// - OUTSTANDING scope: non-paid + selected booking statuses
// - returns summary computed from filtered rows only

export {}
