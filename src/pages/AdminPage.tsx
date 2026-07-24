import { useState, useEffect, useMemo } from "react";
import { format, addDays, subDays, parseISO, eachDayOfInterval, differenceInDays } from "date-fns";
import * as XLSX from "xlsx";
import { supabase, COURTS, SLOT_HOURS, formatHour, getSlotPrice, type Booking } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, LogOut, Search, Download, BarChart3, LayoutGrid, Users, Trophy, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const ADMIN_PIN = "2024";

type PlayerRow = {
  id: string;
  username: string;
  display_name: string;
  phone: string | null;
  skill_level: string;
  gender: string | null;
  elo_rating: number;
  matches_played: number;
  created_at: string;
};

type TournamentRow = {
  id: string;
  name: string;
  description: string | null;
  format: string;
  start_date: string;
  end_date: string | null;
  status: string;
  max_participants: number | null;
  participant_count?: number;
};


const AdminPage = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const [tab, setTab] = useState<"bookings" | "players" | "tournaments" | "analytics">("bookings");


  // Bookings tab state
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");

  // Analytics state
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [analyticsRange, setAnalyticsRange] = useState<"week" | "month" | "custom">("month");
  const [customFrom, setCustomFrom] = useState(format(subDays(new Date(), 30), "yyyy-MM-dd"));
  const [customTo, setCustomTo] = useState(format(new Date(), "yyyy-MM-dd"));

  // Export state
  const [exportFrom, setExportFrom] = useState(format(subDays(new Date(), 30), "yyyy-MM-dd"));
  const [exportTo, setExportTo] = useState(format(new Date(), "yyyy-MM-dd"));

  // Players tab
  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [playerSearch, setPlayerSearch] = useState("");

  // Tournaments tab
  const [tournaments, setTournaments] = useState<TournamentRow[]>([]);
  const [tForm, setTForm] = useState({
    name: "",
    description: "",
    format: "ladder",
    start_date: format(new Date(), "yyyy-MM-dd"),
    end_date: "",
    max_participants: 32,
  });
  const [creatingT, setCreatingT] = useState(false);

  // Add booking form
  const [showAddBooking, setShowAddBooking] = useState(false);
  const [nb, setNb] = useState({
    court_number: 1,
    slot_hour: 8,
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    payment_status: "completed" as "pending" | "completed",
  });
  const [addingB, setAddingB] = useState(false);


  const dateStr = format(selectedDate, "yyyy-MM-dd");

  useEffect(() => {
    if (!authenticated) return;
    fetchBookings();
    const channel = supabase
      .channel("admin-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => {
        fetchBookings();
        if (tab === "analytics") fetchAllBookings();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [dateStr, authenticated]);

  useEffect(() => {
    if (authenticated && tab === "analytics") fetchAllBookings();
    if (authenticated && tab === "players") fetchPlayers();
    if (authenticated && tab === "tournaments") fetchTournaments();
  }, [authenticated, tab]);

  async function fetchPlayers() {
    const { data } = await supabase
      .from("profiles")
      .select("id, username, display_name, phone, skill_level, gender, elo_rating, matches_played, created_at")
      .order("created_at", { ascending: false });
    setPlayers((data as PlayerRow[]) || []);
  }

  async function fetchTournaments() {
    const { data: rows } = await supabase
      .from("tournaments")
      .select("*")
      .order("start_date", { ascending: false });
    if (!rows) { setTournaments([]); return; }
    const withCounts = await Promise.all((rows as TournamentRow[]).map(async (t) => {
      const { count } = await supabase
        .from("tournament_participants")
        .select("id", { count: "exact", head: true })
        .eq("tournament_id", t.id);
      return { ...t, participant_count: count || 0 };
    }));
    setTournaments(withCounts);
  }

  async function createTournament() {
    if (!tForm.name || !tForm.start_date) { toast.error("Name and start date required"); return; }
    setCreatingT(true);
    const { error } = await supabase.from("tournaments").insert({
      name: tForm.name,
      description: tForm.description || "",
      format: tForm.format,
      start_date: tForm.start_date,
      end_date: tForm.end_date || null,
      max_participants: Number(tForm.max_participants) || 32,
      status: "upcoming",
    } as any);
    setCreatingT(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Tournament created 🏆");
    setTForm({ ...tForm, name: "", description: "", end_date: "" });
    fetchTournaments();
  }

  async function updateTournamentStatus(id: string, status: string) {
    const { error } = await supabase.from("tournaments").update({ status: status as any }).eq("id", id);
    if (error) { toast.error("Failed"); return; }
    toast.success("Status updated");
    fetchTournaments();
  }

  async function deleteTournament(id: string) {
    if (!confirm("Delete this tournament? Participants will be removed.")) return;
    const { error } = await supabase.from("tournaments").delete().eq("id", id);
    if (error) { toast.error("Failed to delete"); return; }
    toast.success("Tournament deleted");
    fetchTournaments();
  }

  async function addBookingByAdmin() {
    if (!nb.customer_name || !nb.customer_phone) { toast.error("Name and phone required"); return; }
    setAddingB(true);
    const amount = getSlotPrice(nb.slot_hour);
    const { error } = await supabase.from("bookings").insert({
      court_number: nb.court_number,
      booking_date: dateStr,
      slot_hour: nb.slot_hour,
      customer_name: nb.customer_name,
      customer_phone: nb.customer_phone,
      customer_email: nb.customer_email || null,
      amount,
      payment_status: nb.payment_status,
      payment_method: "upi_manual",
      user_id: null,
    } as any);
    setAddingB(false);
    if (error) {
      toast.error(error.code === "23505" ? "Slot already booked" : error.message);
      return;
    }
    toast.success("Booking added ✅");
    setShowAddBooking(false);
    setNb({ ...nb, customer_name: "", customer_phone: "", customer_email: "" });
    fetchBookings();
  }


  async function fetchBookings() {
    const { data } = await supabase
      .from("bookings")
      .select("*")
      .eq("booking_date", dateStr)
      .order("slot_hour", { ascending: true });
    setBookings((data as Booking[]) || []);
  }

  async function fetchAllBookings() {
    const { data } = await supabase
      .from("bookings")
      .select("*")
      .order("booking_date", { ascending: true });
    setAllBookings((data as Booking[]) || []);
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

  async function handleApprove(b: Booking) {
    const { error } = await supabase.from("bookings").update({ payment_status: "completed" }).eq("id", b.id);
    if (error) { toast.error("Failed to approve"); return; }
    toast.success("Booking approved! ✅");

    // Send confirmation email via mailto (opens admin's mail client with pre-filled email)
    if (b.customer_email) {
      const subject = encodeURIComponent(`Booking Confirmed — Paddle Up Manipal (${b.booking_id})`);
      const body = encodeURIComponent(
        `Hi ${b.customer_name},\n\nYour booking is confirmed! 🏓\n\n` +
        `Booking ID: ${b.booking_id}\n` +
        `Court: ${b.court_number}\n` +
        `Date: ${format(parseISO(b.booking_date), "dd MMM yyyy")}\n` +
        `Time: ${formatHour(b.slot_hour)} – ${formatHour(b.slot_hour + 1)}\n` +
        `Amount Paid: ₹${b.amount}\n\n` +
        `See you on the court!\n— Paddle Up Manipal`
      );
      window.open(`mailto:${b.customer_email}?subject=${subject}&body=${body}`, "_blank");
    }
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

  // Court occupancy for the currently selected date
  const occupancyByCourt = useMemo(() => {
    const map: Record<number, number> = {};
    COURTS.forEach(c => {
      const booked = bookings.filter(b => b.court_number === c && b.payment_status === "completed").length;
      map[c] = Math.round((booked / SLOT_HOURS.length) * 100);
    });
    return map;
  }, [bookings]);

  // ===== EXCEL EXPORT =====
  async function handleExport() {
    if (!exportFrom || !exportTo) { toast.error("Pick both dates"); return; }
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .gte("booking_date", exportFrom)
      .lte("booking_date", exportTo)
      .order("booking_date", { ascending: true });
    if (error) { toast.error("Export failed"); return; }
    const rows = (data as Booking[]).map(b => ({
      "Booking ID": b.booking_id,
      "Date": b.booking_date,
      "Court": b.court_number,
      "Time": `${formatHour(b.slot_hour)} – ${formatHour(b.slot_hour + 1)}`,
      "Customer Name": b.customer_name,
      "Phone": b.customer_phone,
      "Email": b.customer_email || "",
      "Amount (₹)": b.amount,
      "Status": b.payment_status,
      "Created At": format(parseISO(b.created_at), "yyyy-MM-dd HH:mm"),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Bookings");
    XLSX.writeFile(wb, `paddleup-bookings-${exportFrom}-to-${exportTo}.xlsx`);
    toast.success(`Exported ${rows.length} bookings ✅`);
  }

  // ===== ANALYTICS COMPUTATIONS =====
  const analytics = useMemo(() => {
    let from: Date, to: Date;
    const now = new Date();
    if (analyticsRange === "week") { from = subDays(now, 7); to = now; }
    else if (analyticsRange === "month") { from = subDays(now, 30); to = now; }
    else { from = parseISO(customFrom); to = parseISO(customTo); }

    const completed = allBookings.filter(b => {
      const d = parseISO(b.booking_date);
      return b.payment_status === "completed" && d >= from && d <= to;
    });

    // Trend: revenue + count per day
    const days = eachDayOfInterval({ start: from, end: to });
    const trend = days.map(d => {
      const key = format(d, "yyyy-MM-dd");
      const dayBookings = completed.filter(b => b.booking_date === key);
      return {
        date: format(d, "dd MMM"),
        revenue: dayBookings.reduce((s, b) => s + b.amount, 0),
        bookings: dayBookings.length,
      };
    });

    // Peak hours
    const hourCounts: Record<number, number> = {};
    SLOT_HOURS.forEach(h => { hourCounts[h] = 0; });
    completed.forEach(b => { hourCounts[b.slot_hour] = (hourCounts[b.slot_hour] || 0) + 1; });
    const peakHours = SLOT_HOURS.map(h => ({ hour: formatHour(h), count: hourCounts[h] || 0 }));

    // Frequent customers
    const custMap: Record<string, { name: string; phone: string; count: number; revenue: number }> = {};
    completed.forEach(b => {
      const key = b.customer_phone;
      if (!custMap[key]) custMap[key] = { name: b.customer_name, phone: b.customer_phone, count: 0, revenue: 0 };
      custMap[key].count++;
      custMap[key].revenue += b.amount;
    });
    const frequentCustomers = Object.values(custMap).sort((a, b) => b.count - a.count).slice(0, 10);

    // Averages
    const dayCount = Math.max(1, differenceInDays(to, from) + 1);
    const totalRev = completed.reduce((s, b) => s + b.amount, 0);
    const avgPerDay = completed.length / dayCount;

    return { trend, peakHours, frequentCustomers, totalRev, totalCount: completed.length, avgPerDay, dayCount };
  }, [allBookings, analyticsRange, customFrom, customTo]);

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-card border rounded-2xl p-6 w-full max-w-xs space-y-4 animate-fade-in">
          <div className="text-center space-y-1">
            <h1 className="font-heading text-xl font-bold text-gradient-brand">🔐 Admin Access</h1>
            <p className="text-xs text-muted-foreground">Enter your admin PIN</p>
          </div>
          <Input type="password" placeholder="Enter PIN" value={pin} onChange={(e) => setPin(e.target.value)} className="text-center text-2xl tracking-widest" maxLength={10} />
          <Button type="submit" className="w-full">Login</Button>
          <Link to="/" className="block text-center text-xs text-muted-foreground hover:underline">← Back to Home</Link>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b">
        <div className="container flex items-center h-14 gap-3 justify-between">
          <h1 className="font-heading text-lg font-bold text-gradient-brand">📊 Admin Dashboard</h1>
          <Button variant="ghost" size="icon" onClick={() => setAuthenticated(false)}><LogOut className="h-4 w-4" /></Button>
        </div>
        <div className="container flex gap-1 pb-2">
          <Button variant={tab === "bookings" ? "default" : "ghost"} size="sm" onClick={() => setTab("bookings")} className="gap-1.5">
            <LayoutGrid className="h-3.5 w-3.5" /> Bookings
          </Button>
          <Button variant={tab === "analytics" ? "default" : "ghost"} size="sm" onClick={() => setTab("analytics")} className="gap-1.5">
            <BarChart3 className="h-3.5 w-3.5" /> Analytics
          </Button>
        </div>
      </header>

      {tab === "bookings" && (
        <div className="container py-4 space-y-4 max-w-2xl mx-auto">
          {/* Date nav */}
          <div className="flex items-center justify-between">
            <Button variant="outline" size="icon" onClick={() => setSelectedDate(d => subDays(d, 1))}><ChevronLeft className="h-4 w-4" /></Button>
            <div className="text-center">
              <p className="font-heading font-bold text-lg">{format(selectedDate, "dd MMM yyyy")}</p>
              <p className="text-xs text-muted-foreground">{format(selectedDate, "EEEE")}</p>
            </div>
            <Button variant="outline" size="icon" onClick={() => setSelectedDate(d => addDays(d, 1))}><ChevronRight className="h-4 w-4" /></Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card border rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-primary">{totalBookings}</p>
              <p className="text-xs text-muted-foreground">Confirmed Bookings</p>
            </div>
            <div className="bg-card border rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-offpeak">₹{totalRevenue}</p>
              <p className="text-xs text-muted-foreground">Revenue</p>
            </div>
          </div>

          {/* Court occupancy */}
          <div className="grid grid-cols-3 gap-2">
            {COURTS.map(c => (
              <div key={c} className="bg-card border rounded-xl p-3 text-center">
                <p className="text-xs text-muted-foreground">Court {c}</p>
                <p className="text-lg font-bold text-accent">{occupancyByCourt[c]}%</p>
                <p className="text-[10px] text-muted-foreground">occupied</p>
              </div>
            ))}
          </div>

          {/* Search + view */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search name, phone, booking ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
            </div>
            <Button variant={view === "grid" ? "default" : "outline"} size="sm" onClick={() => setView("grid")}>Grid</Button>
            <Button variant={view === "list" ? "default" : "outline"} size="sm" onClick={() => setView("list")}>List</Button>
          </div>

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
                      <div key={court} className={`py-2 px-2 rounded-lg text-[10px] leading-tight ${b ? "bg-primary/10 border border-primary/30" : "bg-muted/30 border border-transparent"}`}>
                        {b ? (
                          <div>
                            <p className="font-semibold text-foreground truncate">{b.customer_name}</p>
                            <p className="text-muted-foreground">{b.customer_phone}</p>
                          </div>
                        ) : (<p className="text-muted-foreground text-center">—</p>)}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}

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
                        {b.customer_email && <p className="text-[10px] text-muted-foreground">{b.customer_email}</p>}
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        b.payment_status === "completed" ? "bg-offpeak/10 text-offpeak" :
                        b.payment_status === "pending" ? "bg-peak/10 text-peak" :
                        "bg-muted text-muted-foreground"
                      }`}>{b.payment_status}</span>
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>Court {b.court_number}</span>
                      <span>{formatHour(b.slot_hour)} – {formatHour(b.slot_hour + 1)}</span>
                      <span className="font-semibold text-foreground">₹{b.amount}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground font-mono">{b.booking_id}</p>
                    {b.payment_status === "pending" && (
                      <div className="flex gap-2 pt-1">
                        <Button size="sm" className="flex-1 text-xs" onClick={() => handleApprove(b)}>✅ Approve</Button>
                        <Button size="sm" variant="destructive" className="flex-1 text-xs" onClick={() => handleCancel(b.id)}>❌ Cancel</Button>
                      </div>
                    )}
                    {b.payment_status === "completed" && (
                      <div className="pt-1">
                        <Button size="sm" variant="destructive" className="w-full text-xs" onClick={() => handleCancel(b.id)}>❌ Cancel Booking</Button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {tab === "analytics" && (
        <div className="container py-4 space-y-5 max-w-3xl mx-auto">
          {/* Export */}
          <div className="bg-card border rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4 text-primary" />
              <p className="font-semibold text-sm">Export Bookings to Excel</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground">From</label>
                <Input type="date" value={exportFrom} onChange={e => setExportFrom(e.target.value)} className="h-9 text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground">To</label>
                <Input type="date" value={exportTo} onChange={e => setExportTo(e.target.value)} className="h-9 text-xs" />
              </div>
            </div>
            <Button onClick={handleExport} className="w-full gap-2" size="sm"><Download className="h-4 w-4" /> Download Excel</Button>
          </div>

          {/* Range selector */}
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" variant={analyticsRange === "week" ? "default" : "outline"} onClick={() => setAnalyticsRange("week")}>Last 7 days</Button>
            <Button size="sm" variant={analyticsRange === "month" ? "default" : "outline"} onClick={() => setAnalyticsRange("month")}>Last 30 days</Button>
            <Button size="sm" variant={analyticsRange === "custom" ? "default" : "outline"} onClick={() => setAnalyticsRange("custom")}>Custom</Button>
          </div>
          {analyticsRange === "custom" && (
            <div className="grid grid-cols-2 gap-2">
              <Input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)} className="h-9 text-xs" />
              <Input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)} className="h-9 text-xs" />
            </div>
          )}

          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-card border rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-primary">₹{analytics.totalRev}</p>
              <p className="text-[10px] text-muted-foreground">Revenue</p>
            </div>
            <div className="bg-card border rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-accent">{analytics.totalCount}</p>
              <p className="text-[10px] text-muted-foreground">Bookings</p>
            </div>
            <div className="bg-card border rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-offpeak">{analytics.avgPerDay.toFixed(1)}</p>
              <p className="text-[10px] text-muted-foreground">Avg / day</p>
            </div>
          </div>

          {/* Revenue trend */}
          <div className="bg-card border rounded-xl p-4">
            <p className="font-semibold text-sm mb-3">💰 Revenue Trend</p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={analytics.trend}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Bookings trend */}
          <div className="bg-card border rounded-xl p-4">
            <p className="font-semibold text-sm mb-3">📅 Bookings Trend</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={analytics.trend}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="bookings" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Peak hours */}
          <div className="bg-card border rounded-xl p-4">
            <p className="font-semibold text-sm mb-3">⏰ Peak Hours</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={analytics.peakHours}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="hour" tick={{ fontSize: 9 }} angle={-45} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--peak))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Frequent customers */}
          <div className="bg-card border rounded-xl p-4">
            <p className="font-semibold text-sm mb-3">🏆 Frequent Customers (Top 10)</p>
            {analytics.frequentCustomers.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No data yet</p>
            ) : (
              <div className="space-y-2">
                {analytics.frequentCustomers.map((c, i) => (
                  <div key={c.phone} className="flex items-center justify-between border-b last:border-b-0 pb-2 last:pb-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-bold text-muted-foreground w-5">#{i + 1}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold truncate">{c.name}</p>
                        <p className="text-[10px] text-muted-foreground">{c.phone}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-primary">{c.count} bookings</p>
                      <p className="text-[10px] text-muted-foreground">₹{c.revenue}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
