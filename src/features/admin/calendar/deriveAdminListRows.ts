import { addMinutes, isBefore, parseISO, setHours, setMilliseconds, setMinutes, setSeconds, startOfDay } from 'date-fns'
import type { Booking } from '@/features/booking/useBookings'
import { normalizePaymentStatus, type NormalizedPaymentStatus } from '@/features/booking/paymentStatus'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AdminListRowStatus = 'AVAILABLE' | 'PENDING' | 'CONFIRMED' | 'UNAVAILABLE' | 'CANCELLED' | 'NO_SHOW'

export interface AdminListRow {
  type: 'booking' | 'available'
  slotStart: Date
  slotEnd: Date
  durationMinutes: number
  status: AdminListRowStatus
  booking?: Booking
  playerName?: string | null
  /** Normalized payment status — only populated for type === 'booking' rows (US3 016). */
  paymentStatus?: NormalizedPaymentStatus
  actionable: boolean
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SCHEDULE_START_HOUR = 6
const SCHEDULE_END_HOUR = 22
const SLOT_STEP_MINUTES = 60

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toScheduleStart(date: Date): Date {
  return setMilliseconds(setSeconds(setMinutes(setHours(date, SCHEDULE_START_HOUR), 0), 0), 0)
}

function toScheduleHour(date: Date, hour: number): Date {
  return setMilliseconds(setSeconds(setMinutes(setHours(date, hour), 0), 0), 0)
}

// ---------------------------------------------------------------------------
// Derivation
// ---------------------------------------------------------------------------

/**
 * Derives an ordered list of AdminListRow entries covering the schedule window
 * (SCHEDULE_START_HOUR–scheduleEndHour) for a given date.
 *
 * - One merged booking row per booking record (exact start → end, unclamped)
 * - 60-minute available-slot rows fill all unbooked intervals in the window
 *
 * @param scheduleEndHour - Court close hour (default: SCHEDULE_END_HOUR). Pass
 *   Math.ceil(timeStrToHours(settings.court_close_time)) to align with court_settings.
 */
export function deriveAdminListRows(
  date: Date,
  bookings: Booking[],
  scheduleEndHour: number = SCHEDULE_END_HOUR,
): AdminListRow[] {
  const scheduleStart = toScheduleStart(date)
  const scheduleEnd = toScheduleHour(date, scheduleEndHour)
  const isPastDate = isBefore(startOfDay(date), startOfDay(new Date()))

  // Filter to bookings that overlap the schedule window and sort ascending
  const dayBookings = bookings
    .filter((b) => {
      const bStart = parseISO(b.start_time)
      const bEnd = parseISO(b.end_time)
      return bStart < scheduleEnd && bEnd > scheduleStart
    })
    .sort((a, b) => parseISO(a.start_time).getTime() - parseISO(b.start_time).getTime())

  const rows: AdminListRow[] = []
  let cursor = scheduleStart

  for (const booking of dayBookings) {
    const bStart = parseISO(booking.start_time)
    const bEnd = parseISO(booking.end_time)

    // Clamp start to schedule window start (early bookings begin at 06:00 display start).
    // Do NOT clamp end: bookings that extend beyond the schedule window must remain
    // fully visible to match calendar view behaviour (US2 016).
    const effectiveBStart = bStart < scheduleStart ? scheduleStart : bStart
    const effectiveBEnd = bEnd

    // Fill 60-min available rows between cursor and booking start
    while (addMinutes(cursor, SLOT_STEP_MINUTES) <= effectiveBStart) {
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

    // Emit partial gap row if remaining time before booking is < 60 min
    if (!isPastDate && cursor < effectiveBStart) {
      const partialDuration = (effectiveBStart.getTime() - cursor.getTime()) / 60000
      rows.push({
        type: 'available',
        slotStart: cursor,
        slotEnd: effectiveBStart,
        durationMinutes: partialDuration,
        status: 'AVAILABLE',
        actionable: true,
      })
      cursor = effectiveBStart
    }

    // Emit one merged booking row
    const durationMinutes = (effectiveBEnd.getTime() - effectiveBStart.getTime()) / 60000
    rows.push({
      type: 'booking',
      slotStart: effectiveBStart,
      slotEnd: effectiveBEnd,
      durationMinutes,
      status: booking.status,
      booking,
      playerName: booking.player_name ?? null,
      paymentStatus: normalizePaymentStatus(booking.payment_status),
      actionable: true,
    })

    // Advance cursor past this booking
    if (effectiveBEnd > cursor) {
      cursor = effectiveBEnd
    }
  }

  // Fill remaining 60-min available slots after the last booking
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

  // Emit partial trailing gap if any unbooked time remains before schedule end
  if (!isPastDate && cursor < scheduleEnd) {
    const partialDuration = (scheduleEnd.getTime() - cursor.getTime()) / 60000
    rows.push({
      type: 'available',
      slotStart: cursor,
      slotEnd: scheduleEnd,
      durationMinutes: partialDuration,
      status: 'AVAILABLE',
      actionable: true,
    })
  }

  return rows
}
