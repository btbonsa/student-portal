"use client";

import { useEffect, useRef, useState } from "react";
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
import type { LucideIcon } from "lucide-react";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  CreditCard,
  FileText,
  Landmark,
  Loader2,
  ShieldCheck,
  Smartphone,
  UploadCloud,
  Wallet,
  X,
} from "lucide-react";

/* ------------------------------ Constants ------------------------------ */

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;

// Replace with your real details (or load them from your API / env)
const PAYMENT_DETAILS = [
  { key: "account", label: "Bank account number", value: "1000123456789", icon: Landmark },
  { key: "telebirr", label: "Telebirr number", value: "0911234567", icon: Smartphone },
];

const PAYMENT_METHODS: { value: string; label: string; icon: LucideIcon }[] = [
  { value: "Telebirr", label: "Telebirr", icon: Smartphone },
  { value: "CBE Birr", label: "CBE Birr", icon: Wallet },
  { value: "Bank Transfer", label: "Bank Transfer", icon: Landmark },
];

const STEPS = [
  { label: "Program selected", state: "done" },
  { label: "Pay & upload receipt", state: "current" },
  { label: "Admin verification", state: "upcoming" },
] as const;

const formatSize = (bytes: number) =>
  bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

/* --------------------------- Small components --------------------------- */

type Tone = "neutral" | "success" | "info";

const toneStyles: Record<Tone, string> = {
  neutral: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300",
  success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  info: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
};

