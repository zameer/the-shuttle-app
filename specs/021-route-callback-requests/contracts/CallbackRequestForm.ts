/**
 * Contract: Callback Request Form
 * Feature: 021-route-callback-requests
 *
 * Modal form shown when the player chooses "Request Callback".
 * Submits via `submit_callback_request` Supabase RPC.
 *
 * FR-002, FR-002b, FR-002c, FR-003, FR-013
 */
import type { z } from 'zod'

// ---------------------------------------------------------------------------
// Zod schema (to be defined in feature types file)
// ---------------------------------------------------------------------------

/**
 * Shape of the validated form schema. All string fields are trimmed.
 *
 * Required fields: playerName, playerPhone, slotFrom, slotTo, playerLocation
 * Optional fields: preferredCallbackTime, note
 */
export interface CallbackRequestFormSchema {
  playerName: string               // min 1, max 100
  playerPhone: string              // min 7, max 20 (digits, spaces, +, -)
  slotFrom: string                 // ISO datetime string; must be a valid date
  slotTo: string                   // ISO datetime string; must be after slotFrom
  playerLocation: string           // min 1, max 200
  preferredCallbackTime?: string   // max 100; optional
  note?: string                    // max 500; optional
}

// ---------------------------------------------------------------------------
// Component props
// ---------------------------------------------------------------------------

export interface CallbackRequestFormProps {
  /** Called with validated data on successful submission */
  onSuccess: (result: CallbackRequestSubmitResult) => void
  /** Called when the modal is dismissed without submitting */
  onCancel: () => void
}

// ---------------------------------------------------------------------------
// Rules reminder
// ---------------------------------------------------------------------------

/**
 * The rules reminder banner shown at the top of the form.
 * Non-blocking: player can submit without acknowledging.
 * FR-002c: MUST NOT block or require acknowledgement to proceed.
 */
export interface RulesReminderBannerProps {
  /** URL or route to the full court rules (links to existing rules modal/page) */
  rulesHref: string
  message: string  // e.g. "Please read the court rules before submitting"
}

// ---------------------------------------------------------------------------
// Submission / RPC result
// ---------------------------------------------------------------------------

export interface CallbackRequestSubmitResult {
  id: string
  status: 'pending' | 'assigned'
  assignedAgentEmail: string | null
}

/**
 * Confirmation message variants shown after successful submission (FR-003):
 *
 * - status === 'assigned': "Your request has been sent to a Booking Agent. They will call you shortly."
 * - status === 'pending':  "No agent is available right now. Your request is in the queue and we'll call you as soon as possible."
 */
export type ConfirmationVariant = 'assigned' | 'pending'
