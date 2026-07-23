
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  body text,
  type text NOT NULL DEFAULT 'info',
  link text,
  booking_id uuid REFERENCES public.bookings(id) ON DELETE CASCADE,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own notifications"
  ON public.notifications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users update own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own notifications"
  ON public.notifications FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_notifications_user_created ON public.notifications(user_id, created_at DESC);

ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

CREATE OR REPLACE FUNCTION public.notify_on_booking_status_change()
RETURNS TRIGGER
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

  IF NEW.payment_status = 'approved' THEN
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

DROP TRIGGER IF EXISTS trg_notify_booking_status ON public.bookings;
CREATE TRIGGER trg_notify_booking_status
  AFTER UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_booking_status_change();
