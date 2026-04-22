import type { Booking, BookingStatus } from '@/features/booking/useBookings'

export interface DerivationScheduleWindow {
  scheduleStart: Date
  scheduleEnd: Date
}

export interface RecurringRuleInput {
  id: string
  day_of_week: number
  start_time: string
  end_time: string
  label: string
}

export interface ComposedSegment {
  segmentStart: Date
  segmentEnd: Date
  status: 'AVAILABLE' | BookingStatus
  source: 'gap' | 'booking' | 'recurring'
  booking?: Booking
  actionable: boolean
}

export interface ComposeAvailabilityInput {
  date: Date
  bookings: Booking[]
  recurringRules: RecurringRuleInput[]
  window: DerivationScheduleWindow
}

export type ComposeAvailability = (input: ComposeAvailabilityInput) => ComposedSegment[]
