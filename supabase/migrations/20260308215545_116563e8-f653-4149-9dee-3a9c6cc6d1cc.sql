
-- Enums
CREATE TYPE public.skill_level AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE public.play_mode AS ENUM ('casual', 'competitive');
CREATE TYPE public.gender_pref AS ENUM ('any', 'male', 'female');
CREATE TYPE public.request_status AS ENUM ('pending', 'accepted', 'declined');
CREATE TYPE public.tournament_status AS ENUM ('upcoming', 'active', 'completed');

-- Profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  display_name text NOT NULL DEFAULT '',
  avatar_url text,
  bio text DEFAULT '',
  skill_level skill_level NOT NULL DEFAULT 'beginner',
  gender text DEFAULT 'prefer_not_to_say',
  matches_played integer NOT NULL DEFAULT 0,
  wins integer NOT NULL DEFAULT 0,
  losses integer NOT NULL DEFAULT 0,
  elo_rating integer NOT NULL DEFAULT 1000,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Badges table
CREATE TABLE public.badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL DEFAULT '🏅',
  criteria_type text NOT NULL,
  criteria_value integer NOT NULL DEFAULT 0
);

ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view badges" ON public.badges FOR SELECT USING (true);

-- User badges
CREATE TABLE public.user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id uuid NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view user badges" ON public.user_badges FOR SELECT USING (true);
CREATE POLICY "System inserts badges" ON public.user_badges FOR INSERT WITH CHECK (true);

-- Match requests
CREATE TABLE public.match_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  host_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  players_needed integer NOT NULL CHECK (players_needed IN (1, 2)),
  skill_filter skill_level,
  gender_pref gender_pref NOT NULL DEFAULT 'any',
  play_mode play_mode NOT NULL DEFAULT 'casual',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.match_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active match requests" ON public.match_requests FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create" ON public.match_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = host_id);
CREATE POLICY "Host can update own request" ON public.match_requests FOR UPDATE USING (auth.uid() = host_id);

-- Join requests
CREATE TABLE public.join_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_request_id uuid NOT NULL REFERENCES public.match_requests(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status request_status NOT NULL DEFAULT 'pending',
  message text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(match_request_id, player_id)
);

ALTER TABLE public.join_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Involved users can view" ON public.join_requests FOR SELECT USING (
  auth.uid() = player_id OR 
  auth.uid() IN (SELECT host_id FROM public.match_requests WHERE id = match_request_id)
);
CREATE POLICY "Authenticated can create join request" ON public.join_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = player_id);
CREATE POLICY "Host can update join request" ON public.join_requests FOR UPDATE USING (
  auth.uid() IN (SELECT host_id FROM public.match_requests WHERE id = match_request_id)
);

-- Follows
CREATE TABLE public.follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view follows" ON public.follows FOR SELECT USING (true);
CREATE POLICY "Users can follow" ON public.follows FOR INSERT TO authenticated WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow" ON public.follows FOR DELETE TO authenticated USING (auth.uid() = follower_id);

-- Regular partners
CREATE TABLE public.regular_partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  partner_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, partner_id),
  CHECK (user_id != partner_id)
);

ALTER TABLE public.regular_partners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view partners" ON public.regular_partners FOR SELECT USING (true);
CREATE POLICY "Users can add partners" ON public.regular_partners FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove partners" ON public.regular_partners FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Messages
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id text NOT NULL,
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view messages" ON public.messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can send messages" ON public.messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.join_requests;

-- Tournaments
CREATE TABLE public.tournaments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  format text NOT NULL DEFAULT 'ladder',
  start_date date NOT NULL,
  end_date date,
  status tournament_status NOT NULL DEFAULT 'upcoming',
  max_participants integer DEFAULT 32,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view tournaments" ON public.tournaments FOR SELECT USING (true);
CREATE POLICY "Admin can insert tournaments" ON public.tournaments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admin can update tournaments" ON public.tournaments FOR UPDATE TO authenticated USING (true);

-- Tournament participants
CREATE TABLE public.tournament_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  seed integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(tournament_id, player_id)
);

ALTER TABLE public.tournament_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view participants" ON public.tournament_participants FOR SELECT USING (true);
CREATE POLICY "Authenticated can join" ON public.tournament_participants FOR INSERT TO authenticated WITH CHECK (auth.uid() = player_id);

-- Match results
CREATE TABLE public.match_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid REFERENCES public.tournaments(id) ON DELETE SET NULL,
  player1_id uuid NOT NULL REFERENCES public.profiles(id),
  player2_id uuid NOT NULL REFERENCES public.profiles(id),
  player1_score integer NOT NULL DEFAULT 0,
  player2_score integer NOT NULL DEFAULT 0,
  winner_id uuid REFERENCES public.profiles(id),
  played_at timestamptz NOT NULL DEFAULT now(),
  submitted_by uuid NOT NULL REFERENCES public.profiles(id),
  verified boolean NOT NULL DEFAULT false
);

ALTER TABLE public.match_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view results" ON public.match_results FOR SELECT USING (true);
CREATE POLICY "Authenticated can submit results" ON public.match_results FOR INSERT TO authenticated WITH CHECK (auth.uid() = submitted_by);
CREATE POLICY "Players can update own results" ON public.match_results FOR UPDATE USING (auth.uid() = player1_id OR auth.uid() = player2_id);

-- Add user_id column to bookings
ALTER TABLE public.bookings ADD COLUMN user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Seed badges
INSERT INTO public.badges (name, description, icon, criteria_type, criteria_value) VALUES
  ('Weekend Warrior', 'Played 10 weekend matches', '⚔️', 'weekend_matches', 10),
  ('Smash King', 'Won 25 matches', '👑', 'wins', 25),
  ('Consistent Server', 'Played 50 matches total', '🎯', 'matches_played', 50),
  ('Rising Star', 'Reached 1200 ELO', '⭐', 'elo_rating', 1200),
  ('Community Builder', 'Followed 10 players', '🤝', 'follows', 10),
  ('First Win', 'Won your first match', '🏆', 'wins', 1),
  ('Getting Started', 'Played your first match', '🏓', 'matches_played', 1),
  ('Tournament Regular', 'Participated in 5 tournaments', '🏅', 'tournaments', 5);
