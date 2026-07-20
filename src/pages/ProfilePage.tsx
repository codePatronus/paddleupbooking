import { useState, useEffect } from "react";
import { BackButton } from "@/components/BackButton";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, UserPlus, UserMinus, Users, Trophy, Target } from "lucide-react";
import { toast } from "sonner";

type ProfileData = {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string;
  skill_level: string;
  matches_played: number;
  wins: number;
  losses: number;
  elo_rating: number;
};

type BadgeData = { badge_id: string; earned_at: string; badges: { name: string; icon: string; description: string } };

const ProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const { user, profile: myProfile } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [badges, setBadges] = useState<BadgeData[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isPartner, setIsPartner] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (username) loadProfile();
  }, [username]);

  async function loadProfile() {
    setLoading(true);
    const { data: prof } = await supabase
      .from("profiles_public" as any)
      .select("*")
      .eq("username", username)
      .single();

    if (!prof) { setLoading(false); return; }
    setProfileData(prof as ProfileData);

    // Load badges, follows, partners in parallel
    const [badgeRes, followerRes, followingRes] = await Promise.all([
      supabase.from("user_badges").select("badge_id, earned_at, badges(name, icon, description)").eq("user_id", prof.id),
      supabase.from("follows").select("id", { count: "exact" }).eq("following_id", prof.id),
      supabase.from("follows").select("id", { count: "exact" }).eq("follower_id", prof.id),
    ]);

    setBadges((badgeRes.data || []) as unknown as BadgeData[]);
    setFollowerCount(followerRes.count || 0);
    setFollowingCount(followingRes.count || 0);

    if (user && user.id !== prof.id) {
      const [followCheck, partnerCheck] = await Promise.all([
        supabase.from("follows").select("id").eq("follower_id", user.id).eq("following_id", prof.id).single(),
        supabase.from("regular_partners").select("id").eq("user_id", user.id).eq("partner_id", prof.id).single(),
      ]);
      setIsFollowing(!!followCheck.data);
      setIsPartner(!!partnerCheck.data);
    }
    setLoading(false);
  }

  async function toggleFollow() {
    if (!user || !profileData) return;
    if (isFollowing) {
      await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", profileData.id);
      setIsFollowing(false);
      setFollowerCount((c) => c - 1);
      toast.success("Unfollowed");
    } else {
      await supabase.from("follows").insert({ follower_id: user.id, following_id: profileData.id });
      setIsFollowing(true);
      setFollowerCount((c) => c + 1);
      toast.success("Following!");
    }
  }

  async function togglePartner() {
    if (!user || !profileData) return;
    if (isPartner) {
      await supabase.from("regular_partners").delete().eq("user_id", user.id).eq("partner_id", profileData.id);
      setIsPartner(false);
      toast.success("Removed from regular partners");
    } else {
      await supabase.from("regular_partners").insert({ user_id: user.id, partner_id: profileData.id });
      setIsPartner(true);
      toast.success("Added as regular partner!");
    }
  }

  const skillColors = { beginner: "bg-green-500/10 text-green-700", intermediate: "bg-yellow-500/10 text-yellow-700", advanced: "bg-red-500/10 text-red-700" };
  const winRate = profileData && profileData.matches_played > 0 ? Math.round((profileData.wins / profileData.matches_played) * 100) : 0;
  const isOwnProfile = user?.id === profileData?.id;

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-muted-foreground">Loading...</div></div>;
  if (!profileData) return <div className="min-h-screen flex flex-col items-center justify-center gap-4"><p className="text-muted-foreground">Player not found</p><Link to="/"><Button>Go Home</Button></Link></div>;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b">
        <div className="container flex items-center h-14 gap-3">
          <BackButton />
          <h1 className="font-heading text-lg font-bold">@{profileData.username}</h1>
        </div>
      </header>

      <div className="container py-6 max-w-md mx-auto space-y-5 animate-fade-in">
        {/* Profile header */}
        <div className="bg-card border rounded-2xl p-5 text-center space-y-3">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-3xl">
            {profileData.display_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="font-heading text-xl font-bold text-foreground">{profileData.display_name}</h2>
            <p className="text-sm text-muted-foreground">@{profileData.username}</p>
          </div>
          <Badge className={skillColors[profileData.skill_level as keyof typeof skillColors] || ""}>
            {profileData.skill_level}
          </Badge>
          {profileData.bio && <p className="text-sm text-muted-foreground">{profileData.bio}</p>}

          <div className="flex justify-center gap-6 text-sm">
            <div><span className="font-bold text-foreground">{followerCount}</span> <span className="text-muted-foreground">followers</span></div>
            <div><span className="font-bold text-foreground">{followingCount}</span> <span className="text-muted-foreground">following</span></div>
          </div>

          {user && !isOwnProfile && (
            <div className="flex gap-2 justify-center">
              <Button size="sm" variant={isFollowing ? "outline" : "default"} onClick={toggleFollow}>
                {isFollowing ? <><UserMinus className="h-4 w-4 mr-1" /> Unfollow</> : <><UserPlus className="h-4 w-4 mr-1" /> Follow</>}
              </Button>
              <Button size="sm" variant={isPartner ? "outline" : "secondary"} onClick={togglePartner}>
                <Users className="h-4 w-4 mr-1" />
                {isPartner ? "Remove Partner" : "Add Partner"}
              </Button>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: <Target className="h-4 w-4" />, label: "ELO", value: profileData.elo_rating },
            { icon: <Trophy className="h-4 w-4" />, label: "Wins", value: profileData.wins },
            { icon: "🏓", label: "Played", value: profileData.matches_played },
            { icon: "📊", label: "Win%", value: `${winRate}%` },
          ].map((s) => (
            <div key={s.label} className="bg-card border rounded-xl p-3 text-center">
              <div className="flex justify-center mb-1 text-primary">{typeof s.icon === "string" ? <span>{s.icon}</span> : s.icon}</div>
              <p className="font-bold text-foreground text-lg">{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Badges */}
        {badges.length > 0 && (
          <div className="bg-card border rounded-2xl p-4 space-y-3">
            <h3 className="font-heading font-bold text-foreground">Badges</h3>
            <div className="flex flex-wrap gap-2">
              {badges.map((b) => (
                <div key={b.badge_id} className="flex items-center gap-1.5 bg-secondary rounded-full px-3 py-1.5 text-sm" title={b.badges.description}>
                  <span>{b.badges.icon}</span>
                  <span className="font-medium text-foreground">{b.badges.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
