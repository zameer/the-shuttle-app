import { addMinutes, isBefore, parseISO, setHours, setMilliseconds, setMinutes, setSeconds, startOfDay } from 'date-fns'
import type { Booking } from '@/features/booking/useBookings'

export interface SlotRowRepresentation {
  type: 'booking' | 'available'
  slotStart: Date
  slotEnd: Date
  durationMinutes: number
  status: 'AVAILABLE' | 'PENDING' | 'CONFIRMED' | 'UNAVAILABLE' | 'CANCELLED' | 'NO_SHOW'
  booking?: Booking
  actionable: boolean
}

const SCHEDULE_START_HOUR = 6
const SCHEDULE_END_HOUR = 22
const SLOT_STEP_MINUTES = 60

function dayStart(date: Date, hour: number): Date {
  return setMilliseconds(setSeconds(setMinutes(setHours(date, hour), 0), 0), 0)
}

function dayAtTime(date: Date, time: string): Date {
  const [hourPart, minutePart, secondPart] = time.split(':').map(Number)
  const hour = Number.isFinite(hourPart) ? hourPart : SCHEDULE_END_HOUR
  const minute = Number.isFinite(minutePart) ? minutePart : 0
  const second = Number.isFinite(secondPart) ? secondPart : 0
  return setMilliseconds(setSeconds(setMinutes(setHours(date, hour), minute), second), 0)
}

/**
 * Derives exact chronological slot rows for a given date from existing booking data.
 * Covers the visible schedule window (scheduleStartHour–scheduleEnd).
 * No API calls — pure client-side derivation from the existing booking query.
 *
 * @param scheduleEndTime - Court close time in HH:mm[:ss] format from court settings.
 *   If undefined, falls back to the default SCHEDULE_END_HOUR boundary.
 */
export function deriveSlotRows(
  date: Date,
  bookings: Booking[],
  scheduleEndTime?: string,
): SlotRowRepresentation[] {
  const scheduleStart = dayStart(date, SCHEDULE_START_HOUR)
  const scheduleEnd = scheduleEndTime ? dayAtTime(date, scheduleEndTime) : dayStart(date, SCHEDULE_END_HOUR)
  const isPastDate = isBefore(startOfDay(date), startOfDay(new Date()))
  const rows: SlotRowRepresentation[] = []

  const dayBookings = bookings
    .filter((booking) => {
      const bookingStart = parseISO(booking.start_time)
      const bookingEnd = parseISO(booking.end_time)
      return bookingStart < scheduleEnd && bookingEnd > scheduleStart
    })
    .sort((left, right) => parseISO(left.start_time).getTime() - parseISO(right.start_time).getTime())

  let cursor = scheduleStart

  for (const booking of dayBookings) {
    const bookingStart = parseISO(booking.start_time)
    const bookingEnd = parseISO(booking.end_time)
    const effectiveStart = bookingStart < scheduleStart ? scheduleStart : bookingStart
    const effectiveEnd = bookingEnd > scheduleEnd ? scheduleEnd : bookingEnd

    // Skip rows that start at or beyond close time after boundary clamping.
    if (effectiveEnd <= effectiveStart) {
      continue
    }

    while (addMinutes(cursor, SLOT_STEP_MINUTES) <= effectiveStart) {
      const slotEnd = addMinutes(cursor, SLOT_STEP_MINUTES)
      if (!isPastDate) {
        rows.push({
          type: 'available',
          slotStart: cursor,
          slotEnd,
          durationMinutes: SLOT_STEP_MINUTES,
          status: 'AVAILABLE',
          actionable: true,
        })
      }
      cursor = slotEnd
    }

    if (!isPastDate && cursor < effectiveStart) {
      rows.push({
        type: 'available',
        slotStart: cursor,
        slotEnd: effectiveStart,
        durationMinutes: (effectiveStart.getTime() - cursor.getTime()) / 60000,
        status: 'AVAILABLE',
        actionable: true,
      })
      cursor = effectiveStart
    }

    rows.push({
      type: 'booking',
      slotStart: effectiveStart,
      slotEnd: effectiveEnd,
      durationMinutes: (effectiveEnd.getTime() - effectiveStart.getTime()) / 60000,
      status: booking.status,
      booking,
      actionable: booking.status !== 'UNAVAILABLE',
    })

    if (effectiveEnd > cursor) {
      cursor = effectiveEnd
    }
  }

  while (addMinutes(cursor, SLOT_STEP_MINUTES) <= scheduleEnd) {
    const slotEnd = addMinutes(cursor, SLOT_STEP_MINUTES)
    if (!isPastDate) {
      rows.push({
        type: 'available',
        slotStart: cursor,
        slotEnd,
        durationMinutes: SLOT_STEP_MINUTES,
        status: 'AVAILABLE',
        actionable: true,
      })
    }
    cursor = slotEnd
  }

  if (!isPastDate && cursor < scheduleEnd) {
    rows.push({
      type: 'available',
      slotStart: cursor,
      slotEnd: scheduleEnd,
      durationMinutes: (scheduleEnd.getTime() - cursor.getTime()) / 60000,
      status: 'AVAILABLE',
      actionable: true,
    })
  }

  return rows
}
