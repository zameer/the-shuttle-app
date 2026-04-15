import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/services/supabase'
import { isAfter, isBefore, differenceInMinutes, addMinutes } from 'date-fns'
import type { Booking } from '@/features/booking/useBookings'

export interface TimeAdjustmentRequest {
  bookingId: string
  startTime: Date
  endTime: Date
}

export interface ValidationResult {
  isValid: boolean
  conflicts?: {
    bookingId: string
    playerName?: string
    startTime: string
    endTime: string
    status: string
  }[]
  errorMessage?: string
}

export interface TimeAdjustmentConstraints {
  minDurationMinutes: number // default: 30
  maxDurationMinutes: number // default: 480 (8 hours)
  courtOpenHour: number // e.g., 6
  courtCloseHour: number // e.g., 23
}

const DEFAULT_CONSTRAINTS: TimeAdjustmentConstraints = {
  minDurationMinutes: 30,
  maxDurationMinutes: 480,
  courtOpenHour: 6,
  courtCloseHour: 23,
}

/**
 * Validates new booking times against existing bookings for conflicts
 * Used by useTimeAdjustment hook
 */
async function validateTimeAdjustment(
  bookingId: string,
  newStartTime: Date,
  newEndTime: Date,
  allBookings: Booking[],
  constraints: TimeAdjustmentConstraints = DEFAULT_CONSTRAINTS
): Promise<ValidationResult> {
  // Validate duration constraints
  const durationMinutes = differenceInMinutes(newEndTime, newStartTime)

  if (durationMinutes < constraints.minDurationMinutes) {
    return {
      isValid: false,
      errorMessage: `Booking must be at least ${constraints.minDurationMinutes} minutes long`,
    }
  }

  if (durationMinutes > constraints.maxDurationMinutes) {
    return {
      isValid: false,
      errorMessage: `Booking cannot exceed ${constraints.maxDurationMinutes} minutes`,
    }
  }

  // Validate court hours
  const startHour = newStartTime.getHours()
  const endHour = newEndTime.getHours()

  if (startHour < constraints.courtOpenHour || endHour > constraints.courtCloseHour) {
    return {
      isValid: false,
      errorMessage: `Court operates between ${constraints.courtOpenHour}:00 and ${constraints.courtCloseHour}:00`,
    }
  }

  // Check for conflicts with other bookings
  const conflicts = allBookings.filter(booking => {
    if (booking.id === bookingId) return false // Exclude the booking being adjusted
    if (booking.status === 'UNAVAILABLE') return false // Ignore unavailable blocks

    const existingStart = new Date(booking.start_time)
    const existingEnd = new Date(booking.end_time)

    // Check if times overlap
    const startsBeforeOurEnd = isBefore(newStartTime, existingEnd)
    const endsAfterOurStart = isAfter(newEndTime, existingStart)

    return startsBeforeOurEnd && endsAfterOurStart
  })

  if (conflicts.length > 0) {
    return {
      isValid: false,
      conflicts: conflicts.map(c => ({
        bookingId: c.id,
        playerName: c.player_name,
        startTime: c.start_time,
        endTime: c.end_time,
        status: c.status,
      })),
      errorMessage: `Time conflicts with ${conflicts.length} existing booking(s)`,
    }
  }

  return { isValid: true }
}

/**
 * Hook for adjusting booking times with conflict detection (US6)
 * 
 * @example
 * const { mutate: adjustTime, isPending } = useTimeAdjustment({ bookingId: 'xyz' })
 * 
 * const handleTimeAdjustment = async () => {
 *   const validation = await validateTimeAdjustment(...)
 *   if (validation.isValid) {
 *     adjustTime({ bookingId, startTime, endTime })
 *   }
 * }
 */
export function useTimeAdjustment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (request: TimeAdjustmentRequest) => {
      const { data, error } = await supabase
        .from('bookings')
        .update({
          start_time: request.startTime.toISOString(),
          end_time: request.endTime.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', request.bookingId)
        .select()
        .single()

      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: () => {
      // Invalidate related queries to refresh calendar
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    },
  })
}

/**
 * Wrapper function to validate and execute time adjustment
 * Call this before mutating to get validation feedback
 */
export async function validateAndAdjustTime(
  bookingId: string,
  newStartTime: Date,
  newEndTime: Date,
  allBookings: Booking[],
  constraints?: TimeAdjustmentConstraints
): Promise<ValidationResult> {
  return validateTimeAdjustment(bookingId, newStartTime, newEndTime, allBookings, constraints)
}

export { validateTimeAdjustment }
