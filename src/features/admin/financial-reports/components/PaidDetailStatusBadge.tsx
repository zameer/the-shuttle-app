import { Badge } from '@/components/ui/badge'

interface PaidDetailStatusBadgeProps {
  type: 'booking' | 'payment'
  status: string
}

export default function PaidDetailStatusBadge({ type, status }: PaidDetailStatusBadgeProps) {
  if (type === 'booking') {
    switch (status) {
      case 'CONFIRMED':
        return <Badge variant="default">{status}</Badge>
      case 'PENDING':
        return <Badge variant="outline">{status}</Badge>
      case 'UNAVAILABLE':
        return <Badge variant="secondary">{status}</Badge>
      case 'CANCELLED':
      case 'NO_SHOW':
        return <Badge variant="destructive">{status}</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  // payment type
  switch (status) {
    case 'PAID':
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">
          {status}
        </Badge>
      )
    case 'PENDING':
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100">
          {status}
        </Badge>
      )
    case 'UNPAID':
      return <Badge variant="outline">{status}</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}
