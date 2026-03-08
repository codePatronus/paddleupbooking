import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatHour } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MessageCircle, Users } from "lucide-react";

type BookingWithRoom = {
  id: string;
  booking_date: string;
  slot_hour: number;
  court_number: number;
  customer_name: string;
  payment_status: string;
};

const MyRoomsPage = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingWithRoom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadMyBookings();
  }, [user]);

  async function loadMyBookings() {
    const { data } = await supabase
      .from("bookings")
      .select("id, booking_date, slot_hour, court_number, customer_name, payment_status")
      .eq("user_id", user!.id)
      .eq("payment_status", "completed")
      .order("booking_date", { ascending: false })
      .limit(50);
    setBookings((data as BookingWithRoom[]) || []);
    setLoading(false);
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Please log in to see your rooms</p>
        <Link to="/login"><Button>Login</Button></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b">
        <div className="container flex items-center h-14 gap-3">
          <Link to="/"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <h1 className="font-heading text-lg font-bold text-gradient-brand">My Booked Rooms</h1>
        </div>
      </header>

      <div className="container py-4 max-w-lg mx-auto space-y-3">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">No booked rooms yet</p>
            <p className="text-xs text-muted-foreground">Book a court to get a chat room!</p>
            <Link to="/book"><Button>Book a Court</Button></Link>
          </div>
        ) : (
          bookings.map((b) => {
            const isPast = new Date(b.booking_date) < new Date(new Date().toDateString());
            return (
              <Link key={b.id} to={`/chat/${b.id}`}>
                <div className="flex items-center gap-3 bg-card border rounded-xl p-4 hover:bg-secondary/50 transition-colors">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <MessageCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground">
                      Court {b.court_number} • {formatHour(b.slot_hour)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(b.booking_date), "dd MMM yyyy")}
                    </p>
                  </div>
                  <div className="shrink-0">
                    {isPast ? (
                      <Badge variant="secondary" className="text-[10px]">Past</Badge>
                    ) : (
                      <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20">Active</Badge>
                    )}
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

export default MyRoomsPage;
