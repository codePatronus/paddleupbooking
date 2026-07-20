
-- ============ ROLES SYSTEM ============
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin','user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own roles" ON public.user_roles;
CREATE POLICY "Users view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

-- ============ BOOKINGS ============
DROP POLICY IF EXISTS "Anyone can view bookings" ON public.bookings;
DROP POLICY IF EXISTS "Anyone can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Anyone can update bookings" ON public.bookings;

CREATE POLICY "Owners can view own bookings" ON public.bookings
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated can create own bookings" ON public.bookings
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owner or admin can update bookings" ON public.bookings
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can delete bookings" ON public.bookings
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Public availability view: exposes only non-PII slot occupancy info
DROP VIEW IF EXISTS public.bookings_availability;
CREATE VIEW public.bookings_availability
WITH (security_invoker = false) AS
SELECT id, court_number, booking_date, slot_hour, payment_status
FROM public.bookings
WHERE payment_status <> 'cancelled';

GRANT SELECT ON public.bookings_availability TO anon, authenticated;

-- Revoke direct table read from anon (was previously public); GraphQL exposure fixed
REVOKE SELECT ON public.bookings FROM anon;

-- ============ PROFILES ============
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;

-- Authenticated users can browse profiles (community/leaderboard)
CREATE POLICY "Authenticated can view profiles" ON public.profiles
  FOR SELECT TO authenticated USING (true);

REVOKE SELECT ON public.profiles FROM anon;

-- ============ TOURNAMENTS ============
DROP POLICY IF EXISTS "Admin can insert tournaments" ON public.tournaments;
DROP POLICY IF EXISTS "Admin can update tournaments" ON public.tournaments;

CREATE POLICY "Admins insert tournaments" ON public.tournaments
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update tournaments" ON public.tournaments
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ USER_BADGES ============
DROP POLICY IF EXISTS "System inserts badges" ON public.user_badges;
-- No client insert policy; only service_role (bypasses RLS) can award badges.

-- ============ LOGIN-LOOKUP FUNCTIONS ============
-- Kept executable by anon because unified-login form calls them before sign-in.
-- Constrained to return only auth email string given a phone/username input.
REVOKE EXECUTE ON FUNCTION public.get_email_by_phone(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_email_by_phone(text) TO anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_email_by_username(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_email_by_username(text) TO anon, authenticated;
