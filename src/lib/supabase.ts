export { supabase } from '@/integrations/supabase/client';

export type Booking = {
  id: string;
  booking_id: string;
  court_number: number;
  booking_date: string;
  slot_hour: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  amount: number;
  payment_status: 'pending' | 'completed' | 'cancelled';
  payment_method: 'upi_manual' | 'paddle';
  paddle_transaction_id: string | null;
  created_at: string;
  updated_at: string;
};

export const COURTS = [1, 2, 3] as const;
export const SLOT_HOURS = Array.from({ length: 14 }, (_, i) => i + 8); // 8 to 21

export function getSlotPrice(hour: number): number {
  return hour >= 16 ? 800 : 600;
}

export function formatHour(hour: number): string {
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour;
  return `${displayHour}:00 ${suffix}`;
}

export function isPeakHour(hour: number): boolean {
  return hour >= 16;
}
