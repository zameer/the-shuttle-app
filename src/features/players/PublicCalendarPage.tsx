import { useState, useMemo } from 'react'
import CalendarContainer from '@/components/shared/calendar/CalendarContainer'
import type { CalendarView } from '@/components/shared/calendar/CalendarContainer'
import { usePublicBookings } from './usePublicBookings'
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'
import type { Booking } from '@/features/booking/useBookings'

/**
 * PublicCalendarPage - Public read-only calendar for viewing booking availability
 * 
 * Features:
 * - Displays booking status only (Open, Reserved, Unavailable) — NO player names
 * - Completely read-only — no click interactions
 * - No access to admin or player contact details
 * - Privacy-compliant: no data leakage via API
 * - Responsive container sizing with mobile-first padding and viewport-height calendar
 */
export default function PublicCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<CalendarView>('week')

  const { startDate, endDate } = useMemo(() => {
    if (view === 'month') {
      return { startDate: startOfMonth(currentDate), endDate: endOfMonth(currentDate) }
    }
    return { startDate: startOfWeek(currentDate), endDate: endOfWeek(currentDate) }
  }, [currentDate, view])

  const { data: rawBookings = [], isLoading } = usePublicBookings(startDate, endDate)

  // Map to the shared calendar interface securely without PII
  // Strip all sensitive data: player names/phone, payment info, rates
  const secureBookings = rawBookings.map((b) => ({
    ...b,
    player_phone_number: null,
    player_name: null,  // Explicitly null for public view
    payment_status: null,
    total_price: null,
    hourly_rate: null,
  }))

  return (
    <div className="mx-auto flex w-full max-w-full flex-col items-center px-2 sm:px-4 lg:px-6 min-h-[78vh]">
      <p className="mb-2 w-full text-left text-xs text-gray-500 md:hidden">
        Swipe horizontally to see all days and times.
      </p>
      {isLoading ? (
        <div className="h-[68vh] w-full animate-pulse rounded-lg border bg-white shadow-sm md:h-[72vh]" />
      ) : (
        <CalendarContainer 
          currentDate={currentDate}
          view={view}
          onDateChange={setCurrentDate}
          onViewChange={setView}
          bookings={secureBookings as Booking[]}
          readOnly={true}
          isAdmin={false}
        />
      )}
      
      <div className="mt-6 w-full max-w-md rounded-lg bg-blue-50 p-4 text-center text-sm text-blue-800">
        <p className="font-semibold mb-1">To reserve an available slot,</p>
        <p>please contact our administrative staff directly via phone or WhatsApp.</p>
      </div>
    </div>
  )
}
