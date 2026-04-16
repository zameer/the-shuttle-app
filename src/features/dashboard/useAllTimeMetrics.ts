import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/services/supabase'
import type { DailyMetrics } from './useDashboardMetrics'

export interface AllTimeMetrics {
  total_bookings: number
  expected_revenue: number
  collected_revenue: number
  pending_revenue: number
}

const EMPTY_METRICS: AllTimeMetrics = {
  total_bookings: 0,
  expected_revenue: 0,
  collected_revenue: 0,
  pending_revenue: 0,
}

export function useAllTimeMetrics() {
  return useQuery({
    queryKey: ['dashboard-metrics-all-time'],
    queryFn: async (): Promise<AllTimeMetrics> => {
      const { data, error } = await supabase
        .from('dashboard_metrics')
        .select('total_bookings, expected_revenue, collected_revenue, pending_revenue')

      if (error) throw new Error(error.message)

      if (!data || data.length === 0) return EMPTY_METRICS

      return (data as Pick<DailyMetrics, 'total_bookings' | 'expected_revenue' | 'collected_revenue' | 'pending_revenue'>[]).reduce(
        (acc, row) => ({
          total_bookings: acc.total_bookings + row.total_bookings,
          expected_revenue: acc.expected_revenue + row.expected_revenue,
          collected_revenue: acc.collected_revenue + row.collected_revenue,
          pending_revenue: acc.pending_revenue + row.pending_revenue,
        }),
        { ...EMPTY_METRICS }
      )
    },
  })
}
