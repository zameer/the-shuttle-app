import { z } from 'zod'

// ---------------------------------------------------------------------------
// BookingAgent
// ---------------------------------------------------------------------------

export const bookingAgentSchema = z.object({
  email: z.string().email('Valid email required'),
  displayName: z.string().min(1, 'Name is required').max(80, 'Max 80 characters'),
  workPhone: z
    .string()
    .regex(/^[+\d\s()\\-]{7,20}$/, 'Enter a valid phone number (7–20 characters)'),
  isPrimary: z.boolean(),
  priorityOrder: z
    .number()
    .int()
    .min(1, 'Priority must be at least 1')
    .max(99, 'Priority must be at most 99'),
  isAvailable: z.boolean(),
})

export type BookingAgentFormValues = z.infer<typeof bookingAgentSchema>

export interface BookingAgent {
  email: string
  display_name: string
  work_phone: string
  is_primary: boolean
  priority_order: number
  is_available: boolean
  updated_at: string
}
