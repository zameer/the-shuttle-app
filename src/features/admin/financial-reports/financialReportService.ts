import { parseISO } from 'date-fns'
import type { BookingRowSchema } from './schemas'
import type {
  FinancialReportOutput,
  NormalizedFinancialBooking,
  OutstandingPendingPlayerRecord,
  PaidBreakdownOutput,
  PaymentBreakdownEntry,
  PaymentBucket,
  RevenueLossBucket,
} from './types'

function round2(value: number): number {
  return Math.round(value * 100) / 100
}

function calculateDurationHours(startISO: string, endISO: string): number {
  const start = parseISO(startISO)
  const end = parseISO(endISO)
  const ms = end.getTime() - start.getTime()
  return ms > 0 ? round2(ms / 3600000) : 0
}

function resolveAmount(row: BookingRowSchema, durationHours: number): {
  amount: number
  source: 'total_price' | 'hourly_rate_x_duration' | 'fallback_zero'
} {
  if (row.total_price !== null && row.total_price !== undefined) {
    return { amount: round2(row.total_price), source: 'total_price' }
  }

  if (row.hourly_rate !== null && row.hourly_rate !== undefined) {
    return { amount: round2(row.hourly_rate * durationHours), source: 'hourly_rate_x_duration' }
  }

  return { amount: 0, source: 'fallback_zero' }
}

function mapPaymentBucket(status: BookingRowSchema['payment_status']): PaymentBucket {
  return status === 'PAID' ? 'PAID' : 'PENDING'
}

export function normalizeFinancialRows(rows: BookingRowSchema[]): NormalizedFinancialBooking[] {
  return rows
    .map((row) => {
      const durationHours = calculateDurationHours(row.start_time, row.end_time)
      const amountResolution = resolveAmount(row, durationHours)

      return {
        bookingId: row.id,
        playerPhoneNumber: row.player_phone_number,
        playerName: row.players?.name ?? null,
        slotStart: row.start_time,
        slotEnd: row.end_time,
        durationHours,
        bookingStatus: row.status,
        paymentBucket: mapPaymentBucket(row.payment_status),
        amount: amountResolution.amount,
        amountSource: amountResolution.source,
      }
    })
    .filter((row) => row.durationHours > 0)
}

function isRevenueImpactStatus(status: NormalizedFinancialBooking['bookingStatus']): status is 'NO_SHOW' | 'CANCELLED' {
  return status === 'NO_SHOW' || status === 'CANCELLED'
}

function isActiveFinancialStatus(status: NormalizedFinancialBooking['bookingStatus']): boolean {
  return !isRevenueImpactStatus(status)
}

function buildSummary(rows: NormalizedFinancialBooking[]) {
  const summary = {
    paidHours: 0,
    paidAmount: 0,
    pendingHours: 0,
    pendingAmount: 0,
  }

  for (const row of rows) {
    if (!isActiveFinancialStatus(row.bookingStatus)) {
      continue
    }

    if (row.paymentBucket === 'PAID') {
      summary.paidHours += row.durationHours
      summary.paidAmount += row.amount
    } else {
      summary.pendingHours += row.durationHours
      summary.pendingAmount += row.amount
    }
  }

  return {
    paidHours: round2(summary.paidHours),
    paidAmount: round2(summary.paidAmount),
    pendingHours: round2(summary.pendingHours),
    pendingAmount: round2(summary.pendingAmount),
  }
}

function buildPaidBreakdown(rows: NormalizedFinancialBooking[]): PaidBreakdownOutput {
  const map = new Map<string, PaymentBreakdownEntry>()

  for (const row of rows) {
    if (!isActiveFinancialStatus(row.bookingStatus) || row.paymentBucket !== 'PAID') {
      continue
    }

    const key = `${row.paymentBucket}::${row.playerPhoneNumber ?? 'unknown'}::${row.playerName ?? 'Unknown Player'}`
    const existing = map.get(key)

    if (!existing) {
      map.set(key, {
        paymentBucket: row.paymentBucket,
        playerPhoneNumber: row.playerPhoneNumber,
        playerName: row.playerName,
        bookingCount: 1,
        totalHours: row.durationHours,
        totalAmount: row.amount,
      })
      continue
    }

    existing.bookingCount += 1
    existing.totalHours = round2(existing.totalHours + row.durationHours)
    existing.totalAmount = round2(existing.totalAmount + row.amount)
  }

  const entries: PaymentBreakdownEntry[] = []

  for (const entry of map.values()) {
    entries.push({
      ...entry,
      totalHours: round2(entry.totalHours),
      totalAmount: round2(entry.totalAmount),
    })
  }

  entries.sort((a, b) => b.totalAmount - a.totalAmount)

  return {
    entries,
    totalEntries: entries.length,
  }
}

