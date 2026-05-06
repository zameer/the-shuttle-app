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

export const detailStatusScopeSchema = z.enum(['PAID', 'OUTSTANDING'])
export const outstandingBookingStatusSchema = z.enum(['CONFIRMED', 'CANCELLED', 'NO_SHOW'])
export const outstandingBookingStatusesSchema = z.array(outstandingBookingStatusSchema).min(1)

export const paidDetailFilterInputSchema = z.object({
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  scope: detailStatusScopeSchema,
  outstandingStatuses: outstandingBookingStatusesSchema,
}).refine((value) => value.startDate <= value.endDate, {
  message: 'Start date must be less than or equal to end date',
  path: ['endDate'],
})

export const paidDetailSearchParamsSchema = z.object({
  start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
})

export const expenseBalanceSearchParamsSchema = z.object({
  start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
})

export const expenseFormSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date is required'),
  description: z.string().trim().min(1, 'Description is required'),
  amount: z.number().positive('Amount must be greater than zero'),
})

const numericAmountSchema = z.union([
  z.number(),
  z.string().regex(/^\d+(\.\d+)?$/, 'Invalid numeric amount').transform((value) => Number(value)),
]).transform((value) => Number(value))

export const expenseRowSchema = z.object({
  id: z.string(),
  expense_date: z.string(),
  description: z.string(),
  amount_lkr: numericAmountSchema,
  created_by: z.string().nullable(),
  created_at: z.string(),
})

export const expensesResponseSchema = z.array(expenseRowSchema)
