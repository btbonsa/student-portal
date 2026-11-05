"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getToken, clearAuth } from "@/lib/auth";
import { getMyRegistration } from "../../../services/registrationservices";
import type { Registration } from "../../../services/registrationservices";
import { Skeleton } from "@/components/ui/skeleton";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BookOpen,
  Check,
  Clock,
  CreditCard,
  GraduationCap,
  LogOut,
  RefreshCw,
  Receipt,
  User,
  XCircle,
} from "lucide-react";

/* ------------------------------ Status config ------------------------------ */

type Tone = "amber" | "sky" | "rose";

const toneStyles: Record<
  Tone,
  { card: string; icon: string; ring: string; accent: string }
> = {
  amber: {
    card: "border-amber-200/80 bg-amber-50/70 dark:border-amber-900/40 dark:bg-amber-950/20",
    icon: "text-amber-600 dark:text-amber-400",
    ring: "ring-amber-200 dark:ring-amber-900/50",
    accent: "from-amber-400 to-orange-400",
  },
  sky: {
    card: "border-sky-200/80 bg-sky-50/70 dark:border-sky-900/40 dark:bg-sky-950/20",
    icon: "text-sky-600 dark:text-sky-400",
    ring: "ring-sky-200 dark:ring-sky-900/50",
    accent: "from-sky-400 to-blue-600",
  },
  rose: {
    card: "border-rose-200/80 bg-rose-50/70 dark:border-rose-900/40 dark:bg-rose-950/20",
    icon: "text-rose-600 dark:text-rose-400",
    ring: "ring-rose-200 dark:ring-rose-900/50",
    accent: "from-rose-400 to-red-500",
  },
};

const statusConfig: Record<
  string,
  { icon: LucideIcon; tone: Tone; title: string; description: string }
> = {
  PENDING: {
    icon: Clock,
    tone: "amber",
    title: "Registration Pending",
    description:
      "Your registration has been initiated. Please upload your payment proof to continue.",
  },
  PAYMENT_PENDING: {
    icon: Clock,
    tone: "sky",
    title: "Payment Under Review",
    description:
      "Your payment transfer receipt has been submitted and is currently being verified by our team. This usually takes 1–2 business days.",
  },
  PAYMENT_REJECTED: {
    icon: XCircle,
    tone: "rose",
    title: "Payment Rejected",
    description:
      "Your payment verification was unsuccessful. Please check the reason below and re-submit a valid payment receipt.",
  },
};

const paymentBadge: Record<string, string> = {
  PENDING:
    "bg-sky-500/10 text-sky-700 ring-sky-500/20 dark:text-sky-300",
  APPROVED:
    "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-300",
  REJECTED:
    "bg-rose-500/10 text-rose-700 ring-rose-500/20 dark:text-rose-300",
};

/* --------------------------------- Page --------------------------------- */

