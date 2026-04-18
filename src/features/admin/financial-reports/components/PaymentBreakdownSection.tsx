import { Button } from '@/components/ui/button'

interface PaymentBreakdownSectionProps {
  paidEntryCount: number
  onOpenPaidBreakdown: () => void
}

export default function PaymentBreakdownSection({ paidEntryCount, onOpenPaidBreakdown }: PaymentBreakdownSectionProps) {
  return (
    <section className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-green-700">Paid Breakdown</h3>
          <p className="text-sm text-gray-600">
            Review paid entries in a dedicated modal without crowding the main report.
          </p>
          <p className="text-xs text-gray-500">
            {paidEntryCount > 0
              ? `${paidEntryCount} paid ${paidEntryCount === 1 ? 'entry' : 'entries'} available for review.`
              : 'No paid entries were found for the selected date range.'}
          </p>
        </div>

        <Button variant="outline" onClick={onOpenPaidBreakdown}>
          View Paid Details
        </Button>
      </div>
    </section>
  )
}
