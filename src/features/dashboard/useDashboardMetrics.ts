import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/services/supabase'

export interface DailyMetrics {
  booking_date: string
  total_bookings: number
  expected_revenue: number
  collected_revenue: number
  pending_revenue: number
  unavailable_blocks: number
}

export function useDashboardMetrics(dateString: string) {
  return useQuery({
    queryKey: ['dashboard-metrics', dateString],
    queryFn: async (): Promise<DailyMetrics | null> => {
      const { data, error } = await supabase
        .from('dashboard_metrics')
        .select('*')
        .eq('booking_date', dateString)
        .single()
        
      if (error) {
        // if no data found for the day, return zeroes
        if (error.code === 'PGRST116') {
          return {
            booking_date: dateString,
            total_bookings: 0,
            expected_revenue: 0,
            collected_revenue: 0,
            pending_revenue: 0,
            unavailable_blocks: 0
          }
        }
        throw new Error(error.message)
      }
      return data as DailyMetrics
    }
  })
}
