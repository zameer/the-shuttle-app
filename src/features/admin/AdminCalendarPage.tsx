import { useState, useMemo } from 'react'
import CalendarContainer from '@/components/shared/calendar/CalendarContainer'
import type { CalendarView } from '@/components/shared/calendar/CalendarContainer'
import BookingDetailsModal from '@/features/booking/BookingDetailsModal'
import BookingForm from '@/features/booking/BookingForm'
import { useBookings, useUpdateBookingStatus } from '@/features/booking/useBookings'
import type { Booking } from '@/features/booking/useBookings'
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'
import { useQueryClient } from '@tanstack/react-query'

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

  const { startDate, endDate } = useMemo(() => {
    if (view === 'month') {
      return { startDate: startOfMonth(currentDate), endDate: endOfMonth(currentDate) }
    }
    return { startDate: startOfWeek(currentDate), endDate: endOfWeek(currentDate) }
  }, [currentDate, view])

  // Fetch bookings WITH player names for admin view
  const { data: bookings = [], isLoading } = useBookings(startDate, endDate, true)
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

  return (
    <div>
      {isLoading ? (
        <div className="animate-pulse bg-gray-200 h-[600px] w-full rounded-lg"></div>
      ) : (
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
