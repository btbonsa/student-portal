"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// shadcn UI & Lucide Components
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
import {
  CreditCard,
  Calendar,
  User,
  ArrowRight,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
  Sparkles,
  FileDown,
  Loader2,
} from "lucide-react";

import {
  getToken,
  getUser,
} from "@/lib/auth";

import {
  getMyRegistration,
} from "../../services/registrationservices";

import {
  getMyClassSchedule,
} from "../../services/classScheduleservice";

import type {
  Registration,
} from "../../services/registrationservices";

import type {
  ClassSchedule,
} from "../../services/classScheduleservice";

export default function DashboardPage() {
  const router = useRouter();

  const [registration, setRegistration] =
    useState<Registration | null>(null);

  const [schedule, setSchedule] =
    useState<ClassSchedule | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exportingPdf, setExportingPdf] = useState(false);

  useEffect(() => {
    const token = getToken();
    const storedUser = getUser();

    if (!token || !storedUser) {
      router.replace("/login");
      return;
    }

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const registrationData = await getMyRegistration(token);
        setRegistration(registrationData);

        // Gate: only REGISTERED (payment approved) can access dashboard
        if (registrationData.status !== "REGISTERED") {
          router.replace("/dashboard/pending");
          return;
        }

        try {
          const scheduleData = await getMyClassSchedule(token);
          setSchedule(scheduleData);
        } catch {
          setSchedule(null);
        }
      } catch (err: unknown) {
        // No registration at all → go to programs
        if (err instanceof Error && err?.message?.toLowerCase().includes("no registration")) {
          router.replace("/dashboard/programs");
          return;
        }
        setError(
          err instanceof Error ? err.message : "Failed to load dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [router]);

  // Export Receipt as PDF via standard print document
  const handleExportPDF = () => {
    if (!registration || !registration.payment) return;

    setExportingPdf(true);

    const studentName = registration.student 
      ? `${registration.student.first_name} ${registration.student.last_name}`
      : "Student";
    
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      setExportingPdf(false);
      alert("Please allow popups to export the payment receipt.");
      return;
    }

    const receiptHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payment Receipt - ${registration.registration_number}</title>
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
            .footer { border-top: 1px solid #e2e8f0; pt: 20px; text-align: center; font-size: 11px; color: #94a3b8; margin-top: 40px; }
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
              <div style="font-size: 14px; font-weight: 700;">${new Date().toLocaleDateString()}</div>
            </div>
          </div>

          <div class="section-title">Student & Registration Info</div>
          <div class="grid">
            <div>
              <div class="field-label">Student Name</div>
              <div class="field-value">${studentName}</div>
            </div>
            <div>
              <div class="field-label">Registration Number</div>
              <div class="field-value">${registration.registration_number}</div>
            </div>
            <div>
              <div class="field-label">Enrolled Program</div>
              <div class="field-value">${registration.program.name}</div>
            </div>
            <div>
              <div class="field-label">Registration Status</div>
              <div class="field-value" style="color: #0284c7;">CLEARED & REGISTERED</div>
            </div>
          </div>

          <div class="section-title">Payment Transaction Breakdown</div>
          <div class="grid">
            <div>
              <div class="field-label">Payment Method</div>
              <div class="field-value" style="text-transform: capitalize;">${registration.payment.payment_method}</div>
            </div>
            <div>
              <div class="field-label">Transaction Reference</div>
              <div class="field-value">${registration.payment.transaction_reference || "N/A"}</div>
            </div>
          </div>

          <div class="amount-box">
            <div class="amount-title">Total Amount Paid</div>
            <div class="amount-value">${Number(registration.payment.amount).toLocaleString()} ETB</div>
            <div class="stamp">✓ Payment Verified & Approved</div>
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

  // Helper for Status Badge Styling
  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase();
    if (s === "approved" || s === "paid" || s === "completed" || s === "registered") {
      return (
        <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border border-emerald-200/50 dark:bg-emerald-950/50 dark:text-emerald-400">
          <CheckCircle2 className="mr-1 h-3.5 w-3.5 text-emerald-600" />
          {status}
        </Badge>
      );
    }
    if (s === "pending" || s === "under_review") {
      return (
        <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border border-amber-200/50 dark:bg-amber-950/50 dark:text-amber-400">
          <Clock className="mr-1 h-3.5 w-3.5 text-amber-600" />
          {status}
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="border-border/60 text-muted-foreground">
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <header className="border-b bg-card/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <Skeleton className="h-8 w-36" />
            <Skeleton className="h-9 w-24" />
          </div>
        </header>
        <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8 space-y-6">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Page Title Bar */}
      <header className="sticky top-0 z-20 border-b bg-card/80 backdrop-blur-md hidden lg:block">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
          <span className="text-lg font-bold tracking-tight">
            Student Overview
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 pt-4 pb-6 sm:py-8 space-y-6 sm:space-y-8">
        
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-600 p-5 sm:p-8 text-white shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <Badge variant="secondary" className="bg-white/20 text-white border-none text-[10px] sm:text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="h-3 w-3 mr-1" /> Student Academic Portal
              </Badge>
              <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight">
                Welcome back{registration?.student ? `, ${registration.student.first_name} ${registration.student.last_name}` : ""}!
              </h2>
              <p className="text-xs sm:text-sm text-white/90 max-w-xl">
                Manage your academic registration clearances, verify payment statuses, and review active class timetables.
              </p>
            </div>
            {registration && (
              <Badge className="self-start md:self-center border-white/20 bg-white/15 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-mono font-bold text-white backdrop-blur-md shadow-sm">
                Reg #: {registration.registration_number}
              </Badge>
            )}
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs sm:text-sm font-medium text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-400">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Responsive Dashboard Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          
          {/* Card 1: Registration Overview */}
          <Card className="border-border/60 shadow-sm backdrop-blur-md lg:col-span-2">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold">My Registration</CardTitle>
                  <CardDescription className="text-xs">Your enrolled certificate program details</CardDescription>
                </div>
              </div>
              {registration && getStatusBadge(registration.status)}
            </CardHeader>

            <CardContent className="pt-6">
              {!registration ? (
                <div className="flex flex-col items-center justify-center text-center py-6 sm:py-8 space-y-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-base">No active registration found</p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-xs">Choose a program from our course catalog to start your registration application.</p>
                  </div>
                  <Button
                    onClick={() => router.push("/dashboard/programs")}
                    className="bg-blue-400 hover:bg-blue-500 font-medium text-white shadow-sm"
                  >
                    Choose Program
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Program Name</p>
                    <p className="text-sm sm:text-base font-bold">
                      {registration.program.name}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Program Fee</p>
                    <p className="text-sm sm:text-base font-bold text-emerald-600 dark:text-emerald-400">
                      {Number(registration.program.fee).toLocaleString()} ETB
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Registration Number</p>
                    <p className="text-xs sm:text-sm font-mono bg-muted px-2 py-1 rounded inline-block">
                      {registration.registration_number}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Registration Status</p>
                    <p className="text-xs sm:text-sm font-semibold capitalize text-primary">
                      {registration.status}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card 2: Payment Status */}
          <Card className="border-border/60 shadow-sm backdrop-blur-md">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold">Payment Status</CardTitle>
                  <CardDescription className="text-xs">Fee transaction audit</CardDescription>
                </div>
              </div>

              {/* PDF Export Button */}
              {registration?.payment?.status === "APPROVED" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportPDF}
                  disabled={exportingPdf}
                  className="w-full sm:w-auto gap-1.5 text-xs font-semibold text-blue-500 border-blue-200 hover:bg-blue-50 dark:border-blue-900/50 dark:hover:bg-blue-950/30"
                >
                  {exportingPdf ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <FileDown className="h-3.5 w-3.5" />
                  )}
                  Export Receipt
                </Button>
              )}
            </CardHeader>

            <CardContent className="pt-6">
              {!registration ? (
                <p className="text-xs text-muted-foreground">Complete registration first to view payments.</p>
              ) : registration.payment ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-xs font-medium text-muted-foreground">Amount Paid</span>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      {Number(registration.payment.amount).toLocaleString()} ETB
                    </span>
                  </div>

                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-xs font-medium text-muted-foreground">Payment Method</span>
                    <span className="text-sm font-medium capitalize">
                      {registration.payment.payment_method}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-1">
                    <span className="text-xs font-medium text-muted-foreground">Status</span>
                    {getStatusBadge(registration.payment.status)}
                  </div>
                </div>
              ) : (
                <div className="space-y-4 py-2">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    No payment receipt submitted for this registration yet. Please upload your transfer slip to proceed.
                  </p>
                  <Button
                    onClick={() => router.push("/dashboard/payment")}
                    className="w-full bg-blue-400 hover:bg-blue-500 font-medium text-white shadow-sm"
                  >
                    <DollarSign className="mr-1.5 h-4 w-4" />
                    Make Payment
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card 3: Class Schedule */}
          <Card className="border-border/60 shadow-sm backdrop-blur-md lg:col-span-3">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold">Class Schedule & Timetable</CardTitle>
                  <CardDescription className="text-xs">Assigned session details and location</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-6">
              {schedule ? (
                <div className="space-y-6">
                  <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-3">
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/40">
                      <Calendar className="h-5 w-5 text-blue-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Start Date</p>
                        <p className="text-sm font-bold mt-0.5">
                          {schedule.class_start_date}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/40">
                      <Clock className="h-5 w-5 text-blue-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Start Time</p>
                        <p className="text-sm font-bold mt-0.5">
                          {schedule.class_start_time || "Not specified"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/40">
                      <MapPin className="h-5 w-5 text-blue-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Location / Room</p>
                        <p className="text-sm font-bold mt-0.5">
                          {schedule.location || "Not specified"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {schedule.message && (
                    <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 text-xs font-medium text-slate-700 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-slate-300">
                      <strong className="text-blue-500 font-bold">Instructor Notice: </strong>
                      {schedule.message}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3 text-sm text-muted-foreground py-4">
                  <Clock className="h-5 w-5 text-muted-foreground/60 shrink-0" />
                  <span>Your class schedule has not been assigned yet. Check back once your payment is reviewed and approved.</span>
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </main>
  );
}