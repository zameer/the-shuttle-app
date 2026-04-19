import { format, parseISO, isValid, addDays, isSameDay, isBefore } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ListDateNavProps {
  value: Date
  onChange: (date: Date) => void
  minDate?: Date
}

export default function ListDateNav({ value, onChange, minDate }: ListDateNavProps) {
  const isPrevDisabled = minDate ? (isSameDay(value, minDate) || isBefore(value, minDate)) : false

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseISO(e.target.value)
    if (!isValid(parsed)) { onChange(new Date()); return }
    if (minDate && isBefore(parsed, minDate)) { onChange(minDate); return }
    onChange(parsed)
  }

  return (
    <div className="flex items-center gap-1 w-full mb-3">
      <button
        type="button"
        aria-label="Previous day"
        aria-disabled={isPrevDisabled}
        onClick={() => { if (!isPrevDisabled) onChange(addDays(value, -1)) }}
        disabled={isPrevDisabled}
        className="shrink-0 flex items-center justify-center min-w-[44px] min-h-[44px] rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <div className="flex-1 min-w-0 flex flex-col items-center">
        <span className="text-sm font-semibold text-gray-800 truncate w-full text-center">
          {format(value, 'EEEE, d MMMM yyyy')}
        </span>
        <input
          type="date"
          value={format(value, 'yyyy-MM-dd')}
          onChange={handleInputChange}
          aria-label="Select date"
          min={minDate ? format(minDate, 'yyyy-MM-dd') : undefined}
          className="mt-0.5 text-xs text-gray-500 border-0 bg-transparent cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
        />
      </div>

      <button
        type="button"
        aria-label="Next day"
        onClick={() => onChange(addDays(value, 1))}
        className="shrink-0 flex items-center justify-center min-w-[44px] min-h-[44px] rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}
