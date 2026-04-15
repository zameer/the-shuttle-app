import { cn } from '@/lib/utils'
import type { BookingStatus } from '@/features/booking/useBookings'

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
 * @param status - Booking status (CONFIRMED, PENDING, UNAVAILABLE)
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
  // Map status to background color and text content
  const statusConfig = {
    CONFIRMED: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      label: 'Reserved',
    },
    PENDING: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      label: 'Pending',
    },
    UNAVAILABLE: {
      bg: 'bg-gray-200',
      text: 'text-gray-600',
      label: 'Unavailable',
    },
  }

  const config = status && statusConfig[status] ? statusConfig[status] : {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    label: 'Open',
  }

  // Inline variant: just status text
  if (variant === 'inline') {
    return (
      <div
        className={cn(
          'text-xs font-semibold px-2.5 py-1 rounded-full',
          config.bg,
          config.text,
          className
        )}
      >
        {config.label}
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
          config.bg,
          config.text
        )}
      >
        {config.label}
      </div>
    </div>
  )
}
