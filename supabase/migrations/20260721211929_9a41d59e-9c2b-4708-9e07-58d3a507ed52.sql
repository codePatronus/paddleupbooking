-- Fix SUPA_security_definer_view: recreate profiles_public as a SECURITY INVOKER view.
-- Protect phone via column-level SELECT privileges (authenticated cannot read phone
-- from profiles directly), and add a permissive SELECT policy so the invoker view
-- can return non-sensitive fields for cross-user reads.

DROP VIEW IF EXISTS public.profiles_public;

CREATE VIEW public.profiles_public
WITH (security_invoker = true) AS
SELECT
  id, username, display_name, avatar_url, bio, skill_level,
  elo_rating, wins, losses, matches_played, gender,
  created_at, updated_at
FROM public.profiles;

GRANT SELECT ON public.profiles_public TO authenticated, anon;

-- Column-level privileges on the base table: authenticated can select only
-- non-sensitive columns. phone is not granted, so any attempt to read it
-- via a direct query on public.profiles fails with a permission error.
REVOKE SELECT ON public.profiles FROM authenticated, anon;
GRANT SELECT (
  id, username, display_name, avatar_url, bio, skill_level,
  elo_rating, wins, losses, matches_played, gender,
  created_at, updated_at
) ON public.profiles TO authenticated;

-- Service role retains full access for edge functions / admin code.
GRANT SELECT ON public.profiles TO service_role;

-- Permissive SELECT policy so the invoker view can return other users'
-- non-sensitive fields. Column privileges above still block phone.
DROP POLICY IF EXISTS "Authenticated can read non-sensitive profile fields" ON public.profiles;
CREATE POLICY "Authenticated can read non-sensitive profile fields"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- SECURITY DEFINER RPC so the owner can fetch their own full profile
-- (including phone) without needing table-level SELECT privilege on phone.
CREATE OR REPLACE FUNCTION public.get_my_profile()
RETURNS SETOF public.profiles
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.profiles WHERE id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION public.get_my_profile() TO authenticated;