/**
 * Contract: OfflineQueue
 *
 * Defines the shape of the localStorage-backed offline callback queue,
 * the hook interface, and the Workbox BackgroundSync configuration
 * (Feature 023).
 *
 * NOT a runtime file — used as a design contract during implementation.
 */

import type { CallbackRequestFormValues } from '../src/features/players/call/types'

// ── Queue Item ─────────────────────────────────────────────────────────────

/**
 * A single pending callback submission stored in localStorage.
 * `clientId` is a stable UUID generated at form submit time; it is used
 * to prevent duplicate submissions when BackgroundSync replays the request
 * AND the online-flush also attempts to re-submit.
 * The payload includes preferred callback time captured in Step 2.
 */
export interface PendingCallbackItem {
  /** Stable UUID created via `crypto.randomUUID()` at submission time */
  clientId: string
  /** Complete validated form values at submission time */
  payload: CallbackRequestFormValues
  /** ISO 8601 timestamp of when the item was queued */
  queuedAt: string
}

// ── Queue ──────────────────────────────────────────────────────────────────

/** localStorage value type for key `shuttle-ksc:pending-callbacks` */
export type PendingCallbackQueue = PendingCallbackItem[]

// ── Submitted ID Log ───────────────────────────────────────────────────────

/**
 * localStorage value type for key `shuttle-ksc:submitted-ids`.
 * Stores the last 20 successfully submitted `clientId` values (LRU).
 * Used to prevent duplicate replay submissions.
 */
export type SubmittedIdLog = string[]

// ── Hook Contract ──────────────────────────────────────────────────────────

/**
 * Return type of the `useOfflineCallbackQueue` hook.
 */
export interface UseOfflineCallbackQueueReturn {
  /** Current pending items (reactive; re-reads from localStorage via state) */
  pendingItems: PendingCallbackQueue
  /** Number of pending items */
  pendingCount: number
  /** Push a new item onto the queue */
  enqueue: (payload: CallbackRequestFormValues, clientId: string) => void
  /** Remove a successfully replayed item by clientId */
  dequeue: (clientId: string) => void
  /** Attempt to flush the queue now (called on 'online' event) */
  flushQueue: () => Promise<void>
  /** Whether the flush is currently in progress */
  isFlushing: boolean
  /** Check if a clientId has already been submitted successfully */
  isAlreadySubmitted: (clientId: string) => boolean
  /** Record a successful submission for dedup tracking */
  markSubmitted: (clientId: string) => void
}

// ── localStorage Keys ──────────────────────────────────────────────────────

/** All localStorage keys used by the offline queue subsystem */
export const OFFLINE_QUEUE_STORAGE_KEYS = {
  PENDING_CALLBACKS: 'shuttle-ksc:pending-callbacks',
  SUBMITTED_IDS: 'shuttle-ksc:submitted-ids',
} as const

// ── Workbox BackgroundSync Config Reference ────────────────────────────────

/**
 * Configuration fragment to add to `vite.config.ts` → `workbox.runtimeCaching`.
 *
 * This is a DOCUMENTATION REFERENCE ONLY — not imported at runtime.
 *
 * ```ts
 * {
 *   urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/rpc\/submit_callback_request/i,
 *   handler: 'NetworkOnly',
 *   options: {
 *     backgroundSync: {
 *       name: 'callback-requests',
 *       options: {
 *         maxRetentionTime: 24 * 60  // 24 hours in minutes
 *       }
 *     }
 *   }
 * }
 * ```
 *
 * **Notes**:
 * - `NetworkOnly` ensures the SW never serves a stale "success" response for a
 *   form submission — it either reaches the network or BackgroundSync retries later.
 * - `maxRetentionTime` is 24 hours; items older than this are dropped from the SW queue.
 * - The localStorage mirror (`shuttle-ksc:pending-callbacks`) provides the UI with
 *   visibility into queued items because the Workbox queue is opaque from the client.
 */
export type WorkboxBackgroundSyncConfigReference = {
  readonly _docOnly: true
}
