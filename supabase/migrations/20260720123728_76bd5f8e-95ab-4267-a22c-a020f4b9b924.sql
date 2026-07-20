
-- 1) Disable GraphQL entirely
DROP EXTENSION IF EXISTS pg_graphql CASCADE;

-- 2) Room-member check (room_id is text, cast to uuid)
CREATE OR REPLACE FUNCTION public.is_room_member(_user_id uuid, _room_id text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.bookings b WHERE b.id::text = _room_id AND b.user_id = _user_id
  ) OR EXISTS (
    SELECT 1
    FROM public.join_requests jr
    JOIN public.match_requests mr ON mr.id = jr.match_request_id
    WHERE mr.booking_id::text = _room_id
      AND jr.player_id = _user_id
      AND jr.status = 'accepted'
  );
$$;

DROP POLICY IF EXISTS "Authenticated can view messages" ON public.messages;
CREATE POLICY "Room members can view messages"
ON public.messages FOR SELECT TO authenticated
USING (
  sender_id = auth.uid()
  OR public.is_room_member(auth.uid(), room_id)
  OR public.has_role(auth.uid(), 'admin')
);

DROP POLICY IF EXISTS "Authenticated can send messages" ON public.messages;
CREATE POLICY "Room members can send messages"
ON public.messages FOR INSERT TO authenticated
WITH CHECK (
  sender_id = auth.uid()
  AND public.is_room_member(auth.uid(), room_id)
);

-- 3) Profiles: hide phone. Owner/admin can see full row; others see safe fields via view.
DROP POLICY IF EXISTS "Authenticated can view profiles" ON public.profiles;
CREATE POLICY "Owner or admin can view full profile"
ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));

-- Public view (security definer semantics) that excludes phone
CREATE OR REPLACE VIEW public.profiles_public
WITH (security_invoker = false) AS
SELECT id, username, display_name, avatar_url, bio, skill_level, gender,
       elo_rating, matches_played, wins, losses, created_at, updated_at
FROM public.profiles;

GRANT SELECT ON public.profiles_public TO authenticated, anon;
