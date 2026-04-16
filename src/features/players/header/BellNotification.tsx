import { Bell } from 'lucide-react'
import { Popover } from '@base-ui/react/popover'
import type { Announcement } from './types'

export interface BellNotificationProps {
  announcements: Announcement[]
}

export default function BellNotification({ announcements }: BellNotificationProps) {
  const count = announcements.length
  const badgeLabel = count > 9 ? '9+' : String(count)

  return (
    <Popover.Root>
      <Popover.Trigger
        aria-label={count > 0 ? `Notifications — ${count} announcement${count > 1 ? 's' : ''}` : 'Notifications'}
        className="relative flex items-center justify-center rounded-full p-1.5 text-white hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white transition-colors"
      >
        <Bell size={20} />
        {count > 0 && (
          <span
            aria-hidden="true"
            className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-0.5 text-[10px] font-bold leading-none text-white"
          >
            {badgeLabel}
          </span>
        )}
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Positioner side="bottom" align="end" sideOffset={8}>
          <Popover.Popup className="z-50 w-80 max-h-72 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg outline-none">
            <div className="p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Announcements
              </p>
              {count === 0 ? (
                <p className="text-sm text-gray-400">No announcements</p>
              ) : (
                <ul className="space-y-3">
                  {announcements.map((a) => (
                    <li key={a.id} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                      <p className="text-sm font-semibold text-gray-900">{a.title}</p>
                      <p className="text-xs text-gray-400 mb-1">{a.date}</p>
                      <p className="text-sm text-gray-700 leading-snug">{a.body}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}
