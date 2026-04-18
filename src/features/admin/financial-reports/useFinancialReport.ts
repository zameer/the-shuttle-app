import { useQuery } from '@tanstack/react-query'
import { endOfDay, startOfDay } from 'date-fns'
import { supabase } from '@/services/supabase'
import { bookingsResponseSchema, reportDateRangeSchema } from './schemas'
import type { ReportDateRangeInput } from './types'
import { buildFinancialReport } from './financialReportService'

function toISODateBoundary(value: string, mode: 'start' | 'end'): string {
  const date = new Date(value)
  const boundary = mode === 'start' ? startOfDay(date) : endOfDay(date)
  return boundary.toISOString()
}

export function useFinancialReport(input: ReportDateRangeInput) {
  const parsedInput = reportDateRangeSchema.safeParse(input)

  return useQuery({
    queryKey: ['financial-report', input.startDate, input.endDate],
    enabled: parsedInput.success,
    queryFn: async () => {
      if (!parsedInput.success) {
        throw new Error(parsedInput.error.issues.map((issue) => issue.message).join(', '))
      }

      const { startDate, endDate } = parsedInput.data

      const { data, error } = await supabase
        .from('bookings')
        .select('id,player_phone_number,start_time,end_time,status,payment_status,hourly_rate,total_price,players(name)')
        .lte('start_time', toISODateBoundary(endDate, 'end'))
        .gte('end_time', toISODateBoundary(startDate, 'start'))
        .order('start_time', { ascending: true })

      if (error) {
        throw new Error(error.message)
      }

      const parsedRows = bookingsResponseSchema.safeParse(data ?? [])
      if (!parsedRows.success) {
        throw new Error('Unexpected booking payload shape for financial report')
      }

      const report = buildFinancialReport(parsedRows.data)
      const allReconciled = Object.values(report.reconciliation).every(Boolean)
      if (!allReconciled) {
        throw new Error('Financial report reconciliation check failed')
      }

      return report
    },
  })
}
