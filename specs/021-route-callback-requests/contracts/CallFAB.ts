/**
 * Contract: Call FAB (Floating Action Button)
 * Feature: 021-route-callback-requests
 *
 * The persistent floating call button shown at the bottom of the
 * player availability/calendar screen. Always visible regardless of scroll position.
 *
 * FR-001, FR-001a, FR-002a, FR-005b, FR-006a
 */

export interface CallFABProps {
  /**
   * Called when the FAB is tapped and at least one Booking Agent is available.
   * The `phone` string is the work phone number returned by `get_next_available_agent_phone()`.
   * The component renders an <a href={`tel:${phone}`}> to trigger the native dialer.
   */
  availableAgentPhone: string | null

  /**
   * Called when the player taps "Request Callback" from the no-agent-available fallback.
   * Opens the callback request form modal.
   */
  onRequestCallback: () => void

  /**
   * Loading state while `get_next_available_agent_phone` RPC is in flight.
   * FAB shows a disabled/spinner state while loading.
   */
  isLoading?: boolean
}

/**
 * Visual states of the Call FAB:
 *
 * 1. Loading      — spinner icon; button disabled
 * 2. Available    — phone icon + "Call Now"; renders as <a href="tel:...">
 * 3. Unavailable  — phone-off icon + "No Agent Available";
 *                   tapping shows inline message + "Request Callback" button
 */
export type CallFABState = 'loading' | 'available' | 'unavailable'

/**
 * Positioning contract:
 * - Position: fixed, bottom-6, right-6 (or bottom-20 if app has bottom nav)
 * - z-index: above calendar/list scroll content
 * - Min width: 56px × 56px (touch target)
 * - On desktop: may render as a wider pill button with label text
 */
export interface CallFABLayout {
  position: 'fixed'
  bottom: string    // e.g. 'bottom-6'
  right: string     // e.g. 'right-6'
  zIndex: string    // e.g. 'z-50'
}