function StatusScreen({
  icon: Icon,
  tone,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon: LucideIcon;
  tone: Tone;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-gradient-to-b from-sky-50/70 via-background to-background p-4 text-foreground sm:p-6 dark:from-slate-950">
      <Card className="w-full max-w-md space-y-4 rounded-3xl border-border/60 p-6 text-center shadow-xl shadow-sky-900/5 animate-in fade-in zoom-in-95 duration-500 sm:p-8">
        <div
          className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${toneStyles[tone]}`}
        >
          <Icon className="h-8 w-8" aria-hidden />
        </div>
        <CardTitle className="text-xl font-bold">{title}</CardTitle>
        <CardDescription className="text-sm leading-relaxed">
          {description}
        </CardDescription>
        <Button
          onClick={onAction}
          className="h-11 w-full rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 font-semibold text-white shadow-md shadow-blue-600/25 transition hover:brightness-110"
        >
          {actionLabel}
        </Button>
      </Card>
    </main>
  );
}

function CopyRow({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable: ignore */
    }
  };

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/70 p-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="break-all font-mono text-sm font-bold tracking-wide text-slate-900 sm:text-base dark:text-slate-100">
          {value}
        </p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={copy}
        aria-label={`Copy ${label}`}
        className="h-10 shrink-0 gap-1.5 rounded-lg px-3 text-xs font-semibold text-sky-700 hover:bg-sky-500/10 dark:text-sky-300"
      >
        {copied ? (
          <>
            <Check className="h-4 w-4" aria-hidden />
            <span className="sr-only sm:not-sr-only">Copied</span>
          </>
        ) : (
          <>
            <Copy className="h-4 w-4" aria-hidden />
            <span className="sr-only sm:not-sr-only">Copy</span>
          </>
        )}
      </Button>
    </div>
  );
}

function SectionLabel({
  children,
  htmlFor,
  optional,
}: {
  children: React.ReactNode;
  htmlFor?: string;
  optional?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300"
    >
      <span>{children}</span>
      {optional && (
        <span className="font-medium normal-case tracking-normal text-muted-foreground">
          Optional
        </span>
      )}
    </label>
  );
}

/* --------------------------------- Page --------------------------------- */

export default function PaymentPage() {
  const router = useRouter();

  const [registration, setRegistration] = useState<Registration | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [transactionReference, setTransactionReference] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const redirectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Image preview (and cleanup of the object URL)
  useEffect(() => {
    if (!screenshot) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(screenshot);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [screenshot]);

  // Bring errors into view
  useEffect(() => {
    if (error) {
      errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [error]);

  // Clear the redirect timer on unmount
  useEffect(() => {
    return () => {
      if (redirectTimer.current) clearTimeout(redirectTimer.current);
    };
  }, []);

  const resetFileInput = () => {
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const processFile = (file: File | undefined) => {
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Only JPG, JPEG, PNG, and WebP image formats are supported.");
      setScreenshot(null);
      resetFileInput();
      return;
    }

    if (file.size > MAX_SIZE) {
      setError("Payment receipt image size must be less than 5MB.");
      setScreenshot(null);
      resetFileInput();
      return;
    }

    setError("");
    setScreenshot(file);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    processFile(event.target.files?.[0]);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    processFile(event.dataTransfer.files?.[0]);
  };

  const removeFile = () => {
    setScreenshot(null);
    resetFileInput();
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

      setSuccess(
        "Payment receipt uploaded successfully! Waiting for admin clearance."
      );

      redirectTimer.current = setTimeout(() => {
        router.push("/dashboard/pending");
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment upload failed.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ------------------------------ Loading ------------------------------ */

  if (loading) {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-background p-4 text-foreground sm:p-6">
        <div className="w-full max-w-2xl space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-10 w-64 max-w-full" />
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-96 w-full rounded-3xl" />
        </div>
      </main>
    );
  }

  /* --------------------------- Status screens --------------------------- */

  if (!registration) {
    return (
      <StatusScreen
        icon={FileText}
        tone="neutral"
        title="No Registration Found"
        description="You must select an academic certificate program before submitting payment."
        actionLabel="Select Program"
        onAction={() => router.push("/dashboard/programs")}
      />
    );
  }

  if (registration.status === "REGISTERED") {
    return (
      <StatusScreen
        icon={CheckCircle2}
        tone="success"
        title="Registration Approved"
        description="Your payment has been verified and your registration status is active."
        actionLabel="Go to Dashboard"
        onAction={() => router.push("/dashboard")}
      />
    );
  }

  if (
    registration.status === "PAYMENT_PENDING" &&
    registration.payment?.status === "PENDING"
  ) {
    return (
      <StatusScreen
        icon={Clock}
        tone="info"
        title="Payment Under Review"
        description="Your transfer receipt is currently being verified by an administrator."
        actionLabel="Check Status"
        onAction={() => router.push("/dashboard/pending")}
      />
    );
  }

  const isRejected = registration.status === "PAYMENT_REJECTED";
  const fee = Number(registration.program.fee).toLocaleString();
  const currentStepIndex = STEPS.findIndex((s) => s.state === "current");

  /* ------------------------------- Form ------------------------------- */

  return (
    <main className="min-h-[100dvh] bg-gradient-to-b from-sky-50/70 via-background to-background text-foreground selection:bg-sky-500 selection:text-white dark:from-slate-950">
      <div className="mx-auto max-w-2xl space-y-6 px-4 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700 sm:space-y-7 sm:py-12">
        {/* Header */}
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => router.push("/dashboard/pending")}
            className="group inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-500"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
            Back to status
          </button>

          <div>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
              Submit{" "}
              <span className="bg-gradient-to-r from-sky-500 to-blue-700 bg-clip-text text-transparent">
                Payment
              </span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Transfer the program fee, then upload your receipt for
              verification.
            </p>
          </div>

          {/* Progress steps */}
          <ol
            aria-label="Registration progress"
            className="flex items-center gap-2 rounded-2xl border border-border/60 bg-card/70 p-3 shadow-sm backdrop-blur"
          >
            {STEPS.map((step, i) => (
              <li
                key={step.label}
                aria-current={step.state === "current" ? "step" : undefined}
                className="flex flex-1 items-center gap-2"
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    step.state === "done"
                      ? "bg-emerald-500 text-white"
                      : step.state === "current"
                      ? "bg-gradient-to-br from-sky-500 to-blue-700 text-white shadow-md shadow-blue-600/30"
                      : "bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                  }`}
                >
                  {step.state === "done" ? (
                    <Check className="h-4 w-4" aria-hidden />
                  ) : (
                    i + 1
                  )}
                </span>
                <span
                  className={`hidden text-xs font-semibold sm:block ${
                    step.state === "upcoming"
                      ? "text-muted-foreground"
                      : "text-slate-800 dark:text-slate-100"
                  }`}
                >
                  {step.label}
                </span>
                {i < STEPS.length - 1 && (
                  <span
                    aria-hidden
                    className="ml-auto h-px flex-1 bg-border sm:ml-1"
                  />
                )}
              </li>
            ))}
          </ol>
          <p className="text-center text-xs font-semibold text-slate-700 sm:hidden dark:text-slate-200">
            Step {currentStepIndex + 1} of {STEPS.length} ·{" "}
            {STEPS[currentStepIndex].label}
          </p>
        </div>

        {/* Rejection notice */}
        {isRejected && registration.payment?.rejection_reason && (
          <div
            role="alert"
            className="space-y-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm animate-in fade-in slide-in-from-top-2 duration-300 dark:border-rose-900/50 dark:bg-rose-950/30"
          >
            <p className="flex items-center gap-1.5 font-bold text-rose-700 dark:text-rose-400">
              <AlertCircle className="h-4 w-4" aria-hidden /> Previous payment
              rejected
            </p>
            <p className="text-rose-600 dark:text-rose-300">
              {registration.payment.rejection_reason}
            </p>
            <p className="pt-1 text-xs text-rose-500 dark:text-rose-400">
              Please correct the issue and upload a valid transfer receipt.
            </p>
          </div>
        )}

        <Card className="overflow-hidden rounded-3xl border-border/60 shadow-2xl shadow-sky-900/10">
          {/* Fee banner */}
          <div className="relative isolate overflow-hidden bg-[#06142e] p-5 text-white sm:p-8">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 -z-10 h-56 w-56 rounded-full bg-blue-500/30 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-20 left-1/3 -z-10 h-48 w-48 rounded-full bg-sky-400/20 blur-3xl"
            />
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sky-200/80">
                  Selected program
                </p>
                <p className="mt-1 text-lg font-bold leading-snug sm:text-xl">
                  {registration.program.name}
                </p>
              </div>
              <Badge className="border border-white/15 bg-white/10 font-mono text-xs font-medium text-sky-100 backdrop-blur">
                {registration.registration_number}
              </Badge>
            </div>

            <div className="mt-6 flex items-end justify-between gap-4 border-t border-white/10 pt-5">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sky-200/80">
                  Amount to pay
                </p>
                <p className="mt-1 break-words text-3xl font-black tracking-tight sm:text-4xl">
                  {fee}{" "}
                  <span className="text-lg font-bold text-sky-300">ETB</span>
                </p>
              </div>
              <span className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15 sm:flex">
                <CreditCard className="h-6 w-6 text-sky-200" aria-hidden />
              </span>
            </div>
          </div>

          <CardContent className="space-y-6 p-5 sm:space-y-7 sm:p-8">
            {/* Banners */}
            {error && (
              <div
                ref={errorRef}
                role="alert"
                className="flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700 animate-in fade-in slide-in-from-top-2 duration-300 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-400"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                {error}
              </div>
            )}

            {success && (
              <div
                role="status"
                className="flex items-start gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700 animate-in fade-in slide-in-from-top-2 duration-300 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-400"
              >
                <CheckCircle2
                  className="mt-0.5 h-4 w-4 shrink-0"
                  aria-hidden
                />
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-7">
              {/* Where to pay */}
              <section className="space-y-3">
                <SectionLabel>Where to send the payment</SectionLabel>
                <div className="grid gap-3">
                  {PAYMENT_DETAILS.map((d) => (
                    <CopyRow
                      key={d.key}
                      label={d.label}
                      value={d.value}
                      icon={d.icon}
                    />
                  ))}
                </div>
              </section>

              {/* Payment method */}
              <fieldset className="space-y-3">
                <legend className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Payment method
                </legend>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {PAYMENT_METHODS.map(({ value, label, icon: Icon }) => (
                    <label key={value} className="relative cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={value}
                        checked={paymentMethod === value}
                        onChange={() => setPaymentMethod(value)}
                        className="peer sr-only"
                        required
                      />
                      <div className="flex items-center gap-3 rounded-xl border border-border bg-background p-3.5 text-sm font-semibold text-slate-700 transition hover:border-sky-300 hover:bg-sky-50/60 peer-checked:border-sky-500 peer-checked:bg-sky-50 peer-checked:text-sky-800 peer-checked:shadow-sm peer-checked:ring-1 peer-checked:ring-sky-500 peer-focus-visible:ring-2 peer-focus-visible:ring-sky-500 peer-focus-visible:ring-offset-2 sm:flex-col sm:justify-center sm:gap-2 sm:py-4 sm:text-center dark:text-slate-200 dark:hover:bg-sky-950/30 dark:peer-checked:bg-sky-950/40 dark:peer-checked:text-sky-200">
                        <Icon className="h-5 w-5 shrink-0" aria-hidden />
                        {label}
                        {paymentMethod === value && (
                          <CheckCircle2
                            className="ml-auto h-4 w-4 text-sky-600 sm:absolute sm:right-2 sm:top-2 sm:ml-0 dark:text-sky-300"
                            aria-hidden
                          />
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </fieldset>

              {/* Transaction reference */}
              <div className="space-y-2">
                <SectionLabel htmlFor="txRef" optional>
                  Transaction reference
                </SectionLabel>
                <Input
                  id="txRef"
                  type="text"
                  value={transactionReference}
                  onChange={(e) => setTransactionReference(e.target.value)}
                  placeholder="e.g. TX123456789"
                  className="h-12 rounded-xl text-base focus-visible:ring-sky-500 sm:text-sm"
                />
              </div>

              {/* Receipt upload */}
              <div className="space-y-3">
                <SectionLabel>Payment transfer screenshot</SectionLabel>

                {!screenshot ? (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                    className={`group relative rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-300 focus-within:ring-2 focus-within:ring-sky-500 focus-within:ring-offset-2 sm:p-8 ${
                      dragging
                        ? "scale-[1.01] border-sky-500 bg-sky-50 dark:bg-sky-950/30"
                        : "border-border bg-muted/10 hover:border-sky-400 hover:bg-sky-50/50 dark:hover:bg-sky-950/20"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleFileChange}
                      aria-label="Upload payment receipt image"
                      className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    />
                    <div className="pointer-events-none flex flex-col items-center justify-center space-y-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-700 text-white shadow-md shadow-blue-900/30 transition-transform duration-300 group-hover:scale-110">
                        <UploadCloud className="h-7 w-7" aria-hidden />
                      </div>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                        {dragging ? (
                          "Drop your receipt here"
                        ) : (
                          <>
                            <span className="sm:hidden">
                              Tap to upload your receipt
                            </span>
                            <span className="hidden sm:inline">
                              Click or drag &amp; drop your receipt
                            </span>
                          </>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        JPG, JPEG, PNG, or WebP · Max 5MB
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 rounded-2xl border border-emerald-200/70 bg-emerald-500/5 p-3 animate-in fade-in zoom-in-95 duration-300 sm:gap-4 dark:border-emerald-900/40">
                    {previewUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={previewUrl}
                        alt="Receipt preview"
                        className="h-16 w-16 shrink-0 rounded-xl border border-border object-cover sm:h-20 sm:w-20"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 className="h-4 w-4" aria-hidden /> Ready
                        to upload
                      </p>
                      <p className="mt-1 truncate text-sm font-bold text-slate-800 dark:text-slate-100">
                        {screenshot.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatSize(screenshot.size)}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={removeFile}
                      aria-label="Remove selected receipt"
                      className="h-11 w-11 shrink-0 rounded-full text-slate-500 transition-colors hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-950/40"
                    >
                      <X className="h-4 w-4" aria-hidden />
                    </Button>
                  </div>
                )}
              </div>

              {/* Submit */}
              <div className="space-y-3">
                <Button
                  type="submit"
                  disabled={submitting || !!success}
                  className="h-12 w-full gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 font-bold text-white shadow-lg shadow-blue-600/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:brightness-110 active:translate-y-0 disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                      Uploading receipt...
                    </>
                  ) : (
                    <>
                      <UploadCloud className="h-4 w-4" aria-hidden />
                      Submit payment
                    </>
                  )}
                </Button>

                <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
                  <ShieldCheck
                    className="h-4 w-4 shrink-0 text-emerald-500"
                    aria-hidden
                  />
                  Your registration activates once an admin verifies your
                  receipt.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}