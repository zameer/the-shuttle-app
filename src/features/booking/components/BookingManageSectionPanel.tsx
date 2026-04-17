import type { KeyboardEvent, ReactNode } from 'react'
import { ChevronDown, Clock3, ShieldAlert, Wallet } from 'lucide-react'

type IconKey = 'clock' | 'wallet' | 'shield'

interface Props {
  id: string
  title: string
  icon: IconKey
  expanded: boolean
  onToggle: () => void
  shouldRenderContent: boolean
  children: ReactNode
}

function SectionIcon({ icon }: { icon: IconKey }) {
  if (icon === 'clock') return <Clock3 size={16} className="text-blue-600" />
  if (icon === 'wallet') return <Wallet size={16} className="text-blue-600" />
  return <ShieldAlert size={16} className="text-blue-600" />
}

export default function BookingManageSectionPanel({
  id,
  title,
  icon,
  expanded,
  onToggle,
  shouldRenderContent,
  children,
}: Props) {
  const contentId = `${id}-content`
  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onToggle()
    }
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white">
      <button
        type="button"
        id={`${id}-trigger`}
        aria-expanded={expanded}
        aria-controls={contentId}
        onClick={onToggle}
        onKeyDown={handleKeyDown}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <span className="flex items-center gap-2">
          <SectionIcon icon={icon} />
          <span className="text-sm font-semibold text-slate-900">{title}</span>
        </span>
        <ChevronDown
          size={16}
          className={`text-slate-500 transition-transform ${expanded ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {shouldRenderContent && (
        <div id={contentId} role="region" aria-labelledby={`${id}-trigger`} className={`${expanded ? 'block' : 'hidden'} px-4 pb-4`}>
          {children}
        </div>
      )}
    </section>
  )
}
