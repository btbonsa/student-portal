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
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    title: "Registration Pending",
    description: "Your registration is being processed. Please upload your payment proof to continue.",
  },
  PAYMENT_PENDING: {
    icon: Clock,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    title: "Payment Under Review",
    description: "Your payment has been submitted and is currently being reviewed by our team. This usually takes 1–2 business days.",
  },
  PAYMENT_REJECTED: {
    icon: XCircle,
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
    title: "Payment Rejected",
    description: "Your payment was rejected. Please re-submit a valid payment proof.",
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
      // If approved, send to dashboard
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load]);

  const handleCheck = () => {
    const token = getToken();
    if (!token) return;
    setChecking(true);
    load(token);
  };

  const handleLogout = () => { clearAuth(); router.replace("/login"); };

  const config = registration ? (statusConfig[registration.status] ?? statusConfig.PENDING) : statusConfig.PENDING;
  const StatusIcon = config.icon;

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-slate-50">Student Portal</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-slate-800"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-16">
        {/* Status card */}
        <div className={`rounded-2xl border ${config.border} ${config.bg} p-8 text-center`}>
          <div className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm`}>
            <StatusIcon className={`h-8 w-8 ${config.color}`} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-50">{config.title}</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{config.description}</p>

          {/* Rejection reason */}
          {registration?.payment?.rejection_reason && (
            <div className="mt-4 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm text-red-600">
              <strong>Reason:</strong> {registration.payment.rejection_reason}
            </div>
          )}
        </div>

        {/* Registration details */}
        {registration && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-400">Registration Details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-slate-500">Student Name</p>
                <p className="mt-0.5 font-semibold text-slate-900 dark:text-slate-100">
                  {registration.student.first_name} {registration.student.last_name}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Program</p>
                <p className="mt-0.5 font-semibold text-slate-900 dark:text-slate-100">{registration.program.name}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Fee</p>
                <p className="mt-0.5 font-semibold text-slate-900 dark:text-slate-100">
                  {Number(registration.program.fee).toLocaleString()} ETB
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Payment Status</p>
                <p className="mt-0.5 font-semibold capitalize text-slate-900 dark:text-slate-100">
                  {registration.payment?.status ?? "Not submitted"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {/* Show payment button if no payment or rejected */}
          {(!registration?.payment || registration.status === "PAYMENT_REJECTED") && (
            <Link
              href="/dashboard/payment"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-500"
            >
              <CreditCard className="h-4 w-4" />
              {registration?.status === "PAYMENT_REJECTED" ? "Re-submit Payment" : "Upload Payment Proof"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}

          {/* Check status button */}
          <button
            onClick={handleCheck}
            disabled={checking}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
          >
            <RefreshCw className={`h-4 w-4 ${checking ? "animate-spin" : ""}`} />
            {checking ? "Checking..." : "Check Status"}
          </button>
        </div>

        {/* Steps indicator */}
        <div className="mt-10">
          <p className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">Your Progress</p>
          <div className="space-y-3">
            {[
              { label: "Account created", done: true },
              { label: "Student profile completed", done: true },
              { label: "Program selected", done: true },
              { label: "Payment submitted", done: !!registration?.payment },
              { label: "Payment approved — access granted", done: registration?.status === "REGISTERED" },
            ].map(({ label, done }) => (
              <div key={label} className="flex items-center gap-3">
                {done
                  ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  : <div className="h-4 w-4 shrink-0 rounded-full border-2 border-slate-300" />
                }
                <span className={`text-sm ${done ? "font-semibold text-slate-800 dark:text-slate-200" : "text-slate-400"}`}>
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
