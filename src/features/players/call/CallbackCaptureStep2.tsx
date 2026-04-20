import type { UseFormRegister, FieldErrors } from 'react-hook-form'
import type { CallbackRequestFormValues } from './types'

interface CallbackCaptureStep2Props {
  register: UseFormRegister<CallbackRequestFormValues>
  errors: FieldErrors<CallbackRequestFormValues>
  onNext: () => Promise<void>
  onBack: () => void
  disabled?: boolean
}

export default function CallbackCaptureStep2({
  register,
  errors,
  onNext,
  onBack,
  disabled,
}: CallbackCaptureStep2Props) {
  return (
    <div className="flex flex-col gap-5 flex-1">
      <div className="flex flex-col gap-1">
        <p className="text-sm text-gray-500">Step 2 of 3 — When and where?</p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700" htmlFor="cb-slot-from">
              Slot start <span className="text-red-500">*</span>
            </label>
            <input
              id="cb-slot-from"
              type="datetime-local"
              disabled={disabled}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:opacity-50"
              {...register('slotFrom')}
            />
            {errors.slotFrom && (
              <p className="text-xs text-red-500">{errors.slotFrom.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700" htmlFor="cb-slot-to">
              Slot end <span className="text-red-500">*</span>
            </label>
            <input
              id="cb-slot-to"
              type="datetime-local"
              disabled={disabled}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:opacity-50"
              {...register('slotTo')}
            />
            {errors.slotTo && (
              <p className="text-xs text-red-500">{errors.slotTo.message}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700" htmlFor="cb-location">
            Your location <span className="text-red-500">*</span>
          </label>
          <input
            id="cb-location"
            type="text"
            placeholder="e.g. Masjid Mawatha, Kal-Eliya"
            disabled={disabled}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:opacity-50"
            {...register('playerLocation')}
          />
          {errors.playerLocation && (
            <p className="text-xs text-red-500">{errors.playerLocation.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700" htmlFor="cb-preferred-time">
            Preferred callback time <span className="text-gray-400 text-xs">(optional)</span>
          </label>
          <input
            id="cb-preferred-time"
            type="text"
            placeholder="e.g. after 3pm, anytime"
            disabled={disabled}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:opacity-50"
            {...register('preferredCallbackTime')}
          />
          {errors.preferredCallbackTime && (
            <p className="text-xs text-red-500">{errors.preferredCallbackTime.message}</p>
          )}
        </div>
      </div>

      <div className="mt-auto flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          disabled={disabled}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Back
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
