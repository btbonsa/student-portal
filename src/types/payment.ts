export interface Payment {
  id: number;
  registration_id: number;
  amount: number;
  payment_method: string;
  transaction_reference: string | null;
  screenshot_url: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejection_reason: string | null;
  payment_date: string;
  reviewed_at: string | null;
}