export default function PendingPage() {
  const router = useRouter();
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const load = useCallback(
    async (token: string) => {
      try {
        const data = await getMyRegistration(token);
        // If approved, send to main dashboard
        if (data.status === "REGISTERED") {
          router.replace("/dashboard");
          return;
        }
        setRegistration(data);
        setLastChecked(new Date());
      } catch {
        router.replace("/dashboard/programs");
      } finally {
        setLoading(false);
        setChecking(false);
      }
    },
    [router]
  );

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    void load(token);
  }, [load, router]);

  const handleCheck = () => {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    setChecking(true);
    void load(token);
  };

  const handleLogout = () => {
    clearAuth();
    router.replace("/login");
  };

  /* ------------------------------- Loading ------------------------------- */

  if (loading) {
    return (
      <main
        role="status"
        aria-busy="true"
        aria-label="Loading your registration"
        className="min-h-[100dvh] bg-gradient-to-b from-sky-50/70 via-background to-background text-foreground dark:from-slate-950"
      >
        <div className="border-b bg-card/80 px-4 py-4">
          <div className="mx-auto flex max-w-4xl items-center justify-between">
            <Skeleton className="h-9 w-40" />
            <Skeleton className="h-10 w-24 rounded-lg" />
          </div>
        </div>
        <div className="mx-auto max-w-2xl space-y-5 px-4 py-10">
          <Skeleton className="h-64 w-full rounded-3xl" />
          <Skeleton className="h-40 w-full rounded-3xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </main>
    );
  }

  /* ------------------------------ Derived data ------------------------------ */

  const config =
    (registration && statusConfig[registration.status]) ?? statusConfig.PENDING;
  const StatusIcon = config.icon;
  const tone = toneStyles[config.tone];

  const isRejected = registration?.status === "PAYMENT_REJECTED";
  const isUnderReview = registration?.status === "PAYMENT_PENDING";
  const needsPayment = !registration?.payment || isRejected;

  const paymentStatus = registration?.payment?.status ?? null;
  const paymentLabel = paymentStatus
    ? paymentStatus.toLowerCase().replace(/_/g, " ")
    : "Not submitted";

  const steps = [
    { label: "Account created", done: true },
    { label: "Student profile completed", done: true },
    { label: "Program selected", done: true },
    { label: "Payment submitted", done: !!registration?.payment },
    {
      label: "Payment approved — clearance granted",
      done: registration?.status === "REGISTERED",
    },
  ];
  const currentIndex = steps.findIndex((s) => !s.done);

  /* -------------------------------- Page -------------------------------- */

  return (
    <main className="min-h-[100dvh] bg-gradient-to-b from-sky-50/70 via-background to-background text-foreground selection:bg-sky-500 selection:text-white dark:from-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-card/80 shadow-[0_1px_12px_rgba(15,23,42,0.04)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between gap-3 px-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-700 text-white shadow-sm shadow-sky-500/30">
              <GraduationCap className="h-5 w-5" aria-hidden />
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-bold tracking-tight sm:text-base">
                Logos College
              </span>
              <span className="block text-[11px] font-medium text-muted-foreground">
                Student Portal
              </span>
            </span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex h-10 items-center gap-1.5 rounded-xl border px-3.5 text-sm font-medium text-muted-foreground transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 dark:hover:bg-rose-950/30"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Logout
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-2xl space-y-6 px-4 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700 sm:py-14">
        {/* Status card */}
        <section
          aria-live="polite"
          className={`relative overflow-hidden rounded-3xl border p-6 text-center shadow-lg shadow-sky-900/5 sm:p-8 ${tone.card}`}
        >
          <div
            aria-hidden
            className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${tone.accent}`}
          />

          <div className="relative mx-auto mb-5 flex h-16 w-16 items-center justify-center">
            {isUnderReview && (
              <span
                aria-hidden
                className="absolute inset-0 rounded-full bg-sky-400/30 animate-ping motion-reduce:animate-none"
              />
            )}
            <span
              className={`relative flex h-16 w-16 items-center justify-center rounded-full border bg-card shadow-sm ring-4 ${tone.ring}`}
            >
              <StatusIcon className={`h-8 w-8 ${tone.icon}`} aria-hidden />
            </span>
          </div>

          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
            {config.title}
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
            {config.description}
          </p>

          {/* Rejection reason */}
          {isRejected && registration?.payment?.rejection_reason && (
            <div
              role="alert"
              className="mt-5 rounded-2xl border border-rose-200/80 bg-card px-4 py-3 text-left text-sm text-rose-600 shadow-sm dark:border-rose-900/50 dark:text-rose-400"
            >
              <strong className="mb-0.5 block font-semibold">
                Rejection reason
              </strong>
              <span>{registration.payment.rejection_reason}</span>
            </div>
          )}
        </section>

        {/* Registration details */}
        {registration && (
          <section className="rounded-3xl border bg-card p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b pb-3">
              <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <span
                  aria-hidden
                  className="h-4 w-1 rounded-full bg-gradient-to-b from-sky-400 to-blue-600"
                />
                Registration Details
              </h2>
              {registration.registration_number && (
                <span className="rounded-full border bg-muted/50 px-2.5 py-1 font-mono text-[11px] font-medium text-muted-foreground">
                  {registration.registration_number}
                </span>
              )}
            </div>

            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <DetailItem icon={User} label="Student Name">
                {registration.student.first_name}{" "}
                {registration.student.last_name}
              </DetailItem>
              <DetailItem icon={BookOpen} label="Enrolled Program">
                {registration.program.name}
              </DetailItem>
              <DetailItem icon={Receipt} label="Program Fee">
                <span className="font-black text-emerald-600 dark:text-emerald-400">
                  {Number(registration.program.fee).toLocaleString()} ETB
                </span>
              </DetailItem>
              <DetailItem icon={CreditCard} label="Payment Status">
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ring-1 ${
                    paymentStatus
                      ? paymentBadge[paymentStatus] ??
                        "bg-slate-500/10 text-slate-700 ring-slate-500/20 dark:text-slate-300"
                      : "bg-slate-500/10 text-slate-600 ring-slate-500/20 dark:text-slate-300"
                  }`}
                >
                  {paymentLabel}
                </span>
              </DetailItem>
            </dl>
          </section>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row">
          {needsPayment && (
            <Link
              href="/dashboard/payment"
              className="group flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 px-6 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
            >
              <CreditCard className="h-4 w-4" aria-hidden />
              {isRejected ? "Re-submit Payment" : "Upload Payment Proof"}
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                aria-hidden
              />
            </Link>
          )}

          <button
            type="button"
            onClick={handleCheck}
            disabled={checking}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border bg-card px-6 text-sm font-bold shadow-sm transition hover:bg-muted/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                checking ? "animate-spin text-sky-500" : ""
              }`}
              aria-hidden
            />
            {checking ? "Checking..." : "Check Status"}
          </button>
        </div>

        {lastChecked && (
          <p className="text-center text-xs text-muted-foreground">
            Last checked at{" "}
            {lastChecked.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        )}

        {/* Progress */}
        <section className="rounded-3xl border bg-card p-5 shadow-sm sm:p-6">
          <h2 className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <span
              aria-hidden
              className="h-4 w-1 rounded-full bg-gradient-to-b from-sky-400 to-blue-600"
            />
            Your Application Progress
          </h2>

          <ol aria-label="Application progress">
            {steps.map(({ label, done }, i) => {
              const current = i === currentIndex;
              const isLast = i === steps.length - 1;
              return (
                <li
                  key={label}
                  aria-current={current ? "step" : undefined}
                  className="relative flex gap-4 pb-5 last:pb-0"
                >
                  {!isLast && (
                    <span
                      aria-hidden
                      className={`absolute left-[13px] top-7 h-[calc(100%-1.75rem)] w-0.5 rounded-full ${
                        done ? "bg-emerald-400/70" : "bg-border"
                      }`}
                    />
                  )}

                  <span
                    className={`relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      done
                        ? "bg-emerald-500 text-white"
                        : current
                        ? isRejected
                          ? "bg-rose-500 text-white ring-4 ring-rose-500/20"
                          : "bg-gradient-to-br from-sky-500 to-blue-700 text-white ring-4 ring-sky-500/20"
                        : "border-2 border-muted-foreground/30 bg-card text-muted-foreground/60"
                    }`}
                  >
                    {done ? (
                      <Check className="h-4 w-4" aria-hidden />
                    ) : (
                      i + 1
                    )}
                    <span className="sr-only">
                      {done ? "(completed)" : current ? "(current step)" : "(upcoming)"}
                    </span>
                  </span>

                  <div className="min-w-0 pt-0.5">
                    <p
                      className={`text-sm ${
                        done
                          ? "font-medium text-foreground"
                          : current
                          ? "font-bold text-foreground"
                          : "text-muted-foreground/70"
                      }`}
                    >
                      {label}
                    </p>
                    {current && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {isRejected
                          ? "Needs your attention"
                          : isUnderReview
                          ? "In progress — we're verifying your receipt"
                          : "Next step"}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      </div>
    </main>
  );
}

/* --------------------------- Small components --------------------------- */

function DetailItem({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-border/60 bg-muted/20 p-3.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <div className="min-w-0">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="mt-0.5 break-words font-semibold">{children}</dd>
      </div>
    </div>
  );
}