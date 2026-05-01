import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSearchParams } from 'react-router-dom'
import { format, parseISO, startOfMonth } from 'date-fns'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePaidDetail } from '../usePaidDetail'
import { paidDetailSearchParamsSchema } from '../schemas'
import PaidDetailStatusBadge from './PaidDetailStatusBadge'

const PAGE_SIZE = 15

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

  const [startDate, setStartDate] = useState(initialStart)
  const [endDate, setEndDate] = useState(initialEnd)
  const [currentPage, setCurrentPage] = useState(1)

  const { data, isLoading, error } = usePaidDetail({ startDate, endDate })

  const rows = data?.rows ?? []
  const summary = data?.summary

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const safePage = Math.min(Math.max(currentPage, 1), totalPages)
  const startIndex = (safePage - 1) * PAGE_SIZE
  const endIndex = Math.min(startIndex + PAGE_SIZE, rows.length)
  const pagedRows = rows.slice(startIndex, endIndex)

  function handleStartChange(value: string) {
    setStartDate(value)
    setCurrentPage(1)
  }

  function handleEndChange(value: string) {
    setEndDate(value)
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

      {/* Date range filter */}
      <section className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className="text-sm font-medium text-gray-700">
            Start Date
            <input
              type="date"
              value={startDate}
              onChange={(e) => handleStartChange(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </label>

          <label className="text-sm font-medium text-gray-700">
            End Date
            <input
              type="date"
              value={endDate}
              onChange={(e) => handleEndChange(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </label>

          <div className="rounded-md border border-green-100 bg-green-50 px-3 py-2 text-xs text-green-700 flex items-center">
            Showing individual paid bookings only. All players included.
          </div>
        </div>
      </section>

      {/* Summary cards */}
      {summary && (
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <SummaryCard
            title="Paid Amount"
            value={`LKR ${summary.totalAmount.toLocaleString()}`}
            subtitle={`${summary.totalHours.toFixed(2)} paid hours`}
          />
          <SummaryCard
            title="Paid Hours"
            value={`${summary.totalHours.toFixed(2)} hrs`}
            subtitle="Total paid booking hours"
          />
          <SummaryCard
            title="Bookings"
            value={String(summary.totalBookings)}
            subtitle="individual paid bookings"
          />
        </section>
      )}

      {/* Loading / Error / Table */}
      {isLoading ? (
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
              No paid bookings for this period.
            </div>
          )}
        </section>
      )}

      {/* Pagination */}
      {rows.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Showing {startIndex + 1}–{endIndex} of {rows.length} paid bookings
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
