import { useState, useEffect } from "react";
import { format, addDays, subDays } from "date-fns";
import { supabase, COURTS, SLOT_HOURS, formatHour, isPeakHour, type Booking } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, LogOut, Search } from "lucide-react";
import { toast } from "sonner";

const ADMIN_PIN = "2024"; // Simple PIN-based admin access

const AdminPage = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");

  const dateStr = format(selectedDate, "yyyy-MM-dd");

  useEffect(() => {
    if (!authenticated) return;
    fetchBookings();
    const channel = supabase
      .channel("admin-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => {
        fetchBookings();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [dateStr, authenticated]);

  async function fetchBookings() {
    const { data } = await supabase
      .from("bookings")
      .select("*")
      .eq("booking_date", dateStr)
      .order("slot_hour", { ascending: true });
    setBookings((data as Booking[]) || []);
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      setAuthenticated(true);
      toast.success("Welcome, Admin!");
    } else {
      toast.error("Incorrect PIN");
    }
  }

  function getBookingForSlot(court: number, hour: number) {
    return bookings.find(b => b.court_number === court && b.slot_hour === hour && b.payment_status !== "cancelled");
  }

  async function handleApprove(bookingId: string) {
    const { error } = await supabase.from("bookings").update({ payment_status: "completed" }).eq("id", bookingId);
    if (error) { toast.error("Failed to approve"); return; }
    toast.success("Booking approved! ✅");
    fetchBookings();
  }

  async function handleCancel(bookingId: string) {
    const { error } = await supabase.from("bookings").update({ payment_status: "cancelled" }).eq("id", bookingId);
    if (error) { toast.error("Failed to cancel"); return; }
    toast.success("Booking cancelled");
    fetchBookings();
  }

  const filteredBookings = bookings.filter(b => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return b.customer_name.toLowerCase().includes(q) ||
      b.customer_phone.includes(q) ||
      b.booking_id.toLowerCase().includes(q);
  });

  const totalRevenue = bookings
    .filter(b => b.payment_status === "completed")
    .reduce((sum, b) => sum + b.amount, 0);

  const totalBookings = bookings.filter(b => b.payment_status === "completed").length;

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-card border rounded-2xl p-6 w-full max-w-xs space-y-4 animate-fade-in">
          <div className="text-center space-y-1">
            <h1 className="font-heading text-xl font-bold text-gradient-brand">🔐 Admin Access</h1>
            <p className="text-xs text-muted-foreground">Enter your admin PIN</p>
          </div>
          <Input
            type="password"
            placeholder="Enter PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="text-center text-2xl tracking-widest"
            maxLength={10}
          />
          <Button type="submit" className="w-full">Login</Button>
          <Link to="/" className="block text-center text-xs text-muted-foreground hover:underline">
            ← Back to Home
          </Link>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b">
        <div className="container flex items-center h-14 gap-3 justify-between">
          <h1 className="font-heading text-lg font-bold text-gradient-brand">📊 Admin Dashboard</h1>
          <Button variant="ghost" size="icon" onClick={() => setAuthenticated(false)}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="container py-4 space-y-4 max-w-2xl mx-auto">
        {/* Date navigation */}
        <div className="flex items-center justify-between">
          <Button variant="outline" size="icon" onClick={() => setSelectedDate(d => subDays(d, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-center">
            <p className="font-heading font-bold text-lg">{format(selectedDate, "dd MMM yyyy")}</p>
            <p className="text-xs text-muted-foreground">{format(selectedDate, "EEEE")}</p>
          </div>
          <Button variant="outline" size="icon" onClick={() => setSelectedDate(d => addDays(d, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card border rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-primary">{totalBookings}</p>
            <p className="text-xs text-muted-foreground">Bookings</p>
          </div>
          <div className="bg-card border rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-offpeak">₹{totalRevenue}</p>
            <p className="text-xs text-muted-foreground">Revenue</p>
          </div>
        </div>

        {/* View toggle + search */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search name, phone, booking ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant={view === "grid" ? "default" : "outline"} size="sm" onClick={() => setView("grid")}>Grid</Button>
          <Button variant={view === "list" ? "default" : "outline"} size="sm" onClick={() => setView("list")}>List</Button>
        </div>

        {/* Grid View */}
        {view === "grid" && (
          <div className="space-y-1 overflow-x-auto">
            <div className="grid grid-cols-[70px_1fr_1fr_1fr] gap-1.5 text-center text-xs font-semibold text-muted-foreground min-w-[400px]">
              <div />
              {COURTS.map(c => <div key={c} className="py-1.5 rounded-lg bg-accent/10 text-accent">Court {c}</div>)}
            </div>
            {SLOT_HOURS.map(hour => (
              <div key={hour} className="grid grid-cols-[70px_1fr_1fr_1fr] gap-1.5 min-w-[400px]">
                <div className="flex items-center text-xs font-medium text-muted-foreground">{formatHour(hour)}</div>
                {COURTS.map(court => {
                  const b = getBookingForSlot(court, hour);
                  return (
                    <div
                      key={court}
                      className={`py-2 px-2 rounded-lg text-[10px] leading-tight ${
                        b
                          ? "bg-primary/10 border border-primary/30"
                          : "bg-muted/30 border border-transparent"
                      }`}
                    >
                      {b ? (
                        <div>
                          <p className="font-semibold text-foreground truncate">{b.customer_name}</p>
                          <p className="text-muted-foreground">{b.customer_phone}</p>
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-center">—</p>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {/* List View */}
        {view === "list" && (
          <div className="space-y-2">
            {filteredBookings.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-8">No bookings found</p>
            ) : (
              filteredBookings.map(b => (
                <div key={b.id} className="bg-card border rounded-xl p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-foreground">{b.customer_name}</p>
                      <p className="text-xs text-muted-foreground">{b.customer_phone}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      b.payment_status === "completed" ? "bg-offpeak/10 text-offpeak" :
                      b.payment_status === "pending" ? "bg-peak/10 text-peak" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {b.payment_status}
                    </span>
                  </div>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>Court {b.court_number}</span>
                    <span>{formatHour(b.slot_hour)} – {formatHour(b.slot_hour + 1)}</span>
                    <span className="font-semibold text-foreground">₹{b.amount}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground font-mono">{b.booking_id}</p>
                  {b.payment_status === "pending" && (
                    <div className="flex gap-2 pt-1">
                      <Button size="sm" className="flex-1 text-xs" onClick={() => handleApprove(b.id)}>
                        ✅ Approve
                      </Button>
                      <Button size="sm" variant="destructive" className="flex-1 text-xs" onClick={() => handleCancel(b.id)}>
                        ❌ Cancel
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
