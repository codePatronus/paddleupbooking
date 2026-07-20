import jsPDF from "jspdf";
import { format } from "date-fns";
import { formatHour } from "@/lib/supabase";

type BookingLike = {
  booking_id: string;
  booking_date: string;
  slot_hour: number;
  court_number: number;
  customer_name: string;
  customer_phone?: string | null;
  amount: number;
  payment_status: string;
};

export function downloadBookingPdf(b: BookingLike) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const w = doc.internal.pageSize.getWidth();

  // Header band
  doc.setFillColor(234, 88, 12); // orange
  doc.rect(0, 0, w, 70, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("Paddle Up Manipal", 40, 34);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("Booking Receipt", 40, 54);

  // Body
  doc.setTextColor(20, 20, 20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Booking Details", 40, 110);

  const status =
    b.payment_status === "completed"
      ? "Approved"
      : b.payment_status === "cancelled"
      ? "Cancelled"
      : "Pending";

  const rows: [string, string][] = [
    ["Booking ID", b.booking_id],
    ["Status", status],
    ["Customer", b.customer_name],
    ["Phone", b.customer_phone || "-"],
    ["Date", format(new Date(b.booking_date), "dd MMM yyyy (EEEE)")],
    ["Time", `${formatHour(b.slot_hour)} - ${formatHour(b.slot_hour + 1)}`],
    ["Court", `Court ${b.court_number}`],
    ["Amount", `Rs. ${b.amount}`],
    ["Payment Method", "UPI - krishg2026-3@okhdfcbank"],
  ];

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  let y = 140;
  rows.forEach(([k, v]) => {
    doc.setTextColor(120, 120, 120);
    doc.text(k, 40, y);
    doc.setTextColor(20, 20, 20);
    doc.setFont("helvetica", "bold");
    doc.text(String(v), 200, y);
    doc.setFont("helvetica", "normal");
    y += 24;
  });

  // Footer
  y += 20;
  doc.setDrawColor(230, 230, 230);
  doc.line(40, y, w - 40, y);
  y += 24;
  doc.setTextColor(120, 120, 120);
  doc.setFontSize(10);
  doc.text("Please arrive 5 minutes before your slot. Bring this receipt for reference.", 40, y);
  y += 16;
  doc.text("Contact: @paddleup.manipal on Instagram", 40, y);

  doc.save(`PaddleUp-${b.booking_id}.pdf`);
}
