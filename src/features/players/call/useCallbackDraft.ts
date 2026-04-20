import { useState, useCallback } from 'react'
import type { CallbackCaptureDraft, CallbackRequestFormValues } from './types'

const DRAFT_KEY = 'shuttle-ksc:callback-draft'
const DRAFT_TTL_MS = 24 * 60 * 60 * 1000

function readDraft(): CallbackCaptureDraft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CallbackCaptureDraft
    if (new Date(parsed.expiresAt) <= new Date()) {
      localStorage.removeItem(DRAFT_KEY)
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export function useCallbackDraft() {
  const [draft, setDraftState] = useState<CallbackCaptureDraft | null>(() => readDraft())

  const saveDraft = useCallback((values: Partial<CallbackRequestFormValues>) => {
    const now = new Date()
    const entry: CallbackCaptureDraft = {
      ...values,
      savedAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + DRAFT_TTL_MS).toISOString(),
    }
    localStorage.setItem(DRAFT_KEY, JSON.stringify(entry))
    setDraftState(entry)
  }, [])

  const clearDraft = useCallback(() => {
    localStorage.removeItem(DRAFT_KEY)
    setDraftState(null)
  }, [])

  return { draft, saveDraft, clearDraft, hasDraft: draft !== null }
}
