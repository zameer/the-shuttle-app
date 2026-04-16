import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import StatusBadge from '@/components/shared/StatusBadge'
import { Badge } from '@/components/ui/badge'
import type { Booking } from '@/features/booking/useBookings'
import { getPaymentStatusBadgeVariant, getPaymentStatusLabel, normalizePaymentStatus } from '@/features/booking/paymentStatus'

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
  const paymentStatus = normalizePaymentStatus(booking.payment_status)
  const paymentLabel = getPaymentStatusLabel(paymentStatus)

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
        'min-h-[44px] rounded-sm px-2 py-2 text-xs sm:text-sm md:px-3 md:py-3 lg:px-4 lg:py-4 truncate transition-colors',
        readOnly ? 'cursor-default' : 'cursor-pointer',
        !readOnly && colorClass.split(' ').filter(c => !c.startsWith('hover:')).join(' '),
        !readOnly && colorClass,
        className
      )}
    >
      <div className="flex items-start gap-1.5 flex-col md:flex-row md:items-center">
        {/* Time */}
        <span className="font-semibold whitespace-nowrap">
          {format(new Date(booking.start_time), 'HH:mm')}
        </span>

        {/* Status + Name (if admin) */}
        <div className="hidden md:flex items-center gap-1">
          <StatusBadge
            status={booking.status}
            playerName={isAdmin ? booking.player_name : undefined}
            isAdmin={isAdmin}
            variant="inline"
          />
          
          {/* US3: Payment status badge (admin only) */}
          {isAdmin && (
            <Badge
              variant={getPaymentStatusBadgeVariant(paymentStatus)}
              className="text-[10px] px-1.5 py-0"
            >
              {paymentLabel}
            </Badge>
          )}
        </div>
      </div>

      {/* Mobile: Show name + status on separate lines */}
      <div className="md:hidden">
        {isAdmin && booking.player_name && (
          <div className="text-xs font-medium text-gray-900 truncate">
            {booking.player_name}
          </div>
        )}
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-xs font-semibold">
            {booking.status === 'CONFIRMED'
              ? 'Reserved'
              : booking.status === 'PENDING'
              ? 'Pending'
              : booking.status === 'UNAVAILABLE'
              ? 'Unavailable'
              : 'Open'}
          </span>
          
          {/* US3: Payment status badge (admin only, mobile) */}
          {isAdmin && (
            <Badge
              variant={getPaymentStatusBadgeVariant(paymentStatus)}
              className="text-[10px] px-1.5 py-0"
            >
              {paymentLabel}
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}
