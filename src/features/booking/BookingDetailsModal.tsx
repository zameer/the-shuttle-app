import { Component, type ReactNode, useEffect, useMemo, useState } from 'react'
import { differenceInMinutes, endOfDay, format, parse, startOfDay } from 'date-fns'
import { AlertCircle, CheckCircle, CreditCard, Loader2, MapPin, Phone, RotateCcw, Trash2 } from 'lucide-react'
import { getPaymentStatusLabel, getPaymentStatusPillClassName, normalizePaymentStatus } from '@/features/booking/paymentStatus'
import { useSettings } from '@/features/booking/useSettings'
import { BOOKING_STATUS_BADGE_CLASS, BOOKING_STATUS_LABEL } from '@/features/booking/bookingStatusMeta'
import {
  BOOKING_MANAGE_SECTION_META,
  DEFAULT_SECTION_VISIBILITY,
  type NonCoreSectionId,
  type SectionVisibilityState,
} from '@/features/booking/bookingManageSections'
import BookingManageSectionPanel from '@/features/booking/components/BookingManageSectionPanel'
import { useDeleteBooking, usePlayerDetails, useBookings } from './useBookings'
import type { Booking, BookingStatus, PaymentStatus, UpdateBookingPayload } from './useBookings'
import { useTimeAdjustment, validateTimeAdjustment } from '@/hooks/useTimeAdjustment'

interface Props {
  booking: Booking
  isOpen: boolean
  isAdmin?: boolean
  onClose: () => void
  onSave: (payload: UpdateBookingPayload) => Promise<void>
}

interface TimeConflict {
  playerName?: string | null
  startTime: string
  endTime: string
}

interface SectionBoundaryProps {
  title: string
  children: ReactNode
}

interface SectionBoundaryState {
  hasError: boolean
}

class SectionBoundary extends Component<SectionBoundaryProps, SectionBoundaryState> {
  constructor(props: SectionBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): SectionBoundaryState {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
          {this.props.title} is temporarily unavailable. Core booking actions are still available.
        </div>
      )
    }

    return this.props.children
  }
}

function getSectionRenderState(visibility: SectionVisibilityState) {
  return {
    'time-adjustment': visibility['time-adjustment'],
    financials: visibility.financials,
    'advanced-actions': visibility['advanced-actions'],
  }
}

