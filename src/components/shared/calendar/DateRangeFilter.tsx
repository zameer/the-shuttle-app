interface DateRangeFilterProps {
  startValue: string
  endValue: string
  onStartChange: (value: string) => void
  onEndChange: (value: string) => void
  onApply: () => void
  onClear: () => void
  canApply: boolean
  isActive: boolean
  error?: string | null
}

export default function DateRangeFilter({
  startValue,
  endValue,
  onStartChange,
  onEndChange,
  onApply,
  onClear,
  canApply,
  isActive,
  error,
}: DateRangeFilterProps) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="text-sm font-medium text-neutral-700">
            Start date
            <input
              type="date"
              value={startValue}
              onChange={(e) => onStartChange(e.target.value)}
              className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm"
            />
          </label>

          <label className="text-sm font-medium text-neutral-700">
            End date
            <input
              type="date"
              value={endValue}
              onChange={(e) => onEndChange(e.target.value)}
              className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm"
            />
          </label>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onApply}
            disabled={!canApply}
            className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            Apply
          </button>
          <button
            type="button"
            onClick={onClear}
            disabled={!isActive && !startValue && !endValue}
            className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Clear
          </button>
        </div>
      </div>

      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </div>
  )
}
