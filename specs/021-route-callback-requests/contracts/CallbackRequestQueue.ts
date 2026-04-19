/**
 * Contract: Callback Request Queue (Admin View)
 * Feature: 021-route-callback-requests
 *
 * Admin-facing view showing pending (unclaimed) and assigned/claimed callback requests.
 * Booking Agents can claim pending requests from this view.
 * Updated in real-time via Supabase Realtime subscriptions.
 *
 * FR-007, FR-008, FR-009, FR-010, FR-011
 */

// ---------------------------------------------------------------------------
// Data types
// ---------------------------------------------------------------------------

export type CallbackRequestStatus = 'pending' | 'assigned' | 'claimed' | 'resolved'

export interface CallbackRequest {
  id: string
  playerName: string
  playerPhone: string
  slotFrom: string            // ISO timestamp
  slotTo: string              // ISO timestamp
  playerLocation: string
  preferredCallbackTime: string | null
  note: string | null
  status: CallbackRequestStatus
  assignedAgentEmail: string | null
  createdAt: string
  updatedAt: string
}

// ---------------------------------------------------------------------------
// Component contracts
// ---------------------------------------------------------------------------

export interface CallbackRequestQueuePageProps {
  /** Email of the currently authenticated Booking Agent */
  currentAgentEmail: string
}

/**
 * The queue page renders two sections:
 * 1. Pending requests (status = 'pending') — visible to all Booking Agents; claimable
 * 2. My requests (status = 'assigned' | 'claimed' where assigned_agent_email = currentAgentEmail)
 */
export interface CallbackRequestQueueSections {
  pending: CallbackRequest[]
  myRequests: CallbackRequest[]
}

export interface CallbackRequestCardProps {
  request: CallbackRequest
  currentAgentEmail: string
  onClaim?: (requestId: string) => void    // only shown for pending requests
  onResolve?: (requestId: string) => void  // shown for assigned/claimed requests owned by current agent
  isClaimPending?: boolean                 // loading state for claim action
}

// ---------------------------------------------------------------------------
// Realtime subscription shape
// ---------------------------------------------------------------------------

/**
 * Supabase Realtime postgres_changes event payload for callback_requests.
 * On INSERT with status='pending': show toast notification to all connected Booking Agents.
 * On UPDATE: invalidate React Query cache to refresh queue.
 */
export interface CallbackRequestRealtimePayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new: Partial<CallbackRequest>
  old: Partial<CallbackRequest>
}

// ---------------------------------------------------------------------------
// Claim result
// ---------------------------------------------------------------------------

/**
 * Result of `claim_callback_request` RPC.
 * success=false means another agent claimed it first (FR-009).
 */
export interface ClaimResult {
  success: boolean
  requestId: string
}

// ---------------------------------------------------------------------------
// Toast notification contract (for FR-007)
// ---------------------------------------------------------------------------

export interface NewRequestToastProps {
  request: Pick<CallbackRequest, 'id' | 'playerName' | 'slotFrom' | 'slotTo' | 'playerLocation'>
  onClaim: (requestId: string) => void
}
