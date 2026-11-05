import apiRequest from "./apiservices";
import { Payment } from "../types/payment";

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

  // Go through the server-side proxy to avoid mixed-content issues
  // and to keep a consistent timeout/error path with other requests.
  return apiRequest<PaymentResponse>(
    "/payments",
    {
      method: "POST",
      body: formData,
    },
    token
  );
};