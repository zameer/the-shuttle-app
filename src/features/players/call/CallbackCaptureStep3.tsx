import { format, parseISO } from 'date-fns'
import type { UseFormRegister, FieldErrors } from 'react-hook-form'
import type { CallbackRequestFormValues } from './types'

interface ReviewValues {
  playerName: string
  playerPhone: string
  slotFrom: string
  slotTo: string
  playerLocation: string
}

function formatSlot(value: string): string {
  try {
    return format(parseISO(value), 'MMM d, yyyy h:mm a')
  } catch {
    return value
  }
}

interface CallbackCaptureStep3Props {
  register: UseFormRegister<CallbackRequestFormValues>
  errors: FieldErrors<CallbackRequestFormValues>
  reviewValues: ReviewValues
  isSubmitting: boolean
  onBack: () => void
  disabled?: boolean
}

export default function CallbackCaptureStep3({
  register,
  errors,
  reviewValues,
  isSubmitting,
  onBack,
  disabled,
}: CallbackCaptureStep3Props) {
  return (
    <div className="flex flex-col gap-5 flex-1">
      <div className="flex flex-col gap-1">
        <p className="text-sm text-gray-500">Step 3 of 3 — Anything else?</p>
        <h2 className="text-lg font-semibold text-gray-900">Review & submit</h2>
      </div>

      {/* Read-only review */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700 flex flex-col gap-1.5">
        <p className="font-medium text-gray-900 mb-1">Your details</p>
        <div className="flex justify-between gap-2">
          <span className="text-gray-500">Name</span>
          <span className="font-medium truncate">{reviewValues.playerName}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-gray-500">Phone</span>
          <span className="font-medium">{reviewValues.playerPhone}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-gray-500">Slot start</span>
          <span className="font-medium">{formatSlot(reviewValues.slotFrom)}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-gray-500">Slot end</span>
          <span className="font-medium">{formatSlot(reviewValues.slotTo)}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-gray-500">Location</span>
          <span className="font-medium truncate">{reviewValues.playerLocation}</span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700" htmlFor="cb-note">
            Note <span className="text-gray-400 text-xs">(optional)</span>
          </label>
          <textarea
            id="cb-note"
            rows={3}
            placeholder="Any additional details…"
            disabled={disabled}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none disabled:opacity-50"
            {...register('note')}
          />
          {errors.note && (
            <p className="text-xs text-red-500">{errors.note.message}</p>
          )}
        </div>
      </div>

      <div className="mt-auto flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          disabled={disabled || isSubmitting}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={disabled || isSubmitting}
          className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Sending…' : 'Submit'}
        </button>
      </div>
    </div>
  )
}
