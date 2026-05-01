import { useQuery } from '@tanstack/react-query'
import { endOfDay, startOfDay } from 'date-fns'
import { supabase } from '@/services/supabase'
import { bookingsResponseSchema, reportDateRangeSchema } from './schemas'
import type { ReportDateRangeInput, PaidDetailOutput } from './types'
import { normalizeFinancialRows, buildPaidDetail } from './financialReportService'

function toISODateBoundary(value: string, mode: 'start' | 'end'): string {
  const date = new Date(value)
  const boundary = mode === 'start' ? startOfDay(date) : endOfDay(date)
  return boundary.toISOString()
}

export function usePaidDetail(input: ReportDateRangeInput) {
  const parsedInput = reportDateRangeSchema.safeParse(input)

  return useQuery<PaidDetailOutput>({
    queryKey: ['paid-detail', input.startDate, input.endDate],
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
        .order('start_time', { ascending: false })

      if (error) {
        throw new Error(error.message)
      }

      const parsedRows = bookingsResponseSchema.safeParse(data ?? [])
      if (!parsedRows.success) {
        throw new Error('Unexpected booking payload shape for paid detail')
      }

      return buildPaidDetail(normalizeFinancialRows(parsedRows.data))
    },
  })
}
