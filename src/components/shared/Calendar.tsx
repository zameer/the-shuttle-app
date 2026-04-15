import type { Booking } from '@/features/booking/useBookings'
import { format, addHours, startOfDay } from 'date-fns'

interface CalendarProps {
  date: Date
  bookings: Booking[]
  onSlotClick?: (startTime: Date, booking?: Booking) => void
  readOnly?: boolean
}

export default function Calendar({ date, bookings, onSlotClick, readOnly = false }: CalendarProps) {
  // Generate hours for the day (e.g. 6 AM to 10 PM)
  const hours = Array.from({ length: 17 }, (_, i) => addHours(startOfDay(date), i + 6))

  const getSlotColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 border-green-500 text-green-800'
      case 'PENDING': return 'bg-yellow-100 border-yellow-500 text-yellow-800'
      case 'UNAVAILABLE': return 'bg-gray-200 border-gray-400 text-gray-500 opacity-70 cursor-not-allowed'
      default: return 'bg-white border-gray-200 text-gray-800 hover:bg-gray-50'
    }
  }

  const getSlotDetails = (hour: Date) => {
    const booking = bookings.find(b => {
      const bStart = new Date(b.start_time)
      const bEnd = new Date(b.end_time)
      // Check if this hour block falls within the booking period
      return hour >= bStart && hour < bEnd
    })
    
    if (!booking) return { status: 'AVAILABLE', booking: null }
    return { status: booking.status, booking }
  }

  return (
    <div className="w-full max-w-3xl border rounded-lg overflow-hidden bg-white shadow-sm">
      <div className="bg-gray-50 border-b px-4 py-3 flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">{format(date, 'EEEE, MMM do, yyyy')}</h3>
      </div>
      <div className="divide-y max-h-[600px] overflow-y-auto">
        {hours.map(hour => {
          const { status, booking } = getSlotDetails(hour)
          const colorClass = getSlotColor(status)

          return (
            <div 
              key={hour.toISOString()} 
              className={`flex items-stretch border-l-4 min-h-[60px] ${colorClass} ${!readOnly || status !== 'AVAILABLE' ? 'cursor-pointer' : ''}`}
              onClick={() => {
                if (readOnly) return;
                onSlotClick?.(hour, booking || undefined);
              }}
            >
              <div className="flex-none w-24 px-4 py-3 flex flex-col justify-center border-r font-medium text-sm border-r-gray-200/50">
                {format(hour, 'h:mm a')}
              </div>
              <div className="flex-1 px-4 py-3 flex flex-col justify-center">
                <div className="font-semibold">{status}</div>
                {booking && !readOnly && booking.player_phone_number && (
                  <div className="text-xs mt-1 opacity-80">
                    Player: {booking.player_phone_number} | Paid: {booking.payment_status || 'PENDING'}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
