import { isBefore, startOfDay } from 'date-fns'
import type { Booking } from '@/features/booking/useBookings'
import {
  composeAvailabilitySegments,
  createScheduleWindow,
  type RecurringRuleInput,
} from '@/features/calendar/availability'
import type { ComposedSegment } from '@/features/calendar/availability/types'

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
const SLOT_DURATION_MS = 60 * 60 * 1000

function expandGapTo60MinSlots(segments: ComposedSegment[], scheduleEnd: Date): ComposedSegment[] {
  const result: ComposedSegment[] = []
  for (const segment of segments) {
    if (segment.source !== 'gap') {
      result.push(segment)
      continue
    }
    let cursor = segment.segmentStart.getTime()
    while (cursor < segment.segmentEnd.getTime()) {
      const unboundedEnd = cursor + SLOT_DURATION_MS
      const slotEnd = new Date(Math.min(unboundedEnd, scheduleEnd.getTime()))
      if (slotEnd.getTime() <= cursor) {
        break
      }
      result.push({
        ...segment,
        segmentStart: new Date(cursor),
        segmentEnd: slotEnd,
      })
      cursor += SLOT_DURATION_MS
    }
  }
  return result
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
  recurringRules: RecurringRuleInput[] = [],
): SlotRowRepresentation[] {
  const window = createScheduleWindow(date, {
    startHour: SCHEDULE_START_HOUR,
    endTime: scheduleEndTime,
  })

  const composedSegments = composeAvailabilitySegments({
    date,
    bookings,
    recurringRules,
    window,
  })

  const expandedSegments = expandGapTo60MinSlots(composedSegments, window.scheduleEnd)

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
      actionable: segment.actionable,
    }))
}
