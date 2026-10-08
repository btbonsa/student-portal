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

  // Helper for Status Badge Styling
  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase();
    if (s === "approved" || s === "paid" || s === "completed") {
      return (
        <Badge className="bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400">
          <CheckCircle2 className="mr-1 h-3.5 w-3.5 text-emerald-600" />
          {status}
        </Badge>
      );
    }
    if (s === "pending" || s === "under_review") {
      return (
        <Badge className="bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400">
          <Clock className="mr-1 h-3.5 w-3.5 text-amber-600" />
          {status}
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="border-slate-300 dark:border-slate-700">
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 pl-16 lg:pl-4">
            <Skeleton className="h-8 w-36" />
            <Skeleton className="h-9 w-24" />
          </div>
        </header>
        <div className="mx-auto max-w-6xl px-4 py-8 space-y-6 pl-16 lg:pl-4">
          <Skeleton className="h-12 w-64" />
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50/50 dark:bg-slate-950">
      {/* Top Header */}
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80 lg:top-0">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 pl-16 lg:pl-4">
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Overview
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8 space-y-8 pl-16 lg:pl-4">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 p-6 text-white shadow-xl dark:border-slate-800">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-200">
              Academic Dashboard
            </p>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Welcome back{registration?.student ? `, ${registration.student.first_name} ${registration.student.last_name}` : ""}!
            </h2>
            <p className="text-sm text-blue-100/90">
              Manage your academic registration, check payments, and review schedules.
            </p>
          </div>
          {registration && (
            <Badge className="self-start md:self-center border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md">
              Reg #: {registration.registration_number}
            </Badge>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-red-200/80 bg-red-50 p-4 text-sm font-medium text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Dashboard Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Card 1: Registration Overview */}
          <Card className="border-slate-200/80 bg-white/90 shadow-md backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90 lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">My Registration</CardTitle>
                  <CardDescription className="text-xs">Your enrolled program details</CardDescription>
                </div>
              </div>
              {registration && getStatusBadge(registration.status)}
            </CardHeader>

            <CardContent className="pt-6">
              {!registration ? (
                <div className="flex flex-col items-center justify-center text-center py-6 space-y-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">No active registration found</p>
                    <p className="text-xs text-slate-500 mt-1">Choose a program to start your registration.</p>
                  </div>
                  <Button
                    onClick={() => router.push("/dashboard/programs")}
                    className="bg-blue-600 font-medium text-white hover:bg-blue-700"
                  >
                    Choose Program
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-slate-500">Program Name</p>
                    <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
                      {registration.program.name}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-medium text-slate-500">Program Fee</p>
                    <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
                      {Number(registration.program.fee).toLocaleString()} ETB
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-medium text-slate-500">Registration Number</p>
                    <p className="text-base font-medium text-slate-800 dark:text-slate-200">
                      {registration.registration_number}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-medium text-slate-500">Registration Status</p>
                    <p className="text-base font-medium text-slate-800 dark:text-slate-200 capitalize">
                      {registration.status}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card 2: Payment Status */}
          <Card className="border-slate-200/80 bg-white/90 shadow-md backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">Payment</CardTitle>
                  <CardDescription className="text-xs">Fee transaction summary</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-6">
              {!registration ? (
                <p className="text-xs text-slate-500">Complete registration first to view payments.</p>
              ) : registration.payment ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-medium text-slate-500">Amount Paid</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {Number(registration.payment.amount).toLocaleString()} ETB
                    </span>
                  </div>

                  <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-medium text-slate-500">Method</span>
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200 capitalize">
                      {registration.payment.payment_method}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-slate-500">Payment Status</span>
                    {getStatusBadge(registration.payment.status)}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-slate-500 leading-relaxed">
                    No payment submitted for this registration yet.
                  </p>
                  <Button
                    onClick={() => router.push("/dashboard/payment")}
                    className="w-full bg-blue-600 font-medium text-white hover:bg-blue-700"
                  >
                    <DollarSign className="mr-1.5 h-4 w-4" />
                    Make Payment
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card 3: Class Schedule */}
          <Card className="border-slate-200/80 bg-white/90 shadow-md backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90 lg:col-span-3">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">Class Schedule</CardTitle>
                  <CardDescription className="text-xs">Timetable & location notice</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-6">
              {schedule ? (
                <div className="space-y-6">
                  <div className="grid gap-6 sm:grid-cols-3">
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-slate-500">Start Date</p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {schedule.class_start_date}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-slate-500">Start Time</p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {schedule.class_start_time || "Not specified"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-slate-500">Location / Room</p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {schedule.location || "Not specified"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {schedule.message && (
                    <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 text-xs font-medium text-slate-700 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-slate-300">
                      <strong className="text-blue-700 dark:text-blue-400">Instructor Note: </strong>
                      {schedule.message}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3 text-sm text-slate-500 py-2">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <span>Your class schedule has not been assigned yet. Check back after payment approval.</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}