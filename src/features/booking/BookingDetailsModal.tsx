import { useState } from 'react'
import type { Booking, BookingStatus, PaymentStatus } from './useBookings'
import { useDeleteBooking, usePlayerDetails, useBookings } from './useBookings'
import { format, parse, startOfDay, endOfDay } from 'date-fns'
import { Loader2, Trash2, CheckCircle, CreditCard, Phone, MapPin, Clock, AlertCircle } from 'lucide-react'
import { useTimeAdjustment, validateTimeAdjustment } from '@/hooks/useTimeAdjustment'
import { getPaymentStatusLabel, getPaymentStatusPillClassName, normalizePaymentStatus } from '@/features/booking/paymentStatus'

interface Props {
  booking: Booking
  isOpen: boolean
  isAdmin?: boolean
  onClose: () => void
  onUpdateStatus: (id: string, status?: BookingStatus, paymentStatus?: PaymentStatus) => void
}

/**
 * BookingDetailsModal - Displays booking details with optional player contact info (admin only)
 * 
 * Admin view shows:
 * - Player name, phone number, address (via usePlayerDetails hook)
 * - Booking status, time, financials
 * - Confirm/Cancel/Delete actions
 * 
 * Non-admin view:
 * - Modal does not render (access control)
 * - Click on booking cells is prevented
 * 
 * @param isAdmin - If true, shows player details and allows interactions
 */
