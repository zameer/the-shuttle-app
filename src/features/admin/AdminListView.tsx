import { format, isBefore, startOfDay } from 'date-fns'
import { MoreVertical, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Booking } from '@/features/booking/useBookings'
import { deriveAdminListRows } from '@/features/admin/calendar/deriveAdminListRows'
import { BOOKING_STATUS_DOT_CLASS, BOOKING_STATUS_LABEL, BOOKING_STATUS_ROW_CLASS } from '@/features/booking/bookingStatusMeta'
import { useCourtSettings } from '@/features/admin/useCourtSettings'
import { getPaymentStatusLabel, getPaymentStatusPillClassName } from '@/features/booking/paymentStatus'

// Parse "HH:MM:SS" or "HH:MM" -> decimal hours (e.g. "22:30:00" -> 22.5)
function timeStrToHours(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h + (m || 0) / 60
}

interface AdminListViewProps {
  currentDate: Date
  bookings: Booking[]
  onBookingClick: (booking: Booking) => void
  onAvailableSlotClick: (date: Date) => void
  onAddBooking: (date: Date) => void
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) return `${mins} min`
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}min`
}

export default function AdminListView({
  currentDate,
  bookings,
  onBookingClick,
  onAvailableSlotClick,
  onAddBooking,
}: AdminListViewProps) {
  const { data: courtSettings } = useCourtSettings()
  const scheduleEndHour = courtSettings
    ? Math.ceil(timeStrToHours(courtSettings.court_close_time))
    : undefined
  const rows = deriveAdminListRows(currentDate, bookings, scheduleEndHour)
  const isPastDate = isBefore(startOfDay(currentDate), startOfDay(new Date()))

  return (
    <div className="space-y-2">
      {isPastDate && (
        <button
          type="button"
          onClick={() => onAddBooking(startOfDay(currentDate))}
          className="w-full flex items-center justify-center gap-2 min-h-[44px] rounded-lg border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Booking for this date
        </button>
      )}

      <ul role="list" aria-label="Time slot availability" className="w-full space-y-1">
      {rows.map((row, idx) => (
        <li
          key={idx}
          tabIndex={0}
          className={cn(
            'flex items-center gap-3 px-3 py-2 min-h-[44px] rounded-lg border',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
            BOOKING_STATUS_ROW_CLASS[row.status],
          )}
        >
          {/* Status dot */}
          <span
            className={cn('w-2 h-2 rounded-full shrink-0', BOOKING_STATUS_DOT_CLASS[row.status])}
            aria-hidden="true"
          />

          {/* Time range */}
          <span className="text-sm font-medium shrink-0">
            {format(row.slotStart, 'h:mm a')} – {format(row.slotEnd, 'h:mm a')}
          </span>

          {/* Duration */}
          <span className="text-xs opacity-60 shrink-0">{formatDuration(row.durationMinutes)}</span>

          {/* Player name badge (booking rows only) */}
          {row.type === 'booking' && row.playerName && (
            <span className="ml-1 rounded-full bg-white/60 px-2 py-0.5 text-xs font-medium truncate max-w-[120px]">
              {row.playerName}
            </span>
          )}

          {/* Payment status pill (booking rows only, hidden for UNKNOWN) */}
          {row.type === 'booking' && row.paymentStatus && row.paymentStatus !== 'UNKNOWN' && (
            <span
              className={cn(
                'shrink-0 rounded-full border px-2 py-0.5 text-xs',
                getPaymentStatusPillClassName(row.paymentStatus),
              )}
            >
              {getPaymentStatusLabel(row.paymentStatus)}
            </span>
          )}

          {/* "Available" label for gap rows */}
          {row.type === 'available' && (
            <span className="text-xs opacity-60">{BOOKING_STATUS_LABEL.AVAILABLE}</span>
          )}

          {/* Trailing action button */}
          {row.type === 'booking' ? (
            <button
              type="button"
              aria-label="Manage booking"
              onClick={(e) => {
                e.stopPropagation()
                onBookingClick(row.booking!)
              }}
              className="ml-auto shrink-0 flex items-center justify-center min-w-[44px] min-h-[44px] rounded-md text-gray-500 hover:text-gray-800 hover:bg-black/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              aria-label="Create booking at this slot"
              onClick={(e) => {
                e.stopPropagation()
                onAvailableSlotClick(row.slotStart)
              }}
              className="ml-auto shrink-0 flex items-center justify-center min-w-[44px] min-h-[44px] rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </li>
      ))}
      </ul>
    </div>
  )
}
