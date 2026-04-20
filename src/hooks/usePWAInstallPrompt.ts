import { useState, useEffect, useRef, useCallback } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

const VISIT_KEY = 'shuttle-ksc:visit-count'
const VISIT_THRESHOLD = 2

function readVisitCount(): number {
  try {
    return parseInt(localStorage.getItem(VISIT_KEY) ?? '0', 10)
  } catch {
    return 0
  }
}

export function usePWAInstallPrompt() {
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null)
  const [canInstall, setCanInstall] = useState(false)

  useEffect(() => {
    const count = readVisitCount() + 1
    try {
      localStorage.setItem(VISIT_KEY, String(count))
    } catch {
      // localStorage unavailable — install prompt not shown
    }

    const handleBeforeInstall = (e: Event): void => {
      e.preventDefault()
      deferredPromptRef.current = e as BeforeInstallPromptEvent
      if (count >= VISIT_THRESHOLD) {
        setCanInstall(true)
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
  }, [])

  const triggerInstall = useCallback(async (): Promise<void> => {
    const prompt = deferredPromptRef.current
    if (!prompt) return
    await prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') {
      deferredPromptRef.current = null
      setCanInstall(false)
    }
  }, [])

  const dismissInstall = useCallback((): void => {
    setCanInstall(false)
  }, [])

  return { canInstall, triggerInstall, dismissInstall }
}
