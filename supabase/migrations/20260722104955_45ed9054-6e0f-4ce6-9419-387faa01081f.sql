-- Restrict authenticated from reading phone column directly on profiles.
-- Owner still gets phone via get_my_profile() SECURITY DEFINER RPC.
REVOKE SELECT ON public.profiles FROM authenticated;
REVOKE SELECT ON public.profiles FROM anon;
GRANT SELECT (id, username, display_name, avatar_url, bio, skill_level, gender, matches_played, wins, losses, elo_rating, created_at, updated_at) ON public.profiles TO authenticated;
GRANT SELECT (id, username, display_name, avatar_url, bio, skill_level, gender, matches_played, wins, losses, elo_rating, created_at, updated_at) ON public.profiles TO anon;