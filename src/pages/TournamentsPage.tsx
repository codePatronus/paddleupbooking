import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trophy, Users, Calendar } from "lucide-react";
import { toast } from "sonner";

type Tournament = {
  id: string;
  name: string;
  description: string;
  format: string;
  start_date: string;
  end_date: string | null;
  status: string;
  max_participants: number;
  participant_count?: number;
  is_joined?: boolean;
};

const TournamentsPage = () => {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningIds, setJoiningIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadTournaments();
  }, [user]);

  async function loadTournaments() {
    const { data: tourns } = await supabase
      .from("tournaments")
      .select("*")
      .order("start_date", { ascending: true });

    if (!tourns) { setLoading(false); return; }

    // Get participant counts
    const withCounts = await Promise.all(
      (tourns as Tournament[]).map(async (t) => {
        const { count } = await supabase
          .from("tournament_participants")
          .select("id", { count: "exact" })
          .eq("tournament_id", t.id);

        let is_joined = false;
        if (user) {
          const { data } = await supabase
            .from("tournament_participants")
            .select("id")
            .eq("tournament_id", t.id)
            .eq("player_id", user.id)
            .single();
          is_joined = !!data;
        }

        return { ...t, participant_count: count || 0, is_joined };
      })
    );

    setTournaments(withCounts);
    setLoading(false);
  }

  async function joinTournament(tournamentId: string) {
    if (!user) { toast.error("Please log in first"); return; }
    setJoiningIds((s) => new Set(s).add(tournamentId));
    const { error } = await supabase.from("tournament_participants").insert({
      tournament_id: tournamentId,
      player_id: user.id,
    });
    setJoiningIds((s) => { const n = new Set(s); n.delete(tournamentId); return n; });
    if (error) {
      toast.error(error.code === "23505" ? "Already joined!" : "Failed to join");
    } else {
      toast.success("You're in! 🏆");
      loadTournaments();
    }
  }

  const statusColors: Record<string, string> = {
    upcoming: "bg-accent/10 text-accent",
    active: "bg-green-500/10 text-green-700",
    completed: "bg-muted text-muted-foreground",
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b">
        <div className="container flex items-center h-14 gap-3">
          <Link to="/"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <h1 className="font-heading text-lg font-bold text-gradient-brand">🏆 Tournaments</h1>
        </div>
      </header>

      <div className="container py-4 max-w-lg mx-auto space-y-4">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : tournaments.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">No tournaments yet</p>
            <p className="text-xs text-muted-foreground">Check back soon for upcoming events!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tournaments.map((t) => (
              <div key={t.id} className="bg-card border rounded-2xl p-4 space-y-3 text-center">
                <div className="flex flex-col items-center gap-2">
                  <Badge className={`text-[10px] ${statusColors[t.status] || ""}`}>
                    {t.status}
                  </Badge>
                  <h3 className="font-heading font-bold text-foreground">{t.name}</h3>
                  {t.description && <p className="text-xs text-muted-foreground">{t.description}</p>}
                </div>

                <div className="flex flex-wrap justify-center gap-2 text-xs">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    {format(new Date(t.start_date), "dd MMM yyyy")}
                    {t.end_date && ` – ${format(new Date(t.end_date), "dd MMM")}`}
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    {t.participant_count}/{t.max_participants}
                  </span>
                  <Badge variant="outline" className="text-[10px]">{t.format}</Badge>
                </div>

                {t.status === "upcoming" && !t.is_joined && (
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => joinTournament(t.id)}
                    disabled={!user || joiningIds.has(t.id) || (t.participant_count || 0) >= t.max_participants}
                  >
                    {joiningIds.has(t.id) ? "Joining..." : "Join Tournament"}
                  </Button>
                )}
                {t.is_joined && (
                  <div className="text-center text-sm text-primary font-semibold py-1">✅ You're registered!</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TournamentsPage;
