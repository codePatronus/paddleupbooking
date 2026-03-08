import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { format, addDays } from "date-fns";
import { supabase, COURTS, SLOT_HOURS, getSlotPrice, formatHour, isPeakHour, type Booking } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

const BookingPage = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<{ court: number; hour: number } | null>(null);
  const [formData, setFormData] = useState({ name: "", phone: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"select" | "details" | "pay">("select");

  const dateStr = format(selectedDate, "yyyy-MM-dd");

  useEffect(() => {
    fetchBookings();
    // Real-time subscription
    const channel = supabase
      .channel("bookings-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => {
        fetchBookings();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [dateStr]);

  async function fetchBookings() {
    const { data } = await supabase
      .from("bookings")
      .select("*")
      .eq("booking_date", dateStr)
      .neq("payment_status", "cancelled");
    setBookings((data as Booking[]) || []);
  }

  function isSlotBooked(court: number, hour: number) {
    return bookings.some(b => b.court_number === court && b.slot_hour === hour);
  }

  function handleSlotClick(court: number, hour: number) {
    if (isSlotBooked(court, hour)) return;
    setSelectedSlot({ court, hour });
    setStep("details");
  }

  async function handleSubmitDetails(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      toast.error("Please fill in name and phone number");
      return;
    }
    if (!/^[6-9]\d{9}$/.test(formData.phone.trim())) {
      toast.error("Please enter a valid 10-digit Indian phone number");
      return;
    }
    setStep("pay");
  }

  async function handlePaymentDone() {
    if (!selectedSlot) return;
    setLoading(true);
    const amount = getSlotPrice(selectedSlot.hour);

    const { data, error } = await supabase
      .from("bookings")
      .insert({
        court_number: selectedSlot.court,
        booking_date: dateStr,
        slot_hour: selectedSlot.hour,
        customer_name: formData.name.trim(),
        customer_phone: formData.phone.trim(),
        customer_email: formData.email.trim() || null,
        amount,
        payment_status: "completed",
      })
      .select()
      .single();

    setLoading(false);

    if (error) {
      if (error.code === "23505") {
        toast.error("This slot was just booked by someone else!");
        fetchBookings();
        setStep("select");
        setSelectedSlot(null);
      } else {
        toast.error("Booking failed. Please try again.");
      }
      return;
    }

    navigate(`/booking/${(data as Booking).id}`);
  }

  const price = selectedSlot ? getSlotPrice(selectedSlot.hour) : 0;
  const upiId = "paddleupmanipal@upi"; // Owner's UPI ID
  const upiLink = selectedSlot
    ? `upi://pay?pa=${upiId}&pn=Paddle%20Up%20Manipal&am=${price}&cu=INR&tn=Court${selectedSlot.court}-${formatHour(selectedSlot.hour)}-${dateStr}`
    : "";

  // Date navigation (today + 6 days)
  const dates = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b">
        <div className="container flex items-center h-14 gap-3">
          <Link to="/">
            <Button variant="ghost" size="icon" className="shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="font-heading text-lg font-bold text-gradient-brand">Book a Court</h1>
        </div>
      </header>

      {step === "select" && (
        <div className="flex-1 container py-4 space-y-4 max-w-lg mx-auto">
          {/* Date selector */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
            {dates.map((d) => {
              const isSelected = format(d, "yyyy-MM-dd") === dateStr;
              return (
                <button
                  key={format(d, "yyyy-MM-dd")}
                  onClick={() => setSelectedDate(d)}
                  className={`flex flex-col items-center min-w-[60px] px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-card border text-foreground hover:bg-secondary"
                  }`}
                >
                  <span className="text-[10px] uppercase opacity-80">{format(d, "EEE")}</span>
                  <span className="text-lg font-bold">{format(d, "d")}</span>
                  <span className="text-[10px] opacity-70">{format(d, "MMM")}</span>
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex gap-3 text-xs flex-wrap">
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-offpeak/20 border border-offpeak" /> Off-Peak ₹600</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-peak/20 border border-peak" /> Peak ₹800</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-booked" /> Booked</span>
          </div>

          {/* Slot grid */}
          <div className="space-y-1">
            {/* Court headers */}
            <div className="grid grid-cols-[70px_1fr_1fr_1fr] gap-1.5 text-center text-xs font-semibold text-muted-foreground">
              <div />
              {COURTS.map((c) => (
                <div key={c} className="py-1.5 rounded-lg bg-accent/10 text-accent">
                  Court {c}
                </div>
              ))}
            </div>

            {/* Time rows */}
            {SLOT_HOURS.map((hour) => (
              <div key={hour} className="grid grid-cols-[70px_1fr_1fr_1fr] gap-1.5">
                <div className="flex items-center text-xs font-medium text-muted-foreground">
                  {formatHour(hour)}
                </div>
                {COURTS.map((court) => {
                  const booked = isSlotBooked(court, hour);
                  const peak = isPeakHour(hour);
                  return (
                    <button
                      key={court}
                      disabled={booked}
                      onClick={() => handleSlotClick(court, hour)}
                      className={`py-3 rounded-lg text-xs font-semibold transition-all ${
                        booked
                          ? "bg-booked/30 text-booked cursor-not-allowed line-through"
                          : peak
                          ? "bg-peak/10 text-peak border border-peak/30 hover:bg-peak/20 active:scale-95"
                          : "bg-offpeak/10 text-offpeak border border-offpeak/30 hover:bg-offpeak/20 active:scale-95"
                      }`}
                    >
                      {booked ? "Booked" : `₹${getSlotPrice(hour)}`}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {step === "details" && selectedSlot && (
        <div className="flex-1 container py-6 max-w-md mx-auto animate-fade-in">
          <div className="bg-card border rounded-2xl p-5 space-y-5">
            {/* Booking summary */}
            <div className="bg-secondary/50 rounded-xl p-4 space-y-2">
              <p className="font-heading font-bold text-foreground">Booking Summary</p>
              <div className="grid grid-cols-2 gap-1 text-sm">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">{format(selectedDate, "dd MMM yyyy")}</span>
                <span className="text-muted-foreground">Court</span>
                <span className="font-medium">Court {selectedSlot.court}</span>
                <span className="text-muted-foreground">Time</span>
                <span className="font-medium">{formatHour(selectedSlot.hour)} – {formatHour(selectedSlot.hour + 1)}</span>
                <span className="text-muted-foreground">Amount</span>
                <span className="font-bold text-primary">₹{price}</span>
              </div>
            </div>

            <form onSubmit={handleSubmitDetails} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input id="name" placeholder="Your name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input id="phone" type="tel" placeholder="10-digit phone number" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email (optional)</Label>
                <Input id="email" type="email" placeholder="your@email.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => { setStep("select"); setSelectedSlot(null); }} className="flex-1">
                  Back
                </Button>
                <Button type="submit" className="flex-1">
                  Proceed to Pay ₹{price}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {step === "pay" && selectedSlot && (
        <div className="flex-1 container py-6 max-w-md mx-auto animate-fade-in">
          <div className="bg-card border rounded-2xl p-5 space-y-5 text-center">
            <div className="space-y-2">
              <p className="font-heading text-2xl font-bold text-foreground">Pay ₹{price}</p>
              <p className="text-sm text-muted-foreground">
                Court {selectedSlot.court} • {formatHour(selectedSlot.hour)} – {formatHour(selectedSlot.hour + 1)} • {format(selectedDate, "dd MMM")}
              </p>
            </div>

            <a
              href={upiLink}
              className="inline-flex items-center justify-center w-full rounded-xl bg-primary text-primary-foreground py-4 px-6 text-lg font-bold shadow-lg active:scale-95 transition-transform"
            >
              Pay via UPI App 💳
            </a>

            <p className="text-xs text-muted-foreground">
              UPI ID: <span className="font-mono font-semibold text-foreground">{upiId}</span>
            </p>

            <div className="border-t pt-4 space-y-3">
              <p className="text-sm text-muted-foreground">After payment, tap below to confirm your booking:</p>
              <Button onClick={handlePaymentDone} disabled={loading} className="w-full py-5 text-base" size="lg">
                {loading ? "Confirming..." : "✅ I've Paid — Confirm Booking"}
              </Button>
            </div>

            <Button variant="ghost" size="sm" onClick={() => setStep("details")} className="text-muted-foreground">
              ← Go Back
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingPage;
