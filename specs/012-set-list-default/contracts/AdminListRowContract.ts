/**
 * Contract: Admin List Hourly Available Slot Display
 * Feature: 012-set-list-default
 *
 * This file documents the interface contract changes introduced by feature 012.
 * The AdminListRow interface and deriveAdminListRows function signature are unchanged.
 * Only the constant SLOT_STEP_MINUTES and the gap-fill algorithm are modified.
 */

// ---------------------------------------------------------------------------
// Unchanged from feature 011 (reproduced here for reference)
// ---------------------------------------------------------------------------

export type AdminListRowStatus = 'AVAILABLE' | 'PENDING' | 'CONFIRMED' | 'UNAVAILABLE'

export interface AdminListRow {
  type: 'booking' | 'available'
  slotStart: Date
  slotEnd: Date
  /** For available rows: 60 (full hour) OR < 60 (partial gap adjacent to a booking boundary) */
  durationMinutes: number
  status: AdminListRowStatus
  booking?: unknown   // Booking from @/features/booking/useBookings
  playerName?: string | null
  actionable: boolean
}

// ---------------------------------------------------------------------------
// Changed in feature 012
// ---------------------------------------------------------------------------

/** Feature 011 value: 30. Feature 012 value: 60. */
export declare const SLOT_STEP_MINUTES: 60

/**
 * Derives the ordered list of AdminListRow entries for a given date.
 *
 * CHANGED in 012: Available slots are now 60-minute blocks instead of 30-minute.
 * Partial gaps (< 60 min) are still emitted as a single available row to ensure
 * no unbooked time is omitted (FR-004, SC-003).
 *
 * INVARIANTS (unchanged from 011):
 * - Rows are non-overlapping and contiguous within 06:00–22:00
 * - Each booking appears as exactly ONE row (exact start→end)
 * - A day with zero bookings produces exactly 16 available rows
 */
export type DeriveAdminListRowsFn = (
  date: Date,
  bookings: { start_time: string; end_time: string; status: string; [key: string]: unknown }[]
) => AdminListRow[]
