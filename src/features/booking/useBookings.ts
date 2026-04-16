import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { endOfDay, endOfWeek, startOfDay, startOfWeek } from 'date-fns'
import { supabase } from '@/services/supabase'
import { normalizePaymentStatus } from '@/features/booking/paymentStatus'

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'UNAVAILABLE'
export type PaymentStatus = 'PENDING' | 'PAID' | 'UNPAID' | 'UNKNOWN'

export interface Booking {
  id: string
  player_phone_number: string | null
  start_time: string
  end_time: string
  status: BookingStatus
  hourly_rate: number | null
  total_price: number | null
  payment_status: PaymentStatus | null
  player_name?: string | null  // Optional: populated when fetchPlayerNames is true
}

function getEffectiveQueryRange(startDate?: Date | null, endDate?: Date | null) {
  const fallbackStart = startOfWeek(new Date())
  const fallbackEnd = endOfWeek(new Date())

  return {
    start: startOfDay(startDate ?? fallbackStart),
    end: endOfDay(endDate ?? fallbackEnd),
  }
}

type BookingRow = Omit<Booking, 'player_name' | 'payment_status'> & {
  payment_status: string | null
  players?: { name: string | null } | null
}

export interface PlayerDetails {
  phone_number: string
  name: string | null
  address: string | null
}

/**
 * Fetches bookings within a date range with optional player name lookup via FK.
 * 
 * @param startDate - Start of date range (inclusive)
 * @param endDate - End of date range (inclusive)
 * @param fetchPlayerNames - If true, performs FK join to fetch player names for admin view (default: false)
 * @returns Query with Booking[] array; player_name populated on admin fetch, null on public
 * 
 * @example
 * // Admin view - includes player names
 * const { data } = useBookings(startDate, endDate, true)
 * 
 * @example
 * // Public view - no player names per RLS policy
 * const { data } = useBookings(startDate, endDate)
 * 
 * @note RLS policies must enforce:
 *   - Admin can read all bookings with player names
 *   - Public users see bookings filtered by view (status only)
 */
export function useBookings(startDate?: Date | null, endDate?: Date | null, fetchPlayerNames: boolean = false) {
  const { start, end } = getEffectiveQueryRange(startDate, endDate)

  return useQuery({
    queryKey: [
      'bookings',
      start.toISOString().split('T')[0],
      end.toISOString().split('T')[0],
      fetchPlayerNames ? 'with-names' : 'status-only'
    ],
    queryFn: async (): Promise<Booking[]> => {
      // Build select clause based on fetchPlayerNames flag
      const selectClause = fetchPlayerNames
        ? '*,players(name)'  // FK join to players table
        : '*'

      const { data, error } = await supabase
        .from('bookings')
        .select(selectClause)
        .lte('start_time', end.toISOString())
        .gte('end_time', start.toISOString())
        .order('start_time', { ascending: true })

      if (error) throw new Error(error.message)
      
      const rows = (data ?? []) as BookingRow[]

      // Transform response: if FK was fetched, extract player name from nested object
      if (fetchPlayerNames) {
        return rows.map((booking) => ({
          ...booking,
          payment_status: normalizePaymentStatus(booking.payment_status),
          player_name: booking.players?.name ?? null,
        }))
      }

      return rows.map((booking) => ({
        ...booking,
        payment_status: normalizePaymentStatus(booking.payment_status),
      })) as Booking[]
    },
  })
}

/**
 * Fetches detailed player information (name, phone, address) by phone number.
 * Admin-only via RLS policy.
 * 
 * @param phoneNumber - Player's phone number (primary key)
 * @returns Query with PlayerDetails (name, phone_number, address)
 * 
 * @example
 * const { data, isLoading } = usePlayerDetails("+94701234567")
 * 
 * @note RLS policies must enforce:
 *   - Only admin users can read player details (name, address, phone)
 *   - Public/unauthenticated users cannot access this endpoint
 */
export function usePlayerDetails(phoneNumber: string | null | undefined) {
  return useQuery({
    queryKey: ['player-details', phoneNumber],
    enabled: !!phoneNumber,
    queryFn: async (): Promise<PlayerDetails | null> => {
      if (!phoneNumber) return null

      const { data, error } = await supabase
        .from('players')
        .select('phone_number,name,address')
        .eq('phone_number', phoneNumber)
        .single()

      if (error) throw new Error(error.message)
      return data as PlayerDetails
    },
  })
}

// Hard-deletes a booking from the database (T059)
export function useDeleteBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id)
      if (error) throw new Error(error.message)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    }
  })
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status, payment_status }: { id: string, status?: BookingStatus, payment_status?: PaymentStatus }) => {
      const updates: Record<string, unknown> = {}
      if (status) updates.status = status
      if (payment_status) updates.payment_status = payment_status

      const { data, error } = await supabase
        .from('bookings')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw new Error(error.message)
      return data as Booking
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    }
  })
}
