import { setHours, setMinutes, setSeconds, setMilliseconds, addHours, parseISO } from 'date-fns'
import type { Booking } from '@/features/booking/useBookings'

export interface SlotRowRepresentation {
  slotStart: Date
  slotEnd: Date
  status: 'AVAILABLE' | 'PENDING' | 'CONFIRMED' | 'UNAVAILABLE'
  booking?: Booking
  actionable: boolean
}

const SCHEDULE_START_HOUR = 6
const SCHEDULE_END_HOUR = 22

function dayStart(date: Date, hour: number): Date {
  return setMilliseconds(setSeconds(setMinutes(setHours(date, hour), 0), 0), 0)
}

/**
 * Derives hourly slot rows for a given date from existing booking data.
 * Covers the visible schedule window (06:00–22:00).
 * No API calls — pure client-side derivation from the existing booking query.
 */
export function deriveSlotRows(date: Date, bookings: Booking[]): SlotRowRepresentation[] {
  const rows: SlotRowRepresentation[] = []

  for (let hour = SCHEDULE_START_HOUR; hour < SCHEDULE_END_HOUR; hour++) {
    const slotStart = dayStart(date, hour)
    const slotEnd = addHours(slotStart, 1)

    const match = bookings.find((b) => {
      const bStart = parseISO(b.start_time)
      const bEnd = parseISO(b.end_time)
      // Overlap: booking starts before slot ends AND ends after slot starts
      return bStart < slotEnd && bEnd > slotStart
    })

    const status = match ? (match.status as SlotRowRepresentation['status']) : 'AVAILABLE'

    rows.push({
      slotStart,
      slotEnd,
      status,
      booking: match,
      actionable: status !== 'UNAVAILABLE',
    })
  }

  return rows
}
