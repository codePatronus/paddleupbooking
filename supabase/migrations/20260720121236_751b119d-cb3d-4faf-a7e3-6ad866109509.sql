
DROP VIEW IF EXISTS public.bookings_availability;

CREATE OR REPLACE FUNCTION public.get_slot_availability(p_date date)
RETURNS TABLE(court_number int, slot_hour int)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT court_number, slot_hour
  FROM public.bookings
  WHERE booking_date = p_date
    AND payment_status <> 'cancelled';
$$;

REVOKE EXECUTE ON FUNCTION public.get_slot_availability(date) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_slot_availability(date) TO anon, authenticated;
