interface RevenueImpactSectionProps {
  noShow: {
    lostHours: number
    lostAmount: number
    bookingCount: number
  }
  cancelled: {
    lostHours: number
    lostAmount: number
    bookingCount: number
  }
  fallbackAmountCount: number
}

function ImpactCard({
  label,
  value,
  hours,
  count,
}: {
  label: string
  value: number
  hours: number
  count: number
}) {
  return (
    <div className="rounded-lg border bg-gray-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">{label}</p>
      <p className="mt-1 text-lg font-semibold text-gray-900">LKR {value.toLocaleString()}</p>
      <p className="text-xs text-gray-500">{hours.toFixed(2)} hrs • {count} bookings</p>
    </div>
  )
}

export default function RevenueImpactSection({ noShow, cancelled, fallbackAmountCount }: RevenueImpactSectionProps) {
  return (
    <section className="rounded-xl border bg-white p-4 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-rose-700">No-Show / Cancellation Revenue Impact</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <ImpactCard label="No Show" value={noShow.lostAmount} hours={noShow.lostHours} count={noShow.bookingCount} />
        <ImpactCard label="Cancelled" value={cancelled.lostAmount} hours={cancelled.lostHours} count={cancelled.bookingCount} />
      </div>
      <p className="mt-3 text-xs text-gray-500">Fallback amount records: {fallbackAmountCount}</p>
    </section>
  )
}
