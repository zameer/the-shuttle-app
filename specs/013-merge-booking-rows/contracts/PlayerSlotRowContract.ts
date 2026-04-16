import type { Booking } from '@/features/booking/useBookings'

export type PlayerSlotRowStatus = 'AVAILABLE' | 'PENDING' | 'CONFIRMED' | 'UNAVAILABLE'

export interface PlayerSlotRow {
  type: 'booking' | 'available'
  slotStart: Date
  slotEnd: Date
  durationMinutes: number
  status: PlayerSlotRowStatus
  booking?: Booking
  actionable: boolean
}

/**
 * Derives ordered rows for the player booking list view covering the visible
 * schedule window. Long bookings must appear as a single row, and partial
 * available gaps adjacent to 30-minute bookings must be preserved.
 */
export type DerivePlayerSlotRowsFn = (date: Date, bookings: Booking[]) => PlayerSlotRow[]
