/**
 * Contract: Admin List View Booking Management
 * Feature: 011-admin-list-view
 *
 * This file defines the public interface contracts for the admin list view components.
 * Import from feature implementation files — do not import this contract directly in source.
 */

import type { Booking } from '@/features/booking/useBookings'

// ---------------------------------------------------------------------------
// Row Types
// ---------------------------------------------------------------------------

export type AdminListRowType = 'booking' | 'available'

export type AdminListRowStatus =
  | 'AVAILABLE'
  | 'PENDING'
  | 'CONFIRMED'
  | 'UNAVAILABLE'

export interface AdminListRow {
  /** Discriminates booking rows (exact booking record) from available slot rows */
  type: AdminListRowType
  /** Exact start of the interval (ISO-parsed or derived from 30-min grid) */
  slotStart: Date
  /** Exact end of the interval */
  slotEnd: Date
  /** Computed duration in minutes: (slotEnd - slotStart) / 60_000 */
  durationMinutes: number
  /** AVAILABLE for available rows; booking status for booking rows */
  status: AdminListRowStatus
  /** Populated only when type === 'booking' */
  booking?: Booking
  /** Player name from admin join — only set for booking rows with player data */
  playerName?: string | null
  /** true for all actionable rows (create on available, manage on booking) */
  actionable: boolean
}

// ---------------------------------------------------------------------------
// deriveAdminListRows — pure function contract
// ---------------------------------------------------------------------------

/**
 * Derives the ordered list of AdminListRow entries for a given date.
 *
 * @param date    - The calendar date to derive rows for
 * @param bookings - Admin-fetched bookings (includes player_name) for the range covering date
 * @returns Ordered AdminListRow[] covering 06:00–22:00 with:
 *          - One merged booking row per booking record (exact start→end)
 *          - 30-minute available-slot rows filling all unbooked intervals
 *
 * Invariants:
 *  - Rows are non-overlapping and contiguous within the schedule window
 *  - A single booking spanning multiple hours appears as exactly ONE row
 *  - Adjacent available slots are NOT merged (stay as 30-min units for UX)
 */
export type DeriveAdminListRowsFn = (date: Date, bookings: Booking[]) => AdminListRow[]

// ---------------------------------------------------------------------------
// AdminListView component contract
// ---------------------------------------------------------------------------

export interface AdminListViewProps {
  /** The calendar date controlling which day's rows are displayed */
  currentDate: Date
  /**
   * Admin-fetched bookings for the selected date range.
   * Expected to include player_name (fetchPlayerNames=true from useBookings).
   */
  bookings: Booking[]
  /**
   * Called when an available slot is clicked (for creating a new booking).
   * @param date - The slot's start time
   */
  onAvailableSlotClick: (date: Date) => void
  /**
   * Called when a booking row action is triggered.
   * @param booking - The booking record to manage
   */
  onBookingClick: (booking: Booking) => void
}

// ---------------------------------------------------------------------------
// AdminCalendarDisplayMode
// ---------------------------------------------------------------------------

export type AdminCalendarDisplayMode = 'calendar' | 'list'

/** Default display mode for AdminCalendarPage within feature 011 scope */
export const ADMIN_DEFAULT_DISPLAY_MODE: AdminCalendarDisplayMode = 'calendar'
// Note: feature 012 (012-set-list-default) will change this to 'list'
