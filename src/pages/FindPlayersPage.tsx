import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatHour } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, UserPlus, Send, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type MatchRequest = {
  id: string;
  booking_id: string;
  host_id: string;
  players_needed: number;
  skill_filter: string | null;
  gender_pref: string;
  play_mode: string;
  is_active: boolean;
  created_at: string;
  bookings: { booking_date: string; slot_hour: number; court_number: number };
  profiles: { username: string; display_name: string; skill_level: string; elo_rating: number };
};

const FindPlayersPage = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<MatchRequest[]>([]);
  const [skillFilter, setSkillFilter] = useState<string>("all");
  const [modeFilter, setModeFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [sendingIds, setSendingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadRequests();
    const channel = supabase
      .channel("match-requests")
      .on("postgres_changes", { event: "*", schema: "public", table: "match_requests" }, () => loadRequests())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  async function loadRequests() {
    const { data } = await supabase
      .from("match_requests")
      .select("*, bookings(booking_date, slot_hour, court_number), profiles(username, display_name, skill_level, elo_rating)")
      .eq("is_active", true)
      .gte("bookings.booking_date", format(new Date(), "yyyy-MM-dd"))
      .order("created_at", { ascending: false });
    setRequests((data as unknown as MatchRequest[]) || []);
    setLoading(false);
  }

  async function sendJoinRequest(requestId: string) {
    if (!user) { toast.error("Please log in first"); return; }
    setSendingIds((s) => new Set(s).add(requestId));
    const { error } = await supabase.from("join_requests").insert({
      match_request_id: requestId,
      player_id: user.id,
    });
    setSendingIds((s) => { const n = new Set(s); n.delete(requestId); return n; });
    if (error) {
      if (error.code === "23505") toast.error("You already sent a request!");
      else toast.error("Failed to send request");
    } else {
      toast.success("Join request sent! 🎉");
    }
  }

  const filtered = requests.filter((r) => {
    if (skillFilter !== "all" && r.skill_filter && r.skill_filter !== skillFilter) return false;
    if (modeFilter !== "all" && r.play_mode !== modeFilter) return false;
    if (user && r.host_id === user.id) return false;
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b">
        <div className="container flex items-center h-14 gap-3">
          <Link to="/community"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <h1 className="font-heading text-lg font-bold text-gradient-brand">Find Players</h1>
        </div>
      </header>

      <div className="container py-4 max-w-lg mx-auto space-y-4">
        {/* Filters */}
        <div className="flex gap-2">
          <Select value={skillFilter} onValueChange={setSkillFilter}>
            <SelectTrigger className="flex-1 text-xs h-9"><SelectValue placeholder="Skill" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Skills</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
          <Select value={modeFilter} onValueChange={setModeFilter}>
            <SelectTrigger className="flex-1 text-xs h-9"><SelectValue placeholder="Mode" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modes</SelectItem>
              <SelectItem value="casual">Casual</SelectItem>
              <SelectItem value="competitive">Competitive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <UserPlus className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">No open requests right now</p>
            <p className="text-xs text-muted-foreground">Book a court and toggle "Need Players" to create one!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((req) => (
              <div key={req.id} className="bg-card border rounded-2xl p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <Link to={`/player/${req.profiles.username}`} className="font-semibold text-sm text-foreground hover:underline">
                      {req.profiles.display_name}
                    </Link>
                    <p className="text-[10px] text-muted-foreground">@{req.profiles.username} • ELO {req.profiles.elo_rating}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    Need {req.players_needed} {req.players_needed === 1 ? "player" : "players"}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {req.bookings && (
                    <>
                      <Badge variant="secondary" className="text-[10px]">
                        📅 {format(new Date(req.bookings.booking_date), "dd MMM")}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px]">
                        🕐 {formatHour(req.bookings.slot_hour)}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px]">
                        🏟️ Court {req.bookings.court_number}
                      </Badge>
                    </>
                  )}
                  <Badge variant="secondary" className="text-[10px]">
                    {req.play_mode === "casual" ? "😎 Casual" : "🔥 Competitive"}
                  </Badge>
                  {req.skill_filter && (
                    <Badge variant="secondary" className="text-[10px]">
                      🎯 {req.skill_filter}
                    </Badge>
                  )}
                </div>

                <Button
                  size="sm"
                  className="w-full gap-2"
                  onClick={() => sendJoinRequest(req.id)}
                  disabled={!user || sendingIds.has(req.id)}
                >
                  <Send className="h-3.5 w-3.5" />
                  {sendingIds.has(req.id) ? "Sending..." : "Request to Join"}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FindPlayersPage;
