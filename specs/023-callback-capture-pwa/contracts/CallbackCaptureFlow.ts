/**
 * Contract: CallbackCaptureFlow
 *
 * Defines props, step enum, and submission status for the multi-step
 * guided callback capture flow (Feature 023).
 *
 * NOT a runtime file — used as a design contract during implementation.
 */

import type { CallbackRequestFormValues } from '../src/features/players/call/types'

// ── Step Enum ──────────────────────────────────────────────────────────────

/**
 * The active step in the guided capture flow.
 * 1 = "Could you please mention" (name, phone)
 * 2 = "When and where?" (slot start, slot end, location, preferred callback time)
 * 3 = "Anything else?" (note, read-only summary)
 */
export type CaptureStep = 1 | 2 | 3

// ── Submission Status ──────────────────────────────────────────────────────

/**
 * Tracks the current submission lifecycle.
 * - idle:          No submit attempt yet
 * - submitting:    Mutation in flight (online)
 * - success:       RPC returned successfully
 * - offline-queued: Network unavailable; payload queued for later retry
 * - error:         Server or validation error (not network)
 */
export type SubmissionStatus =
  | 'idle'
  | 'submitting'
  | 'success'
  | 'offline-queued'
  | 'error'

// ── Step Component Contracts ───────────────────────────────────────────────

/** Shared props injected into every step component */
export interface StepBaseProps {
  /** Advance to the next step after passing per-step validation */
  onNext: () => Promise<void>
  /** Return to the previous step (no validation) */
  onBack?: () => void
  /** Whether the step is disabled (e.g. during submission) */
  disabled?: boolean
}

/** Step 1: Identity */
export interface CaptureStep1Props extends StepBaseProps {
  /** react-hook-form register fn, typed to step-1 fields */
  register: import('react-hook-form').UseFormRegister<CallbackRequestFormValues>
  /** react-hook-form errors object */
  errors: Partial<import('react-hook-form').FieldErrors<CallbackRequestFormValues>>
}

/** Step 2: Booking details */
export interface CaptureStep2Props extends StepBaseProps {
  register: import('react-hook-form').UseFormRegister<CallbackRequestFormValues>
  errors: Partial<import('react-hook-form').FieldErrors<CallbackRequestFormValues>>
}

/** Step 3: Extras + Review */
export interface CaptureStep3Props extends StepBaseProps {
  register: import('react-hook-form').UseFormRegister<CallbackRequestFormValues>
  errors: Partial<import('react-hook-form').FieldErrors<CallbackRequestFormValues>>
  /** Read-only summary of values from Steps 1–2 for review panel */
  reviewValues: Pick<
    CallbackRequestFormValues,
    'playerName' | 'playerPhone' | 'slotFrom' | 'slotTo' | 'playerLocation'
  >
  /** Whether a submit is in progress */
  isSubmitting: boolean
}

// ── Coordinator Component Contract ─────────────────────────────────────────

/**
 * Props for the top-level CallbackRequestForm coordinator.
 * This component owns step state, form state, and submission lifecycle.
 */
export interface CallbackRequestFormProps {
  /** Called when the flow reaches 'success' or the user explicitly closes */
  onSuccess: () => void
  /** Called when the user cancels at any step */
  onCancel: () => void
}

// ── Draft Banner Contract ──────────────────────────────────────────────────

/**
 * Props for the "Continue from last time?" draft restoration banner
 * rendered above Step 1 when a valid saved draft is detected.
 */
export interface DraftRestorationBannerProps {
  /** Human-readable relative time string, e.g. "2 hours ago" */
  savedAgo: string
  /** User accepts and pre-fills form with draft values */
  onRestore: () => void
  /** User declines and starts fresh */
  onDismiss: () => void
}

// ── Step Progress Indicator Contract ──────────────────────────────────────

/**
 * Props for the step progress dots/bar shown at the top of the Dialog.
 */
export interface StepProgressProps {
  current: CaptureStep
  total: 3
  labels: [string, string, string]  // e.g. ["Mention", "When and where", "Anything else"]
}

// ── Offline Queued Notice Contract ─────────────────────────────────────────

/**
 * Props for the success-variant view shown when the request was offline-queued
 * instead of submitted immediately.
 */
export interface OfflineQueuedNoticeProps {
  /** Number of requests currently pending in the queue */
  pendingCount: number
  /** Called when user explicitly dismisses the modal */
  onClose: () => void
}
