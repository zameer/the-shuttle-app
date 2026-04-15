import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/services/supabase'

export interface Settings {
  defaultRate: number
  availableRates: number[]
}

export function useSettings() {
  return useQuery({
    queryKey: ['system-settings'],
    queryFn: async (): Promise<Settings> => {
      const { data, error } = await supabase
        .from('court_settings')
        .select('default_hourly_rate, available_rates')
        .eq('id', 1)
        .single()

      if (error || !data) {
        // Fallback to defaults if table not yet available
        return { defaultRate: 600, availableRates: [600, 500] }
      }

      return {
        defaultRate: data.default_hourly_rate,
        availableRates: data.available_rates as number[]
      }
    },
    staleTime: 1000 * 60 * 5
  })
}
