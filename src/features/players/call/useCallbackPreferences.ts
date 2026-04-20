import { useState, useCallback } from 'react'
import type { CallbackCapturePreferences } from './types'

const PREFS_KEY = 'shuttle-ksc:callback-prefs'

function readPreferences(): CallbackCapturePreferences {
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as CallbackCapturePreferences
  } catch {
    return {}
  }
}

export function useCallbackPreferences() {
  const [preferences, setPreferencesState] = useState<CallbackCapturePreferences>(
    () => readPreferences()
  )

  const savePreferences = useCallback((prefs: CallbackCapturePreferences) => {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs))
    setPreferencesState(prefs)
  }, [])

  return { preferences, savePreferences }
}
