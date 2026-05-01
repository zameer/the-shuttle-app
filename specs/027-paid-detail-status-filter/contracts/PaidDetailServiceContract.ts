// contracts/PaidDetailServiceContract.ts
// Feature: 027-paid-detail-status-filter
// Scope: Service/hook filtering rules for paid-detail rows

import type { PaidDetailOutput, NormalizedFinancialBooking } from '../../../src/features/admin/financial-reports/types'

export type DetailStatusScope = 'PAID' | 'OUTSTANDING'
export type OutstandingBookingStatus = 'CONFIRMED' | 'CANCELLED' | 'NO_SHOW'

export interface PaidDetailFilterInput {
  startDate: string
  endDate: string
  scope: DetailStatusScope
  outstandingStatuses: OutstandingBookingStatus[]
}

// Proposed service contract:
// buildPaidDetailByFilter(rows: NormalizedFinancialBooking[], input: PaidDetailFilterInput): PaidDetailOutput

// Filtering algorithm:
// 1. Base row set is date-range constrained by query layer.
// 2. If scope=PAID: include rows where paymentBucket==='PAID' and bookingStatus is active per existing rule.
// 3. If scope=OUTSTANDING:
//    - include rows where paymentBucket!=='PAID'
//    - include only rows where bookingStatus is in outstandingStatuses
// 4. Sort rows by slotStart descending.
// 5. Compute summary from filtered rows only.

export {}
