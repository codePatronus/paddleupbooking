
-- =========================================
-- 1) profiles: lock down stat columns
-- =========================================
-- Revoke blanket UPDATE from authenticated; re-grant only user-editable columns.
REVOKE UPDATE ON public.profiles FROM authenticated;
REVOKE UPDATE ON public.profiles FROM anon;

GRANT UPDATE (username, display_name, avatar_url, bio, skill_level, gender, phone, updated_at)
  ON public.profiles TO authenticated;

-- Defense-in-depth trigger: reject any change to stat columns from non-service roles.
CREATE OR REPLACE FUNCTION public.prevent_profile_stat_edits()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF current_setting('role', true) = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF NEW.elo_rating     IS DISTINCT FROM OLD.elo_rating
  OR NEW.wins           IS DISTINCT FROM OLD.wins
  OR NEW.losses         IS DISTINCT FROM OLD.losses
  OR NEW.matches_played IS DISTINCT FROM OLD.matches_played
  THEN
    RAISE EXCEPTION 'Stat columns (elo_rating, wins, losses, matches_played) are system-managed and cannot be edited directly';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_profile_stat_edits ON public.profiles;
CREATE TRIGGER trg_prevent_profile_stat_edits
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_stat_edits();


-- =========================================
-- 2) match_results: prevent forgery & edits
-- =========================================

-- Tighten INSERT: submitter must be a participant, and cannot self-mark verified.
DROP POLICY IF EXISTS "Authenticated can submit results" ON public.match_results;
CREATE POLICY "Participants can submit unverified results"
  ON public.match_results
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = submitted_by
    AND auth.uid() IN (player1_id, player2_id)
    AND COALESCE(verified, false) = false
  );

-- Remove player UPDATE ability entirely; only admins can update/verify results.
DROP POLICY IF EXISTS "Players can update own results" ON public.match_results;

CREATE POLICY "Admins can update match results"
  ON public.match_results
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Defense-in-depth trigger: even admins cannot mutate identity columns after creation.
CREATE OR REPLACE FUNCTION public.protect_match_result_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF current_setting('role', true) = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF NEW.player1_id   IS DISTINCT FROM OLD.player1_id
  OR NEW.player2_id   IS DISTINCT FROM OLD.player2_id
  OR NEW.submitted_by IS DISTINCT FROM OLD.submitted_by
  OR NEW.tournament_id IS DISTINCT FROM OLD.tournament_id
  THEN
    RAISE EXCEPTION 'player1_id, player2_id, submitted_by, and tournament_id are immutable after creation';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_match_result_columns ON public.match_results;
CREATE TRIGGER trg_protect_match_result_columns
  BEFORE UPDATE ON public.match_results
  FOR EACH ROW EXECUTE FUNCTION public.protect_match_result_columns();
