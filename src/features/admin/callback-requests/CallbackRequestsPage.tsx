import { useAuth } from '@/features/auth/useAuth'
import { useCallbackRequests } from './useCallbackRequests'
import CallbackRequestCard from './CallbackRequestCard'
import type { CallbackRequest } from './types'

export default function CallbackRequestsPage() {
  const { user } = useAuth()
  const { data: requests = [], isLoading } = useCallbackRequests()

  const currentAgentEmail = user?.email ?? ''

  const pendingRequests = requests.filter((r: CallbackRequest) => r.status === 'pending')
  const myRequests = requests.filter(
    (r: CallbackRequest) =>
      r.assigned_agent_email === currentAgentEmail &&
      (r.status === 'assigned' || r.status === 'claimed' || r.status === 'resolved')
  )

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 animate-pulse rounded-xl bg-gray-100" />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Callback Requests</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Manage player callback requests in real time.
        </p>
      </div>

      {/* Pending requests */}
      <section>
        <h3 className="text-base font-semibold text-gray-800 mb-3">
          Pending Requests{' '}
          {pendingRequests.length > 0 && (
            <span className="ml-1 inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
              {pendingRequests.length}
            </span>
          )}
        </h3>
        {pendingRequests.length === 0 ? (
          <p className="text-sm text-gray-500 rounded-lg border border-dashed border-gray-200 p-6 text-center">
            No pending requests right now.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {pendingRequests.map((r: CallbackRequest) => (
              <CallbackRequestCard
                key={r.id}
                request={r}
                currentAgentEmail={currentAgentEmail}
              />
            ))}
          </div>
        )}
      </section>

      {/* My requests */}
      <section>
        <h3 className="text-base font-semibold text-gray-800 mb-3">My Requests</h3>
        {myRequests.length === 0 ? (
          <p className="text-sm text-gray-500 rounded-lg border border-dashed border-gray-200 p-6 text-center">
            You have no assigned requests.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {myRequests.map((r: CallbackRequest) => (
              <CallbackRequestCard
                key={r.id}
                request={r}
                currentAgentEmail={currentAgentEmail}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
