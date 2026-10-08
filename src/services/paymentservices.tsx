import { Payment } from "../types/payment";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL

export interface UploadPaymentData {
  amount: number;
  payment_method: string;
  transaction_reference?: string;
  screenshot: File;
}

interface PaymentResponse {
  success: boolean;
  message: string;
  payment: Payment;
}

export const uploadPayment = async (
  data: UploadPaymentData,
  token: string
): Promise<PaymentResponse> => {
  const formData = new FormData();

  formData.append("amount", String(data.amount));
  formData.append("payment_method", data.payment_method);

  if (data.transaction_reference) {
    formData.append(
      "transaction_reference",
      data.transaction_reference
    );
  }

  formData.append("payment_proof", data.screenshot);

  const response = await fetch(
    `${API_URL}/payments`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Payment upload failed"
    );
  }

  return result;
};