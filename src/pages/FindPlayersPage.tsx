import { useState, useEffect } from "react";
import { BackButton } from "@/components/BackButton";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatHour } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MessageCircle, Users } from "lucide-react";

type RoomData = {
  id: string;
  booking_date: string;
  slot_hour: number;
  court_number: number;
  customer_name: string;
  user_id: string | null;
  profiles: { username: string; display_name: string } | null;
  match_requests: { id: string; players_needed: number; play_mode: string; is_active: boolean }[];
};

const RoomsPage = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<RoomData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRooms();
  }, []);

  async function loadRooms() {
    // Get all confirmed bookings that have active match_requests (Need Player toggled on)
    // Only show bookings where slot hasn't expired yet
    const now = new Date();
    const todayStr = format(now, "yyyy-MM-dd");

    const { data, error } = await supabase
      .from("bookings")
      .select(`
        id, booking_date, slot_hour, court_number, customer_name, user_id,
        profiles:user_id (username, display_name),
        match_requests (id, players_needed, play_mode, is_active)
      `)
      .eq("payment_status", "completed")
      .gte("booking_date", todayStr)
      .order("booking_date", { ascending: true })
      .order("slot_hour", { ascending: true });

    if (error) {
      console.error("Error loading rooms:", error);
      setLoading(false);
      return;
    }

    // Filter: only bookings with active match_requests AND not yet expired
    const filtered = ((data || []) as unknown as RoomData[]).filter((b) => {
      // Must have at least one active match request
      const hasActiveRequest = b.match_requests?.some((mr) => mr.is_active);
      if (!hasActiveRequest) return false;

      // Check if slot hasn't ended yet
      const slotEnd = new Date(b.booking_date + "T00:00:00");
      slotEnd.setHours(b.slot_hour + 1);
      return slotEnd > now;
    });

    setRooms(filtered);
    setLoading(false);
  }

  function getRoomName(b: RoomData): string {
    const username = b.profiles?.username || b.customer_name;
    const time = formatHour(b.slot_hour);
    const date = format(new Date(b.booking_date), "dd-MMM");
    return `${username}_${time}_${date}`;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b">
        <div className="container flex items-center h-14 gap-3">
          <BackButton />
          <h1 className="font-heading text-lg font-bold text-gradient-brand">Rooms</h1>
        </div>
      </header>

      <div className="container py-4 max-w-lg mx-auto space-y-3">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <Users className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">No active rooms right now</p>
            <p className="text-xs text-muted-foreground">
              Rooms appear when someone books a court with "Need Players" and admin approves it
            </p>
            <Link to="/book"><Button>Book a Court</Button></Link>
          </div>
        ) : (
          rooms.map((b) => {
            const mr = b.match_requests?.find((r) => r.is_active);
            const isOwner = user?.id === b.user_id;
            return (
              <Link key={b.id} to={`/chat/${b.id}`}>
                <div className="flex items-center gap-3 bg-card border rounded-xl p-4 hover:bg-secondary/50 transition-colors">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <MessageCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground truncate">
                      {getRoomName(b)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Court {b.court_number} • {formatHour(b.slot_hour)} – {formatHour(b.slot_hour + 1)} • {format(new Date(b.booking_date), "dd MMM")}
                    </p>
                    <div className="flex gap-1.5 mt-1">
                      {mr && (
                        <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                          Need {mr.players_needed} • {mr.play_mode}
                        </Badge>
                      )}
                      {isOwner && (
                        <Badge variant="outline" className="text-[10px] bg-accent/10 text-accent border-accent/20">
                          Your Room
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RoomsPage;
