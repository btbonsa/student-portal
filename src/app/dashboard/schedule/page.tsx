"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";
import { getMyClassSchedule } from "../../../services/classScheduleservice";
import type { ClassSchedule } from "../../../services/classScheduleservice";

export default function SchedulePage() {
  const router = useRouter();
  const [schedule, setSchedule] = useState<ClassSchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const loadSchedule = useCallback(async () => {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    setLoading(true);
    setError("");
    try {
      setSchedule(await getMyClassSchedule(token));
    } catch (err) {
      setSchedule(null);
      setError(err instanceof Error ? err.message : "We couldn't load your schedule.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadSchedule();
  }, [loadSchedule, refreshKey]);

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <div className="mx-auto max-w-6xl px-4 py-10 pl-16 lg:pl-4 sm:py-14">
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[.18em] text-green-900/60">Student portal</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">My class schedule</h1>
            <p className="mt-3 text-slate-600">Keep track of where and when your classes begin.</p>
          </div>
          <button
            type="button"
            onClick={() => setRefreshKey((key) => key + 1)}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-blue-400/50 hover:text-green-900 disabled:cursor-wait disabled:opacity-60 sm:self-auto"
          >
            <span aria-hidden="true" className={loading ? "animate-spin" : ""}>↻</span>
            {loading ? "Refreshing…" : "Refresh schedule"}
          </button>
        </div>

        {error && (
          <div role="alert" className="mb-6 flex flex-col justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800 sm:flex-row sm:items-center">
            <p className="text-sm">{error}</p>
            <button onClick={() => setRefreshKey((key) => key + 1)} className="self-start rounded-lg bg-white px-4 py-2 text-sm font-bold text-red-700 shadow-sm transition hover:bg-red-100 sm:self-auto">Try again</button>
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-slate-200/80 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-blue-400/20 border-t-blue-400" />
            <p className="mt-4 text-sm font-medium text-slate-600">Loading your schedule…</p>
          </div>
        ) : schedule ? (
          <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition-shadow hover:shadow-lg" aria-label="Assigned class schedule">
            <div className="bg-green-900/60 px-6 py-7 text-white sm:px-9">
              <p className="text-sm font-semibold text-blue-100">Registration {schedule.registration_number}</p>
              <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">You’re on your way.</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/80">Your class details are ready. Keep this information handy before your first day.</p>
            </div>
            <div className="grid gap-px bg-slate-100 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-white p-6 sm:p-8">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-400/10 text-xl text-blue-500" aria-hidden="true">◷</span>
                <p className="mt-5 text-sm font-semibold text-slate-500">Start date</p>
                <p className="mt-1 text-lg font-bold text-slate-900">{schedule.class_start_date}</p>
              </div>
              <div className="bg-white p-6 sm:p-8">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-400/10 text-xl text-blue-500" aria-hidden="true">◴</span>
                <p className="mt-5 text-sm font-semibold text-slate-500">Start time</p>
                <p className="mt-1 text-lg font-bold text-slate-900">{schedule.class_start_time || "To be announced"}</p>
              </div>
              <div className="bg-white p-6 sm:col-span-2 sm:p-8 lg:col-span-1">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-400/10 text-xl text-blue-500" aria-hidden="true">⌖</span>
                <p className="mt-5 text-sm font-semibold text-slate-500">Location</p>
                <p className="mt-1 text-lg font-bold text-slate-900">{schedule.location || "To be announced"}</p>
              </div>
            </div>
            {schedule.message && <div className="border-t border-slate-100 bg-blue-400/5 px-6 py-5 text-sm leading-6 text-slate-700 sm:px-8">{schedule.message}</div>}
          </section>
        ) : (
          <section className="rounded-3xl border border-slate-200/80 bg-white px-6 py-14 text-center shadow-sm sm:px-12">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-blue-400/10 text-3xl text-blue-500" aria-hidden="true">◷</div>
            <h2 className="mt-5 text-xl font-extrabold text-slate-900">Your schedule is on its way</h2>
            <p className="mx-auto mt-2 max-w-lg leading-7 text-slate-600">Your class schedule hasn’t been assigned yet. Check back later, or view your registration details in the dashboard.</p>
            <Link href="/dashboard" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-400 px-5 py-3 font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-green-900/60">Go to dashboard <span aria-hidden="true">→</span></Link>
          </section>
        )}
      </div>
    </main>
  );
}
