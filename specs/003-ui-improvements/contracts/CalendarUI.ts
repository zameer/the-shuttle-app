// CalendarUI.ts
// Contract for calendar UI components and payment status display
// Used by: MonthView, WeekView, BookingDetailsModal components
// Features: Sticky headers (US2), Payment status display (US3)

export interface CalendarHeaderConfig {
  position: 'sticky'; // CSS position property
  top: number; // pixels from top (typically 0)
  zIndex: number; // z-index for overlays (typically 10-20)
  backgroundColor: string; // Tailwind class or CSS color
  borderBottom?: string; // Optional border styling
}

export interface BookingUIState {
  isAdmin: boolean; // Used to determine payment_status visibility
  isSticky: boolean; // Whether sticky headers are enabled
  paymentStatusVisible: boolean; // Only true if isAdmin
}

// Extended Booking type for UI rendering
export interface BookingWithPayment {
  id: string; // UUID
  player_phone_number: string;
  playerName?: string; // Optional; included if isAdmin
  start_time: string; // ISO 8601
  end_time: string; // ISO 8601
  status: 'CONFIRMED' | 'PENDING' | 'UNAVAILABLE';
  payment_status?: 'PAID' | 'PENDING'; // Optional; included if isAdmin
  hourly_rate: number;
  total_price: number;
  // Derived for UI
  durationMinutes?: number;
  displayLabel?: string; // e.g., "John Smith (Paid)" for admin
}

export interface PaymentStatusBadgeProps {
  status: 'PAID' | 'PENDING' | 'UNPAID';
  size?: 'sm' | 'md' | 'lg'; // default: 'md'
}

export interface PaymentStatusBadgeVariant {
  'PAID': 'default'; // Green background
  'PENDING': 'secondary'; // Yellow background
  'UNPAID': 'destructive'; // Red background
}

// Calendar cell rendering
export interface CalendarCellProps {
  booking?: BookingWithPayment;
  isAdmin: boolean;
  isSticky: boolean; // Parent container supports sticky positioning
  onCellClick?: (booking: BookingWithPayment) => void;
  className?: string;
}

export const PAYMENT_STATUS_COLORS = {
  PAID: 'bg-green-100 text-green-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  UNPAID: 'bg-red-100 text-red-800',
} as const;

// Sticky header configuration usage:
// <thead className={cn(
//   'sticky top-0 z-10',
//   isAdmin ? 'bg-white' : 'bg-gray-50'
// )}>

// Payment status badge usage:
// <Badge variant={paymentVariantMap[booking.payment_status]}>
//   {booking.payment_status}
// </Badge>

export type PaymentStatus = 'PAID' | 'PENDING' | 'UNPAID';
export type PaymentStatusVariant = 'default' | 'secondary' | 'destructive';

export const mapPaymentStatusToVariant = (status?: PaymentStatus): PaymentStatusVariant => {
  switch (status) {
    case 'PAID':
      return 'default';
    case 'PENDING':
      return 'secondary';
    case 'UNPAID':
      return 'destructive';
    default:
      return 'secondary';
  }
};
