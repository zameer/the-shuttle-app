import type { BookingStatus } from '@/features/booking/useBookings'

export type BookingStatusWithAvailable = BookingStatus | 'AVAILABLE'

export const BOOKING_STATUS_LABEL: Record<BookingStatusWithAvailable, string> = {
  CONFIRMED: 'Reserved',
  PENDING: 'Pending',
  UNAVAILABLE: 'Unavailable',
  CANCELLED: 'Cancelled',
  NO_SHOW: 'No Show',
  AVAILABLE: 'Open',
}

export const BOOKING_STATUS_BADGE_CLASS: Record<BookingStatusWithAvailable, string> = {
  CONFIRMED: 'bg-green-100 text-green-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  UNAVAILABLE: 'bg-gray-200 text-gray-600',
  CANCELLED: 'bg-red-100 text-red-700',
  NO_SHOW: 'bg-orange-100 text-orange-700',
  AVAILABLE: 'bg-blue-100 text-blue-800',
}

export const BOOKING_STATUS_ROW_CLASS: Record<BookingStatusWithAvailable, string> = {
  CONFIRMED: 'bg-green-100 border-green-200 text-green-900',
  PENDING: 'bg-yellow-100 border-yellow-200 text-yellow-900',
  UNAVAILABLE: 'bg-gray-100 border-gray-200 text-gray-500',
  CANCELLED: 'bg-red-100 border-red-200 text-red-900',
  NO_SHOW: 'bg-orange-100 border-orange-200 text-orange-900',
  AVAILABLE: 'bg-blue-50 border-blue-200 text-blue-900',
}

export const BOOKING_STATUS_DOT_CLASS: Record<BookingStatusWithAvailable, string> = {
  CONFIRMED: 'bg-green-500',
  PENDING: 'bg-yellow-500',
  UNAVAILABLE: 'bg-gray-400',
  CANCELLED: 'bg-red-500',
  NO_SHOW: 'bg-orange-500',
  AVAILABLE: 'bg-blue-400',
}
