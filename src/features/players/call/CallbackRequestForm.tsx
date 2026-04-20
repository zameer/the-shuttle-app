import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Info } from 'lucide-react'
import { callbackRequestSchema, type CallbackRequestFormValues } from './types'
import type { SubmissionStatus } from './types'
import { useSubmitCallbackRequest } from './useSubmitCallbackRequest'
import { useCallbackDraft } from './useCallbackDraft'
import { useCallbackPreferences } from './useCallbackPreferences'
import { useOfflineCallbackQueue } from './useOfflineCallbackQueue'
import CallbackCaptureStep1 from './CallbackCaptureStep1'
import CallbackCaptureStep2 from './CallbackCaptureStep2'
import CallbackCaptureStep3 from './CallbackCaptureStep3'
import CallbackSuccessView from './CallbackSuccessView'

type CaptureStep = 1 | 2 | 3

interface StepProgressProps {
  step: CaptureStep
}

function StepProgress({ step }: StepProgressProps) {
  return (
    <div className="flex items-center justify-center gap-2 py-1" aria-label={`Step ${step} of 3`}>
      {([1, 2, 3] as CaptureStep[]).map((s) => (
        <span
          key={s}
          className={`h-2 rounded-full transition-all ${
            s === step
              ? 'w-6 bg-blue-600'
              : s < step
              ? 'w-2 bg-blue-300'
              : 'w-2 bg-gray-300'
          }`}
        />
      ))}
    </div>
  )
}

interface CallbackRequestFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export default function CallbackRequestForm({ onSuccess, onCancel }: CallbackRequestFormProps) {
  const [step, setStep] = useState<CaptureStep>(1)
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>('idle')
  const [assignedAgentEmail, setAssignedAgentEmail] = useState<string | null>(null)
  const [clientId, setClientId] = useState<string>(() => crypto.randomUUID())
  const [showDraftBanner, setShowDraftBanner] = useState(true)

  const submitMutation = useSubmitCallbackRequest()
  const { draft, saveDraft, clearDraft, hasDraft } = useCallbackDraft()
  const { preferences, savePreferences } = useCallbackPreferences()
  const { enqueue, isAlreadySubmitted, markSubmitted, pendingCount } = useOfflineCallbackQueue()

  const draftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CallbackRequestFormValues>({
    resolver: zodResolver(callbackRequestSchema),
    defaultValues: {
      playerName: '',
      playerPhone: '',
      slotFrom: '',
      slotTo: '',
      playerLocation: '',
      preferredCallbackTime: preferences.preferredCallbackTime ?? '',
      note: '',
    },
  })

  // ── Draft save (debounced 500 ms) ────────────────────────────────────────
  const scheduleDraftSave = () => {
    if (draftTimerRef.current) clearTimeout(draftTimerRef.current)
    draftTimerRef.current = setTimeout(() => {
      saveDraft(getValues())
    }, 500)
  }

  // ── Draft restoration ────────────────────────────────────────────────────
  const handleRestoreDraft = () => {
    if (!draft) return
    const fields = [
      'playerName', 'playerPhone', 'slotFrom', 'slotTo',
      'playerLocation', 'preferredCallbackTime', 'note',
    ] as const
    fields.forEach((field) => {
      if (draft[field] !== undefined) {
        setValue(field, draft[field] as string)
      }
    })
    setShowDraftBanner(false)
  }

  // ── Step navigation ──────────────────────────────────────────────────────
  const handleNextStep1 = async () => {
    const valid = await trigger(['playerName', 'playerPhone'])
    if (!valid) return
    scheduleDraftSave()
    setStep(2)
  }

  const handleNextStep2 = async () => {
    const valid = await trigger(['slotFrom', 'slotTo', 'playerLocation'])
    if (!valid) return
    scheduleDraftSave()
    setStep(3)
  }

  // ── Submit ───────────────────────────────────────────────────────────────
  const onSubmit = async (values: CallbackRequestFormValues) => {
    if (isAlreadySubmitted(clientId)) return

    setSubmissionStatus('submitting')
    try {
      const result = await submitMutation.mutateAsync({ values, clientId })
      markSubmitted(clientId)
      clearDraft()
      if (values.preferredCallbackTime) {
        savePreferences({ preferredCallbackTime: values.preferredCallbackTime })
      }
      setAssignedAgentEmail(result.assigned_agent_email)
      setSubmissionStatus('success')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : ''
      if (message === 'network-offline' || !navigator.onLine) {
        enqueue(values, clientId)
        setClientId(crypto.randomUUID()) // fresh id for any retry
        setSubmissionStatus('offline-queued')
      } else {
        setSubmissionStatus('error')
      }
    }
  }

  // ── Success / offline-queued / error views ───────────────────────────────
  if (submissionStatus === 'success' || submissionStatus === 'offline-queued') {
    return (
      <CallbackSuccessView
        status={submissionStatus}
        assignedAgentEmail={assignedAgentEmail}
        pendingCount={pendingCount}
        onClose={() => onSuccess?.()}
      />
    )
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4 flex-1 min-h-0"
    >
      {/* Flow guidance banner */}
      <div className="flex items-start gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          Share your details in three short steps and we will arrange your callback.
        </span>
      </div>

      {/* Step progress */}
      <StepProgress step={step} />

      {/* Draft restoration banner */}
      {hasDraft && showDraftBanner && step === 1 && (
        <div className="flex items-center justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm">
          <span className="text-amber-800">Continue from last time?</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleRestoreDraft}
              className="text-xs font-medium text-amber-800 underline hover:text-amber-900"
            >
              Restore
            </button>
            <button
              type="button"
              onClick={() => setShowDraftBanner(false)}
              className="text-xs font-medium text-gray-500 hover:text-gray-700"
            >
              Start fresh
            </button>
          </div>
        </div>
      )}

      {/* Error banner */}
      {submissionStatus === 'error' && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          Something went wrong. Please try again.
        </p>
      )}

      {/* Step content */}
      {step === 1 && (
        <CallbackCaptureStep1
          register={register}
          errors={errors}
          onNext={handleNextStep1}
          onCancel={() => onCancel?.()}
          disabled={isSubmitting}
        />
      )}
      {step === 2 && (
        <CallbackCaptureStep2
          register={register}
          errors={errors}
          onNext={handleNextStep2}
          onBack={() => setStep(1)}
          disabled={isSubmitting}
        />
      )}
      {step === 3 && (
        <CallbackCaptureStep3
          register={register}
          errors={errors}
          reviewValues={{
            playerName: getValues('playerName'),
            playerPhone: getValues('playerPhone'),
            slotFrom: getValues('slotFrom'),
            slotTo: getValues('slotTo'),
            playerLocation: getValues('playerLocation'),
          }}
          isSubmitting={isSubmitting}
          disabled={isSubmitting}
          onBack={() => setStep(2)}
        />
      )}
    </form>
  )
}
