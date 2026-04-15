import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { differenceInMinutes } from 'date-fns'
import { X, Loader2 } from 'lucide-react'

import { useSettings } from '@/features/booking/useSettings'
import PlayerSelectCombobox from './PlayerSelectCombobox'

import { supabase } from '@/services/supabase'

const bookingSchema = z.object({
  player_phone_number: z.string().min(5, "Valid phone number is required"),
  start_time: z.string().min(1, "Start time is required"),
  end_time: z.string().min(1, "End time is required"),
  status: z.enum(['AVAILABLE', 'PENDING', 'CONFIRMED', 'UNAVAILABLE']),
  hourly_rate: z.number().min(0, "Hourly rate is required"),
  payment_status: z.enum(['PENDING', 'PAID']),
})

type FormData = z.infer<typeof bookingSchema>

interface Props {
  initialDate?: Date
  initialStartTime?: Date
  onClose: () => void
  onSuccess: () => void
}

export default function BookingForm({ initialStartTime, onClose, onSuccess }: Props) {
  const { data: settings } = useSettings()

  // Standardize the HTML input datetime-local string
  const getLocalDatetimeStr = (d: Date) => {
    const offset = d.getTimezoneOffset() * 60000 
    return new Date(d.getTime() - offset).toISOString().slice(0, 16)
  }

  const defaultStart = initialStartTime ? getLocalDatetimeStr(initialStartTime) : getLocalDatetimeStr(new Date())
  
  // Default end time is 1 hour after start
  const placeholderEnd = new Date(initialStartTime || new Date())
  placeholderEnd.setHours(placeholderEnd.getHours() + 1)
  const defaultEnd = getLocalDatetimeStr(placeholderEnd)

  const { control, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      player_phone_number: '',
      start_time: defaultStart,
      end_time: defaultEnd,
      status: 'CONFIRMED',
      hourly_rate: 600, // will override when settings load
      payment_status: 'PENDING',
    }
  })

  // Override rate when settings load
  useEffect(() => {
    if (settings?.defaultRate) {
      setValue('hourly_rate', settings.defaultRate)
    }
  }, [settings, setValue])

  const watchStartTime = watch('start_time')
  const watchEndTime = watch('end_time')
  const watchRate = watch('hourly_rate')

  // Dynamic pricing calculation
  let totalPrice = 0
  if (watchStartTime && watchEndTime && watchRate) {
    const mins = differenceInMinutes(new Date(watchEndTime), new Date(watchStartTime))
    if (mins > 0) {
      // Allow partial calculations seamlessly
      totalPrice = (mins / 60) * watchRate
    }
  }

  const onSubmit = async (data: FormData) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .insert([{
          ...data,
          start_time: new Date(data.start_time).toISOString(),
          end_time: new Date(data.end_time).toISOString(),
          total_price: totalPrice
        }])

      if (error) throw error
      onSuccess()
    } catch (e: any) {
      alert("Failed to save booking. " + e.message)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white shadow-xl overflow-hidden flex flex-col h-[90vh] md:h-auto">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-xl font-bold text-gray-800">New Booking</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* US4: Scrollable form body with padding for sticky button on mobile */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto">
          <div className="p-6 pb-24 md:pb-6">
          
          <div className="mb-6">
            <Controller
              name="player_phone_number"
              control={control}
              render={({ field }) => (
                <PlayerSelectCombobox
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.player_phone_number?.message}
                  searchMode="both"
                />
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <Controller
                name="start_time"
                control={control}
                render={({ field }) => (
                  <input type="datetime-local" {...field} className="w-full border rounded-md px-3 py-2 text-sm focus:ring-blue-500 outline-none border-gray-300" />
                )}
              />
              {errors.start_time && <p className="text-red-500 text-xs mt-1">{errors.start_time.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <Controller
                name="end_time"
                control={control}
                render={({ field }) => (
                  <input type="datetime-local" {...field} className="w-full border rounded-md px-3 py-2 text-sm focus:ring-blue-500 outline-none border-gray-300" />
                )}
              />
              {errors.end_time && <p className="text-red-500 text-xs mt-1">{errors.end_time.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <select {...field} className="w-full border rounded-md px-3 py-2 text-sm focus:ring-blue-500 outline-none border-gray-300 bg-white">
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="PENDING">Pending</option>
                    <option value="UNAVAILABLE">Block (Unavailable)</option>
                  </select>
                )}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate (LKR)</label>
              <Controller
                name="hourly_rate"
                control={control}
                render={({ field }) => (
                  <select 
                    {...field} 
                    onChange={e => field.onChange(Number(e.target.value))}
                    className="w-full border rounded-md px-3 py-2 text-sm focus:ring-blue-500 outline-none border-gray-300 bg-white"
                  >
                    {settings?.availableRates.map(rate => (
                      <option key={rate} value={rate}>{rate}</option>
                    ))}
                    <option value={0}>Custom (Free)</option>
                  </select>
                )}
              />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6 relative">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">Financials</h3>
            <div className="flex items-center justify-between">
              <span className="text-blue-800 text-sm">Dynamical Calculation</span>
              <span className="text-xl font-bold tracking-tight text-blue-900">{totalPrice.toLocaleString()} LKR</span>
            </div>
            
            <div className="mt-4 pt-4 border-t border-blue-200">
              <label className="flex items-center gap-2 cursor-pointer">
                <Controller
                  name="payment_status"
                  control={control}
                  render={({ field }) => (
                    <input 
                      type="checkbox" 
                      checked={field.value === 'PAID'}
                      onChange={(e) => field.onChange(e.target.checked ? 'PAID' : 'PENDING')}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                  )}
                />
                <span className="text-sm font-medium text-blue-900 flex-1">Mark as Paid immediately</span>
              </label>
            </div>
          </div>
          </div>
        </form>

        {/* US4: Sticky footer buttons (always visible on mobile, positioned at bottom) */}
        <div className="sticky bottom-0 md:static border-t bg-white p-6 flex items-center justify-end gap-3 md:border-t md:bg-transparent">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md">Cancel</button>
          <button type="submit" disabled={isSubmitting} onClick={handleSubmit(onSubmit)} className="flex items-center justify-center min-w-[120px] px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md h-10 md:h-auto">
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Booking'}
          </button>
        </div>
      </div>
    </div>
  )
}
