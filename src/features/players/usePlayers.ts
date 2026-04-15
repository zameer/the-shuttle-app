import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/services/supabase'

export interface Player {
  phone_number: string
  name: string | null
  address: string | null
}

export function usePlayerSearch(query: string) {
  return useQuery({
    queryKey: ['players', query],
    queryFn: async (): Promise<Player[]> => {
      if (!query || query.length < 3) return []
      
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .ilike('phone_number', `%${query}%`)
        .limit(10)
        
      if (error) throw new Error(error.message)
      return data as Player[]
    },
    enabled: query.length >= 3
  })
}

export function useCreatePlayer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ phone_number, name, address }: { phone_number: string, name?: string, address?: string }) => {
      const { data, error } = await supabase
        .from('players')
        .insert([{ phone_number, name: name || null, address: address || null }])
        .select()
        .single()
        
      if (error) throw new Error(error.message)
      return data as Player
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] })
    }
  })
}
