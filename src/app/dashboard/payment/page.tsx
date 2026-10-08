"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";
import { getMyRegistration } from "../../../services/registrationservices";
import { uploadPayment } from "../../../services/paymentservices";

import type { Registration } from "../../../services/registrationservices";

export default function PaymentPage() {
  const router = useRouter();

  const [registration, setRegistration] =
    useState<Registration | null>(null);

  const [paymentMethod, setPaymentMethod] =
    useState("");

  const [transactionReference, setTransactionReference] =
    useState("");

  const [screenshot, setScreenshot] =
    useState<File | null>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadRegistration = async () => {
      const token = getToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const data = await getMyRegistration(token);
        setRegistration(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load registration"
        );
      } finally {
        setLoading(false);
      }
    };

    loadRegistration();
  }, [router]);

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "Only JPG, JPEG, PNG, and WebP images are allowed."
      );
      setScreenshot(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Screenshot must be less than 5MB.");
      setScreenshot(null);
      return;
    }

    setError("");
    setScreenshot(file);
  };

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const token = getToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    if (!registration) {
      setError("Registration not found.");
      return;
    }

    if (!paymentMethod) {
      setError("Please select a payment method.");
      return;
    }

    if (!screenshot) {
      setError("Please upload your payment screenshot.");
      return;
    }

    try {
      setSubmitting(true);

      await uploadPayment(
        {
          amount: Number(registration.program.fee),
          payment_method: paymentMethod,
          transaction_reference:
            transactionReference || undefined,
          screenshot,
        },
        token
      );

      setSuccess(
        "Payment submitted successfully. Please wait for admin approval."
      );

      setTimeout(() => {
        router.push("/dashboard/pending");
      }, 1500);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Payment upload failed."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f8fafc]">
        <div className="flex min-h-screen items-center justify-center px-4">
        <p className="text-slate-600">
          Loading registration...
        </p>
        </div>
      </main>
    );
  }

  if (!registration) {
    return (
      <main className="min-h-screen bg-[#f8fafc]">
      <div className="px-4 py-10">
        <div className="mx-auto max-w-xl rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">
            No Registration Found
          </h1>

          <p className="mt-3 text-slate-600">
            You need to select a program before making
            a payment.
          </p>

          <button
            onClick={() =>
              router.push("/dashboard/programs")
            }
            className="mt-6 rounded-xl bg-blue-400 px-6 py-3 font-semibold text-white hover:bg-green-900/60"
          >
            Select Program
          </button>
        </div>
        </div>
      </main>
    );
  }

  if (registration.status === "REGISTERED") {
    return (
      <main className="min-h-screen bg-[#f8fafc]">
      <div className="px-4 py-10">
        <div className="mx-auto max-w-xl rounded-2xl bg-white p-8 shadow-sm">
          <div className="mb-4 text-4xl">✓</div>

          <h1 className="text-2xl font-bold text-slate-900">
            Registration Already Approved
          </h1>

          <p className="mt-3 text-slate-600">
            Your payment has already been approved and
            your registration is complete.
          </p>

          <button
            onClick={() => router.push("/dashboard/pending")}
            className="mt-6 rounded-xl bg-blue-400 px-6 py-3 font-semibold text-white hover:bg-green-900/60"
          >
            Check Status
          </button>
        </div>
        </div>
      </main>
    );
  }

  if (
    registration.status === "PAYMENT_PENDING" &&
    registration.payment?.status === "PENDING"
  ) {
    return (
      <main className="min-h-screen bg-[#f8fafc]">
      <div className="px-4 py-10">
        <div className="mx-auto max-w-xl rounded-2xl bg-white p-8 shadow-sm">
          <div className="mb-4 text-4xl">⏳</div>

          <h1 className="text-2xl font-bold text-slate-900">
            Payment Under Review
          </h1>

          <p className="mt-3 text-slate-600">
            Your payment has been submitted successfully.
            Please wait while an administrator reviews it.
          </p>

          <button
            onClick={() => router.push("/dashboard/pending")}
            className="mt-6 rounded-xl bg-blue-400 px-6 py-3 font-semibold text-white hover:bg-green-900/60"
          >
            Check Status
          </button>
        </div>
        </div>
      </main>
    );
  }

  const isRejected =
    registration.status === "PAYMENT_REJECTED";

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <div className="px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <button
            onClick={() => router.push("/dashboard/pending")}
            className="text-sm font-medium text-blue-400 hover:text-green-900/60"
          >
            ← Back
          </button>

          <h1 className="mt-4 text-3xl font-bold text-slate-900">
            Submit Payment
          </h1>

          <p className="mt-2 text-slate-600">
            Upload your payment information for registration.
          </p>
        </div>

        {isRejected &&
          registration.payment?.rejection_reason && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="font-semibold text-red-700">
                Previous Payment Rejected
              </p>

              <p className="mt-1 text-sm text-red-600">
                {registration.payment.rejection_reason}
              </p>

              <p className="mt-2 text-sm text-red-600">
                Please correct the problem and submit
                your payment again.
              </p>
            </div>
          )}

        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
          <div className="mb-6 rounded-xl bg-blue-400/5 p-5">
            <h2 className="text-lg font-bold text-slate-900">
              Registration Information
            </h2>

            <div className="mt-4 space-y-3">
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">
                  Registration Number
                </span>

                <span className="font-semibold text-slate-900">
                  {registration.registration_number}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-slate-500">
                  Program
                </span>

                <span className="font-semibold text-slate-900">
                  {registration.program.name}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-slate-500">
                  Program Monthly_Fee
                </span>

                <span className="font-bold text-blue-400">
                  {Number(
                    registration.program.fee
                  ).toLocaleString()}{" "}
                  ETB
                </span>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
              {success}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Payment Amount
              </label>

              <input
                type="text"
                value={`${Number(
                  registration.program.fee
                ).toLocaleString()} ETB`}
                disabled
                className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-700"
              />

              <p className="mt-1 text-xs text-slate-500">
                Payment amount is automatically taken from
                your selected program.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Payment Method
              </label>

              <select
                value={paymentMethod}
                onChange={(e) =>
                  setPaymentMethod(e.target.value)
                }
                className="w-full rounded-xl text-black border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
              >
                <option value="">
                  Select payment method
                </option>

                <option value="Telebirr">
                  Telebirr
                </option>

                <option value="CBE Birr">
                  CBE Birr
                </option>

                <option value="Bank Transfer">
                  Bank Transfer
                </option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-black">
                Transaction Reference
                <span className="ml-1 font-normal text-gray-400">
                  (Optional)
                </span>
              </label>

              <input
                type="text"
                value={transactionReference}
                onChange={(e) =>
                  setTransactionReference(
                    e.target.value
                  )
                }
                placeholder="Enter transaction/reference number"
                className="w-full rounded-xl text-black border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Payment Screenshot
              </label>

              <div className="rounded-xl border-2 border-dashed border-slate-200 p-6 text-center hover:border-blue-400">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="w-full text-sm text-slate-600"
                />

                <p className="mt-2 text-xs text-slate-500">
                  JPG, JPEG, PNG or WebP • Maximum 5MB
                </p>

                {screenshot && (
                  <p className="mt-3 text-sm font-medium text-green-600">
                    Selected: {screenshot.name}
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-blue-400 px-6 py-3.5 font-bold text-white transition hover:bg-green-900/60 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? "Uploading Payment..."
                : "Submit Payment"}
            </button>
          </form>
        </div>
      </div>
      </div>
    </main>
  );
}