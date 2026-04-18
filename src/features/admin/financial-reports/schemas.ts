import { z } from 'zod'

export const reportDateRangeSchema = z.object({
  startDate: z.string().min(1),
  endDate: z.string().min(1),
}).refine((value) => value.startDate <= value.endDate, {
  message: 'Start date must be less than or equal to end date',
  path: ['endDate'],
})

export const bookingStatusSchema = z.enum(['PENDING', 'CONFIRMED', 'UNAVAILABLE', 'CANCELLED', 'NO_SHOW'])
export const paymentStatusSchema = z.enum(['PAID', 'PENDING', 'UNPAID', 'UNKNOWN']).nullable()

export const bookingRowSchema = z.object({
  id: z.string(),
  player_phone_number: z.string().nullable(),
  start_time: z.string(),
  end_time: z.string(),
  status: bookingStatusSchema,
  payment_status: paymentStatusSchema,
  hourly_rate: z.number().nullable(),
  total_price: z.number().nullable(),
  players: z.object({
    name: z.string().nullable(),
  }).nullable().optional(),
})

export const bookingsResponseSchema = z.array(bookingRowSchema)

export type BookingRowSchema = z.infer<typeof bookingRowSchema>
export type ReportDateRangeSchema = z.infer<typeof reportDateRangeSchema>
