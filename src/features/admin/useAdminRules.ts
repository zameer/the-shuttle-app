import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/services/supabase'
import type { CourtRule } from '@/features/players/rules/useCourtRules'

interface CreateRuleInput {
  title: string
  icon: string
  chip_label: string
  detail: string
}

interface UpdateRuleInput {
  id: string
  title?: string
  icon?: string
  chip_label?: string
  detail?: string
}

interface ReorderInput {
  aId: string
  bId: string
  aOrder: number
  bOrder: number
}

export function useCreateRule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateRuleInput): Promise<CourtRule> => {
      const existing = queryClient.getQueryData<CourtRule[]>(['court-rules']) ?? []
      const maxOrder = existing.reduce((max, r) => Math.max(max, r.sort_order), 0)
      const { data, error } = await supabase
        .from('court_rules')
        .insert([{ ...input, sort_order: maxOrder + 1 }])
        .select()
        .single()
      if (error) throw new Error(error.message)
      return data as CourtRule
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['court-rules'] })
    },
  })
}

export function useUpdateRule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateRuleInput): Promise<CourtRule> => {
      const { data, error } = await supabase
        .from('court_rules')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw new Error(error.message)
      return data as CourtRule
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['court-rules'] })
    },
  })
}

export function useDeleteRule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('court_rules')
        .delete()
        .eq('id', id)
      if (error) throw new Error(error.message)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['court-rules'] })
    },
  })
}

export function useReorderRules() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ aId, bId, aOrder, bOrder }: ReorderInput): Promise<void> => {
      const { error: err1 } = await supabase
        .from('court_rules')
        .update({ sort_order: bOrder })
        .eq('id', aId)
      if (err1) throw new Error(err1.message)

      const { error: err2 } = await supabase
        .from('court_rules')
        .update({ sort_order: aOrder })
        .eq('id', bId)
      if (err2) throw new Error(err2.message)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['court-rules'] })
    },
  })
}
