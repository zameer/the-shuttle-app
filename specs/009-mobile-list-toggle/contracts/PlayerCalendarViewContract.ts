/**
 * Contract: Player calendar display mode and list view behavior
 * Feature: 009-mobile-list-toggle
 */

import type { Booking } from '@/features/booking/useBookings'

export type DisplayMode = 'calendar' | 'list'

/**
 * FR-002: List view MUST be the default display mode on page load.
 * Initialize displayMode state as 'list' in PublicCalendarPage.
 */
export const DEFAULT_DISPLAY_MODE: DisplayMode = 'list'

export interface PlayerCalendarPageState {
  currentDate: Date
  calendarView: 'week' | 'month'
  displayMode: DisplayMode
  bookings: Booking[]
  isLoading: boolean
}

export interface DisplayModeToggleProps {
  value: DisplayMode
  onChange: (mode: DisplayMode) => void
  ariaLabel?: string
}

export interface PlayerListViewProps {
  currentDate: Date
  bookings: Booking[]
  readOnly: boolean
  isAdmin: boolean
  onSlotClick?: (date: Date, booking?: Booking) => void
}

/**
 * Behavioral contract
 *
 * 1) Toggling display mode must not reset `currentDate`.
 * 2) Booking actions exposed in calendar mode must be available in list mode.
 * 3) List mode must render a no-slots empty state when no rows are actionable.
 * 4) List mode rows must preserve status semantics used in calendar cells.
 */

export interface EmptyStateContract {
  show: boolean
  title: string
  description?: string
}
