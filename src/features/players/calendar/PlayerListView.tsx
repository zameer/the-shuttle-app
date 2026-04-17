import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import type { Booking } from '@/features/booking/useBookings'
import { deriveSlotRows } from './deriveSlotRows'
import { useCourtSettings } from '@/features/admin/useCourtSettings'

interface PlayerListViewProps {
  currentDate: Date
  bookings: Booking[]
  readOnly: boolean
  isAdmin: boolean
  onSlotClick?: (date: Date, booking?: Booking) => void
}

const STATUS_STYLES: Record<string, string> = {
  CONFIRMED: 'bg-green-100 border-green-200 text-green-900',
  PENDING: 'bg-yellow-100 border-yellow-200 text-yellow-900',
  UNAVAILABLE: 'bg-gray-100 border-gray-200 text-gray-400',
  CANCELLED: 'bg-red-100 border-red-200 text-red-900',
  NO_SHOW: 'bg-orange-100 border-orange-200 text-orange-900',
  AVAILABLE: 'bg-blue-50 border-blue-200 text-blue-900',
}

const STATUS_DOT: Record<string, string> = {
  CONFIRMED: 'bg-green-500',
  PENDING: 'bg-yellow-500',
  UNAVAILABLE: 'bg-gray-400',
  CANCELLED: 'bg-red-500',
  NO_SHOW: 'bg-orange-500',
  AVAILABLE: 'bg-blue-400',
}

const STATUS_LABEL: Record<string, string> = {
  CONFIRMED: 'Reserved',
  PENDING: 'Pending',
  UNAVAILABLE: 'Unavailable',
  CANCELLED: 'Cancelled',
  NO_SHOW: 'No Show',
  AVAILABLE: 'Available',
}

export default function PlayerListView({
  currentDate,
  bookings,
  readOnly,
  onSlotClick,
}: PlayerListViewProps) {
  const { data: courtSettings } = useCourtSettings()
  const scheduleEndTime = courtSettings?.court_close_time
  const rows = deriveSlotRows(currentDate, bookings, scheduleEndTime)

  return (
    <ul
      role="list"
      aria-label="Time slot availability"
      className="w-full divide-y divide-gray-100"
    >
      {rows.map((row) => {
        const timeLabel = `${format(row.slotStart, 'h:mm a')} – ${format(row.slotEnd, 'h:mm a')}`
        const colorClass = STATUS_STYLES[row.status] ?? STATUS_STYLES.AVAILABLE
        const dotClass = STATUS_DOT[row.status] ?? STATUS_DOT.AVAILABLE
        const statusLabel = STATUS_LABEL[row.status] ?? row.status
        const interactive = !readOnly && row.actionable && !!onSlotClick

        const handleClick = () => {
          if (interactive) onSlotClick!(row.slotStart, row.booking)
        }

        const handleKeyDown = (e: React.KeyboardEvent) => {
          if (interactive && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault()
            onSlotClick!(row.slotStart, row.booking)
          }
        }

        return (
          <li
            key={`${row.type}-${row.slotStart.toISOString()}-${row.slotEnd.toISOString()}`}
            role="listitem"
            tabIndex={0}
            aria-disabled={!row.actionable}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            className={cn(
              'flex items-center gap-3 min-h-[44px] px-3 py-2.5 border rounded-md mb-1.5 transition-colors',
              colorClass,
              interactive && 'cursor-pointer hover:brightness-95',
              !interactive && 'cursor-default',
              'focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none'
            )}
          >
            <span className={cn('w-2 h-2 rounded-full shrink-0', dotClass)} aria-hidden="true" />
            <span className="text-sm font-medium w-36 shrink-0">{timeLabel}</span>
            <span className="text-xs font-semibold uppercase tracking-wide opacity-80">{statusLabel}</span>
          </li>
        )
      })}
    </ul>
  )
}
