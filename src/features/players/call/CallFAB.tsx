import { useState } from 'react'
import { Phone, PhoneOff, Loader2 } from 'lucide-react'

interface CallFABProps {
  availableAgentPhone: string | null
  isLoading: boolean
  onRequestCallback: () => void
}

/**
 * CallFAB — Persistent floating action button for calling a Booking Agent.
 * 
 * States:
 * - loading: spinner, disabled
 * - available: Phone icon + "Call Now", rendered as <a href="tel:...">
 * - unavailable: PhoneOff icon + "No Agent Available", tap shows inline message + "Request Callback" button
 */
export default function CallFAB({ availableAgentPhone, isLoading, onRequestCallback }: CallFABProps) {
  const [showUnavailableMsg, setShowUnavailableMsg] = useState(false)

  if (isLoading) {
    return (
      <div
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg"
        aria-label="Checking availability…"
      >
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (availableAgentPhone) {
    return (
      <a
        href={`tel:${availableAgentPhone}`}
        className="fixed bottom-6 right-6 z-50 flex h-14 min-w-14 items-center gap-2 rounded-full bg-green-600 px-4 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-green-700 active:scale-95"
        aria-label="Call Booking Agent"
      >
        <Phone className="h-5 w-5 shrink-0" />
        <span className="hidden sm:inline">Call Now</span>
      </a>
    )
  }

  // No agent available
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {showUnavailableMsg && (
        <div className="flex flex-col gap-2 rounded-xl bg-white p-3 shadow-xl ring-1 ring-gray-200 max-w-xs text-sm">
          <p className="text-gray-700">No Booking Agent is currently available. Leave a callback request and we'll call you back.</p>
          <button
            onClick={() => {
              setShowUnavailableMsg(false)
              onRequestCallback()
            }}
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Request Callback
          </button>
        </div>
      )}
      <button
        onClick={() => setShowUnavailableMsg((v) => !v)}
        className="flex h-14 min-w-14 items-center gap-2 rounded-full bg-gray-500 px-4 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-gray-600 active:scale-95"
        aria-label="No Booking Agent available"
      >
        <PhoneOff className="h-5 w-5 shrink-0" />
        <span className="hidden sm:inline">No Agent Available</span>
      </button>
    </div>
  )
}
