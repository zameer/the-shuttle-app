import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import StatusBadge from '@/components/shared/StatusBadge'
import type { Booking } from '@/features/booking/useBookings'

interface CalendarSlotProps {
  booking: Booking
  isAdmin?: boolean
  readOnly?: boolean
  onClick?: () => void
  className?: string
}

/**
 * CalendarSlot - Renders a booking cell for calendar views
 * 
 * Displays:
 * - Time (HH:mm format)
 * - Status badge with conditional player name
 * - Responsive styling for mobile/desktop
 * 
 * @param booking - The booking object with time, status, player_name
 * @param isAdmin - If true, shows player name on the status badge
 * @param readOnly - If true, removes hover effects and cursor pointer
 * @param onClick - Click handler (only active if not readOnly and not UNAVAILABLE)
 * @param className - Additional Tailwind classes
 * 
 * @example
 * // Admin view with click handler
 * <CalendarSlot
 *   booking={booking}
 *   isAdmin={true}
 *   onClick={() => setActiveBooking(booking)}
 * />
 * 
 * @example
 * // Public view - read-only
 * <CalendarSlot
 *   booking={booking}
 *   isAdmin={false}
 *   readOnly={true}
 * />
 */
export default function CalendarSlot({
  booking,
  isAdmin = false,
  readOnly = false,
  onClick,
  className,
}: CalendarSlotProps) {
  const handleClick = () => {
    // Don't click unavailable slots in read-only mode
    if (readOnly && booking.status === 'UNAVAILABLE') return
    onClick?.()
  }

  const statusColors = {
    CONFIRMED: 'bg-green-100 text-green-800 hover:bg-green-200',
    PENDING: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
    UNAVAILABLE: 'bg-gray-200 text-gray-600 hover:bg-gray-300',
    default: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  }

  const colorClass = statusColors[booking.status as keyof typeof statusColors] || statusColors.default

  return (
    <div
      onClick={handleClick}
      className={cn(
        'text-xs px-1.5 py-0.5 rounded-sm truncate transition-colors',
        readOnly ? 'cursor-default' : 'cursor-pointer',
        !readOnly && colorClass.split(' ').filter(c => !c.startsWith('hover:')).join(' '),
        !readOnly && colorClass,
        className
      )}
    >
      <div className="flex items-center gap-1 flex-col md:flex-row">
        {/* Time */}
        <span className="font-semibold whitespace-nowrap">
          {format(new Date(booking.start_time), 'HH:mm')}
        </span>

        {/* Status + Name (if admin) */}
        <div className="hidden md:block">
          <StatusBadge
            status={booking.status}
            playerName={isAdmin ? booking.player_name : undefined}
            isAdmin={isAdmin}
            variant="inline"
          />
        </div>
      </div>

      {/* Mobile: Show name + status on separate lines */}
      <div className="md:hidden">
        {isAdmin && booking.player_name && (
          <div className="text-xs font-medium text-gray-900 truncate">
            {booking.player_name}
          </div>
        )}
        <div className="text-xs font-semibold">
          {booking.status === 'CONFIRMED'
            ? 'Reserved'
            : booking.status === 'PENDING'
            ? 'Pending'
            : booking.status === 'UNAVAILABLE'
            ? 'Unavailable'
            : 'Open'}
        </div>
      </div>
    </div>
  )
}
