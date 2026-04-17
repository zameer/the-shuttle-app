import { cn } from '@/lib/utils'
import type { BookingStatus } from '@/features/booking/useBookings'
import { BOOKING_STATUS_BADGE_CLASS, BOOKING_STATUS_LABEL } from '@/features/booking/bookingStatusMeta'

interface StatusBadgeProps {
  status: BookingStatus | null
  playerName?: string | null
  isAdmin?: boolean
  variant?: 'inline' | 'block'
  className?: string
}

/**
 * StatusBadge - Displays booking status with optional player name (admin only)
 * 
 * @param status - Booking status (CONFIRMED, PENDING, UNAVAILABLE, CANCELLED, NO_SHOW)
 * @param playerName - Player name to display (only shown if isAdmin && variant='block')
 * @param isAdmin - If true, displays player name on separate line
 * @param variant - 'inline' (status text) or 'block' (name on first line, status on second)
 * @param className - Additional Tailwind classes
 * 
 * @example
 * // Admin view: Shows "John Smith" then "Reserved"
 * <StatusBadge status="CONFIRMED" playerName="John Smith" isAdmin variant="block" />
 * 
 * @example
 * // Public view: Shows "Reserved" only
 * <StatusBadge status="CONFIRMED" variant="inline" />
 */
export default function StatusBadge({
  status,
  playerName,
  isAdmin = false,
  variant = 'inline',
  className,
}: StatusBadgeProps) {
  const statusKey = status ?? 'AVAILABLE'
  const badgeClasses = BOOKING_STATUS_BADGE_CLASS[statusKey]
  const label = BOOKING_STATUS_LABEL[statusKey]

  // Inline variant: just status text
  if (variant === 'inline') {
    return (
      <div
        className={cn(
          'text-xs font-semibold px-2.5 py-1 rounded-full',
          badgeClasses,
          className
        )}
      >
        {label}
      </div>
    )
  }

  // Block variant: player name (admin) + status
  return (
    <div className={cn('flex flex-col gap-0.5', className)}>
      {isAdmin && playerName && (
        <div className="text-xs font-medium text-gray-900 truncate">
          {playerName}
        </div>
      )}
      <div
        className={cn(
          'text-xs font-semibold px-2.5 py-1 rounded-full w-fit',
          badgeClasses
        )}
      >
        {label}
      </div>
    </div>
  )
}
