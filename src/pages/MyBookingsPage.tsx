import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatHour } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar } from "lucide-react";

type BookingItem = {
  id: string;
  booking_id: string;
  booking_date: string;
  slot_hour: number;
  court_number: number;
  customer_name: string;
  amount: number;
  payment_status: string;
};

function getDisplayStatus(b: BookingItem): { label: string; className: string } {
  if (b.payment_status === "cancelled") {
    return { label: "Cancelled", className: "bg-destructive/10 text-destructive border-destructive/20" };
  }
  if (b.payment_status === "pending") {
    // Check if slot has passed
    const slotEnd = new Date(b.booking_date + "T00:00:00");
    slotEnd.setHours(b.slot_hour + 1);
    if (slotEnd < new Date()) {
      return { label: "Expired", className: "bg-muted text-muted-foreground border-muted" };
    }
    return { label: "Pending", className: "bg-peak/10 text-peak border-peak/20" };
  }
  if (b.payment_status === "completed") {
    const slotEnd = new Date(b.booking_date + "T00:00:00");
    slotEnd.setHours(b.slot_hour + 1);
    if (slotEnd < new Date()) {
      return { label: "Expired", className: "bg-muted text-muted-foreground border-muted" };
    }
    return { label: "Approved", className: "bg-offpeak/10 text-offpeak border-offpeak/20" };
  }
  return { label: b.payment_status, className: "bg-muted text-muted-foreground" };
}

const MyBookingsPage = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadBookings();
  }, [user]);

  async function loadBookings() {
    const { data } = await supabase
      .from("bookings")
      .select("id, booking_id, booking_date, slot_hour, court_number, customer_name, amount, payment_status")
      .eq("user_id", user!.id)
      .order("booking_date", { ascending: false })
      .order("slot_hour", { ascending: false })
      .limit(100);
    setBookings((data as BookingItem[]) || []);
    setLoading(false);
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Please log in to see your bookings</p>
        <Link to="/login"><Button>Login</Button></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b">
        <div className="container flex items-center h-14 gap-3">
          <Link to="/"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <h1 className="font-heading text-lg font-bold text-gradient-brand">My Bookings</h1>
        </div>
      </header>

      <div className="container py-4 max-w-lg mx-auto space-y-3">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">No bookings yet</p>
            <Link to="/book"><Button>Book a Court</Button></Link>
          </div>
        ) : (
          bookings.map((b) => {
            const status = getDisplayStatus(b);
            return (
              <Link key={b.id} to={`/booking/${b.id}`}>
                <div className="flex items-center gap-3 bg-card border rounded-xl p-4 hover:bg-secondary/50 transition-colors">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground">
                      Court {b.court_number} • {formatHour(b.slot_hour)} – {formatHour(b.slot_hour + 1)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(b.booking_date), "dd MMM yyyy")} • ₹{b.amount}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-mono">{b.booking_id}</p>
                  </div>
                  <Badge variant="outline" className={`text-[10px] shrink-0 ${status.className}`}>
                    {status.label}
                  </Badge>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MyBookingsPage;
