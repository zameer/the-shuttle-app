import { CheckCircle, Clock } from 'lucide-react'
import type { SubmissionStatus } from './types'

interface CallbackSuccessViewProps {
  status: Extract<SubmissionStatus, 'success' | 'offline-queued'>
  assignedAgentEmail?: string | null
  pendingCount: number
  onClose: () => void
}

export default function CallbackSuccessView({
  status,
  assignedAgentEmail,
  pendingCount,
  onClose,
}: CallbackSuccessViewProps) {
  if (status === 'offline-queued') {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <Clock className="h-12 w-12 text-amber-500" />
        <div className="flex flex-col gap-1">
          <p className="text-base font-semibold text-gray-900">Saved offline</p>
          <p className="text-sm text-gray-600">
            Your request will be sent automatically when you reconnect.
          </p>
          {pendingCount > 0 && (
            <p className="mt-1 text-xs text-gray-500">
              {pendingCount} request{pendingCount > 1 ? 's' : ''} pending
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg bg-gray-900 px-6 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Close
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4 py-8 text-center">
      <CheckCircle className="h-12 w-12 text-green-500" />
      {assignedAgentEmail ? (
        <div className="flex flex-col gap-1">
          <p className="text-base font-semibold text-gray-900">
            Request received — agent assigned!
          </p>
          <p className="text-sm text-gray-600">
            A Booking Agent has been assigned and will call you back at the number you provided.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          <p className="text-base font-semibold text-gray-900">Request received!</p>
          <p className="text-sm text-gray-600">
            No agents are currently available. Your request is in the queue and a Booking Agent
            will call you back soon.
          </p>
        </div>
      )}
      <button
        type="button"
        onClick={onClose}
        className="rounded-lg bg-green-600 px-6 py-2 text-sm font-medium text-white hover:bg-green-700"
      >
        Done
      </button>
    </div>
  )
}
