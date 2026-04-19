import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/services/supabase'
import type { BookingAgent, BookingAgentFormValues } from './types'

export function useBookingAgents() {
  return useQuery({
    queryKey: ['booking-agents'],
    queryFn: async (): Promise<BookingAgent[]> => {
      const { data, error } = await supabase
        .from('booking_agents')
        .select('*')
        .order('is_primary', { ascending: false })
        .order('priority_order', { ascending: true })

      if (error) throw error
      return data as BookingAgent[]
    },
  })
}

export function useCreateBookingAgent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (values: BookingAgentFormValues) => {
      const { error } = await supabase.from('booking_agents').insert({
        email: values.email,
        display_name: values.displayName,
        work_phone: values.workPhone,
        is_primary: values.isPrimary,
        priority_order: values.priorityOrder,
        is_available: values.isAvailable,
      })
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['booking-agents'] }),
  })
}

export function useUpdateBookingAgent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (values: BookingAgentFormValues) => {
      const { error } = await supabase
        .from('booking_agents')
        .update({
          display_name: values.displayName,
          work_phone: values.workPhone,
          is_primary: values.isPrimary,
          priority_order: values.priorityOrder,
          is_available: values.isAvailable,
        })
        .eq('email', values.email)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['booking-agents'] }),
  })
}

export function useDeleteBookingAgent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (email: string) => {
      const { error } = await supabase.from('booking_agents').delete().eq('email', email)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['booking-agents'] }),
  })
}
