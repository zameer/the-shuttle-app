import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { bookingAgentSchema, type BookingAgentFormValues, type BookingAgent } from './types'
import { useCreateBookingAgent, useUpdateBookingAgent } from './useBookingAgents'

interface BookingAgentFormProps {
  agent?: BookingAgent | null
  onSuccess: () => void
  onCancel: () => void
}

export default function BookingAgentForm({ agent, onSuccess, onCancel }: BookingAgentFormProps) {
  const isEdit = !!agent
  const createMutation = useCreateBookingAgent()
  const updateMutation = useUpdateBookingAgent()
  const isPending = createMutation.isPending || updateMutation.isPending

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingAgentFormValues>({
    resolver: zodResolver(bookingAgentSchema),
    defaultValues: agent
      ? {
          email: agent.email,
          displayName: agent.display_name,
          workPhone: agent.work_phone,
          isPrimary: agent.is_primary,
          priorityOrder: agent.priority_order,
          isAvailable: agent.is_available,
        }
      : {
          email: '',
          displayName: '',
          workPhone: '',
          isPrimary: false,
          priorityOrder: 99,
          isAvailable: false,
        },
  })

  const onSubmit = async (values: BookingAgentFormValues) => {
    if (isEdit) {
      await updateMutation.mutateAsync(values)
    } else {
      await createMutation.mutateAsync(values)
    }
    onSuccess()
  }

  const error = createMutation.error || updateMutation.error

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {/* Email */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700" htmlFor="ba-email">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          id="ba-email"
          type="email"
          readOnly={isEdit}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 read-only:bg-gray-50 read-only:text-gray-500"
          {...register('email')}
        />
        {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
      </div>

      {/* Display name */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700" htmlFor="ba-display-name">
          Display name <span className="text-red-500">*</span>
        </label>
        <input
          id="ba-display-name"
          type="text"
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          {...register('displayName')}
        />
        {errors.displayName && <p className="text-xs text-red-500">{errors.displayName.message}</p>}
      </div>

      {/* Work phone */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700" htmlFor="ba-work-phone">
          Work phone <span className="text-red-500">*</span>
        </label>
        <input
          id="ba-work-phone"
          type="tel"
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          {...register('workPhone')}
        />
        {errors.workPhone && <p className="text-xs text-red-500">{errors.workPhone.message}</p>}
      </div>

      {/* Priority order */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700" htmlFor="ba-priority">
          Priority order (1 = highest) <span className="text-red-500">*</span>
        </label>
        <input
          id="ba-priority"
          type="number"
          min={1}
          max={99}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          {...register('priorityOrder', { valueAsNumber: true })}
        />
        {errors.priorityOrder && <p className="text-xs text-red-500">{errors.priorityOrder.message}</p>}
      </div>

      {/* Checkboxes */}
      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="rounded" {...register('isPrimary')} />
          <span>Primary contact (routed first)</span>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="rounded" {...register('isAvailable')} />
          <span>Available for calls</span>
        </label>
      </div>

      {error && (
        <p className="text-sm text-red-600">
          {(error as Error).message ?? 'Something went wrong. Please try again.'}
        </p>
      )}

      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Add agent'}
        </button>
      </div>
    </form>
  )
}
