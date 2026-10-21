"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";
import { getMyRegistration } from "../../../services/registrationservices";
import { uploadPayment } from "../../../services/paymentservices";
import type { Registration } from "../../../services/registrationservices";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  UploadCloud,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  CreditCard,
  Loader2,
  Image as ImageIcon,
  X,
} from "lucide-react";

export default function PaymentPage() {
  const router = useRouter();

  const [registration, setRegistration] = useState<Registration | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [transactionReference, setTransactionReference] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);

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
          err instanceof Error ? err.message : "Failed to load registration"
        );
      } finally {
        setLoading(false);
      }
    };

    loadRegistration();
  }, [router]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Only JPG, JPEG, PNG, and WebP image formats are supported.");
      setScreenshot(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Payment receipt image size must be less than 5MB.");
      setScreenshot(null);
      return;
    }

    setError("");
    setScreenshot(file);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const token = getToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    if (!registration) {
      setError("No registration found. Please select a program first.");
      return;
    }

    if (!paymentMethod) {
      setError("Please select a payment method.");
      return;
    }

    if (!screenshot) {
      setError("Please upload your payment transfer receipt image.");
      return;
    }

    try {
      setSubmitting(true);

      // Upload payment - backend will handle status update from DRAFT to PENDING
      await uploadPayment(
        {
          amount: Number(registration.program.fee),
          payment_method: paymentMethod,
          transaction_reference: transactionReference.trim() || undefined,
          screenshot,
        },
        token
      );

      setSuccess("Payment receipt uploaded successfully! Waiting for admin clearance.");

      setTimeout(() => {
        router.push("/dashboard/pending");
      }, 1500);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Payment upload failed."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
        <div className="w-full max-w-xl space-y-4">
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </main>
    );
  }

  if (!registration) {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
        <Card className="w-full max-w-md border-border/60 shadow-lg text-center p-6 space-y-4 rounded-3xl">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <FileText className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl font-bold">No Registration Found</CardTitle>
          <CardDescription className="text-sm">
            You must select an academic certificate program before submitting payment.
          </CardDescription>
          <Button
            onClick={() => router.push("/dashboard/programs")}
            className="w-full bg-blue-400 hover:bg-blue-500 font-bold text-white shadow-sm rounded-xl"
          >
            Select Program
          </Button>
        </Card>
      </main>
    );
  }

  if (registration.status === "REGISTERED") {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
        <Card className="w-full max-w-md border-border/60 shadow-lg text-center p-6 space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <CardTitle className="text-xl font-bold">Registration Approved</CardTitle>
          <CardDescription className="text-sm">
            Your payment has been verified and your registration status is active.
          </CardDescription>
          <Button
            onClick={() => router.push("/dashboard")}
            className="w-full bg-blue-400 hover:bg-blue-500 font-bold text-white shadow-sm"
          >
            Go to Dashboard
          </Button>
        </Card>
      </main>
    );
  }

  if (
    registration.status === "PAYMENT_PENDING" &&
    registration.payment?.status === "PENDING"
  ) {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
        <Card className="w-full max-w-md border-border/60 shadow-lg text-center p-6 space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-400/10 text-blue-400">
            <Clock className="h-8 w-8" />
          </div>
          <CardTitle className="text-xl font-bold">Payment Under Review</CardTitle>
          <CardDescription className="text-sm leading-relaxed">
            Your transfer receipt is currently being verified by an administrator.
          </CardDescription>
          <Button
            onClick={() => router.push("/dashboard/pending")}
            className="w-full bg-blue-400 hover:bg-blue-500 font-bold text-white shadow-sm"
          >
            Check Status
          </Button>
        </Card>
      </main>
    );
  }

  const isRejected = registration.status === "PAYMENT_REJECTED";

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-blue-400 selection:text-white">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:py-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

        {/* Navigation & Header */}
        <div className="space-y-3">
          <button
            onClick={() => router.push("/dashboard/pending")}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground font-medium transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
            Back to Dashboard
          </button>

          <div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              Submit Payment
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              Upload your payment receipt and transaction details for verification.
            </p>
          </div>
        </div>

        {/* Rejection Notice Banner */}
        {isRejected && registration.payment?.rejection_reason && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900/50 dark:bg-rose-950/30 text-sm space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <p className="font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4" /> Previous Payment Rejected
            </p>
            <p className="text-rose-600 dark:text-rose-300">
              {registration.payment.rejection_reason}
            </p>
            <p className="text-xs text-rose-500 dark:text-rose-400 pt-1">
              Please correct the issue and upload a valid transfer receipt.
            </p>
          </div>
        )}

        {/* Form Card */}
        <Card className="border-border/60 shadow-2xl shadow-blue-400/10 rounded-3xl overflow-hidden">
          <CardContent className="p-6 sm:p-8 space-y-6">

            {/* Registration Summary Box */}
            <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Registration Summary
                </h2>
                <Badge className="bg-blue-400 text-white font-medium border-0 shadow-sm">
                  {registration.registration_number}
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">Selected Program</p>
                  <p className="font-bold text-base text-slate-900 dark:text-slate-100">
                    {registration.program.name}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">Program Fee</p>
                  <p className="font-black text-2xl text-emerald-600 dark:text-emerald-400">
                    {Number(registration.program.fee).toLocaleString()} ETB
                  </p>
                </div>
              </div>
            </div>

            {/* Error and Success Banners */}
            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-400 animate-in fade-in slide-in-from-top-2 duration-300">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-400 animate-in fade-in slide-in-from-top-2 duration-300">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Payment Amount Display */}
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Required Fee Amount
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-400" />
                  <Input
                    type="text"
                    value={`${Number(registration.program.fee).toLocaleString()} ETB`}
                    disabled
                    className="pl-12 h-12 font-bold text-lg bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/30 text-blue-900 dark:text-blue-100 cursor-not-allowed rounded-xl"
                  />
                </div>
              </div>

              {/* Payment Method Select */}
              <div className="space-y-2">
                <label htmlFor="paymentMethod" className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Payment Method
                </label>
                <select
                  id="paymentMethod"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="h-12 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                  required
                >
                  <option value="">Select payment method...</option>
                  <option value="Telebirr">Telebirr</option>
                  <option value="CBE Birr">CBE Birr</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>

              {/* Transaction Reference Input */}
              <div className="space-y-2">
                <label htmlFor="txRef" className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Transaction Reference</span>
                  <span className="font-normal text-muted-foreground/60 lower-case">(Optional)</span>
                </label>
                <Input
                  id="txRef"
                  type="text"
                  value={transactionReference}
                  onChange={(e) => setTransactionReference(e.target.value)}
                  placeholder="e.g. TX123456789"
                  className="h-12 rounded-xl focus-visible:ring-blue-400"
                />
              </div>

              {/* Payment Information Card */}
              <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 p-6 shadow-sm">
                <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-blue-400" />
                  Payment Information
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 text-sm">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-medium">Account Number</p>
                    <p className="font-bold font-mono text-lg text-slate-900 dark:text-slate-100">1000123456789</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-medium">Telebirr Number</p>
                    <p className="font-bold font-mono text-lg text-slate-900 dark:text-slate-100">0911234567</p>
                  </div>
                </div>
              </div>

              {/* Screenshot File Dropzone */}
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Payment Transfer Screenshot
                </label>
                <div className="relative rounded-2xl border-2 border-dashed border-border p-8 text-center hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-all duration-300 bg-muted/10">
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="flex flex-col items-center justify-center space-y-3 pointer-events-none">
                    <div className="h-14 w-14 rounded-full bg-blue-400/10 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <UploadCloud className="h-7 w-7" />
                    </div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Click or drag & drop payment receipt image</p>
                    <p className="text-xs text-muted-foreground">JPG, JPEG, PNG, or WebP • Max 5MB</p>
                  </div>
                </div>

                {/* Selected File Badge Preview */}
                {screenshot && (
                  <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-500/10 border border-emerald-200/50 text-sm font-medium text-emerald-700 dark:text-emerald-400 animate-in fade-in">
                    <span className="flex items-center gap-2 truncate">
                      <ImageIcon className="h-5 w-5 shrink-0" />
                      <span className="truncate">{screenshot.name}</span>
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setScreenshot(null)}
                      className="h-8 w-8 text-emerald-700 hover:bg-emerald-200/50 rounded-full shrink-0 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-400 hover:bg-blue-500 font-bold text-white h-12 gap-2 shadow-lg shadow-blue-400/25 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] rounded-xl"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading Payment Receipt...
                  </>
                ) : (
                  <>
                    <UploadCloud className="h-4 w-4" />
                    Submit Payment
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}