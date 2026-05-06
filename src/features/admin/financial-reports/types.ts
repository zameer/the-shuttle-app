export type PaymentBucket = 'PAID' | 'PENDING'
export type ImpactType = 'NO_SHOW' | 'CANCELLED'
export type DetailStatusScope = 'PAID' | 'OUTSTANDING'
export type OutstandingBookingStatus = 'CONFIRMED' | 'CANCELLED' | 'NO_SHOW'

export interface ReportDateRangeInput {
  startDate: string
  endDate: string
}

export interface NormalizedFinancialBooking {
  bookingId: string
  playerPhoneNumber: string | null
  playerName: string | null
  slotStart: string
  slotEnd: string
  durationHours: number
  bookingStatus: 'PENDING' | 'CONFIRMED' | 'UNAVAILABLE' | 'CANCELLED' | 'NO_SHOW'
  paymentBucket: PaymentBucket
  amount: number
  amountSource: 'total_price' | 'hourly_rate_x_duration' | 'fallback_zero'
}

export interface FinancialSummary {
  paidHours: number
  paidAmount: number
  pendingHours: number
  pendingAmount: number
}

export interface PaymentBreakdownEntry {
  paymentBucket: PaymentBucket
  playerPhoneNumber: string | null
  playerName: string | null
  bookingCount: number
  totalHours: number
  totalAmount: number
}

export interface PaidBreakdownOutput {
  entries: PaymentBreakdownEntry[]
  totalEntries: number
}

export interface PaidBreakdownModalState {
  isOpen: boolean
  currentPage: number
  pageSize: number
}

export interface PaginationControlState {
  canGoPrevious: boolean
  canGoNext: boolean
  pageLabel: string
}

export interface OutstandingPendingSlot {
  bookingId: string
  startTime: string
  endTime: string
  status: 'PENDING' | 'CONFIRMED' | 'UNAVAILABLE' | 'CANCELLED' | 'NO_SHOW'
  amount: number
}

export interface OutstandingPendingPlayerRecord {
  playerPhoneNumber: string | null
  playerName: string | null
  pendingHours: number
  pendingAmount: number
  slots: OutstandingPendingSlot[]
}

export interface RevenueLossBucket {
  lostHours: number
  lostAmount: number
  bookingCount: number
}

export interface RevenueLossOutput {
  noShow: RevenueLossBucket
  cancelled: RevenueLossBucket
  fallbackAmountCount: number
}

export interface FinancialReportOutput {
  summary: FinancialSummary
  paidBreakdown: PaidBreakdownOutput
  outstandingPending: {
    players: OutstandingPendingPlayerRecord[]
    totalOutstandingAmount: number
  }
  revenueLoss: RevenueLossOutput
  reconciliation: {
    paidAmountMatches: boolean
    paidHoursMatches: boolean
  }
}

// PaidDetailRow is a semantic alias — one row per individual paid booking
export type PaidDetailRow = NormalizedFinancialBooking

export interface PaidDetailSummary {
  totalAmount: number
  totalHours: number
  totalBookings: number
}

export interface PaidDetailOutput {
  rows: PaidDetailRow[]
  summary: PaidDetailSummary
}

export interface PaidDetailFilterInput extends ReportDateRangeInput {
  scope: DetailStatusScope
  outstandingStatuses: OutstandingBookingStatus[]
}

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

export interface ExpenseRecord {
  id: string
  expenseDate: string
  description: string
  amountLkr: number
  createdBy: string | null
  createdAt: string
}

export interface ExpenseFormInput {
  date: string
  description: string
  amount: number
}

export interface BalanceComputation {
  paidAmount: number
  expenseAmount: number
  balanceAmount: number
  calculatedAt: string
}

export interface ExpenseBalanceRouteSearchParams {
  start?: string
  end?: string
}
