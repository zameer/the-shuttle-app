/**
 * Feature 016 — List End-Time and Payment Visibility
 * Interface contracts for list-view derivation layer.
 *
 * These types define the public surface of deriveSlotRows() and
 * deriveAdminListRows() after the 016 changes. Consumers of these
 * functions must be updated to handle the new optional parameters
 * and the added `paymentStatus` field on AdminListRow.
 */

import type { NormalizedPaymentStatus } from '../../../src/features/booking/paymentStatus'

// ---------------------------------------------------------------------------
// Shared status union
// ---------------------------------------------------------------------------

export type ListRowStatus =
  | 'AVAILABLE'
  | 'PENDING'
  | 'CONFIRMED'
  | 'UNAVAILABLE'
  | 'CANCELLED'
  | 'NO_SHOW'

// ---------------------------------------------------------------------------
// Player list view row (deriveSlotRows output)
// ---------------------------------------------------------------------------

/**
 * deriveSlotRows(date, bookings, options?)
 *
 * @param date            - The calendar day to derive rows for
 * @param bookings        - Bookings fetched for this date (already filtered to day)
 * @param options.scheduleEndHour   - Court close hour (default: 22). Pass Math.ceil(timeStrToHours(court_close_time)).
 * @param options.scheduleStartHour - Court open hour (default: 6).
 *
 * Changed in 016:
 * - `slotEnd` on booking rows now uses actual booking end time (unclamped)
 * - Accepts scheduleEndHour to align with court_settings
 */
export interface SlotRowOptions {
  scheduleStartHour?: number  // default 6
  scheduleEndHour?: number    // default 22
}

export interface SlotRowRepresentation {
  type: 'booking' | 'available'
  slotStart: Date
  slotEnd: Date               // For booking rows: actual booking end (unclamped from 016)
  durationMinutes: number
  status: ListRowStatus
  booking?: import('../../../src/features/booking/useBookings').Booking
  actionable: boolean
}

// ---------------------------------------------------------------------------
// Admin list view row (deriveAdminListRows output)
// ---------------------------------------------------------------------------

/**
 * deriveAdminListRows(date, bookings, options?)
 *
 * @param date            - The calendar day to derive rows for
 * @param bookings        - Bookings fetched for this date (admin query, includes payment_status)
 * @param options.scheduleEndHour   - Court close hour (default: 22). Pass Math.ceil(timeStrToHours(court_close_time)).
 * @param options.scheduleStartHour - Court open hour (default: 6).
 *
 * Changed in 016:
 * - `slotEnd` on booking rows now uses actual booking end time (unclamped)
 * - `paymentStatus` field added (undefined for 'available' rows, FR-007)
 * - Accepts scheduleEndHour to align with court_settings
 */
export interface AdminListRowOptions {
  scheduleStartHour?: number  // default 6
  scheduleEndHour?: number    // default 22
}

export interface AdminListRow {
  type: 'booking' | 'available'
  slotStart: Date
  slotEnd: Date               // For booking rows: actual booking end (unclamped from 016)
  durationMinutes: number
  status: ListRowStatus
  booking?: import('../../../src/features/booking/useBookings').Booking
  playerName?: string | null
  actionable: boolean
  /** Present only on booking rows. Undefined on available rows (FR-007). */
  paymentStatus?: NormalizedPaymentStatus
}

// ---------------------------------------------------------------------------
// Payment status display contract (AdminListView render rules)
// ---------------------------------------------------------------------------

/**
 * Payment badge render rules (FR-005 through FR-008):
 * - Show badge only when row.type === 'booking' AND row.paymentStatus is defined
 * - 'UNKNOWN' status: render a muted/outline badge (fallback, not hidden)
 * - 'available' rows: never render a payment badge (FR-007)
 * - Badge uses getPaymentStatusPillClassName(paymentStatus) for color
 * - Badge uses getPaymentStatusLabel(paymentStatus) for text
 */
export type PaymentBadgeVisibility =
  | { show: false }
  | { show: true; status: NormalizedPaymentStatus; label: string; className: string }
