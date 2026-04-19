import { useEffect, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/services/supabase'
import { toast } from 'sonner'
import { format } from 'date-fns'
import type { CallbackRequest } from './types'

export function useCallbackRequests() {
  const queryClient = useQueryClient()
  // Track seen insert IDs to avoid duplicate toasts on Realtime reconnect
  const seenIds = useRef<Set<string>>(new Set())

  useEffect(() => {
    const channel = supabase
      .channel('callback_requests_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'callback_requests' },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['callback-requests'] })

          // Toast only for new pending inserts — deduplicate by id
          if (
            payload.eventType === 'INSERT' &&
            payload.new?.status === 'pending' &&
            !seenIds.current.has(payload.new.id as string)
          ) {
            seenIds.current.add(payload.new.id as string)
            const req = payload.new as CallbackRequest
            const fromStr = req.slot_from ? format(new Date(req.slot_from), 'dd MMM HH:mm') : ''
            const toStr = req.slot_to ? format(new Date(req.slot_to), 'HH:mm') : ''
            toast.info(`New callback request from ${req.player_name}`, {
              description: fromStr && toStr ? `Slot: ${fromStr}–${toStr}` : undefined,
              duration: 8000,
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient])

  return useQuery({
    queryKey: ['callback-requests'],
    queryFn: async (): Promise<CallbackRequest[]> => {
      const { data, error } = await supabase
        .from('callback_requests')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as CallbackRequest[]
    },
  })
}
