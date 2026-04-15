import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/services/supabase'

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'UNAVAILABLE'
export type PaymentStatus = 'PENDING' | 'PAID'

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
export function useBookings(startDate: Date, endDate: Date, fetchPlayerNames: boolean = false) {
  return useQuery({
    queryKey: [
      'bookings',
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0],
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
        .lte('start_time', endDate.toISOString())
        .gte('end_time', startDate.toISOString())
        .order('start_time', { ascending: true })

      if (error) throw new Error(error.message)
      
      // Transform response: if FK was fetched, extract player name from nested object
      if (fetchPlayerNames && data) {
        return data.map((booking: any) => ({
          ...booking,
          player_name: booking.players?.name || null,
          // Remove the nested players object to keep interface clean
          players: undefined,
        }))
      }
      
      return data as Booking[]
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
