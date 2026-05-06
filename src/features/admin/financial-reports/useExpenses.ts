import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/services/supabase'
import { expenseFormSchema, expensesResponseSchema } from './schemas'
import type { ExpenseFormInput, ExpenseRecord } from './types'

interface UseExpensesInput {
  startDate: string
  endDate: string
}

function mapExpenseRow(row: {
  id: string
  expense_date: string
  description: string
  amount_lkr: number
  created_by: string | null
  created_at: string
}): ExpenseRecord {
  return {
    id: row.id,
    expenseDate: row.expense_date,
    description: row.description,
    amountLkr: row.amount_lkr,
    createdBy: row.created_by,
    createdAt: row.created_at,
  }
}

export function useExpenses(input: UseExpensesInput) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['expenses', input.startDate, input.endDate],
    enabled: Boolean(input.startDate && input.endDate),
    queryFn: async (): Promise<ExpenseRecord[]> => {
      const { data, error } = await supabase
        .from('expenses')
        .select('id,expense_date,description,amount_lkr,created_by,created_at')
        .gte('expense_date', input.startDate)
        .lte('expense_date', input.endDate)
        .order('expense_date', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) {
        throw new Error(error.message)
      }

      const parsedRows = expensesResponseSchema.safeParse(data ?? [])
      if (!parsedRows.success) {
        throw new Error('Unexpected expense payload shape')
      }

      return parsedRows.data.map(mapExpenseRow)
    },
  })

  const createExpense = useMutation({
    mutationFn: async (values: ExpenseFormInput) => {
      const parsedInput = expenseFormSchema.safeParse(values)
      if (!parsedInput.success) {
        throw new Error(parsedInput.error.issues.map((issue) => issue.message).join(', '))
      }

      const payload = {
        expense_date: parsedInput.data.date,
        description: parsedInput.data.description.trim(),
        amount_lkr: parsedInput.data.amount,
      }

      const { error } = await supabase.from('expenses').insert(payload)
      if (error) {
        throw new Error(error.message)
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['expenses', input.startDate, input.endDate] })
    },
  })

  return {
    ...query,
    createExpense,
  }
}
