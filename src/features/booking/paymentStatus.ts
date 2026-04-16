export type NormalizedPaymentStatus = 'PAID' | 'PENDING' | 'UNPAID' | 'UNKNOWN'

export function normalizePaymentStatus(value: string | null | undefined): NormalizedPaymentStatus {
  if (!value) return 'UNKNOWN'

  const normalized = value.trim().toUpperCase()

  if (normalized === 'PAID') return 'PAID'
  if (normalized === 'PENDING') return 'PENDING'
  if (normalized === 'UNPAID') return 'UNPAID'

  return 'UNKNOWN'
}

export function getPaymentStatusLabel(status: NormalizedPaymentStatus): string {
  switch (status) {
    case 'PAID':
      return 'Paid'
    case 'PENDING':
      return 'Pending'
    case 'UNPAID':
      return 'Unpaid'
    default:
      return 'Unknown'
  }
}

export function getPaymentStatusBadgeVariant(status: NormalizedPaymentStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'PAID':
      return 'default'
    case 'PENDING':
      return 'secondary'
    case 'UNPAID':
      return 'destructive'
    default:
      return 'outline'
  }
}

export function getPaymentStatusPillClassName(status: NormalizedPaymentStatus): string {
  switch (status) {
    case 'PAID':
      return 'bg-green-100 text-green-700 border-green-200'
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200'
    case 'UNPAID':
      return 'bg-red-100 text-red-700 border-red-200'
    default:
      return 'bg-neutral-100 text-neutral-700 border-neutral-200'
  }
}
