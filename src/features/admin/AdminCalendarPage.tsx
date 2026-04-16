import { useState, useMemo } from 'react'
import CalendarContainer from '@/components/shared/calendar/CalendarContainer'
import DateRangeFilter from '@/components/shared/calendar/DateRangeFilter'
import { getCalendarViewRange } from '@/components/shared/calendar/range'
import type { CalendarView } from '@/components/shared/calendar/CalendarContainer'
import BookingDetailsModal from '@/features/booking/BookingDetailsModal'
import BookingForm from '@/features/booking/BookingForm'
import { useBookings, useUpdateBookingStatus } from '@/features/booking/useBookings'
import type { Booking } from '@/features/booking/useBookings'
import { useQueryClient } from '@tanstack/react-query'
import { useDateRangeFilter } from '@/hooks/useDateRangeFilter'

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
  const dateRangeFilter = useDateRangeFilter()

  const calendarRange = useMemo(() => getCalendarViewRange(currentDate, view), [currentDate, view])
  const queryStartDate = dateRangeFilter.appliedRange?.startDate ?? calendarRange.startDate
  const queryEndDate = dateRangeFilter.appliedRange?.endDate ?? calendarRange.endDate

  // Fetch bookings WITH player names for admin view
  const { data: bookings = [], isLoading } = useBookings(queryStartDate, queryEndDate, true)
  const { mutateAsync: updateStatus } = useUpdateBookingStatus()
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

      {activeBooking && (
        <BookingDetailsModal
          booking={activeBooking}
          isOpen={true}
          isAdmin={true}
          onClose={() => setActiveBooking(null)}
          onUpdateStatus={(id, status, payment_status) => updateStatus({ id, status, payment_status })}
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
