/**
 * Contract: List-mode date navigation bar
 * Feature: 010-list-date-picker
 */

/**
 * Props for the ListDateNav component.
 *
 * This is a fully controlled component — the parent (PublicCalendarPage)
 * owns the date state and passes it down.
 */
export interface ListDateNavProps {
  /** Currently selected date (calendar date; time component is irrelevant). */
  value: Date
  /** Called whenever the player changes the selected date via picker or arrows. */
  onChange: (date: Date) => void
}

/**
 * Behavioral contract
 *
 * 1) On mount, `value` is today's date (FR-002 — enforced by parent initialization).
 * 2) Selecting a date via the date input calls `onChange` with the parsed Date.
 *    If the input produces an invalid date string, `onChange` is called with `new Date()` (today).
 * 3) Tapping the previous-day button calls `onChange(addDays(value, -1))`.
 * 4) Tapping the next-day button calls `onChange(addDays(value, 1))`.
 * 5) The formatted label displays the date in locale-aware long format (e.g., "Wednesday, 16 April 2026") — FR-007.
 * 6) The component fits within a 375 px viewport without horizontal overflow — FR-006, SC-005.
 * 7) Both arrow buttons and the date input are keyboard focusable with visible focus rings — FR-006.
 */

/**
 * Query range contract for list mode.
 *
 * When displayMode === 'list', PublicCalendarPage computes:
 *   startDate = startOfDay(currentDate)
 *   endDate   = endOfDay(currentDate)
 *
 * This single-day range is passed to usePublicBookings, replacing the
 * previous full-week / full-month range used in calendar mode.
 */
export interface ListModeQueryRange {
  startDate: Date  // startOfDay(currentDate)
  endDate: Date    // endOfDay(currentDate)
}
