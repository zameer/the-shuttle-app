import { endOfMonth, endOfWeek, startOfMonth, startOfWeek } from 'date-fns'
import type { CalendarView } from './CalendarContainer'

export interface CalendarQueryRange {
  startDate: Date
  endDate: Date
}

export function getCalendarViewRange(currentDate: Date, view: CalendarView): CalendarQueryRange {
  if (view === 'month') {
    return { startDate: startOfMonth(currentDate), endDate: endOfMonth(currentDate) }
  }

  return { startDate: startOfWeek(currentDate), endDate: endOfWeek(currentDate) }
}
