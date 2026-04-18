import { useState, useMemo } from 'react'
import { startOfDay, endOfDay } from 'date-fns'
import { LayoutList, CalendarDays } from 'lucide-react'
import CalendarContainer from '@/components/shared/calendar/CalendarContainer'
import DateRangeFilter from '@/components/shared/calendar/DateRangeFilter'
import { getCalendarViewRange } from '@/components/shared/calendar/range'
import type { CalendarView } from '@/components/shared/calendar/CalendarContainer'
import BookingDetailsModal from '@/features/booking/BookingDetailsModal'
import BookingForm from '@/features/booking/BookingForm'
import { useBookings, useUpdateBooking } from '@/features/booking/useBookings'
import type { Booking } from '@/features/booking/useBookings'
import { useQueryClient } from '@tanstack/react-query'
import { useDateRangeFilter } from '@/hooks/useDateRangeFilter'
import AdminListView from '@/features/admin/AdminListView'
import ListDateNav from '@/features/players/calendar/ListDateNav'

/**
 * AdminCalendarPage - Admin-only calendar view
 * 
 * Displays:
 * - Player names + booking status on calendar cells (admin feature)
 * - Click booking to see full player details (name, phone, address)
 * - Create new bookings by clicking empty slots
 * - Edit/Cancel/Delete existing bookings
 */
export default function AdminCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<CalendarView>('week')
  const [displayMode, setDisplayMode] = useState<'calendar' | 'list'>('list')
  const dateRangeFilter = useDateRangeFilter()

  const calendarRange = useMemo(() => getCalendarViewRange(currentDate, view), [currentDate, view])
  const queryStartDate = displayMode === 'list'
    ? startOfDay(currentDate)
    : (dateRangeFilter.appliedRange?.startDate ?? calendarRange.startDate)
  const queryEndDate = displayMode === 'list'
    ? endOfDay(currentDate)
    : (dateRangeFilter.appliedRange?.endDate ?? calendarRange.endDate)

  // Fetch bookings WITH player names for admin view
  const { data: bookings = [], isLoading } = useBookings(queryStartDate, queryEndDate, true)
  const { mutateAsync: updateBooking } = useUpdateBooking()
  const queryClient = useQueryClient()

  const [activeBooking, setActiveBooking] = useState<Booking | null>(null)
  
  const [isBookingFormOpen, setIsBookingFormOpen] = useState(false)
  const [selectedSlotHour, setSelectedSlotHour] = useState<Date | undefined>(undefined)
  
  const handleSlotClick = (hour: Date, booking?: Booking) => {
    if (booking) {
      setActiveBooking(booking)
    } else {
      setSelectedSlotHour(hour)
      setIsBookingFormOpen(true)
    }
  }

  const handleApplyRange = () => {
    const applied = dateRangeFilter.applyRange()
    if (applied) {
      setCurrentDate(applied.startDate)
    }
  }

  const handleClearRange = () => {
    dateRangeFilter.clearRange()
  }

  return (
    <div className="space-y-3">
      {/* List / Calendar toggle */}
      <div className="flex justify-end">
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

      {displayMode === 'list' ? (
        <div className="space-y-3">
          <ListDateNav value={currentDate} onChange={setCurrentDate} />
          <AdminListView
            currentDate={currentDate}
            bookings={bookings}
            onBookingClick={(b) => setActiveBooking(b)}
            onAvailableSlotClick={(d) => { setSelectedSlotHour(d); setIsBookingFormOpen(true) }}
            onAddBooking={(d) => { setSelectedSlotHour(d); setIsBookingFormOpen(true) }}
          />
        </div>
      ) : (
        <>
          <DateRangeFilter
            startValue={dateRangeFilter.startInput}
            endValue={dateRangeFilter.endInput}
            onStartChange={dateRangeFilter.setStartInput}
            onEndChange={dateRangeFilter.setEndInput}
            canApply={dateRangeFilter.canApply}
            isActive={dateRangeFilter.isActive}
            error={dateRangeFilter.validationError}
            onApply={handleApplyRange}
            onClear={handleClearRange}
          />

          {isLoading ? (
            <div className="animate-pulse bg-gray-200 h-[600px] w-full rounded-lg"></div>
          ) : (
            <>
              {dateRangeFilter.isActive && bookings.length === 0 ? (
                <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                  No bookings found in the selected date range. Try expanding the range or clear filters.
                </div>
              ) : null}

              <CalendarContainer
                currentDate={currentDate}
                view={view}
                onDateChange={setCurrentDate}
                onViewChange={setView}
                bookings={bookings}
                onSlotClick={handleSlotClick}
                isAdmin={true}
                readOnly={false}
              />
            </>
          )}
        </>
      )}

      {activeBooking && (
        <BookingDetailsModal
          booking={activeBooking}
          isOpen={true}
          isAdmin={true}
          onClose={() => setActiveBooking(null)}
          onSave={(payload) => updateBooking(payload)}
        />
      )}

      {isBookingFormOpen && (
        <BookingForm
          initialDate={currentDate}
          initialStartTime={selectedSlotHour}
          onClose={() => setIsBookingFormOpen(false)}
          onSuccess={() => {
            setIsBookingFormOpen(false)
            queryClient.invalidateQueries({ queryKey: ['bookings'] })
          }}
        />
      )}
    </div>
  )
}
