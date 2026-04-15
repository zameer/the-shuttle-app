-- Create Dashboard Metrics View
CREATE OR REPLACE VIEW public.dashboard_metrics AS
SELECT 
  DATE(start_time) as booking_date,
  COUNT(*) as total_bookings,
  COALESCE(SUM(total_price), 0) as expected_revenue,
  COALESCE(SUM(CASE WHEN payment_status = 'PAID' THEN total_price ELSE 0 END), 0) as collected_revenue,
  COALESCE(SUM(CASE WHEN payment_status = 'PENDING' THEN total_price ELSE 0 END), 0) as pending_revenue,
  COUNT(CASE WHEN status = 'UNAVAILABLE' THEN 1 END) as unavailable_blocks
FROM public.bookings
GROUP BY DATE(start_time);

-- Grant access to authenticated users
GRANT SELECT ON public.dashboard_metrics TO authenticated;

-- Create constraint trigger to enforce single court (prevent overlaps)
CREATE OR REPLACE FUNCTION public.check_booking_overlap()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.bookings
    WHERE id != NEW.id
      AND status IN ('CONFIRMED', 'UNAVAILABLE')
      AND NEW.status IN ('CONFIRMED', 'UNAVAILABLE', 'PENDING')
      AND NEW.start_time < end_time
      AND NEW.end_time > start_time
  ) THEN
    RAISE EXCEPTION 'Double booking conflict: Overlaps with an existing confirmed or unavailable booking!';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_single_court_overlap
BEFORE INSERT OR UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.check_booking_overlap();
