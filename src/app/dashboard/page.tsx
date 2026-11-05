"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { GraduationCap as GraduationCapIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { LucideIcon } from "lucide-react";
import {
  AlertCircle,
  ArrowRight,
  Banknote,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  FileDown,
  FileText,
  Loader2,
  MapPin,
  RefreshCw,
  Sparkles,
  User,
} from "lucide-react";

import { getToken, getUser } from "@/lib/auth";
import { getMyRegistration } from "../../services/registrationservices";
import { getMyClassSchedule } from "../../services/classScheduleservice";
import type { Registration } from "../../services/registrationservices";
import type { ClassSchedule } from "../../services/classScheduleservice";

/* -------------------------------- Helpers -------------------------------- */

const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const formatStatus = (status: string) =>
  (status || "").toLowerCase().replace(/_/g, " ");

function formatDate(value?: string | null) {
  if (!value) return "Not specified";
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    ...(dateOnly ? { timeZone: "UTC" } : {}),
  });
}

function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase();
  const label = formatStatus(status);

  if (["approved", "paid", "completed", "registered"].includes(s)) {
    return (
      <Badge className="border border-emerald-200/50 bg-emerald-500/10 capitalize text-emerald-700 hover:bg-emerald-500/20 dark:bg-emerald-950/50 dark:text-emerald-400">
        <CheckCircle2 className="mr-1 h-3.5 w-3.5" aria-hidden />
        {label}
      </Badge>
    );
  }
  if (["pending", "under_review", "payment_pending"].includes(s)) {
    return (
      <Badge className="border border-amber-200/50 bg-amber-500/10 capitalize text-amber-700 hover:bg-amber-500/20 dark:bg-amber-950/50 dark:text-amber-400">
        <Clock className="mr-1 h-3.5 w-3.5" aria-hidden />
        {label}
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="border-border/60 capitalize text-muted-foreground">
      {label}
    </Badge>
  );
}

