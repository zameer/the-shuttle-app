import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/services/supabase'

export function useNextAvailableAgent() {
  const { data, isLoading } = useQuery({
    queryKey: ['next-available-agent'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_next_available_agent_phone')
      if (error) throw error
      return (data as string | null) ?? null
    },
    staleTime: 30_000,
  })

  return { phone: data ?? null, isLoading }
}