export default function BookingDetailsModal({ booking, isOpen, isAdmin = false, onClose, onUpdateStatus }: Props) {
  const bookingDate = new Date(booking.start_time)
  const dayStart = startOfDay(bookingDate)
  const dayEnd = endOfDay(bookingDate)

  const [isUpdating, setIsUpdating] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [showTimeAdjustment, setShowTimeAdjustment] = useState(false)
  const [adjustedStartTime, setAdjustedStartTime] = useState<string>(format(new Date(booking.start_time), 'HH:mm'))
  const [adjustedEndTime, setAdjustedEndTime] = useState<string>(format(new Date(booking.end_time), 'HH:mm'))
  const [timeValidationError, setTimeValidationError] = useState<string>('')
  const [timeConflicts, setTimeConflicts] = useState<any[]>([])
  const [isValidatingTime, setIsValidatingTime] = useState(false)

  const { mutateAsync: deleteBooking, isPending: isDeleting } = useDeleteBooking()
  const { data: playerDetails, isLoading: isLoadingPlayer } = usePlayerDetails(booking.player_phone_number)
  const { data: allBookings = [] } = useBookings(dayStart, dayEnd, true)
  const { mutate: adjustTime, isPending: isAdjustingTime } = useTimeAdjustment()

  if (!isOpen) return null

  // Admin-only access control: Don't render modal for non-admin users
  if (!isAdmin) {
    console.warn('Unauthorized: Non-admin user attempted to access booking details modal')
    return null
  }

  const handleUpdate = async (status?: BookingStatus, paymentStatus?: PaymentStatus) => {
    setIsUpdating(true)
    try {
      await onUpdateStatus(booking.id, status, paymentStatus)
      onClose()
    } catch (e) {
      console.error(e)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async () => {
    try {
      await deleteBooking(booking.id)
      onClose()
    } catch (e) {
      console.error(e)
    }
  }

  const handleValidateTimeAdjustment = async () => {
    setIsValidatingTime(true)
    setTimeValidationError('')
    setTimeConflicts([])

    try {
      const newStartDate = parse(adjustedStartTime, 'HH:mm', bookingDate)
      const newEndDate = parse(adjustedEndTime, 'HH:mm', bookingDate)

      const validation = await validateTimeAdjustment(
        booking.id,
        newStartDate,
        newEndDate,
        allBookings
      )

      if (!validation.isValid) {
        setTimeValidationError(validation.errorMessage || 'Invalid time adjustment')
        if (validation.conflicts) {
          setTimeConflicts(validation.conflicts)
        }
      }
    } catch (e) {
      setTimeValidationError(e instanceof Error ? e.message : 'Validation failed')
    } finally {
      setIsValidatingTime(false)
    }
  }

  const handleConfirmTimeAdjustment = async () => {
    if (timeValidationError) return // Don't proceed if validation failed

    const newStartDate = parse(adjustedStartTime, 'HH:mm', bookingDate)
    const newEndDate = parse(adjustedEndTime, 'HH:mm', bookingDate)

    adjustTime(
      {
        bookingId: booking.id,
        startTime: newStartDate,
        endTime: newEndDate,
      },
      {
        onSuccess: () => {
          setShowTimeAdjustment(false)
          onClose()
        },
      }
    )
  }

  const statusColor = {
    CONFIRMED: 'bg-green-100 text-green-800',
    PENDING: 'bg-yellow-100 text-yellow-800',
    UNAVAILABLE: 'bg-gray-100 text-gray-600',
  }[booking.status] ?? 'bg-gray-100 text-gray-800'

  const paymentStatus = normalizePaymentStatus(booking.payment_status)
  const paymentLabel = getPaymentStatusLabel(paymentStatus)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl overflow-hidden">
        {/* Header */}
        <div className="border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Booking Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Player Information Section */}
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Player</p>
              {isLoadingPlayer ? (
                <div className="mt-1 flex items-center gap-1">
                  <Loader2 size={14} className="animate-spin text-gray-400" />
                  <span className="text-sm text-gray-500">Loading...</span>
                </div>
              ) : (
                <div className="mt-0.5 space-y-1">
                  <p className="text-gray-900 font-medium">
                    {playerDetails?.name || booking.player_phone_number || '—'}
                  </p>
                </div>
              )}
            </div>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor}`}>
              {booking.status}
            </span>
          </div>

          {/* Contact Information (Admin Only) */}
          {playerDetails && (
            <div className="bg-blue-50 rounded-lg p-4 space-y-2 border border-blue-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Contact Information</p>
              
              {playerDetails.phone_number && (
                <div className="flex items-start gap-2">
                  <Phone size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500">Phone</span>
                    <a 
                      href={`tel:${playerDetails.phone_number}`}
                      className="text-sm text-blue-600 hover:underline font-medium"
                    >
                      {playerDetails.phone_number}
                    </a>
                  </div>
                </div>
              )}

              {playerDetails.address && (
                <div className="flex items-start gap-2">
                  <MapPin size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500">Address</span>
                    <p className="text-sm text-gray-900 font-medium">{playerDetails.address}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Booking Time */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Time</p>
            <p className="text-gray-900 font-medium mt-0.5">
              {format(new Date(booking.start_time), 'h:mm a')} → {format(new Date(booking.end_time), 'h:mm a')}
            </p>
            <p className="text-sm text-gray-500">{format(new Date(booking.start_time), 'EEEE, MMM do yyyy')}</p>
          </div>

          {/* Time Adjustment Section (Admin Only) */}
          {!showTimeAdjustment ? (
            <button
              onClick={() => setShowTimeAdjustment(true)}
              className="w-full flex items-center justify-center gap-2 border border-blue-200 text-blue-600 hover:bg-blue-50 font-medium py-2 px-3 rounded-lg text-sm transition-colors"
            >
              <Clock size={15} /> Adjust Time
            </button>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Adjust Booking Time</p>
              
              <div className="space-y-2">
                <label className="block text-xs text-gray-600 font-medium">Start Time</label>
                <input
                  type="time"
                  value={adjustedStartTime}
                  onChange={(e) => {
                    setAdjustedStartTime(e.target.value)
                    setTimeValidationError('')
                    setTimeConflicts([])
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs text-gray-600 font-medium">End Time</label>
                <input
                  type="time"
                  value={adjustedEndTime}
                  onChange={(e) => {
                    setAdjustedEndTime(e.target.value)
                    setTimeValidationError('')
                    setTimeConflicts([])
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Validation Error */}
              {timeValidationError && (
                <div className="bg-red-100 border border-red-300 rounded-lg p-2 flex items-start gap-2">
                  <AlertCircle size={14} className="text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-red-600 font-medium">{timeValidationError}</p>
                    {timeConflicts.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {timeConflicts.map((conflict, idx) => (
                          <p key={idx} className="text-xs text-red-600">
                            • {conflict.playerName || 'Player'}: {format(new Date(conflict.startTime), 'h:mm a')} - {format(new Date(conflict.endTime), 'h:mm a')}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    setShowTimeAdjustment(false)
                    setTimeValidationError('')
                    setTimeConflicts([])
                  }}
                  className="flex-1 py-1.5 text-sm border rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-60"
                  disabled={isValidatingTime}
                >
                  Cancel
                </button>
                <button
                  onClick={handleValidateTimeAdjustment}
                  className="flex-1 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
                  disabled={isValidatingTime}
                >
                  {isValidatingTime ? <Loader2 size={14} className="inline animate-spin mr-1" /> : 'Check'}
                </button>
                <button
                  onClick={handleConfirmTimeAdjustment}
                  className="flex-1 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60"
                  disabled={timeValidationError !== '' || isAdjustingTime}
                >
                  {isAdjustingTime ? <Loader2 size={14} className="inline animate-spin mr-1" /> : 'Save'}
                </button>
              </div>
            </div>
          )}

          {/* Financials */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Financials</p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Rate: {booking.hourly_rate ?? '—'} LKR/hr</span>
              <span className="font-bold text-gray-900">{booking.total_price ?? 0} LKR</span>
            </div>
            <div className="mt-2">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${getPaymentStatusPillClassName(paymentStatus)}`}>
                Payment: {paymentLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-gray-50 px-6 py-4 flex flex-col gap-2 border-t">
          <div className="grid grid-cols-2 gap-2">
            {booking.status === 'PENDING' && (
              <button
                disabled={isUpdating}
                onClick={() => handleUpdate('CONFIRMED')}
                className="flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-lg text-sm transition-colors disabled:opacity-60"
              >
                <CheckCircle size={15} /> Confirm
              </button>
            )}
            {booking.status === 'CONFIRMED' && booking.payment_status === 'PENDING' && (
              <button
                disabled={isUpdating}
                onClick={() => handleUpdate(undefined, 'PAID')}
                className="flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-3 rounded-lg text-sm transition-colors disabled:opacity-60"
              >
                <CreditCard size={15} /> Mark Paid
              </button>
            )}
          </div>

          {/* Confirmation step for delete */}
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center justify-center gap-1.5 border border-red-200 text-red-600 hover:bg-red-50 font-medium py-2 px-3 rounded-lg text-sm transition-colors"
            >
              <Trash2 size={15} /> Cancel Booking
            </button>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex flex-col gap-2">
              <p className="text-sm text-red-700 font-medium text-center">
                Permanently delete this booking?
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="py-1.5 text-sm border rounded-lg text-gray-600 hover:bg-gray-100"
                >
                  Keep
                </button>
                <button
                  disabled={isDeleting}
                  onClick={handleDelete}
                  className="flex items-center justify-center gap-1 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-60"
                >
                  {isDeleting ? <Loader2 size={14} className="animate-spin" /> : 'Yes, Delete'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
