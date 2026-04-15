import { useState, useMemo } from 'react'
import CalendarContainer from '@/components/shared/calendar/CalendarContainer'
import type { CalendarView } from '@/components/shared/calendar/CalendarContainer'
import { usePublicBookings } from './usePublicBookings'
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'

/**
 * PublicCalendarPage - Public read-only calendar for viewing booking availability
 * 
 * Features:
 * - Displays booking status only (Open, Reserved, Unavailable) — NO player names
 * - Completely read-only — no click interactions
 * - No access to admin or player contact details
 * - Privacy-compliant: no data leakage via API
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
    <div className="w-full h-[80vh] flex flex-col items-center">
      {isLoading ? (
        <div className="animate-pulse bg-white border h-[600px] w-full rounded-lg shadow-sm"></div>
      ) : (
        <CalendarContainer 
          currentDate={currentDate}
          view={view}
          onDateChange={setCurrentDate}
          onViewChange={setView}
          bookings={secureBookings as any}
          readOnly={true}
          isAdmin={false}
        />
      )}
      
      <div className="mt-8 bg-blue-50 text-blue-800 p-4 rounded-lg text-center text-sm max-w-md">
        <p className="font-semibold mb-1">To reserve an available slot,</p>
        <p>please contact our administrative staff directly via phone or WhatsApp.</p>
      </div>
    </div>
  )
}
