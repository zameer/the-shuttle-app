export type CallbackRequestStatus = 'pending' | 'assigned' | 'claimed' | 'resolved'

export interface CallbackRequest {
  id: string
  player_name: string
  player_phone: string
  slot_from: string
  slot_to: string
  player_location: string
  preferred_callback_time: string | null
  note: string | null
  status: CallbackRequestStatus
  assigned_agent_email: string | null
  created_at: string
  updated_at: string
}
