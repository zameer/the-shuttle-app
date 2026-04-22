import { setHours, setMilliseconds, setMinutes, setSeconds } from 'date-fns'
import { parseISO } from 'date-fns'
import type { Booking } from '@/features/booking/useBookings'
import type { ComposedSegment, ComposeAvailability, DerivationScheduleWindow, RecurringRuleInput } from './types'

interface Interval {
  start: Date
  end: Date
}

interface BookingInterval extends Interval {
  booking: Booking
}

function toDateForTime(date: Date, time: string): Date {
  const [rawHour, rawMinute, rawSecond] = time.split(':').map(Number)
  const hour = Number.isFinite(rawHour) ? rawHour : 0
  const minute = Number.isFinite(rawMinute) ? rawMinute : 0
  const second = Number.isFinite(rawSecond) ? rawSecond : 0
  return setMilliseconds(setSeconds(setMinutes(setHours(date, hour), minute), second), 0)
}

function clampInterval(interval: Interval, window: DerivationScheduleWindow): Interval | null {
  const start = interval.start < window.scheduleStart ? window.scheduleStart : interval.start
  const end = interval.end > window.scheduleEnd ? window.scheduleEnd : interval.end

  if (end <= start) {
    return null
  }

  return { start, end }
}

function getBookingIntervals(bookings: Booking[], window: DerivationScheduleWindow): BookingInterval[] {
  return bookings
    .map((booking) => {
      const clamped = clampInterval(
        {
          start: parseISO(booking.start_time),
          end: parseISO(booking.end_time),
        },
        window,
      )

      if (!clamped) return null
      return { ...clamped, booking }
    })
    .filter((interval): interval is BookingInterval => interval !== null)
    .sort((left, right) => left.start.getTime() - right.start.getTime())
}

function getRecurringIntervals(
  date: Date,
  recurringRules: RecurringRuleInput[],
  window: DerivationScheduleWindow,
): Interval[] {
  const dayOfWeek = date.getDay()

  return recurringRules
    .filter((rule) => rule.day_of_week === dayOfWeek)
    .map((rule) =>
      clampInterval(
        {
          start: toDateForTime(date, rule.start_time),
          end: toDateForTime(date, rule.end_time),
        },
        window,
      ),
    )
    .filter((interval): interval is Interval => interval !== null)
    .sort((left, right) => left.start.getTime() - right.start.getTime())
}

function createBoundaries(window: DerivationScheduleWindow, bookingIntervals: BookingInterval[], recurringIntervals: Interval[]): number[] {
  const boundaries = new Set<number>([window.scheduleStart.getTime(), window.scheduleEnd.getTime()])

  for (const interval of bookingIntervals) {
    boundaries.add(interval.start.getTime())
    boundaries.add(interval.end.getTime())
  }

  for (const interval of recurringIntervals) {
    boundaries.add(interval.start.getTime())
    boundaries.add(interval.end.getTime())
  }

  return Array.from(boundaries).sort((a, b) => a - b)
}

function mergeAdjacentSegments(segments: ComposedSegment[]): ComposedSegment[] {
  if (segments.length === 0) return []

  const merged: ComposedSegment[] = [segments[0]]

  for (let i = 1; i < segments.length; i += 1) {
    const current = segments[i]
    const previous = merged[merged.length - 1]

    const canMerge =
      previous.segmentEnd.getTime() === current.segmentStart.getTime() &&
      previous.status === current.status &&
      previous.source === current.source &&
      (previous.booking?.id ?? null) === (current.booking?.id ?? null)

    if (canMerge) {
      previous.segmentEnd = current.segmentEnd
      continue
    }

    merged.push(current)
  }

  return merged
}

function findBookingInterval(bookingIntervals: BookingInterval[], start: number, end: number): BookingInterval | undefined {
  return bookingIntervals.find((interval) => interval.start.getTime() < end && interval.end.getTime() > start)
}

function hasRecurringCoverage(recurringIntervals: Interval[], start: number, end: number): boolean {
  return recurringIntervals.some((interval) => interval.start.getTime() < end && interval.end.getTime() > start)
}

const BLOCKING_STATUSES = new Set<string>(['CONFIRMED', 'PENDING', 'UNAVAILABLE'])

export const composeAvailabilitySegments: ComposeAvailability = ({ date, bookings, recurringRules, window }) => {
  const bookingIntervals = getBookingIntervals(bookings, window)
  const recurringIntervals = getRecurringIntervals(date, recurringRules, window)
  const boundaries = createBoundaries(window, bookingIntervals, recurringIntervals)

  const segments: ComposedSegment[] = []

  for (let index = 0; index < boundaries.length - 1; index += 1) {
    const start = boundaries[index]
    const end = boundaries[index + 1]

    if (end <= start) {
      continue
    }

    const bookingInterval = findBookingInterval(bookingIntervals, start, end)
    if (bookingInterval) {
      if (BLOCKING_STATUSES.has(bookingInterval.booking.status)) {
        segments.push({
          segmentStart: new Date(start),
          segmentEnd: new Date(end),
          status: bookingInterval.booking.status,
          source: 'booking',
          booking: bookingInterval.booking,
          actionable: bookingInterval.booking.status !== 'UNAVAILABLE',
        })
      } else {
        // CANCELLED / NO_SHOW: slot is operationally free; recurring block must not override (FR-007)
        segments.push({
          segmentStart: new Date(start),
          segmentEnd: new Date(end),
          status: 'AVAILABLE',
          source: 'gap',
          actionable: true,
        })
      }
      continue
    }

    if (hasRecurringCoverage(recurringIntervals, start, end)) {
      segments.push({
        segmentStart: new Date(start),
        segmentEnd: new Date(end),
        status: 'UNAVAILABLE',
        source: 'recurring',
        actionable: false,
      })
      continue
    }

    segments.push({
      segmentStart: new Date(start),
      segmentEnd: new Date(end),
      status: 'AVAILABLE',
      source: 'gap',
      actionable: true,
    })
  }

  return mergeAdjacentSegments(segments)
}
