import { format } from 'date-fns'
import type { OutstandingPendingPlayerRecord } from '../types'

interface OutstandingPendingSectionProps {
  players: OutstandingPendingPlayerRecord[]
  totalOutstandingAmount: number
}

export default function OutstandingPendingSection({
  players,
  totalOutstandingAmount,
}: OutstandingPendingSectionProps) {
  return (
    <section className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-amber-700">Outstanding by Player</h3>
        <p className="text-sm font-semibold text-gray-900">Total Outstanding: LKR {totalOutstandingAmount.toLocaleString()}</p>
      </div>

      {players.length === 0 ? (
        <p className="text-sm text-gray-500">No pending bookings found for this date range.</p>
      ) : (
        <div className="space-y-3">
          {players.map((player, index) => (
            <details key={`${player.playerPhoneNumber ?? 'unknown'}-${index}`} className="rounded-lg border p-3">
              <summary className="cursor-pointer list-none">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{player.playerName ?? 'Unknown Player'}</p>
                    <p className="text-xs text-gray-500">{player.playerPhoneNumber ?? 'No phone on record'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">LKR {player.pendingAmount.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">{player.pendingHours.toFixed(2)} hrs • {player.slots.length} slots</p>
                  </div>
                </div>
              </summary>

              <div className="mt-3 space-y-2 border-t pt-3">
                {player.slots.map((slot) => (
                  <div key={slot.bookingId} className="rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-700">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <span>
                        {format(new Date(slot.startTime), 'dd MMM yyyy, h:mm a')} - {format(new Date(slot.endTime), 'h:mm a')}
                      </span>
                      <span className="font-semibold">LKR {slot.amount.toLocaleString()}</span>
                    </div>
                    <p className="mt-1 uppercase tracking-wide text-[11px] text-gray-500">{slot.status}</p>
                  </div>
                ))}
              </div>
            </details>
          ))}
        </div>
      )}
    </section>
  )
}
