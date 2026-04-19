import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/services/supabase'
import { toast } from 'sonner'

export function useClaimRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      requestId,
      agentEmail,
    }: {
      requestId: string
      agentEmail: string
    }): Promise<boolean> => {
      const { data, error } = await supabase.rpc('claim_callback_request', {
        p_request_id: requestId,
        p_agent_email: agentEmail,
      })
      if (error) throw error
      return data as boolean
    },
    onSuccess: (claimed) => {
      if (claimed) {
        queryClient.invalidateQueries({ queryKey: ['callback-requests'] })
      } else {
        toast.error('Request already claimed by another agent.')
      }
    },
  })
}
