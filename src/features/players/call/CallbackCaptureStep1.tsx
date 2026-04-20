import type { UseFormRegister, FieldErrors } from 'react-hook-form'
import type { CallbackRequestFormValues } from './types'

interface CallbackCaptureStep1Props {
  register: UseFormRegister<CallbackRequestFormValues>
  errors: FieldErrors<CallbackRequestFormValues>
  onNext: () => Promise<void>
  onCancel: () => void
  disabled?: boolean
}

export default function CallbackCaptureStep1({
  register,
  errors,
  onNext,
  onCancel,
  disabled,
}: CallbackCaptureStep1Props) {
  return (
    <div className="flex flex-col gap-5 flex-1">
      <div className="flex flex-col gap-1">
        <p className="text-sm text-gray-500">Step 1 of 3 - Could you please mention?</p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700" htmlFor="cb-player-name">
            Your name <span className="text-red-500">*</span>
          </label>
          <input
            id="cb-player-name"
            type="text"
            autoComplete="name"
            disabled={disabled}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:opacity-50"
            {...register('playerName')}
          />
          {errors.playerName && (
            <p className="text-xs text-red-500">{errors.playerName.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700" htmlFor="cb-player-phone">
            Your phone number <span className="text-red-500">*</span>
          </label>
          <input
            id="cb-player-phone"
            type="tel"
            autoComplete="tel"
            disabled={disabled}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:opacity-50"
            {...register('playerPhone')}
          />
          {errors.playerPhone && (
            <p className="text-xs text-red-500">{errors.playerPhone.message}</p>
          )}
        </div>
      </div>

      <div className="mt-auto flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={disabled}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={disabled}
          className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  )
}
