import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { format, startOfMonth } from 'date-fns'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { buildBalanceComputation, sumExpenses } from '@/features/admin/financial-reports/financialReportService'
import { expenseBalanceSearchParamsSchema, expenseFormSchema } from '@/features/admin/financial-reports/schemas'
import { useExpenses } from '@/features/admin/financial-reports/useExpenses'
import { useFinancialReport } from '@/features/admin/financial-reports/useFinancialReport'

interface FormErrors {
  date?: string
  description?: string
  amount?: string
}

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

export default function ExpenseBalancePage() {
  const [searchParams] = useSearchParams()
  const parsedSearchParams = expenseBalanceSearchParamsSchema.safeParse({
    start: searchParams.get('start') ?? undefined,
    end: searchParams.get('end') ?? undefined,
  })

  const initialStartDate = parsedSearchParams.success && parsedSearchParams.data.start
    ? parsedSearchParams.data.start
    : startOfMonthString()
  const initialEndDate = parsedSearchParams.success && parsedSearchParams.data.end
    ? parsedSearchParams.data.end
    : todayString()

  const [startDate, setStartDate] = useState(initialStartDate)
  const [endDate, setEndDate] = useState(initialEndDate)
  const [date, setDate] = useState(initialEndDate)
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [calculationKey, setCalculationKey] = useState<string | null>(null)

  const { data: report, isLoading: isReportLoading, error: reportError } = useFinancialReport({ startDate, endDate })
  const { data: expenses = [], isLoading: isExpensesLoading, error: expensesError, createExpense } = useExpenses({ startDate, endDate })

  const totalExpenseAmount = useMemo(() => sumExpenses(expenses), [expenses])
  const currentKey = `${startDate}|${endDate}|${totalExpenseAmount}|${report?.summary.paidAmount ?? 0}`
  const hasCalculated = calculationKey === currentKey
  const balanceSummary = useMemo(
    () => buildBalanceComputation({ paidAmount: report?.summary.paidAmount ?? 0, expenseAmount: totalExpenseAmount }),
    [report?.summary.paidAmount, totalExpenseAmount],
  )

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitError(null)

    const parsedForm = expenseFormSchema.safeParse({
      date,
      description,
      amount: Number(amount),
    })

    if (!parsedForm.success) {
      const nextErrors: FormErrors = {}
      for (const issue of parsedForm.error.issues) {
        const fieldName = issue.path[0]
        if (fieldName === 'date') nextErrors.date = issue.message
        if (fieldName === 'description') nextErrors.description = issue.message
        if (fieldName === 'amount') nextErrors.amount = issue.message
      }
      setErrors(nextErrors)
      return
    }

    setErrors({})

    try {
      await createExpense.mutateAsync(parsedForm.data)
      setDescription('')
      setAmount('')
      setDate(endDate)
      setCalculationKey(null)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to save expense')
    }
  }

  const isLoading = isReportLoading || isExpensesLoading
  const pageError = reportError ?? expensesError

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/admin/reports">← Back to Reports</Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Expenses and Balance</h2>
          <p className="text-sm text-gray-500">Track expenses and calculate balance for the selected reporting period.</p>
        </div>
      </div>

      <section className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className="text-sm font-medium text-gray-700">
            Start Date
            <input
              type="date"
              value={startDate}
              onChange={(event) => {
                setStartDate(event.target.value)
                setCalculationKey(null)
              }}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </label>

          <label className="text-sm font-medium text-gray-700">
            End Date
            <input
              type="date"
              value={endDate}
              onChange={(event) => {
                setEndDate(event.target.value)
                setDate(event.target.value)
                setCalculationKey(null)
              }}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </label>

          <div className="rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-700">
            Paid totals and expenses use the same date range on this page.
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <SummaryCard
          title="Paid Amount"
          value={`LKR ${(report?.summary.paidAmount ?? 0).toLocaleString()}`}
          subtitle={`${(report?.summary.paidHours ?? 0).toFixed(2)} paid hours`}
        />
        <SummaryCard
          title="Expense Amount"
          value={`LKR ${totalExpenseAmount.toLocaleString()}`}
          subtitle={`${expenses.length} ${expenses.length === 1 ? 'expense' : 'expenses'} in range`}
        />
        <SummaryCard
          title="Balance Status"
          value={hasCalculated ? `LKR ${balanceSummary.balanceAmount.toLocaleString()}` : 'Hidden'}
          subtitle={hasCalculated ? 'Displayed after explicit calculation' : 'Click Calculate Balance to reveal'}
        />
      </section>

      <section className="space-y-4 rounded-xl border bg-white p-4 shadow-sm" aria-label="Expense entry form">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-blue-700">Add Expense</h3>
          <p className="text-sm text-gray-600">Enter a date, description, and amount to save a new expense record.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          <label className="text-sm font-medium text-gray-700">
            Date
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              aria-invalid={Boolean(errors.date)}
            />
            {errors.date ? <span className="mt-1 block text-xs text-red-600">{errors.date}</span> : null}
          </label>

          <label className="text-sm font-medium text-gray-700">
            Description
            <input
              type="text"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="Shuttle cocks, maintenance, utilities"
              aria-invalid={Boolean(errors.description)}
            />
            {errors.description ? <span className="mt-1 block text-xs text-red-600">{errors.description}</span> : null}
          </label>

          <label className="text-sm font-medium text-gray-700">
            Amount (LKR)
            <input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="0.00"
              aria-invalid={Boolean(errors.amount)}
            />
            {errors.amount ? <span className="mt-1 block text-xs text-red-600">{errors.amount}</span> : null}
          </label>

          <div className="flex flex-wrap gap-2 md:col-span-2 xl:col-span-3">
            <Button type="submit" disabled={createExpense.isPending}>
              {createExpense.isPending ? 'Saving...' : 'Save Expense'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setCalculationKey(currentKey)}>
              Calculate Balance
            </Button>
          </div>

          {submitError ? <p className="text-sm text-red-600 md:col-span-2 xl:col-span-3">{submitError}</p> : null}
        </form>
      </section>

      {isLoading ? (
        <div className="flex items-center justify-center rounded-xl border bg-white p-12 shadow-sm">
          <Loader2 className="h-7 w-7 animate-spin text-blue-500" />
        </div>
      ) : pageError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {pageError instanceof Error ? pageError.message : 'Failed to load expense and balance data'}
        </div>
      ) : (
        <section className="space-y-4 rounded-xl border bg-white p-4 shadow-sm">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-green-700">Saved Expenses</h3>
            <p className="text-sm text-gray-600">Expenses within the selected reporting period.</p>
          </div>

          {expenses.length === 0 ? (
            <p className="text-sm text-gray-500">No expenses found for this date range.</p>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Description</th>
                    <th className="px-3 py-2 text-right">Amount (LKR)</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense) => (
                    <tr key={expense.id} className="border-t">
                      <td className="px-3 py-2 text-gray-700">{expense.expenseDate}</td>
                      <td className="px-3 py-2 text-gray-700">{expense.description}</td>
                      <td className="px-3 py-2 text-right font-medium text-gray-900">{expense.amountLkr.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {hasCalculated ? (
            <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm">
              <p className="font-semibold text-green-900">Balance Result</p>
              <p className="text-green-800">Paid Amount: LKR {balanceSummary.paidAmount.toLocaleString()}</p>
              <p className="text-green-800">Expense Amount: LKR {balanceSummary.expenseAmount.toLocaleString()}</p>
              <p className="mt-1 text-base font-semibold text-green-900">Balance: LKR {balanceSummary.balanceAmount.toLocaleString()}</p>
            </div>
          ) : (
            <p className="text-xs text-gray-500">Balance appears only after clicking Calculate Balance.</p>
          )}
        </section>
      )}
    </div>
  )
}
