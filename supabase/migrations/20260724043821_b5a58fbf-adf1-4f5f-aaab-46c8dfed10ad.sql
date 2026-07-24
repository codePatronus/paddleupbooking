
CREATE POLICY "Admin can create bookings"
  ON public.bookings FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin can delete tournaments"
  ON public.tournaments FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin can remove participants"
  ON public.tournament_participants FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));
