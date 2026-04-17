-- Feature 014: Extend booking status values
-- Adds CANCELLED and NO_SHOW to bookings.status constraint.

ALTER TABLE public.bookings
  DROP CONSTRAINT IF EXISTS bookings_status_check;

ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_status_check
  CHECK (status IN ('AVAILABLE', 'PENDING', 'CONFIRMED', 'UNAVAILABLE', 'CANCELLED', 'NO_SHOW'));
