import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/services/supabase'

export interface PublicBooking {
  id: string
  start_time: string
  end_time: string
  status: 'AVAILABLE' | 'PENDING' | 'CONFIRMED' | 'UNAVAILABLE'
}

export function usePublicBookings(startDate: Date, endDate: Date) {
  return useQuery({
    queryKey: ['public-bookings', startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]],
    queryFn: async (): Promise<PublicBooking[]> => {
      const { data, error } = await supabase
        .from('bookings')
        .select('id, start_time, end_time, status')
        .lte('start_time', endDate.toISOString())
        .gte('end_time', startDate.toISOString())
        .order('start_time', { ascending: true })

      if (error) throw new Error(error.message)
      return data as PublicBooking[]
    },
  })
}
