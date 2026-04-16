import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/services/supabase'

export interface CourtRule {
  id: string
  title: string
  icon: string
  chip_label: string
  detail: string
  sort_order: number
  created_at: string
}

export function useCourtRules() {
  return useQuery({
    queryKey: ['court-rules'],
    queryFn: async (): Promise<CourtRule[]> => {
      const { data, error } = await supabase
        .from('court_rules')
        .select('*')
        .order('sort_order', { ascending: true })
      if (error) throw new Error(error.message)
      return (data ?? []) as CourtRule[]
    },
  })
}
