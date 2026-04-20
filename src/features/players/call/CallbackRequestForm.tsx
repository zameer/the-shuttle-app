import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { callbackRequestSchema, type CallbackRequestFormValues, type SubmitCallbackResult } from './types'
import { useSubmitCallbackRequest } from './useSubmitCallbackRequest'
import { Info, CheckCircle } from 'lucide-react'
import { useState } from 'react'

interface CallbackRequestFormProps {
  onSuccess?: (result: SubmitCallbackResult) => void
}

export default function CallbackRequestForm({ onSuccess }: CallbackRequestFormProps) {
  const [successResult, setSuccessResult] = useState<SubmitCallbackResult | null>(null)
  const submitMutation = useSubmitCallbackRequest()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CallbackRequestFormValues>({
    resolver: zodResolver(callbackRequestSchema),
    defaultValues: {
      playerName: '',
      playerPhone: '',
      slotFrom: '',
      slotTo: '',
      playerLocation: '',
      preferredCallbackTime: '',
      note: '',
    },
  })

  const onSubmit = async (values: CallbackRequestFormValues) => {
    const result = await submitMutation.mutateAsync(values)
    setSuccessResult(result)
    reset()
    onSuccess?.(result)
  }

  if (successResult) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <CheckCircle className="h-12 w-12 text-green-500" />
        {successResult.status === 'assigned' ? (
          <>
            <p className="text-base font-semibold text-gray-900">Request received — agent assigned!</p>
            <p className="text-sm text-gray-600">
              A Booking Agent has been assigned and will call you back at the number you provided.
            </p>
          </>
        ) : (
          <>
            <p className="text-base font-semibold text-gray-900">Request received!</p>
            <p className="text-sm text-gray-600">
              No agents are currently available. Your request is in the queue and a Booking Agent will call you back soon.
            </p>
          </>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {/* Rules reminder banner */}
      <div className="flex items-start gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          Please review our{' '}
          <a href="/terms" className="underline hover:text-blue-900" target="_blank" rel="noreferrer">
            court rules and terms
          </a>{' '}
          before booking.
        </span>
      </div>

      {/* Player name */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700" htmlFor="cb-player-name">
          Your name <span className="text-red-500">*</span>
        </label>
        <input
          id="cb-player-name"
          type="text"
          autoComplete="name"
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          {...register('playerName')}
        />
        {errors.playerName && <p className="text-xs text-red-500">{errors.playerName.message}</p>}
      </div>

      {/* Phone */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700" htmlFor="cb-player-phone">
          Your phone number <span className="text-red-500">*</span>
        </label>
        <input
          id="cb-player-phone"
          type="tel"
          autoComplete="tel"
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          {...register('playerPhone')}
        />
        {errors.playerPhone && <p className="text-xs text-red-500">{errors.playerPhone.message}</p>}
      </div>

      {/* Slot from / to */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700" htmlFor="cb-slot-from">
            Slot start <span className="text-red-500">*</span>
          </label>
          <input
            id="cb-slot-from"
            type="datetime-local"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            {...register('slotFrom')}
          />
          {errors.slotFrom && <p className="text-xs text-red-500">{errors.slotFrom.message}</p>}
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700" htmlFor="cb-slot-to">
            Slot end <span className="text-red-500">*</span>
          </label>
          <input
            id="cb-slot-to"
            type="datetime-local"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            {...register('slotTo')}
          />
          {errors.slotTo && <p className="text-xs text-red-500">{errors.slotTo.message}</p>}
        </div>
      </div>

      {/* Location */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700" htmlFor="cb-location">
          Your location <span className="text-red-500">*</span>
        </label>
        <input
          id="cb-location"
          type="text"
          placeholder="e.g. Masjid Mawatha, Kal-Eliya"
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          {...register('playerLocation')}
        />
        {errors.playerLocation && <p className="text-xs text-red-500">{errors.playerLocation.message}</p>}
      </div>

      {/* Preferred callback time (optional) */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700" htmlFor="cb-preferred-time">
          Preferred callback time <span className="text-gray-400 text-xs">(optional)</span>
        </label>
        <input
          id="cb-preferred-time"
          type="text"
          placeholder="e.g. after 3pm, anytime"
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          {...register('preferredCallbackTime')}
        />
        {errors.preferredCallbackTime && (
          <p className="text-xs text-red-500">{errors.preferredCallbackTime.message}</p>
        )}
      </div>

      {/* Note (optional) */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700" htmlFor="cb-note">
          Additional note <span className="text-gray-400 text-xs">(optional)</span>
        </label>
        <textarea
          id="cb-note"
          rows={3}
          placeholder="Any other information for the agent"
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none"
          {...register('note')}
        />
        {errors.note && <p className="text-xs text-red-500">{errors.note.message}</p>}
      </div>

      {submitMutation.isError && (
        <p className="text-sm text-red-600">
          Something went wrong. Please try again.
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting || submitMutation.isPending}
        className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {submitMutation.isPending ? 'Submitting…' : 'Submit Callback Request'}
      </button>
    </form>
  )
}
