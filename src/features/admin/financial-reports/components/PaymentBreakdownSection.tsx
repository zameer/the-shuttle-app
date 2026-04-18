import type { PaymentBreakdownEntry } from '../types'

interface PaymentBreakdownSectionProps {
  paidEntries: PaymentBreakdownEntry[]
  pendingEntries: PaymentBreakdownEntry[]
}

function renderRows(entries: PaymentBreakdownEntry[]) {
  if (entries.length === 0) {
    return <p className="text-sm text-gray-500">No entries in this section.</p>
  }

  return (
    <div className="space-y-2">
      {entries.map((entry, index) => (
        <div key={`${entry.playerPhoneNumber ?? 'unknown'}-${index}`} className="rounded-lg border px-3 py-2">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900">{entry.playerName ?? 'Unknown Player'}</p>
              <p className="text-xs text-gray-500">{entry.playerPhoneNumber ?? 'No phone on record'}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">LKR {entry.totalAmount.toLocaleString()}</p>
              <p className="text-xs text-gray-500">{entry.totalHours.toFixed(2)} hrs • {entry.bookingCount} bookings</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function PaymentBreakdownSection({ paidEntries, pendingEntries }: PaymentBreakdownSectionProps) {
  return (
    <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-green-700">Paid Breakdown</h3>
        {renderRows(paidEntries)}
      </div>

      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-amber-700">Pending Breakdown</h3>
        {renderRows(pendingEntries)}
      </div>
    </section>
  )
}