function buildOutstandingPending(rows: NormalizedFinancialBooking[]) {
  const map = new Map<string, OutstandingPendingPlayerRecord>()

  for (const row of rows) {
    if (!isActiveFinancialStatus(row.bookingStatus) || row.paymentBucket !== 'PENDING') {
      continue
    }

    const key = `${row.playerPhoneNumber ?? 'unknown'}::${row.playerName ?? 'Unknown Player'}`
    const existing = map.get(key)

    if (!existing) {
      map.set(key, {
        playerPhoneNumber: row.playerPhoneNumber,
        playerName: row.playerName,
        pendingHours: row.durationHours,
        pendingAmount: row.amount,
        slots: [
          {
            bookingId: row.bookingId,
            startTime: row.slotStart,
            endTime: row.slotEnd,
            status: row.bookingStatus,
            amount: row.amount,
          },
        ],
      })
      continue
    }

    existing.pendingHours = round2(existing.pendingHours + row.durationHours)
    existing.pendingAmount = round2(existing.pendingAmount + row.amount)
    existing.slots.push({
      bookingId: row.bookingId,
      startTime: row.slotStart,
      endTime: row.slotEnd,
      status: row.bookingStatus,
      amount: row.amount,
    })
  }

  const players = [...map.values()].sort((a, b) => b.pendingAmount - a.pendingAmount)
  const totalOutstandingAmount = round2(players.reduce((sum, row) => sum + row.pendingAmount, 0))

  return { players, totalOutstandingAmount }
}

function buildRevenueLoss(rows: NormalizedFinancialBooking[]) {
  const noShow: RevenueLossBucket = { lostHours: 0, lostAmount: 0, bookingCount: 0 }
  const cancelled: RevenueLossBucket = { lostHours: 0, lostAmount: 0, bookingCount: 0 }

  let fallbackAmountCount = 0

  for (const row of rows) {
    if (!isRevenueImpactStatus(row.bookingStatus)) {
      continue
    }

    if (row.amountSource === 'fallback_zero') {
      fallbackAmountCount += 1
    }

    const bucket = row.bookingStatus === 'NO_SHOW' ? noShow : cancelled
    bucket.bookingCount += 1
    bucket.lostHours = round2(bucket.lostHours + row.durationHours)
    bucket.lostAmount = round2(bucket.lostAmount + row.amount)
  }

  return {
    noShow,
    cancelled,
    fallbackAmountCount,
  }
}

function calculateReconciliation(summary: FinancialReportOutput['summary'], paidBreakdown: FinancialReportOutput['paidBreakdown']) {
  const paidAmount = round2(paidBreakdown.entries.reduce((sum, entry) => sum + entry.totalAmount, 0))
  const paidHours = round2(paidBreakdown.entries.reduce((sum, entry) => sum + entry.totalHours, 0))

  return {
    paidAmountMatches: paidAmount === summary.paidAmount,
    paidHoursMatches: paidHours === summary.paidHours,
  }
}

export function buildFinancialReport(rows: BookingRowSchema[]): FinancialReportOutput {
  const normalizedRows = normalizeFinancialRows(rows)
  const summary = buildSummary(normalizedRows)
  const paidBreakdown = buildPaidBreakdown(normalizedRows)
  const outstandingPending = buildOutstandingPending(normalizedRows)
  const revenueLoss = buildRevenueLoss(normalizedRows)
  const reconciliation = calculateReconciliation(summary, paidBreakdown)

  return {
    summary,
    paidBreakdown,
    outstandingPending,
    revenueLoss,
    reconciliation,
  }
}
