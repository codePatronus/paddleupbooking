import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase, formatHour, type Booking } from "@/lib/supabase";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { CheckCircle, Copy, Home, Download } from "lucide-react";
import { toast } from "sonner";
import { downloadBookingPdf } from "@/lib/bookingPdf";

const ConfirmationPage = () => {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", id)
        .single();
      setBooking(data as Booking | null);
      setLoading(false);
    }
    fetch();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse-soft text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
        <p className="text-muted-foreground">Booking not found</p>
        <Link to="/"><Button>Go Home</Button></Link>
      </div>
    );
  }

  function copyBookingId() {
    navigator.clipboard.writeText(booking!.booking_id);
    toast.success("Booking ID copied!");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-sm w-full animate-fade-in space-y-6 text-center">
        {/* Success icon */}
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-full bg-offpeak/10 flex items-center justify-center">
            <CheckCircle className="h-12 w-12 text-offpeak" />
          </div>
        </div>

        <div className="space-y-1">
          <h1 className="font-heading text-2xl font-bold text-foreground">
            {booking.payment_status === "completed" ? "Booking Confirmed!" : "Booking Submitted!"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {booking.payment_status === "completed" 
              ? "Your court is reserved. See you there! 🏓" 
              : "Awaiting admin approval. You'll be confirmed once payment is verified. ⏳"}
          </p>
          {booking.payment_status === "pending" && (
            <div className="mt-2 inline-flex items-center gap-1.5 bg-peak/10 text-peak rounded-full px-3 py-1 text-xs font-semibold">
              ⏳ Pending Approval
            </div>
          )}
        </div>

        {/* Booking card */}
        <div className="bg-card border-2 border-primary/20 rounded-2xl p-5 space-y-4 text-left">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Booking ID</span>
            <button onClick={copyBookingId} className="flex items-center gap-1.5 text-sm font-mono font-bold text-primary">
              {booking.booking_id}
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="border-t" />

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Date</p>
              <p className="font-semibold">{format(new Date(booking.booking_date), "dd MMM yyyy")}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Court</p>
              <p className="font-semibold">Court {booking.court_number}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Time</p>
              <p className="font-semibold">{formatHour(booking.slot_hour)} – {formatHour(booking.slot_hour + 1)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Amount Paid</p>
              <p className="font-bold text-primary">₹{booking.amount}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-muted-foreground">Name</p>
              <p className="font-semibold">{booking.customer_name}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-muted-foreground">Phone</p>
              <p className="font-semibold">{booking.customer_phone}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Link to={`/chat/${booking.id}`}>
            <Button className="w-full" size="lg">Open Chat Room 💬</Button>
          </Link>
          <Button variant="outline" className="w-full gap-2" onClick={() => downloadBookingPdf(booking)}>
            <Download className="h-4 w-4" /> Download Receipt PDF
          </Button>
          <Link to="/book">
            <Button variant="outline" className="w-full">Book Another Slot</Button>
          </Link>
          <Link to="/">
            <Button variant="ghost" className="w-full gap-2">
              <Home className="h-4 w-4" /> Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage;
