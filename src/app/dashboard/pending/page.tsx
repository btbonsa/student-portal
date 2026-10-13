"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getToken, clearAuth } from "@/lib/auth";
import { getMyRegistration } from "../../../services/registrationservices";
import type { Registration } from "../../../services/registrationservices";
import {
  Clock,
  CheckCircle2,
  XCircle,
  CreditCard,
  LogOut,
  GraduationCap,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

const statusConfig: Record<string, { icon: typeof Clock; color: string; bg: string; border: string; title: string; description: string }> = {
  PENDING: {
    icon: Clock,
    color: "text-amber-500 dark:text-amber-400",
    bg: "bg-amber-50/80 dark:bg-amber-950/20",
    border: "border-amber-200/80 dark:border-amber-900/40",
    title: "Registration Pending",
    description: "Your registration has been initiated. Please upload your payment proof to continue.",
  },
  PAYMENT_PENDING: {
    icon: Clock,
    color: "text-blue-400",
    bg: "bg-blue-50/80 dark:bg-blue-950/20",
    border: "border-blue-200/80 dark:border-blue-900/40",
    title: "Payment Under Review",
    description: "Your payment transfer receipt has been submitted and is currently being verified by our team. This usually takes 1–2 business days.",
  },
  PAYMENT_REJECTED: {
    icon: XCircle,
    color: "text-rose-500 dark:text-rose-400",
    bg: "bg-rose-50/80 dark:bg-rose-950/20",
    border: "border-rose-200/80 dark:border-rose-900/40",
    title: "Payment Rejected",
    description: "Your payment verification was unsuccessful. Please check the reason below and re-submit a valid payment receipt.",
  },
};

export default function PendingPage() {
  const router = useRouter();
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  const load = useCallback(async (token: string) => {
    try {
      const data = await getMyRegistration(token);
      // If approved, send to main dashboard
      if (data.status === "REGISTERED") {
        router.replace("/dashboard");
        return;
      }
      setRegistration(data);
    } catch {
      router.replace("/dashboard/programs");
    } finally {
      setLoading(false);
      setChecking(false);
    }
  }, [router]);

  useEffect(() => {
    const token = getToken();
    if (!token) { router.replace("/login"); return; }
    load(token);
  }, [load, router]);

  const handleCheck = () => {
    const token = getToken();
    if (!token) return;
    setChecking(true);
    load(token);
  };

  const handleLogout = () => { 
    clearAuth(); 
    router.replace("/login"); 
  };

  const config = registration ? (statusConfig[registration.status] ?? statusConfig.PENDING) : statusConfig.PENDING;
  const StatusIcon = config.icon;

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-400 border-t-transparent" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-400 text-white font-bold">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight">Student Portal</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium text-muted-foreground transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
        {/* Status card */}
        <div className={`rounded-2xl border ${config.border} ${config.bg} p-8 text-center shadow-sm`}>
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-card shadow-sm border">
            <StatusIcon className={`h-8 w-8 ${config.color}`} />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">{config.title}</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground max-w-md mx-auto">{config.description}</p>

          {/* Rejection reason */}
          {registration?.payment?.rejection_reason && (
            <div className="mt-5 rounded-xl border border-rose-200/80 bg-card px-4 py-3 text-sm text-rose-600 dark:border-rose-900/50 dark:text-rose-400 text-left shadow-sm">
              <strong className="font-semibold block mb-0.5">Rejection Reason:</strong> 
              <span>{registration.payment.rejection_reason}</span>
            </div>
          )}
        </div>

        {/* Registration details */}
        {registration && (
          <div className="mt-6 rounded-2xl border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Registration Details</h2>
            <div className="grid gap-4 sm:grid-cols-2 text-sm">
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground">Student Name</p>
                <p className="font-semibold">
                  {registration.student.first_name} {registration.student.last_name}
                </p>
              </div>
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground">Enrolled Program</p>
                <p className="font-semibold">{registration.program.name}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground">Program Fee</p>
                <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {Number(registration.program.fee).toLocaleString()} ETB
                </p>
              </div>
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground">Payment Status</p>
                <p className="font-semibold capitalize text-blue-400">
                  {registration.payment?.status ? registration.payment.status.toLowerCase().replace('_', ' ') : "Not submitted"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Payment Information */}
        <div className="mt-6 rounded-2xl border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Payment Information</h2>
          <div className="grid gap-4 sm:grid-cols-2 text-sm">
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground">Account Number</p>
              <p className="font-semibold font-mono">1000123456789</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground">Telebirr Number</p>
              <p className="font-semibold font-mono">0911234567</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {(!registration?.payment || registration.status === "PAYMENT_REJECTED") && (
            <Link
              href="/dashboard/payment"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-400 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-400/20 transition hover:bg-blue-500"
            >
              <CreditCard className="h-4 w-4" />
              {registration?.status === "PAYMENT_REJECTED" ? "Re-submit Payment" : "Upload Payment Proof"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}

          <button
            onClick={handleCheck}
            disabled={checking}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border bg-card px-6 py-3 text-sm font-bold transition hover:bg-muted/50 disabled:opacity-60 shadow-sm"
          >
            <RefreshCw className={`h-4 w-4 ${checking ? "animate-spin text-blue-400" : ""}`} />
            {checking ? "Checking..." : "Check Status"}
          </button>
        </div>

        {/* Steps indicator */}
        <div className="mt-10 rounded-2xl border bg-card p-6 shadow-sm">
          <p className="mb-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Your Application Progress</p>
          <div className="space-y-3.5">
            {[
              { label: "Account created", done: true },
              { label: "Student profile completed", done: true },
              { label: "Program selected", done: true },
              { label: "Payment submitted", done: !!registration?.payment },
              { label: "Payment approved — clearance granted", done: registration?.status === "REGISTERED" },
            ].map(({ label, done }) => (
              <div key={label} className="flex items-center gap-3">
                {done
                  ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  : <div className="h-4 w-4 shrink-0 rounded-full border-2 border-muted-foreground/30" />
                }
                <span className={`text-sm ${done ? "font-medium text-foreground" : "text-muted-foreground/60"}`}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}