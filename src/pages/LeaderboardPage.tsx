import { useState, useEffect } from "react";
import { BackButton } from "@/components/BackButton";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trophy, Medal, Award } from "lucide-react";

type LeaderboardPlayer = {
  id: string;
  username: string;
  display_name: string;
  skill_level: string;
  elo_rating: number;
  matches_played: number;
  wins: number;
  losses: number;
};

const LeaderboardPage = () => {
  const [players, setPlayers] = useState<LeaderboardPlayer[]>([]);
  const [tab, setTab] = useState<"elo" | "wins" | "matches">("elo");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [tab]);

  async function loadLeaderboard() {
    setLoading(true);
    const orderCol = tab === "elo" ? "elo_rating" : tab === "wins" ? "wins" : "matches_played";
    const { data } = await supabase
      .from("profiles")
      .select("id, username, display_name, skill_level, elo_rating, matches_played, wins, losses")
      .order(orderCol, { ascending: false })
      .limit(50);
    setPlayers((data as LeaderboardPlayer[]) || []);
    setLoading(false);
  }

  const rankIcons = ["🥇", "🥈", "🥉"];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b">
        <div className="container flex items-center h-14 gap-3">
          <BackButton />
          <h1 className="font-heading text-lg font-bold text-gradient-brand">🏆 Leaderboard</h1>
        </div>
      </header>

      <div className="container py-4 max-w-lg mx-auto space-y-4">
        {/* Tabs */}
        <div className="flex bg-secondary rounded-xl p-1 gap-1">
          {([
            { key: "elo", label: "ELO Rating", icon: <Trophy className="h-3.5 w-3.5" /> },
            { key: "wins", label: "Most Wins", icon: <Medal className="h-3.5 w-3.5" /> },
            { key: "matches", label: "Most Active", icon: <Award className="h-3.5 w-3.5" /> },
          ] as const).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                tab === t.key ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : players.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No players yet</div>
        ) : (
          <div className="space-y-2">
            {players.map((player, i) => {
              const stat = tab === "elo" ? player.elo_rating : tab === "wins" ? player.wins : player.matches_played;
              const statLabel = tab === "elo" ? "ELO" : tab === "wins" ? "wins" : "played";
              return (
                <Link key={player.id} to={`/player/${player.username}`}>
                  <div className={`flex items-center gap-3 rounded-xl p-3 transition-colors ${
                    i < 3 ? "bg-primary/5 border border-primary/20" : "bg-card border"
                  }`}>
                    <div className="w-8 text-center font-bold text-sm">
                      {i < 3 ? <span className="text-lg">{rankIcons[i]}</span> : <span className="text-muted-foreground">#{i + 1}</span>}
                    </div>
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm shrink-0">
                      {player.display_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">{player.display_name}</p>
                      <p className="text-[10px] text-muted-foreground">@{player.username}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">{stat}</p>
                      <p className="text-[10px] text-muted-foreground">{statLabel}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;
