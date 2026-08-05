CREATE OR REPLACE FUNCTION public.notify_on_booking_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  slot_label text;
  date_label text;
BEGIN
  IF NEW.user_id IS NULL THEN
    RETURN NEW;
  END IF;
  IF NEW.payment_status IS NOT DISTINCT FROM OLD.payment_status THEN
    RETURN NEW;
  END IF;

  slot_label := to_char(make_time(NEW.slot_hour, 0, 0), 'HH12:MI AM');
  date_label := to_char(NEW.booking_date, 'DD Mon YYYY');

  IF NEW.payment_status IN ('completed', 'approved') THEN
    INSERT INTO public.notifications (user_id, title, body, type, link, booking_id)
    VALUES (
      NEW.user_id,
      'Booking approved ✅',
      'Court ' || NEW.court_number || ' on ' || date_label || ' at ' || slot_label || ' is confirmed. Booking ID: ' || NEW.booking_id,
      'success',
      '/booking/' || NEW.id,
      NEW.id
    );
  ELSIF NEW.payment_status = 'cancelled' THEN
    INSERT INTO public.notifications (user_id, title, body, type, link, booking_id)
    VALUES (
      NEW.user_id,
      'Booking cancelled ❌',
      'Your booking for Court ' || NEW.court_number || ' on ' || date_label || ' at ' || slot_label || ' was cancelled.',
      'error',
      '/my-bookings',
      NEW.id
    );
  END IF;

  RETURN NEW;
END;
$$;