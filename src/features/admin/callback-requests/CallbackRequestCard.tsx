import { format } from 'date-fns'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/services/supabase'
import { useClaimRequest } from './useClaimRequest'
import type { CallbackRequest, CallbackRequestStatus } from './types'
import { Phone, MapPin, Clock, MessageSquare } from 'lucide-react'

interface CallbackRequestCardProps {
  request: CallbackRequest
  currentAgentEmail: string
}

const STATUS_COLORS: Record<CallbackRequestStatus, string> = {
  pending:  'bg-yellow-100 text-yellow-800',
  assigned: 'bg-blue-100 text-blue-800',
  claimed:  'bg-purple-100 text-purple-800',
  resolved: 'bg-green-100 text-green-800',
}

const STATUS_LABELS: Record<CallbackRequestStatus, string> = {
  pending:  'Pending',
  assigned: 'Assigned',
  claimed:  'Claimed',
  resolved: 'Resolved',
}

function useResolveRequest(requestId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('callback_requests')
        .update({ status: 'resolved', updated_at: new Date().toISOString() })
        .eq('id', requestId)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['callback-requests'] }),
  })
}

export default function CallbackRequestCard({ request, currentAgentEmail }: CallbackRequestCardProps) {
  const claimMutation = useClaimRequest()
  const resolveMutation = useResolveRequest(request.id)

  const isMyRequest = request.assigned_agent_email === currentAgentEmail
  const canClaim = request.status === 'pending'
  const canResolve =
    isMyRequest && (request.status === 'assigned' || request.status === 'claimed')

  const slotFrom = request.slot_from ? format(new Date(request.slot_from), 'dd MMM yyyy HH:mm') : '—'
  const slotTo = request.slot_to ? format(new Date(request.slot_to), 'HH:mm') : '—'

  const isResolved = request.status === 'resolved'

  return (
    <div className={`rounded-xl border p-4 flex flex-col gap-3 ${isResolved ? 'bg-gray-50 border-gray-200 opacity-75' : 'bg-white border-gray-200'}`}>
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div>
          <p className="font-semibold text-gray-900">{request.player_name}</p>
          <a
            href={`tel:${request.player_phone}`}
            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
          >
            <Phone className="h-3.5 w-3.5" />
            {request.player_phone}
          </a>
        </div>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[request.status]}`}>
          {STATUS_LABELS[request.status]}
        </span>
      </div>

      {/* Slot time */}
      <div className="flex items-center gap-1.5 text-sm text-gray-600">
        <Clock className="h-4 w-4 text-gray-400 shrink-0" />
        <span>{slotFrom} – {slotTo}</span>
      </div>

      {/* Location */}
      <div className="flex items-center gap-1.5 text-sm text-gray-600">
        <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
        <span>{request.player_location}</span>
      </div>

      {/* Preferred callback time */}
      {request.preferred_callback_time && (
        <div className="text-sm text-gray-600">
          <span className="font-medium">Preferred callback:</span>{' '}
          {request.preferred_callback_time}
        </div>
      )}

      {/* Note */}
      {request.note && (
        <div className="flex items-start gap-1.5 text-sm text-gray-600">
          <MessageSquare className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
          <span>{request.note}</span>
        </div>
      )}

      {/* Assigned agent */}
      {request.assigned_agent_email && (
        <div className="text-xs text-gray-400">
          Agent: {request.assigned_agent_email}
        </div>
      )}

      {/* Actions */}
      {(canClaim || canResolve) && (
        <div className="flex gap-2 pt-1 border-t border-gray-100">
          {canClaim && (
            <button
              onClick={() =>
                claimMutation.mutate({ requestId: request.id, agentEmail: currentAgentEmail })
              }
              disabled={claimMutation.isPending}
              className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {claimMutation.isPending ? 'Claiming…' : 'Claim'}
            </button>
          )}
          {canResolve && (
            <button
              onClick={() => resolveMutation.mutate()}
              disabled={resolveMutation.isPending}
              className="rounded-lg bg-green-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
            >
              {resolveMutation.isPending ? 'Resolving…' : 'Mark Resolved'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