export default function BookingDetailsModal({ booking, isOpen, isAdmin = false, onClose, onSave }: Props) {
  const bookingDate = new Date(booking.start_time)
  const dayStart = startOfDay(bookingDate)
  const dayEnd = endOfDay(bookingDate)

  const [isUpdating, setIsUpdating] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [showTimeAdjustment, setShowTimeAdjustment] = useState(false)
  const [adjustedStartTime, setAdjustedStartTime] = useState<string>(format(new Date(booking.start_time), 'HH:mm'))
  const [adjustedEndTime, setAdjustedEndTime] = useState<string>(format(new Date(booking.end_time), 'HH:mm'))
  const [timeValidationError, setTimeValidationError] = useState<string>('')
  const [timeConflicts, setTimeConflicts] = useState<TimeConflict[]>([])
  const [isValidatingTime, setIsValidatingTime] = useState(false)

  const [editStatus, setEditStatus] = useState<BookingStatus>(booking.status)
  const [editRate, setEditRate] = useState<number>(booking.hourly_rate ?? 0)
  const [editTotal, setEditTotal] = useState<number>(booking.total_price ?? 0)
  const [sectionVisibility, setSectionVisibility] = useState<SectionVisibilityState>(DEFAULT_SECTION_VISIBILITY)
  const [sectionLoaded, setSectionLoaded] = useState<Record<NonCoreSectionId, boolean>>({
    'time-adjustment': false,
    financials: false,
    'advanced-actions': false,
  })

  const sessionStateKey = useMemo(() => `booking-manage-session:${booking.id}`, [booking.id])

  const { data: settings } = useSettings()
  const { mutateAsync: deleteBooking, isPending: isDeleting } = useDeleteBooking()
  const { data: playerDetails, isLoading: isLoadingPlayer } = usePlayerDetails(booking.player_phone_number)
  const { data: allBookings = [] } = useBookings(dayStart, dayEnd, true)
  const { mutate: adjustTime, isPending: isAdjustingTime } = useTimeAdjustment()

  useEffect(() => {
    setEditStatus(booking.status)
    setEditRate(booking.hourly_rate ?? 0)
    setEditTotal(booking.total_price ?? 0)
    setAdjustedStartTime(format(new Date(booking.start_time), 'HH:mm'))
    setAdjustedEndTime(format(new Date(booking.end_time), 'HH:mm'))
    setTimeValidationError('')
    setTimeConflicts([])
    setShowTimeAdjustment(false)
    setConfirmDelete(false)

    const savedState = sessionStorage.getItem(sessionStateKey)
    if (!savedState) {
      setSectionVisibility(DEFAULT_SECTION_VISIBILITY)
      setSectionLoaded({
        'time-adjustment': false,
        financials: false,
        'advanced-actions': false,
      })
      return
    }

    try {
      const parsed = JSON.parse(savedState) as {
        sectionVisibility?: Partial<SectionVisibilityState>
        sectionLoaded?: Partial<Record<NonCoreSectionId, boolean>>
        editStatus?: BookingStatus
        editRate?: number
        editTotal?: number
        showTimeAdjustment?: boolean
        adjustedStartTime?: string
        adjustedEndTime?: string
      }

      setSectionVisibility({
        ...DEFAULT_SECTION_VISIBILITY,
        ...parsed.sectionVisibility,
        'core-summary': true,
      })

      setSectionLoaded({
        'time-adjustment': Boolean(parsed.sectionLoaded?.['time-adjustment']),
        financials: Boolean(parsed.sectionLoaded?.financials),
        'advanced-actions': Boolean(parsed.sectionLoaded?.['advanced-actions']),
      })

      if (parsed.editStatus) setEditStatus(parsed.editStatus)
      if (typeof parsed.editRate === 'number') setEditRate(parsed.editRate)
      if (typeof parsed.editTotal === 'number') setEditTotal(parsed.editTotal)
      if (typeof parsed.showTimeAdjustment === 'boolean') setShowTimeAdjustment(parsed.showTimeAdjustment)
      if (typeof parsed.adjustedStartTime === 'string') setAdjustedStartTime(parsed.adjustedStartTime)
      if (typeof parsed.adjustedEndTime === 'string') setAdjustedEndTime(parsed.adjustedEndTime)
    } catch {
      setSectionVisibility(DEFAULT_SECTION_VISIBILITY)
      setSectionLoaded({
        'time-adjustment': false,
        financials: false,
        'advanced-actions': false,
      })
    }
  }, [booking, sessionStateKey])

  useEffect(() => {
    sessionStorage.setItem(
      sessionStateKey,
      JSON.stringify({
        sectionVisibility,
        sectionLoaded,
        editStatus,
        editRate,
        editTotal,
        showTimeAdjustment,
        adjustedStartTime,
        adjustedEndTime,
      })
    )
  }, [
    adjustedEndTime,
    adjustedStartTime,
    editRate,
    editStatus,
    editTotal,
    sectionLoaded,
    sectionVisibility,
    sessionStateKey,
    showTimeAdjustment,
  ])

  if (!isOpen) return null

  if (!isAdmin) {
    console.warn('Unauthorized: Non-admin user attempted to access booking details modal')
    return null
  }

  const originalRate = booking.hourly_rate ?? 0
  const originalTotal = booking.total_price ?? 0
  const hasChanges = editStatus !== booking.status || editRate !== originalRate || editTotal !== originalTotal
  const hasInvalidPrice = Number.isNaN(editRate) || Number.isNaN(editTotal) || editRate < 0 || editTotal < 0

  const handleSave = async () => {
    if (!hasChanges || hasInvalidPrice) return

    const payload: UpdateBookingPayload = { id: booking.id }
    if (editStatus !== booking.status) payload.status = editStatus
    if (editRate !== originalRate) payload.hourly_rate = editRate
    if (editTotal !== originalTotal) payload.total_price = editTotal

    setIsUpdating(true)
    try {
      await onSave(payload)
      onClose()
    } catch (e) {
      console.error(e)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleQuickUpdate = async (status?: BookingStatus, paymentStatus?: PaymentStatus) => {
    setIsUpdating(true)
    try {
      await onSave({ id: booking.id, status, payment_status: paymentStatus })
      onClose()
    } catch (e) {
      console.error(e)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRevertPricing = () => {
    const durationMinutes = differenceInMinutes(new Date(booking.end_time), new Date(booking.start_time))
    const systemRate = settings?.defaultRate ?? originalRate
    const systemTotal = Math.max(0, (durationMinutes / 60) * systemRate)

    setEditRate(systemRate)
    setEditTotal(systemTotal)
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

      const validation = await validateTimeAdjustment(booking.id, newStartDate, newEndDate, allBookings)

      if (!validation.isValid) {
        setTimeValidationError(validation.errorMessage || 'Invalid time adjustment')
        if (Array.isArray(validation.conflicts)) {
          setTimeConflicts(validation.conflicts as TimeConflict[])
        }
      }
    } catch (e) {
      setTimeValidationError(e instanceof Error ? e.message : 'Validation failed')
    } finally {
      setIsValidatingTime(false)
    }
  }

  const handleConfirmTimeAdjustment = async () => {
    if (timeValidationError) return

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

  const toggleSection = (sectionId: NonCoreSectionId) => {
    setSectionVisibility((prev) => {
      const nextValue = !prev[sectionId]
      if (nextValue) {
        setSectionLoaded((loaded) => ({ ...loaded, [sectionId]: true }))
      }
      return { ...prev, [sectionId]: nextValue }
    })
  }

  const paymentStatus = normalizePaymentStatus(booking.payment_status)
  const paymentLabel = getPaymentStatusLabel(paymentStatus)
  const sectionRenderState = getSectionRenderState(sectionVisibility)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4">
      <div className="flex max-h-[calc(100dvh-1rem)] w-full max-w-lg flex-col overflow-hidden rounded-xl bg-white shadow-xl sm:max-h-[calc(100dvh-2rem)]">
        <div className="border-b px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-gray-900">Booking Details</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none" aria-label="Close details">
              &times;
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-6 pt-4 sm:px-6">
          <section className="rounded-lg border border-blue-100 bg-blue-50 p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Player</p>
                {isLoadingPlayer ? (
                  <div className="mt-1 flex items-center gap-1">
                    <Loader2 size={14} className="animate-spin text-gray-400" />
                    <span className="text-sm text-gray-500">Loading...</span>
                  </div>
                ) : (
                  <p className="mt-0.5 text-gray-900 font-medium">{playerDetails?.name || booking.player_phone_number || '-'}</p>
                )}
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${BOOKING_STATUS_BADGE_CLASS[editStatus]}`}>
                {BOOKING_STATUS_LABEL[editStatus]}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Status</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as BookingStatus)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-blue-500 outline-none border-gray-300 bg-white"
              >
                <option value="CONFIRMED">Confirmed</option>
                <option value="PENDING">Pending</option>
                <option value="UNAVAILABLE">Unavailable (Block)</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="NO_SHOW">No Show</option>
              </select>
            </div>

            <div className="rounded-lg border border-blue-200 bg-white p-3 space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Contact Details</p>

              <div className="flex items-start gap-2">
                <Phone size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500">Phone</span>
                  {playerDetails?.phone_number ? (
                    <a href={`tel:${playerDetails.phone_number}`} className="text-sm text-blue-700 hover:underline font-medium">
                      {playerDetails.phone_number}
                    </a>
                  ) : (
                    <span className="text-sm text-gray-500">Not provided</span>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-2">
                <MapPin size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500">Address</span>
                  <p className="text-sm text-gray-900 font-medium break-words">{playerDetails?.address || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </section>

          <BookingManageSectionPanel
            id="section-time-adjustment"
            title={BOOKING_MANAGE_SECTION_META['time-adjustment'].title}
            icon={BOOKING_MANAGE_SECTION_META['time-adjustment'].icon}
            expanded={sectionRenderState['time-adjustment']}
            onToggle={() => toggleSection('time-adjustment')}
            shouldRenderContent={sectionLoaded['time-adjustment'] || !BOOKING_MANAGE_SECTION_META['time-adjustment'].lazyRender}
          >
            <SectionBoundary title="Time adjustment">
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Time</p>
                  <p className="text-gray-900 font-medium mt-0.5">
                    {format(new Date(booking.start_time), 'h:mm a')} - {format(new Date(booking.end_time), 'h:mm a')}
                  </p>
                  <p className="text-sm text-gray-500">{format(new Date(booking.start_time), 'EEEE, MMM do yyyy')}</p>
                </div>

                {!showTimeAdjustment ? (
                  <button
                    onClick={() => setShowTimeAdjustment(true)}
                    className="w-full border border-blue-200 text-blue-600 hover:bg-blue-50 font-medium py-2 px-3 rounded-lg text-sm transition-colors"
                  >
                    Adjust Time
                  </button>
                ) : (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-3">
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

                    {timeValidationError && (
                      <div className="bg-red-100 border border-red-300 rounded-lg p-2 flex items-start gap-2">
                        <AlertCircle size={14} className="text-red-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-xs text-red-600 font-medium">{timeValidationError}</p>
                          {timeConflicts.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {timeConflicts.map((conflict, idx) => (
                                <p key={idx} className="text-xs text-red-600">
                                  - {conflict.playerName || 'Player'}: {format(new Date(conflict.startTime), 'h:mm a')} -{' '}
                                  {format(new Date(conflict.endTime), 'h:mm a')}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

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
              </div>
            </SectionBoundary>
          </BookingManageSectionPanel>

          <BookingManageSectionPanel
            id="section-financials"
            title={BOOKING_MANAGE_SECTION_META.financials.title}
            icon={BOOKING_MANAGE_SECTION_META.financials.icon}
            expanded={sectionRenderState.financials}
            onToggle={() => toggleSection('financials')}
            shouldRenderContent={sectionLoaded.financials || !BOOKING_MANAGE_SECTION_META.financials.lazyRender}
          >
            <SectionBoundary title="Financials">
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Hourly Rate (LKR)</label>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={editRate}
                      onChange={(e) => setEditRate(Number(e.target.value))}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-blue-500 outline-none border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Total Price (LKR)</label>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={editTotal}
                      onChange={(e) => setEditTotal(Number(e.target.value))}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-blue-500 outline-none border-gray-300"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={handleRevertPricing}
                    className="inline-flex items-center gap-1 text-sm font-medium px-3 py-1.5 rounded-lg border border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    <RotateCcw size={14} /> Revert to System Pricing
                  </button>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${getPaymentStatusPillClassName(paymentStatus)}`}>
                    Payment: {paymentLabel}
                  </span>
                </div>

                {hasInvalidPrice && <p className="text-xs text-red-600">Price values must be non-negative numbers.</p>}
              </div>
            </SectionBoundary>
          </BookingManageSectionPanel>

          <BookingManageSectionPanel
            id="section-advanced-actions"
            title={BOOKING_MANAGE_SECTION_META['advanced-actions'].title}
            icon={BOOKING_MANAGE_SECTION_META['advanced-actions'].icon}
            expanded={sectionRenderState['advanced-actions']}
            onToggle={() => toggleSection('advanced-actions')}
            shouldRenderContent={sectionLoaded['advanced-actions'] || !BOOKING_MANAGE_SECTION_META['advanced-actions'].lazyRender}
          >
            <SectionBoundary title="Advanced actions">
              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="w-full flex items-center justify-center gap-1.5 border border-red-200 text-red-600 hover:bg-red-50 font-medium py-2 px-3 rounded-lg text-sm transition-colors"
                >
                  <Trash2 size={15} /> Cancel Booking
                </button>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex flex-col gap-2">
                  <p className="text-sm text-red-700 font-medium text-center">Permanently delete this booking?</p>
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
            </SectionBoundary>
          </BookingManageSectionPanel>
        </div>

        <div className="sticky bottom-0 border-t bg-white/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur supports-[backdrop-filter]:bg-white/80 sm:px-6">
          <div className="space-y-2">
            <button
              disabled={isUpdating || !hasChanges || hasInvalidPrice}
              onClick={handleSave}
              className="w-full flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-lg text-sm transition-colors disabled:opacity-60"
            >
              {isUpdating ? <Loader2 size={14} className="animate-spin" /> : 'Save Changes'}
            </button>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {booking.status === 'PENDING' && (
                <button
                  disabled={isUpdating}
                  onClick={() => handleQuickUpdate('CONFIRMED')}
                  className="w-full flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-3 rounded-lg text-sm transition-colors disabled:opacity-60"
                >
                  <CheckCircle size={15} /> Confirm
                </button>
              )}
              {booking.payment_status === 'PENDING' && (
                <button
                  disabled={isUpdating}
                  onClick={() => handleQuickUpdate(undefined, 'PAID')}
                  className="w-full flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-3 rounded-lg text-sm transition-colors disabled:opacity-60"
                >
                  <CreditCard size={15} /> Mark Paid
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
