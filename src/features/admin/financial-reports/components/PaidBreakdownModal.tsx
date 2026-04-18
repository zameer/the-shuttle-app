import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { FinancialSummary, PaymentBreakdownEntry } from '../types'

interface PaidBreakdownModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entries: PaymentBreakdownEntry[]
  currentPage: number
  pageSize: number
  onPageChange: (page: number) => void
  summary: FinancialSummary
}

export default function PaidBreakdownModal({
  open,
  onOpenChange,
  entries,
  currentPage,
  pageSize,
  onPageChange,
  summary,
}: PaidBreakdownModalProps) {
  const totalPages = Math.max(1, Math.ceil(entries.length / pageSize))
  const safePage = Math.min(Math.max(currentPage, 1), totalPages)
  const startIndex = (safePage - 1) * pageSize
  const pagedEntries = entries.slice(startIndex, startIndex + pageSize)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-[min(56rem,calc(100%-1.5rem))] overflow-hidden p-0 sm:max-w-3xl" showCloseButton>
        <DialogHeader className="border-b px-4 pt-4 pb-3 sm:px-6">
          <DialogTitle>Paid Breakdown</DialogTitle>
          <DialogDescription>
            {entries.length > 0
              ? `Page ${safePage} of ${totalPages}. Paid totals remain aligned with the report summary.`
              : 'No paid entries were found for the selected date range.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto px-4 py-4 sm:px-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-lg border bg-muted/30 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Paid Amount</p>
              <p className="mt-1 text-lg font-semibold text-foreground">LKR {summary.paidAmount.toLocaleString()}</p>
            </div>
            <div className="rounded-lg border bg-muted/30 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Paid Hours</p>
              <p className="mt-1 text-lg font-semibold text-foreground">{summary.paidHours.toFixed(2)} hrs</p>
            </div>
          </div>

          {pagedEntries.length === 0 ? (
            <div className="rounded-lg border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
              There are no paid entries to review for this date range.
            </div>
          ) : (
            <div className="space-y-3">
              {pagedEntries.map((entry, index) => (
                <div
                  key={`${entry.playerPhoneNumber ?? 'unknown'}-${startIndex + index}`}
                  className="rounded-lg border px-4 py-3"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{entry.playerName ?? 'Unknown Player'}</p>
                      <p className="text-xs text-muted-foreground">{entry.playerPhoneNumber ?? 'No phone on record'}</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-sm font-semibold text-foreground">LKR {entry.totalAmount.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">
                        {entry.totalHours.toFixed(2)} hrs • {entry.bookingCount} bookings
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="items-center justify-between gap-3 sm:flex-row sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {entries.length > 0
              ? `Showing ${startIndex + 1}-${Math.min(startIndex + pagedEntries.length, entries.length)} of ${entries.length} paid entries.`
              : '0 paid entries'}
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => onPageChange(safePage - 1)}
              disabled={safePage === 1 || entries.length === 0}
            >
              Previous
            </Button>
            <span className="min-w-20 text-center text-sm text-muted-foreground">
              {entries.length > 0 ? `${safePage} / ${totalPages}` : '0 / 0'}
            </span>
            <Button
              variant="outline"
              onClick={() => onPageChange(safePage + 1)}
              disabled={safePage === totalPages || entries.length === 0}
            >
              Next
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}