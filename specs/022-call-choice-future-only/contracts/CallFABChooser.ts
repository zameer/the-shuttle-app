/**
 * UI Contract: CallFABChooser
 * Feature: 022 — Player Call Choice and Future-Only Dates
 * Date: 2026-04-19
 *
 * Replaces the 021 `CallFAB` component. The chooser is a speed-dial floating
 * action button fixed at bottom-right, present in both calendar and list views.
 *
 * Behaviour contract:
 *   1. A single main FAB is always visible while scrolling (z-50, fixed).
 *   2. Tapping the main FAB toggles `isOpen` — expanding two action buttons
 *      above it (speed-dial style) via Tailwind CSS transitions.
 *   3. Tapping outside the FAB group or pressing Escape closes the chooser.
 *   4. "Call Now" action button:
 *      - When `availableAgentPhone` is non-null AND `isLoading` is false:
 *          rendered as `<a href="tel:...">`, green, active.
 *      - When `availableAgentPhone` is null AND `isLoading` is false:
 *          rendered as `<button disabled>`, greyed-out, with aria-label
 *          "No agent available", and visible status label below the button.
 *      - When `isLoading` is true: neither action button is shown; only the
 *          main FAB (with spinner) is visible.
 *   5. "Request Callback" action button: always active (blue), calls
 *      `onRequestCallback()` then closes the chooser.
 *   6. Main FAB icon: Phone when closed, X when open.
 *   7. Background overlay: a semi-transparent backdrop (or invisible click-
 *      trap div) appears behind the speed-dial when open to catch outside taps.
 */

/** Props for the CallFABChooser component (same surface as former CallFAB). */
export interface CallFABProps {
  /** Phone number of the next available booking agent, or null if none. */
  availableAgentPhone: string | null

  /** True while the `useNextAvailableAgent` hook is loading. */
  isLoading: boolean

  /** Called when the player selects "Request Callback". */
  onRequestCallback: () => void
}

/**
 * Speed-dial action button descriptor.
 * Used internally to drive the two action buttons above the FAB.
 */
export interface SpeedDialAction {
  /** Display label shown next to the icon. */
  label: string

  /** Sub-label shown below the button when the action is disabled. */
  sublabel?: string

  /** lucide-react icon component. */
  icon: React.ComponentType<{ className?: string }>

  /** Tailwind colour classes for the active state. */
  activeClassName: string

  /** Tailwind colour classes for the disabled state. */
  disabledClassName: string

  /** Whether this action is currently interactive. */
  disabled: boolean

  /** Click handler (ignored when disabled). */
  onClick: () => void

  /** Optional href — renders as `<a>` instead of `<button>` when provided. */
  href?: string
}

/**
 * Visual state of the speed-dial chooser.
 * Determines which elements are visible and how they are styled.
 */
export type ChooserVisualState =
  | 'loading'       // Spinner on main FAB; no action buttons visible
  | 'closed'        // Main FAB with Phone icon; no action buttons
  | 'open-agent'    // Expanded; "Call Now" active (green)
  | 'open-no-agent' // Expanded; "Call Now" disabled (grey + label)

/**
 * Responsive breakpoints:
 *   - ≥375 px: FAB 56 × 56 px (h-14 w-14), action labels hidden on xs
 *   - ≥640 px (sm): action labels visible (sm:inline)
 *
 * Placement: `fixed bottom-6 right-6 z-50`
 * Animation: `transition-all duration-200 ease-out` on each action button
 *            combined with `translate-y-4 opacity-0` (closed) →
 *            `translate-y-0 opacity-100` (open)
 */
