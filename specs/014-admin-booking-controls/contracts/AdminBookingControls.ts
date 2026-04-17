/**
 * Contract: Admin Booking Controls — Feature 014
 *
 * Defines the interfaces for:
 *  1. Extended BookingStatus type (CANCELLED, NO_SHOW)
 *  2. useUpdateBooking hook payload
 *  3. BookingDetailsModal edit state
 *  4. AdminListView past-booking entry point
 *  5. Derivation function past-date behaviour
 */

import type { Booking, BookingStatus, PaymentStatus } from '@/features/booking/useBookings'

// ---------------------------------------------------------------------------
// 1. Extended BookingStatus (replaces current union in useBookings.ts)
// ---------------------------------------------------------------------------

/**
 * All valid booking statuses including two new admin-managed states.
 * AVAILABLE is excluded — it is a derived display state only, never stored.
 */
export type ExtendedBookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'UNAVAILABLE'
  | 'CANCELLED'
  | 'NO_SHOW'

/**
 * Human-readable labels for each status (for dropdowns and badges).
 */
export const BOOKING_STATUS_LABELS: Record<ExtendedBookingStatus, string> = {
  CONFIRMED:   'Confirmed',
  PENDING:     'Pending',
  UNAVAILABLE: 'Unavailable (Block)',
  CANCELLED:   'Cancelled',
  NO_SHOW:     'No Show',
}

/**
 * Tailwind CSS classes for each status badge.
 */
export const BOOKING_STATUS_STYLES: Record<ExtendedBookingStatus | 'AVAILABLE', string> = {
  CONFIRMED:   'bg-green-100 text-green-800',
  PENDING:     'bg-yellow-100 text-yellow-800',
  UNAVAILABLE: 'bg-gray-100 text-gray-600',
  CANCELLED:   'bg-red-100 text-red-700',
  NO_SHOW:     'bg-orange-100 text-orange-700',
  AVAILABLE:   'bg-blue-100 text-blue-700',
}

// ---------------------------------------------------------------------------
// 2. useUpdateBooking — Unified booking update hook payload
// ---------------------------------------------------------------------------

/**
 * Payload for the new useUpdateBooking hook.
 * All fields except `id` are optional — only provided fields are written to DB.
 */
export interface UpdateBookingPayload {
  id: string
  status?: BookingStatus
  payment_status?: PaymentStatus
  /** Admin-entered hourly rate; any value ≥ 0 (including 0 for complimentary sessions) */
  hourly_rate?: number
  /** Admin-entered total price; any value ≥ 0; not auto-calculated from rate */
  total_price?: number
}

// ---------------------------------------------------------------------------
// 3. BookingDetailsModal — Edit state shape
// ---------------------------------------------------------------------------

/**
 * Local edit state tracked inside BookingDetailsModal.
 * Initialised from the booking prop; saved via useUpdateBooking on Save.
 */
export interface BookingEditState {
  status: BookingStatus
  /** Currently edited hourly rate (LKR) */
  editRate: number
  /** Currently edited total price (LKR) */
  editTotal: number
  /** True when editRate/editTotal have been changed from original booking values */
  isPriceModified: boolean
}

/**
 * Props extension for BookingDetailsModal to support the new unified save action.
 */
export interface BookingDetailsModalOnSave {
  /**
   * Replaces the existing `onUpdateStatus` callback.
   * Called when admin clicks Save with any combination of changed fields.
   */
  onSave: (payload: UpdateBookingPayload) => Promise<void>
}

// ---------------------------------------------------------------------------
// 4. AdminListView — Past date booking creation
// ---------------------------------------------------------------------------

/**
 * Props shape for AdminListView (existing + new).
 * The `onAddBooking` callback is invoked when the "Add Booking" button is
 * clicked on a past-date view (where available slot rows are hidden).
 */
export interface AdminListViewProps {
  currentDate: Date
  bookings: Booking[]
  onBookingClick: (booking: Booking) => void
  /** Called from available slot "+" buttons on current/future dates */
  onAvailableSlotClick: (slotStart: Date) => void
  /** Called from the "Add Booking for this date" button on past dates */
  onAddBooking: (date: Date) => void
}

// ---------------------------------------------------------------------------
// 5. Derivation — Past-date slot suppression behaviour
// ---------------------------------------------------------------------------

/**
 * Both deriveSlotRows and deriveAdminListRows adopt this behaviour:
 *
 * - If date < startOfToday(): emit ONLY booking rows; suppress ALL available rows
 * - If date >= startOfToday(): existing behaviour unchanged (emit all rows)
 *
 * The function signatures remain unchanged; no new parameters needed.
 * The past-date check is computed internally using `isBefore(startOfDay(date), startOfDay(new Date()))`.
 */
export type PastDateSlotBehaviour = 'suppress-available' | 'emit-all'

/**
 * Calendar.tsx adopts the same logic per rendered hour:
 * - Past date + AVAILABLE status → do not render hour block
 * - Past date + any other status → render normally
 * - Current/future date → render all hour blocks (no change)
 */
export type CalendarPastHourBehaviour = 'hide-if-available' | 'show-all'
