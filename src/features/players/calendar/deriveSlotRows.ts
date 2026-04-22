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

    const gapEndMs = Math.min(segment.segmentEnd.getTime(), scheduleEnd.getTime())
    let cursor = segment.segmentStart.getTime()

    while (cursor + SLOT_DURATION_MS <= gapEndMs) {
      result.push({
        ...segment,
        segmentStart: new Date(cursor),
        segmentEnd: new Date(cursor + SLOT_DURATION_MS),
      })
      cursor += SLOT_DURATION_MS
    }

    // FR-015: do not emit an overlapping tail slot; merge a short remainder into
    // the previous available slot when contiguous.
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
