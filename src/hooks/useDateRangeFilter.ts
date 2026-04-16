import { useMemo, useState } from 'react'
import { endOfDay, format, parseISO, startOfDay } from 'date-fns'

export interface AppliedDateRange {
  startDate: Date
  endDate: Date
}

export function toDateInputValue(date: Date | null): string {
  return date ? format(date, 'yyyy-MM-dd') : ''
}

function parseInputDate(value: string): Date | null {
  if (!value) return null
  const parsed = parseISO(value)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed
}

export function useDateRangeFilter() {
  const [startInput, setStartInput] = useState('')
  const [endInput, setEndInput] = useState('')
  const [appliedRange, setAppliedRange] = useState<AppliedDateRange | null>(null)

  const startDate = useMemo(() => parseInputDate(startInput), [startInput])
  const endDate = useMemo(() => parseInputDate(endInput), [endInput])

  const validationError = useMemo(() => {
    if ((startInput && !startDate) || (endInput && !endDate)) {
      return 'Please enter valid dates in YYYY-MM-DD format.'
    }

    if ((startDate && !endDate) || (!startDate && endDate)) {
      return 'Select both start and end dates to apply a range.'
    }

    if (startDate && endDate && endDate < startDate) {
      return 'End date cannot be earlier than start date.'
    }

    return null
  }, [startInput, endInput, startDate, endDate])

  const canApply = Boolean(startDate && endDate && !validationError)

  const applyRange = (): AppliedDateRange | null => {
    if (!canApply || !startDate || !endDate) return null

    const normalized = {
      startDate: startOfDay(startDate),
      endDate: endOfDay(endDate),
    }

    setAppliedRange(normalized)
    return normalized
  }

  const clearRange = () => {
    setStartInput('')
    setEndInput('')
    setAppliedRange(null)
  }

  return {
    startInput,
    endInput,
    setStartInput,
    setEndInput,
    startDate,
    endDate,
    validationError,
    canApply,
    appliedRange,
    isActive: appliedRange !== null,
    applyRange,
    clearRange,
  }
}
