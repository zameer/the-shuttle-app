import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSearchParams } from 'react-router-dom'
import { format, parseISO, startOfMonth } from 'date-fns'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePaidDetail } from '../usePaidDetail'
import { paidDetailSearchParamsSchema } from '../schemas'
import type { DetailStatusScope, OutstandingBookingStatus, PaidDetailDraftFilters, PaidDetailFilterInput } from '../types'
import PaidDetailStatusBadge from './PaidDetailStatusBadge'

const PAGE_SIZE = 15
const DEFAULT_OUTSTANDING_STATUSES: OutstandingBookingStatus[] = ['CONFIRMED', 'CANCELLED', 'NO_SHOW']

function todayString(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

function startOfMonthString(): string {
  return format(startOfMonth(new Date()), 'yyyy-MM-dd')
}

function SummaryCard({ title, value, subtitle }: { title: string; value: string; subtitle: string }) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{title}</p>
      <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{subtitle}</p>
    </div>
  )
}

export default function PaidDetailPage() {
  const [searchParams] = useSearchParams()

  const parsed = paidDetailSearchParamsSchema.safeParse({
    start: searchParams.get('start') ?? undefined,
    end: searchParams.get('end') ?? undefined,
  })

  const initialStart = parsed.success && parsed.data.start ? parsed.data.start : startOfMonthString()
  const initialEnd = parsed.success && parsed.data.end ? parsed.data.end : todayString()

  const [draftFilters, setDraftFilters] = useState<PaidDetailDraftFilters>({
    startDate: initialStart,
    endDate: initialEnd,
    scope: 'PAID',
    outstandingStatuses: DEFAULT_OUTSTANDING_STATUSES,
  })
  const [appliedFilters, setAppliedFilters] = useState<PaidDetailFilterInput | null>(null)
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const { data, isLoading, error } = usePaidDetail(
    appliedFilters ?? { startDate: initialStart, endDate: initialEnd, scope: 'PAID', outstandingStatuses: DEFAULT_OUTSTANDING_STATUSES },
    hasLoadedOnce,
  )

  const rows = data?.rows ?? []
  const summary = data?.summary

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const safePage = Math.min(Math.max(currentPage, 1), totalPages)
  const startIndex = (safePage - 1) * PAGE_SIZE
  const endIndex = Math.min(startIndex + PAGE_SIZE, rows.length)
  const pagedRows = rows.slice(startIndex, endIndex)

  function handleStartChange(value: string) {
    setDraftFilters((prev) => ({ ...prev, startDate: value }))
  }

  function handleEndChange(value: string) {
    setDraftFilters((prev) => ({ ...prev, endDate: value }))
  }

  function handleScopeChange(value: DetailStatusScope) {
    setDraftFilters((prev) => ({ ...prev, scope: value }))
  }

  function toggleOutstandingStatus(status: OutstandingBookingStatus) {
    setDraftFilters((prev) => {
      const next = prev.outstandingStatuses.includes(status)
        ? prev.outstandingStatuses.filter((s) => s !== status)
        : [...prev.outstandingStatuses, status]
      if (next.length === 0) return prev
      return { ...prev, outstandingStatuses: next }
    })
  }

  function handleLoadDetails() {
    setAppliedFilters({ ...draftFilters })
    setHasLoadedOnce(true)
    setCurrentPage(1)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/admin/reports">← Back to Reports</Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Paid Booking Detail</h2>
          <p className="text-sm text-gray-500">Individual paid bookings for the selected period.</p>
        </div>
      </div>

      {/* Date range and scope filter */}
      <section className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-sm font-medium text-gray-700">
            Start Date
            <input
              type="date"
              value={draftFilters.startDate}
              onChange={(e) => handleStartChange(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </label>

          <label className="text-sm font-medium text-gray-700">
            End Date
            <input
              type="date"
              value={draftFilters.endDate}
              onChange={(e) => handleEndChange(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </label>

          <label className="text-sm font-medium text-gray-700">
            Scope
            <select
              value={draftFilters.scope}
              onChange={(e) => handleScopeChange(e.target.value as DetailStatusScope)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="PAID">PAID</option>
              <option value="OUTSTANDING">OUTSTANDING</option>
            </select>
          </label>

          <div className="flex items-end">
            <Button type="button" className="w-full" onClick={handleLoadDetails}>
              Load Details
            </Button>
          </div>
        </div>

        {draftFilters.scope === 'OUTSTANDING' && (
          <div className="mt-3 rounded-md border border-amber-100 bg-amber-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Outstanding booking status filter</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {DEFAULT_OUTSTANDING_STATUSES.map((status) => {
                const selected = draftFilters.outstandingStatuses.includes(status)

                return (
                  <Button
                    key={status}
                    type="button"
                    size="sm"
                    variant={selected ? 'default' : 'outline'}
                    onClick={() => toggleOutstandingStatus(status)}
                  >
                    {status}
                  </Button>
                )
              })}
            </div>
            <p className="mt-2 text-xs text-amber-700">At least one status must remain selected.</p>
          </div>
        )}
      </section>

      {/* Pre-load guidance */}
      {!hasLoadedOnce && (
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-6 text-center text-sm text-blue-700">
          Set your filters above and click <strong>Load Details</strong> to view booking records.
        </div>
      )}

      {/* Summary cards — shown only after first load */}
      {hasLoadedOnce && summary && (
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <SummaryCard
            title={draftFilters.scope === 'PAID' ? 'Paid Amount' : 'Outstanding Amount'}
            value={`LKR ${summary.totalAmount.toLocaleString()}`}
            subtitle={`${summary.totalHours.toFixed(2)} ${appliedFilters?.scope === 'PAID' ? 'paid' : 'outstanding'} hours`}
          />
          <SummaryCard
            title={appliedFilters?.scope === 'PAID' ? 'Paid Hours' : 'Outstanding Hours'}
            value={`${summary.totalHours.toFixed(2)} hrs`}
            subtitle={appliedFilters?.scope === 'PAID' ? 'Total paid booking hours' : 'Total outstanding booking hours'}
          />
          <SummaryCard
            title="Bookings"
            value={String(summary.totalBookings)}
            subtitle={`individual ${appliedFilters?.scope === 'PAID' ? 'paid' : 'outstanding'} bookings`}
          />
        </section>
      )}

      {/* Loading / Error / Table — shown only after first load */}
      {hasLoadedOnce && (
        isLoading ? (
          <div className="flex items-center justify-center rounded-xl border bg-white p-12 shadow-sm">
            <Loader2 className="h-7 w-7 animate-spin text-blue-500" />
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error instanceof Error ? error.message : 'Failed to load paid detail'}
          </div>
        ) : (
          <section className="rounded-xl border bg-white overflow-x-auto shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Player</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Confirmation</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {pagedRows.map((row) => (
                  <tr key={row.bookingId} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      {format(parseISO(row.slotStart), 'dd MMM yyyy')}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {format(parseISO(row.slotStart), 'HH:mm')}
                      {' – '}
                      {format(parseISO(row.slotEnd), 'HH:mm')}
                    </td>
                    <td className="px-4 py-3">{row.playerName ?? '—'}</td>
                    <td className="px-4 py-3">{row.playerPhoneNumber ?? '—'}</td>
                    <td className="px-4 py-3">
                      <PaidDetailStatusBadge type="booking" status={row.bookingStatus} />
                    </td>
                    <td className="px-4 py-3">
                      <PaidDetailStatusBadge type="payment" status={row.paymentBucket} />
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      LKR {row.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {rows.length === 0 && !isLoading && (
              <div className="py-12 text-center text-sm text-muted-foreground">
                {appliedFilters?.scope === 'PAID'
                  ? 'No paid bookings for this period.'
                  : 'No outstanding bookings for this period and selected statuses.'}
              </div>
            )}
          </section>
        )
      )}

      {/* Pagination — shown only after first load */}
      {hasLoadedOnce && rows.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Showing {startIndex + 1}–{endIndex} of {rows.length} {appliedFilters?.scope === 'PAID' ? 'paid' : 'outstanding'} bookings
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Previous
            </Button>
            <span className="px-2 py-1 text-xs text-gray-600">
              {safePage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
