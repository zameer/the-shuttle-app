import { useState, useEffect, useRef } from 'react'
import { Phone, PhoneOff, MessageSquare, Loader2, X } from 'lucide-react'

interface CallFABProps {
  availableAgentPhone: string | null
  isLoading: boolean
  onRequestCallback: () => void
}

/**
 * CallFAB — Speed-dial floating action button for player contact.
 *
 * Tapping the main FAB expands two action buttons above it:
 *   - "Call Now": active (green link) when agent is available; greyed-out disabled when not.
 *   - "Request Callback": always active (blue).
 *
 * Closes on: outside click/tap, Escape key, or tapping the main FAB again.
 */
export default function CallFAB({ availableAgentPhone, isLoading, onRequestCallback }: CallFABProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close on outside click/tap or Escape key
  useEffect(() => {
    if (!isOpen) return

    const handleOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('mousedown', handleOutside)
    document.addEventListener('touchstart', handleOutside)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleOutside)
      document.removeEventListener('touchstart', handleOutside)
      document.removeEventListener('keydown', handleKey)
    }
  }, [isOpen])

  const actionVisible = isOpen && !isLoading

  return (
    <div ref={containerRef} className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Speed-dial action buttons (animate above FAB) */}
      <div className="flex flex-col-reverse gap-3 mb-3">
        {/* Request Callback — always active */}
        <button
          type="button"
          onClick={() => { setIsOpen(false); onRequestCallback() }}
          aria-label="Request Callback"
          className={`flex h-12 items-center gap-2 rounded-full bg-blue-600 px-4 text-white shadow-lg transition-all duration-200 ease-out hover:bg-blue-700 active:scale-95 ${
            actionVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'
          }`}
        >
          <MessageSquare className="h-5 w-5 shrink-0" />
          <span className="text-sm font-medium">Request Callback</span>
        </button>

        {/* Call Now — active when agent available, disabled otherwise */}
        <div
          className={`flex flex-col items-end gap-0.5 transition-all duration-200 ease-out ${
            actionVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'
          }`}
        >
          {!availableAgentPhone && (
            <span className="text-xs text-gray-500 pr-1">No agent available</span>
          )}
          {availableAgentPhone ? (
            <a
              href={`tel:${availableAgentPhone}`}
              onClick={() => setIsOpen(false)}
              aria-label="Call Now"
              className="flex h-12 items-center gap-2 rounded-full bg-green-600 px-4 text-white shadow-lg hover:bg-green-700 active:scale-95"
            >
              <Phone className="h-5 w-5 shrink-0" />
              <span className="text-sm font-medium">Call Now</span>
            </a>
          ) : (
            <button
              type="button"
              disabled
              aria-label="Call Now"
              aria-disabled="true"
              className="flex h-12 cursor-not-allowed items-center gap-2 rounded-full bg-gray-300 px-4 text-gray-500 opacity-60 shadow-lg"
            >
              <PhoneOff className="h-5 w-5 shrink-0" />
              <span className="text-sm font-medium">Call Now</span>
            </button>
          )}
        </div>
      </div>

      {/* Main FAB */}
      <button
        type="button"
        onClick={() => { if (!isLoading) setIsOpen((v) => !v) }}
        aria-label="Contact us"
        aria-expanded={isOpen}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-colors hover:bg-blue-700 active:scale-95 disabled:opacity-60"
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Phone className="h-6 w-6" />
        )}
      </button>
    </div>
  )
}
