import { z } from 'zod'

// ---------------------------------------------------------------------------
// Zod schema
// ---------------------------------------------------------------------------

export const callbackRequestSchema = z
  .object({
    playerName: z.string().min(1, 'Name is required'),
    playerPhone: z
      .string()
      .min(7, 'Phone must be at least 7 characters')
      .max(20, 'Phone must be at most 20 characters'),
    slotFrom: z.string().min(1, 'Slot start is required'),
    slotTo: z.string().min(1, 'Slot end is required'),
    playerLocation: z.string().min(1, 'Location is required'),
    preferredCallbackTime: z
      .string()
      .max(100, 'Max 100 characters')
      .optional()
      .or(z.literal('')),
    note: z.string().max(500, 'Max 500 characters').optional().or(z.literal('')),
  })
  .refine((d) => new Date(d.slotTo) > new Date(d.slotFrom), {
    message: 'Slot end must be after slot start',
    path: ['slotTo'],
  })

export type CallbackRequestFormValues = z.infer<typeof callbackRequestSchema>

// ---------------------------------------------------------------------------
// API / DB interfaces
// ---------------------------------------------------------------------------

export interface SubmitCallbackResult {
  id: string
  status: 'pending' | 'assigned'
  assigned_agent_email: string | null
}

export interface CallbackRequest {
  id: string
  player_name: string
  player_phone: string
  slot_from: string
  slot_to: string
  player_location: string
  preferred_callback_time: string | null
  note: string | null
  status: 'pending' | 'assigned' | 'claimed' | 'resolved'
  assigned_agent_email: string | null
  created_at: string
  updated_at: string
}
