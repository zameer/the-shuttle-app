import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/services/supabase'
import { z } from 'zod'
import type { CallbackRequestFormValues, SubmitCallbackResult } from './types'

const submitResultSchema = z.object({
  id: z.string(),
  status: z.enum(['pending', 'assigned']),
  assigned_agent_email: z.string().nullable(),
})

export interface SubmitCallbackInput {
  values: CallbackRequestFormValues
  clientId: string
}

export function useSubmitCallbackRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ values }: SubmitCallbackInput): Promise<SubmitCallbackResult> => {
      if (!navigator.onLine) {
        throw new Error('network-offline')
      }

      const { data, error } = await supabase.rpc('submit_callback_request', {
        p_player_name: values.playerName,
        p_player_phone: values.playerPhone,
        p_slot_from: new Date(values.slotFrom).toISOString(),
        p_slot_to: new Date(values.slotTo).toISOString(),
        p_player_location: values.playerLocation,
        p_preferred_callback_time: values.preferredCallbackTime || null,
        p_note: values.note || null,
      })

      if (error) throw error

      // RPC returns a row set; take the first row
      const row = Array.isArray(data) ? data[0] : data
      return submitResultSchema.parse(row)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callback-requests'] })
    },
  })
}
