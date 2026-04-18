import { useMemo, useState } from 'react'
import { format, startOfMonth } from 'date-fns'
import { Loader2 } from 'lucide-react'
import { useFinancialReport } from '@/features/admin/financial-reports/useFinancialReport'
import PaymentBreakdownSection from '@/features/admin/financial-reports/components/PaymentBreakdownSection'
import OutstandingPendingSection from '@/features/admin/financial-reports/components/OutstandingPendingSection'
import RevenueImpactSection from '@/features/admin/financial-reports/components/RevenueImpactSection'

function SummaryCard({ title, value, subtitle }: { title: string; value: string; subtitle: string }) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{title}</p>
      <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{subtitle}</p>
    </div>
  )
}

export default function AdminFinancialReportsPage() {
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'))
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'))

  const reportInput = useMemo(() => ({ startDate, endDate }), [startDate, endDate])
  const { data: report, isLoading, error } = useFinancialReport(reportInput)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Admin Financial Reports</h2>
        <p className="text-sm text-gray-500">Date-range financial report across all players. Player selection is not required.</p>
      </div>

      <section className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className="text-sm font-medium text-gray-700">
            Start Date
            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </label>

          <label className="text-sm font-medium text-gray-700">
            End Date
            <input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </label>

          <div className="rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-700">
            All players are included by default for this report.
          </div>
        </div>
      </section>

      {isLoading ? (
        <div className="flex items-center justify-center rounded-xl border bg-white p-12 shadow-sm">
          <Loader2 className="h-7 w-7 animate-spin text-blue-500" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error instanceof Error ? error.message : 'Failed to load financial report'}
        </div>
      ) : report ? (
        <>
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard
              title="Paid Amount"
              value={`LKR ${report.summary.paidAmount.toLocaleString()}`}
              subtitle={`${report.summary.paidHours.toFixed(2)} paid hours`}
            />
            <SummaryCard
              title="Pending Amount"
              value={`LKR ${report.summary.pendingAmount.toLocaleString()}`}
              subtitle={`${report.summary.pendingHours.toFixed(2)} pending hours`}
            />
            <SummaryCard
              title="Paid Hours"
              value={report.summary.paidHours.toFixed(2)}
              subtitle="Total paid booking hours"
            />
            <SummaryCard
              title="Pending Hours"
              value={report.summary.pendingHours.toFixed(2)}
              subtitle="Total pending booking hours"
            />
          </section>

          <PaymentBreakdownSection
            paidEntries={report.breakdown.paidEntries}
            pendingEntries={report.breakdown.pendingEntries}
          />

          <OutstandingPendingSection
            players={report.outstandingPending.players}
            totalOutstandingAmount={report.outstandingPending.totalOutstandingAmount}
          />

          <RevenueImpactSection
            noShow={report.revenueLoss.noShow}
            cancelled={report.revenueLoss.cancelled}
            fallbackAmountCount={report.revenueLoss.fallbackAmountCount}
          />
        </>
      ) : (
        <div className="rounded-xl border bg-white p-4 text-sm text-gray-500">No report data available.</div>
      )}
    </div>
  )
}
