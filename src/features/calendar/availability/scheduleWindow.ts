import { setHours, setMilliseconds, setMinutes, setSeconds } from 'date-fns'
import type { DerivationScheduleWindow } from './types'

const DEFAULT_START_HOUR = 6
const DEFAULT_END_HOUR = 22

function toHourBoundary(date: Date, hour: number): Date {
  return setMilliseconds(setSeconds(setMinutes(setHours(date, hour), 0), 0), 0)
}

function timeToDate(date: Date, time: string): Date {
  const [rawHour, rawMinute, rawSecond] = time.split(':').map(Number)
  const hour = Number.isFinite(rawHour) ? rawHour : DEFAULT_END_HOUR
  const minute = Number.isFinite(rawMinute) ? rawMinute : 0
  const second = Number.isFinite(rawSecond) ? rawSecond : 0
  return setMilliseconds(setSeconds(setMinutes(setHours(date, hour), minute), second), 0)
}

interface ScheduleWindowOptions {
  startHour?: number
  endHour?: number
  endTime?: string
}

export function createScheduleWindow(date: Date, options?: ScheduleWindowOptions): DerivationScheduleWindow {
  const startHour = options?.startHour ?? DEFAULT_START_HOUR
  const scheduleStart = toHourBoundary(date, startHour)

  const scheduleEnd = options?.endTime
    ? timeToDate(date, options.endTime)
    : toHourBoundary(date, options?.endHour ?? DEFAULT_END_HOUR)

  if (scheduleEnd <= scheduleStart) {
    return {
      scheduleStart,
      scheduleEnd: toHourBoundary(date, DEFAULT_END_HOUR),
    }
  }

  return { scheduleStart, scheduleEnd }
}
