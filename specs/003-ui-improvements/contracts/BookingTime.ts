// BookingTime.ts
// Contract for booking time adjustment functionality (US6)
// Used by: BookingDetailsModal component
// Feature: Admin can increase or decrease booking duration/time

export interface TimeAdjustmentRequest {
  bookingId: string; // UUID of booking to adjust
  startTime?: string; // ISO 8601 datetime (optional if only adjusting end time)
  endTime?: string; // ISO 8601 datetime (optional if only adjusting start time)
  durationMinutes?: number; // Alternative: adjust duration by N minutes from current end time
}

export interface TimeValidationResult {
  isValid: boolean;
  conflictingBookings?: ConflictingBooking[]; // Only if isValid=false
  errorMessage?: string; // User-friendly error message
  suggestedAlternatives?: TimeSlot[]; // Optional: suggest available times
}

export interface ConflictingBooking {
  bookingId: string;
  playerName: string;
  playerPhoneNumber: string;
  start_time: string; // ISO 8601
  end_time: string; // ISO 8601
  status: 'CONFIRMED' | 'PENDING' | 'UNAVAILABLE';
}

export interface TimeSlot {
  startTime: string; // ISO 8601
  endTime: string; // ISO 8601
  durationMinutes: number;
  reason: 'gap_between_bookings' | 'after_hours_conflict' | 'before_hours_conflict';
}

export interface TimeAdjustmentResponse {
  success: boolean;
  bookingId: string;
  previousStartTime: string; // ISO 8601
  previousEndTime: string; // ISO 8601
  newStartTime: string; // ISO 8601
  newEndTime: string; // ISO 8601
  updatedAt: string; // ISO 8601 timestamp
}

// Validation constraints
export interface TimeAdjustmentConstraints {
  minDurationMinutes: number; // default: 30
  maxDurationMinutes: number; // default: 480 (8 hours)
  courtOperatingHourStart: string; // e.g., '06:00'
  courtOperatingHourEnd: string; // e.g., '22:00'
}

// Error cases
export interface TimeAdjustmentError {
  code:
    | 'INVALID_TIME_RANGE'
    | 'DURATION_TOO_SHORT'
    | 'DURATION_TOO_LONG'
    | 'TIME_CONFLICT'
    | 'OUTSIDE_OPERATING_HOURS'
    | 'BOOKING_NOT_FOUND'
    | 'UNAUTHORIZED';
  message: string;
  conflictingBookingId?: string; // If code='TIME_CONFLICT'
}

// React Query Hook signature
// Expected Hook Usage:
// const validateMutation = useMutation(validateTimeAdjustment);
// const { data: validationResult } = validateMutation.mutate({ bookingId, endTime: newTime });
// const saveMutation = useMutation(applyTimeAdjustment);
