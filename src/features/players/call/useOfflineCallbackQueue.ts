import { useState, useCallback, useEffect } from 'react'
import { supabase } from '@/services/supabase'
import type {
  CallbackRequestFormValues,
  PendingCallbackItem,
  PendingCallbackQueue,
  SubmittedIdLog,
} from './types'

const QUEUE_KEY = 'shuttle-ksc:pending-callbacks'
const SUBMITTED_KEY = 'shuttle-ksc:submitted-ids'
const MAX_PENDING = 10
const MAX_SUBMITTED = 20

function readQueue(): PendingCallbackQueue {
  try {
    const raw = localStorage.getItem(QUEUE_KEY)
    return raw ? (JSON.parse(raw) as PendingCallbackQueue) : []
  } catch {
    return []
  }
}

function readSubmittedIds(): SubmittedIdLog {
  try {
    const raw = localStorage.getItem(SUBMITTED_KEY)
    return raw ? (JSON.parse(raw) as SubmittedIdLog) : []
  } catch {
    return []
  }
}

function writeQueue(items: PendingCallbackQueue): void {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(items))
}

function writeSubmittedIds(ids: SubmittedIdLog): void {
  localStorage.setItem(SUBMITTED_KEY, JSON.stringify(ids))
}

export function useOfflineCallbackQueue() {
  const [pendingItems, setPendingItems] = useState<PendingCallbackQueue>(() => readQueue())
  const [isFlushing, setIsFlushing] = useState(false)

  const isAlreadySubmitted = useCallback((clientId: string): boolean => {
    return readSubmittedIds().includes(clientId)
  }, [])

  const markSubmitted = useCallback((clientId: string): void => {
    const ids = readSubmittedIds()
    const updated = [...ids, clientId].slice(-MAX_SUBMITTED)
    writeSubmittedIds(updated)
  }, [])

  const dequeue = useCallback((clientId: string): void => {
    const updated = readQueue().filter((item) => item.clientId !== clientId)
    writeQueue(updated)
    setPendingItems(updated)
  }, [])

  const enqueue = useCallback(
    (payload: CallbackRequestFormValues, clientId: string): void => {
      const current = readQueue()
      const item: PendingCallbackItem = {
        clientId,
        payload,
        queuedAt: new Date().toISOString(),
      }
      const updated = [...current, item].slice(-MAX_PENDING)
      writeQueue(updated)
      setPendingItems(updated)
    },
    []
  )

  const flushQueue = useCallback(async (): Promise<void> => {
    const current = readQueue()
    if (current.length === 0 || isFlushing) return
    setIsFlushing(true)
    try {
      for (const item of current) {
        if (isAlreadySubmitted(item.clientId)) {
          dequeue(item.clientId)
          continue
        }
        try {
          const { error } = await supabase.rpc('submit_callback_request', {
            p_player_name: item.payload.playerName,
            p_player_phone: item.payload.playerPhone,
            p_slot_from: new Date(item.payload.slotFrom).toISOString(),
            p_slot_to: new Date(item.payload.slotTo).toISOString(),
            p_player_location: item.payload.playerLocation,
            p_preferred_callback_time: item.payload.preferredCallbackTime || null,
            p_note: item.payload.note || null,
          })
          if (!error) {
            markSubmitted(item.clientId)
            dequeue(item.clientId)
          }
        } catch {
          // Network still unavailable for this item — leave in queue
        }
      }
    } finally {
      setIsFlushing(false)
    }
  }, [isFlushing, isAlreadySubmitted, markSubmitted, dequeue])

  useEffect(() => {
    const handleOnline = (): void => {
      void flushQueue()
    }
    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [flushQueue])

  return {
    pendingItems,
    pendingCount: pendingItems.length,
    enqueue,
    dequeue,
    flushQueue,
    isFlushing,
    isAlreadySubmitted,
    markSubmitted,
  }
}
