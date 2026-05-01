import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/services/supabase'

export type PlayerDisplayMode = 'calendar' | 'closure_message' | 'both'

export interface CourtSettings {
  id: number
  court_open_time: string   // e.g. "06:00:00"
  court_close_time: string  // e.g. "23:00:00"
  default_hourly_rate: number
  available_rates: number[]
  terms_and_conditions: string | null
  player_display_mode: PlayerDisplayMode | null
  closure_message_markdown: string | null
}

export interface RecurringBlock {
  id: string
  day_of_week: number  // 0=Sun, 6=Sat
  start_time: string   // "14:00:00"
  end_time: string     // "16:00:00"
  label: string
}

// ---- Court Settings ----

export function useCourtSettings() {
  return useQuery({
    queryKey: ['court-settings'],
    queryFn: async (): Promise<CourtSettings> => {
      const { data, error } = await supabase
        .from('court_settings')
        .select('*')
        .eq('id', 1)
        .single()
      if (error) throw new Error(error.message)
      return data as CourtSettings
    },
    staleTime: 1000 * 60 * 5, // 5 min cache
  })
}

export function useUpdateCourtSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (updates: Partial<Omit<CourtSettings, 'id'>>) => {
      const { data, error } = await supabase
        .from('court_settings')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', 1)
        .select()
        .single()
      if (error) throw new Error(error.message)
      return data as CourtSettings
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['court-settings'] })
      await queryClient.refetchQueries({ queryKey: ['court-settings'], type: 'active' })
    }
  })
}

// ---- Recurring Unavailable Blocks ----

export function useRecurringBlocks() {
  return useQuery({
    queryKey: ['recurring-blocks'],
    queryFn: async (): Promise<RecurringBlock[]> => {
      const { data, error } = await supabase
        .from('recurring_unavailable_blocks')
        .select('*')
        .order('day_of_week', { ascending: true })
      if (error) throw new Error(error.message)
      return data as RecurringBlock[]
    },
  })
}

export function useCreateRecurringBlock() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (block: Omit<RecurringBlock, 'id'>) => {
      const { data, error } = await supabase
        .from('recurring_unavailable_blocks')
        .insert([block])
        .select()
        .single()
      if (error) throw new Error(error.message)
      return data as RecurringBlock
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-blocks'] })
    }
  })
}

export function useDeleteRecurringBlock() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('recurring_unavailable_blocks')
        .delete()
        .eq('id', id)
      if (error) throw new Error(error.message)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-blocks'] })
    }
  })
}