function CardTitleBlock({
  icon: Icon,
  tint,
  title,
  description,
}: {
  icon: LucideIcon;
  tint: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tint}`}>
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <div>
        <CardTitle className="text-base font-bold">{title}</CardTitle>
        <CardDescription className="text-xs">{description}</CardDescription>
      </div>
    </div>
  );
}

function InfoTile({
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
        <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </dt>
        <dd className="mt-0.5 break-words text-sm font-bold">{children}</dd>
      </div>
    </div>
  );
}

const PRIMARY_BTN =
  "bg-gradient-to-r from-blue-600 to-sky-500 font-semibold text-white shadow-md shadow-blue-600/25 transition hover:-translate-y-0.5 hover:brightness-110";

/* --------------------------------- Page --------------------------------- */

export default function DashboardPage() {
  const router = useRouter();

  const [registration, setRegistration] = useState<Registration | null>(null);
  const [schedule, setSchedule] = useState<ClassSchedule | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportError, setExportError] = useState("");

  const loadDashboard = useCallback(async () => {
    const token = getToken();
    const storedUser = getUser();

    if (!token || !storedUser) {
      router.replace("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Fetch registration and schedule in parallel — they don't depend on each other
      const [registrationResult, scheduleResult] = await Promise.allSettled([
        getMyRegistration(token),
        getMyClassSchedule(token),
      ]);

      if (registrationResult.status === "rejected") {
        const err = registrationResult.reason;
        // No registration at all → go to programs
        if (err instanceof Error && err?.message?.toLowerCase().includes("no registration")) {
          router.replace("/dashboard/programs");
          return;
        }
        setError(err instanceof Error ? err.message : "Failed to load dashboard.");
        return;
      }

      const registrationData = registrationResult.value;

      // Gate: only REGISTERED (payment approved) can access dashboard
      if (registrationData.status !== "REGISTERED") {
        router.replace("/dashboard/pending");
        return;
      }

      setRegistration(registrationData);
      setSchedule(scheduleResult.status === "fulfilled" ? scheduleResult.value : null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  // Export receipt as PDF via the browser's print dialog
  const handleExportPDF = () => {
    if (!registration || !registration.payment) return;

    setExportError("");
    setExportingPdf(true);

    const studentName = registration.student
      ? `${registration.student.first_name} ${registration.student.last_name}`
      : "Student";

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      setExportingPdf(false);
      setExportError("Please allow popups for this site to export the payment receipt.");
      return;
    }

    // Every dynamic value is escaped before going into the HTML
    const receiptHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Payment Receipt - ${escapeHtml(registration.registration_number)}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #1e293b; line-height: 1.5; }
            .header { border-bottom: 2px solid #38bdf8; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
            .logo { font-size: 24px; font-weight: 800; color: #0284c7; letter-spacing: -0.5px; }
            .title { font-size: 14px; text-transform: uppercase; color: #64748b; font-weight: 600; letter-spacing: 1px; }
            .section-title { font-size: 12px; font-weight: 700; text-transform: uppercase; color: #94a3b8; letter-spacing: 1px; margin-bottom: 12px; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
            .field-label { font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600; }
            .field-value { font-size: 15px; font-weight: 700; color: #0f172a; margin-top: 2px; }
            .amount-box { background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin-bottom: 30px; text-align: center; }
            .amount-title { font-size: 12px; color: #166534; font-weight: 600; text-transform: uppercase; }
            .amount-value { font-size: 32px; font-weight: 900; color: #15803d; margin-top: 4px; }
            .footer { border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; font-size: 11px; color: #94a3b8; margin-top: 40px; }
            .stamp { display: inline-block; padding: 6px 16px; background-color: #dcfce7; color: #15803d; border-radius: 20px; font-weight: 700; font-size: 12px; text-transform: uppercase; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">LOGOS COLLEGE</div>
              <div class="title">Official Payment Receipt</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 12px; font-weight: 600; color: #64748b;">Receipt Date</div>
              <div style="font-size: 14px; font-weight: 700;">${escapeHtml(new Date().toLocaleDateString())}</div>
            </div>
          </div>

          <div class="section-title">Student &amp; Registration Info</div>
          <div class="grid">
            <div>
              <div class="field-label">Student Name</div>
              <div class="field-value">${escapeHtml(studentName)}</div>
            </div>
            <div>
              <div class="field-label">Registration Number</div>
              <div class="field-value">${escapeHtml(registration.registration_number)}</div>
            </div>
            <div>
              <div class="field-label">Enrolled Program</div>
              <div class="field-value">${escapeHtml(registration.program.name)}</div>
            </div>
            <div>
              <div class="field-label">Registration Status</div>
              <div class="field-value" style="color: #0284c7;">CLEARED &amp; REGISTERED</div>
            </div>
          </div>

          <div class="section-title">Payment Transaction Breakdown</div>
          <div class="grid">
            <div>
              <div class="field-label">Payment Method</div>
              <div class="field-value" style="text-transform: capitalize;">${escapeHtml(registration.payment.payment_method)}</div>
            </div>
            <div>
              <div class="field-label">Transaction Reference</div>
              <div class="field-value">${escapeHtml(registration.payment.transaction_reference || "N/A")}</div>
            </div>
          </div>

          <div class="amount-box">
            <div class="amount-title">Total Amount Paid</div>
            <div class="amount-value">${escapeHtml(Number(registration.payment.amount).toLocaleString())} ETB</div>
            <div class="stamp">✓ Payment Verified &amp; Approved</div>
          </div>

          <div class="footer">
            <p>This is an official computer-generated document from Logos College Student Portal.</p>
            <p>© ${new Date().getFullYear()} Logos College. All rights reserved.</p>
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(receiptHtml);
    printWindow.document.close();
    setExportingPdf(false);
  };

  /* ------------------------------- Loading ------------------------------- */

  if (loading) {
    return (
      <main
        role="status"
        aria-busy="true"
        aria-label="Loading your dashboard"
        className="min-h-[100dvh] bg-gradient-to-b from-sky-50/70 via-background to-background text-foreground dark:from-slate-950"
      >
        <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:py-8">
          <Skeleton className="h-44 w-full rounded-3xl" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-64 w-full rounded-3xl lg:col-span-2" />
            <Skeleton className="h-64 w-full rounded-3xl" />
            <Skeleton className="h-48 w-full rounded-3xl md:col-span-2 lg:col-span-3" />
          </div>
        </div>
      </main>
    );
  }

  const paymentApproved = registration?.payment?.status === "APPROVED";

  /* -------------------------------- Page -------------------------------- */

  return (
    <main className="min-h-[100dvh] bg-gradient-to-b from-sky-50/70 via-background to-background text-foreground selection:bg-sky-500 selection:text-white dark:from-slate-950">
      <div className="mx-auto max-w-6xl space-y-6 px-4 pb-8 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-700 sm:space-y-8 sm:py-8">
        {/* Welcome banner */}
        <section className="relative isolate overflow-hidden rounded-3xl bg-[#06142e] p-5 text-white shadow-xl shadow-blue-950/20 sm:p-8">
          <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 -z-10 h-64 w-64 rounded-full bg-blue-500/30 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -bottom-24 left-1/4 -z-10 h-56 w-56 rounded-full bg-sky-400/20 blur-3xl" />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 opacity-[0.07]"
            style={{
              backgroundImage:
                "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
              backgroundSize: "44px 44px",
              maskImage: "linear-gradient(to bottom right, black, transparent 70%)",
              WebkitMaskImage: "linear-gradient(to bottom right, black, transparent 70%)",
            }}
          />

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-100 backdrop-blur-md sm:text-xs">
                <Sparkles className="h-3 w-3 text-sky-300" aria-hidden />
                Student Academic Portal
              </span>
              <h1 className="text-2xl font-black tracking-tight sm:text-4xl">
                Welcome back
                {registration?.student ? (
                  <>
                    ,{" "}
                    <span className="bg-gradient-to-r from-sky-300 to-blue-400 bg-clip-text text-transparent">
                      {registration.student.first_name} {registration.student.last_name}
                    </span>
                  </>
                ) : null}
                !
              </h1>
              <p className="max-w-xl text-xs leading-relaxed text-slate-300 sm:text-sm">
                Manage your registration clearance, verify payment status, and review your class timetable.
              </p>
            </div>

            {registration && (
              <div className="self-start rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-md md:self-center">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-200/80">
                  Registration no.
                </p>
                <p className="mt-0.5 font-mono text-sm font-bold sm:text-base">
                  {registration.registration_number}
                </p>
              </div>
            )}
          </div>
        </section>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-700 animate-in fade-in slide-in-from-top-2 duration-300 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-400 sm:text-sm"
          >
            <AlertCircle className="h-5 w-5 shrink-0" aria-hidden />
            <span className="flex-1">{error}</span>
            <button
              type="button"
              onClick={() => void loadDashboard()}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-bold underline-offset-4 hover:underline"
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden />
              Retry
            </button>
          </div>
        )}

        {/* Dashboard grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Registration */}
          <Card className="overflow-hidden rounded-3xl border-border/60 shadow-sm lg:col-span-2">
            <CardHeader className="flex flex-col items-start justify-between gap-3 border-b bg-muted/20 pb-4 sm:flex-row sm:items-center">
              <CardTitleBlock
                icon={FileText}
                tint="bg-sky-500/10 text-sky-600 dark:text-sky-400"
                title="My Registration"
                description="Your enrolled certificate program"
              />
              {registration && <StatusBadge status={registration.status} />}
            </CardHeader>

            <CardContent className="pt-6">
              {!registration ? (
                <div className="flex flex-col items-center justify-center space-y-4 py-6 text-center sm:py-8">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
                    <User className="h-6 w-6" aria-hidden />
                  </div>
                  <div>
                    <p className="text-base font-semibold">No active registration found</p>
                    <p className="mx-auto mt-1 max-w-xs text-xs text-muted-foreground">
                      Choose a program from our course catalog to start your registration.
                    </p>
                  </div>
                  <Button
                    onClick={() => router.push("/dashboard/programs")}
                    className={`h-11 rounded-xl px-5 ${PRIMARY_BTN}`}
                  >
                    Choose Program
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                  </Button>
                </div>
              ) : (
                <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <InfoTile icon={GraduationCapIcon} label="Program">
                    {registration.program.name}
                  </InfoTile>
                  <InfoTile icon={Banknote} label="Program Fee">
                    <span className="font-black text-emerald-600 dark:text-emerald-400">
                      {Number(registration.program.fee).toLocaleString()} ETB
                    </span>
                  </InfoTile>
                  <InfoTile icon={FileText} label="Registration No.">
                    <span className="font-mono">{registration.registration_number}</span>
                  </InfoTile>
                  <InfoTile icon={CheckCircle2} label="Status">
                    <span className="capitalize text-sky-700 dark:text-sky-300">
                      {formatStatus(registration.status)}
                    </span>
                  </InfoTile>
                </dl>
              )}
            </CardContent>
          </Card>

          {/* Payment */}
          <Card className="overflow-hidden rounded-3xl border-border/60 shadow-sm">
            <CardHeader className="flex flex-col items-start justify-between gap-3 border-b bg-muted/20 pb-4">
              <CardTitleBlock
                icon={CreditCard}
                tint="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                title="Payment Status"
                description="Fee transaction audit"
              />
              {paymentApproved && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportPDF}
                  disabled={exportingPdf}
                  className="h-10 w-full gap-1.5 rounded-xl border-sky-200 text-xs font-semibold text-sky-700 hover:bg-sky-50 dark:border-sky-900/50 dark:text-sky-300 dark:hover:bg-sky-950/30"
                >
                  {exportingPdf ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                  ) : (
                    <FileDown className="h-3.5 w-3.5" aria-hidden />
                  )}
                  Export Receipt
                </Button>
              )}
            </CardHeader>

            <CardContent className="pt-6">
              {exportError && (
                <p
                  role="alert"
                  className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-400"
                >
                  {exportError}
                </p>
              )}

              {!registration ? (
                <p className="text-xs text-muted-foreground">
                  Complete registration first to view payments.
                </p>
              ) : registration.payment ? (
                <dl className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-3">
                    <dt className="text-xs font-medium text-muted-foreground">Amount Paid</dt>
                    <dd className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                      {Number(registration.payment.amount).toLocaleString()} ETB
                    </dd>
                  </div>
                  <div className="flex items-center justify-between border-b pb-3">
                    <dt className="text-xs font-medium text-muted-foreground">Payment Method</dt>
                    <dd className="text-sm font-medium capitalize">
                      {registration.payment.payment_method}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <dt className="text-xs font-medium text-muted-foreground">Status</dt>
                    <dd>
                      <StatusBadge status={registration.payment.status} />
                    </dd>
                  </div>
                </dl>
              ) : (
                <div className="space-y-4 py-2">
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    No payment receipt submitted for this registration yet. Please upload your transfer slip to proceed.
                  </p>
                  <Button
                    onClick={() => router.push("/dashboard/payment")}
                    className={`h-11 w-full rounded-xl ${PRIMARY_BTN}`}
                  >
                    <Banknote className="mr-1.5 h-4 w-4" aria-hidden />
                    Make Payment
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Schedule */}
          <Card className="overflow-hidden rounded-3xl border-border/60 shadow-sm md:col-span-2 lg:col-span-3">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b bg-muted/20 pb-4">
              <CardTitleBlock
                icon={Calendar}
                tint="bg-violet-500/10 text-violet-600 dark:text-violet-400"
                title="Class Schedule & Timetable"
                description="Assigned session details and location"
              />
            </CardHeader>

            <CardContent className="pt-6">
              {schedule ? (
                <div className="space-y-5">
                  <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <InfoTile icon={Calendar} label="Start Date">
                      {formatDate(schedule.class_start_date)}
                    </InfoTile>
                    <InfoTile icon={Clock} label="Start Time">
                      {schedule.class_start_time || "Not specified"}
                    </InfoTile>
                    <InfoTile icon={MapPin} label="Location / Room">
                      {schedule.location || "Not specified"}
                    </InfoTile>
                  </dl>

                  {schedule.message && (
                    <div className="rounded-2xl border border-sky-200 bg-sky-50/70 p-4 text-xs font-medium leading-relaxed text-slate-700 dark:border-sky-900/50 dark:bg-sky-950/30 dark:text-slate-300 sm:text-sm">
                      <strong className="font-bold text-sky-700 dark:text-sky-300">
                        Instructor notice:{" "}
                      </strong>
                      {schedule.message}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">
                  <Clock className="h-5 w-5 shrink-0 text-muted-foreground/60" aria-hidden />
                  <span>
                    Your class schedule has not been assigned yet. Check back once your payment is reviewed and approved.
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

