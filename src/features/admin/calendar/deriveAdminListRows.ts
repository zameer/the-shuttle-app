import { isBefore, startOfDay } from 'date-fns'
import type { Booking } from '@/features/booking/useBookings'
import { normalizePaymentStatus, type NormalizedPaymentStatus } from '@/features/booking/paymentStatus'
import {
  composeAvailabilitySegments,
  createScheduleWindow,
  type RecurringRuleInput,
} from '@/features/calendar/availability'
import type { ComposedSegment } from '@/features/calendar/availability/types'

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

const SCHEDULE_END_HOUR = 22
const SCHEDULE_START_HOUR = 6
const SLOT_DURATION_MS = 60 * 60 * 1000

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function expandGapTo60MinSlots(segments: ComposedSegment[]): ComposedSegment[] {
  const result: ComposedSegment[] = []
  for (const segment of segments) {
    if (segment.source !== 'gap') {
      result.push(segment)
      continue
    }

    const gapEndMs = segment.segmentEnd.getTime()
    let cursor = segment.segmentStart.getTime()

    while (cursor + SLOT_DURATION_MS <= gapEndMs) {
      result.push({
        ...segment,
        segmentStart: new Date(cursor),
        segmentEnd: new Date(cursor + SLOT_DURATION_MS),
      })
      cursor += SLOT_DURATION_MS
    }

    // FR-015: avoid rendering a separate overlapping tail row. Merge short
    // remainder into the previous available slot when contiguous.
    if (cursor < gapEndMs) {
      const previous = result[result.length - 1]
      const canMergeRemainder =
        previous &&
        previous.source === 'gap' &&
        previous.status === 'AVAILABLE' &&
        previous.segmentEnd.getTime() === cursor

      if (canMergeRemainder) {
        previous.segmentEnd = new Date(gapEndMs)
      } else {
        result.push({
          ...segment,
          segmentStart: new Date(cursor),
          segmentEnd: new Date(gapEndMs),
        })
      }
    }
  }
  return result
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
  recurringRules: RecurringRuleInput[] = [],
): AdminListRow[] {
  const window = createScheduleWindow(date, {
    startHour: SCHEDULE_START_HOUR,
    endHour: scheduleEndHour,
  })

  const composedSegments = composeAvailabilitySegments({
    date,
    bookings,
    recurringRules,
    window,
  })

  const expandedSegments = expandGapTo60MinSlots(composedSegments)

  const isPastDate = isBefore(startOfDay(date), startOfDay(new Date()))

  return expandedSegments
    .filter((segment) => !isPastDate || segment.status !== 'AVAILABLE')
    .map((segment) => ({
      type: segment.status === 'AVAILABLE' ? 'available' : 'booking',
      slotStart: segment.segmentStart,
      slotEnd: segment.segmentEnd,
      durationMinutes: (segment.segmentEnd.getTime() - segment.segmentStart.getTime()) / 60000,
      status: segment.status,
      booking: segment.booking,
      playerName: segment.booking?.player_name ?? null,
      paymentStatus: segment.booking
        ? normalizePaymentStatus(segment.booking.payment_status)
        : undefined,
      actionable: segment.actionable,
    }))
}
