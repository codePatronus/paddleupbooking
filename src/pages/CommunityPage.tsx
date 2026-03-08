import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, Trophy, Users, UserPlus } from "lucide-react";

type Player = {
  id: string;
  username: string;
  display_name: string;
  skill_level: string;
  elo_rating: number;
  matches_played: number;
  wins: number;
};

const CommunityPage = () => {
  const { user } = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "beginner" | "intermediate" | "advanced">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlayers();
  }, []);

  async function loadPlayers() {
    const { data } = await supabase
      .from("profiles")
      .select("id, username, display_name, skill_level, elo_rating, matches_played, wins")
      .order("elo_rating", { ascending: false })
      .limit(100);
    setPlayers((data as Player[]) || []);
    setLoading(false);
  }

  const filtered = players.filter((p) => {
    if (filter !== "all" && p.skill_level !== filter) return false;
    if (search && !p.username.includes(search.toLowerCase()) && !p.display_name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const skillColors: Record<string, string> = {
    beginner: "bg-green-500/10 text-green-700 border-green-200",
    intermediate: "bg-yellow-500/10 text-yellow-700 border-yellow-200",
    advanced: "bg-red-500/10 text-red-700 border-red-200",
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b">
        <div className="container flex items-center h-14 gap-3">
          <Link to="/"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <h1 className="font-heading text-lg font-bold text-gradient-brand">Community</h1>
        </div>
      </header>

      <div className="container py-4 max-w-lg mx-auto space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search players..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(["all", "beginner", "intermediate", "advanced"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {f === "all" ? "All Players" : f === "beginner" ? "🟢 Beginner" : f === "intermediate" ? "🟡 Intermediate" : "🔴 Advanced"}
            </button>
          ))}
        </div>

        {/* Quick links */}
        <div className="flex gap-2">
          <Link to="/leaderboard" className="flex-1">
            <Button variant="outline" className="w-full gap-2 text-sm">
              <Trophy className="h-4 w-4" /> Leaderboard
            </Button>
          </Link>
          <Link to="/find-players" className="flex-1">
            <Button variant="outline" className="w-full gap-2 text-sm">
              <UserPlus className="h-4 w-4" /> Find Players
            </Button>
          </Link>
        </div>

        {/* Player list */}
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading players...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {players.length === 0 ? "No players have joined yet. Be the first!" : "No players match your search."}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((player, i) => (
              <Link key={player.id} to={`/player/${player.username}`}>
                <div className="flex items-center gap-3 bg-card border rounded-xl p-3 hover:bg-secondary/50 transition-colors">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm shrink-0">
                    {player.display_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground truncate">{player.display_name}</p>
                    <p className="text-xs text-muted-foreground">@{player.username}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <Badge className={`text-[10px] ${skillColors[player.skill_level] || ""}`}>
                      {player.skill_level}
                    </Badge>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      ELO {player.elo_rating} • {player.wins}W
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityPage;
