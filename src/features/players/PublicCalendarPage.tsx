import { useState, useMemo } from 'react'
import { LayoutList, CalendarDays } from 'lucide-react'
import CalendarContainer from '@/components/shared/calendar/CalendarContainer'
import type { CalendarView } from '@/components/shared/calendar/CalendarContainer'
import PlayerListView from '@/features/players/calendar/PlayerListView'
import ListDateNav from '@/features/players/calendar/ListDateNav'
import { usePublicBookings } from './usePublicBookings'
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfDay, endOfDay, startOfToday } from 'date-fns'
import type { Booking } from '@/features/booking/useBookings'
import { useNextAvailableAgent } from './call/useNextAvailableAgent'
import CallFAB from './call/CallFAB'
import CallbackRequestModal from './call/CallbackRequestModal'

type DisplayMode = 'calendar' | 'list'

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
  const [currentDate, setCurrentDate] = useState(startOfToday())
  const [view, setView] = useState<CalendarView>('week')
  // FR-002: list view is the default display mode on page load
  const [displayMode, setDisplayMode] = useState<DisplayMode>('list')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { phone: availableAgentPhone, isLoading: agentLoading } = useNextAvailableAgent()

  const { startDate, endDate } = useMemo(() => {
    if (displayMode === 'list') {
      return { startDate: startOfDay(currentDate), endDate: endOfDay(currentDate) }
    }
    if (view === 'month') {
      return { startDate: startOfMonth(currentDate), endDate: endOfMonth(currentDate) }
    }
    return { startDate: startOfWeek(currentDate), endDate: endOfWeek(currentDate) }
  }, [currentDate, view, displayMode])

  const today = startOfToday()

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
      <div className="flex w-full justify-end mb-2">
        <div className="inline-flex rounded-lg border border-gray-200 bg-gray-100 p-0.5 gap-0.5" role="group" aria-label="View mode">
          <button
            onClick={() => setDisplayMode('list')}
            aria-pressed={displayMode === 'list'}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              displayMode === 'list'
                ? 'bg-white shadow text-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <LayoutList className="w-4 h-4" />
            List
          </button>
          <button
            onClick={() => setDisplayMode('calendar')}
            aria-pressed={displayMode === 'calendar'}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              displayMode === 'calendar'
                ? 'bg-white shadow text-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            Calendar
          </button>
        </div>
      </div>

      {displayMode === 'calendar' && (
        <p className="mb-2 w-full text-left text-xs text-gray-500 md:hidden">
          Swipe horizontally to see all days and times.
        </p>
      )}

      {isLoading ? (
        <div className="h-[68vh] w-full animate-pulse rounded-lg border bg-white shadow-sm md:h-[72vh]" />
      ) : displayMode === 'list' ? (
        <div className="w-full">
          <ListDateNav value={currentDate} onChange={setCurrentDate} minDate={today} />
          <PlayerListView
            currentDate={currentDate}
            bookings={secureBookings as Booking[]}
            readOnly={true}
            isAdmin={false}
          />
        </div>
      ) : (
        <CalendarContainer
          currentDate={currentDate}
          view={view}
          onDateChange={setCurrentDate}
          onViewChange={setView}
          bookings={secureBookings as Booking[]}
          readOnly={true}
          isAdmin={false}
          minDate={today}
        />
      )}
      
      <CallFAB
        availableAgentPhone={availableAgentPhone}
        isLoading={agentLoading}
        onRequestCallback={() => setIsModalOpen(true)}
      />
      <CallbackRequestModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}
