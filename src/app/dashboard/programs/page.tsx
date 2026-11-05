"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getToken } from "@/lib/auth";
import { getProgramImageUrl } from "@/lib/program-image";
import { getPrograms, Program } from "../../../services/programservices";
import { createRegistration } from "../../../services/registrationservices";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Banknote,
  Clock,
  GraduationCap,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";

function formatFee(value: unknown) {
  const fee = Number(value);
  return Number.isFinite(fee) && fee > 0 ? `${fee.toLocaleString()} ETB` : null;
}

function ProgramImage({ src, alt }: { src: string | null | undefined; alt: string }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-sky-300 ring-1 ring-white/15">
          <GraduationCap className="h-8 w-8" aria-hidden />
        </div>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className="object-cover transition-transform duration-700 group-hover:scale-110 motion-reduce:transition-none"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      onError={() => setFailed(true)}
    />
  );
}

export default function ProgramsPage() {
  const router = useRouter();

  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState<number | null>(null);
  const [error, setError] = useState("");

  const loadPrograms = useCallback(async () => {
    const token = getToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      setError("");
      setLoading(true);
      const data = await getPrograms(token);
      setPrograms(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load programs.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadPrograms();
  }, [loadPrograms]);

  const handleSelectProgram = async (programId: number) => {
    if (selecting !== null) return;

    const token = getToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      setError("");
      setSelecting(programId);

      // Create registration with DRAFT status
      await createRegistration(programId, token);

      // Navigate to payment page
      router.push("/dashboard/payment");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to select program.");
      setSelecting(null);
    }
  };

  /* ------------------------------- Loading ------------------------------- */

  if (loading) {
    return (
      <main
        role="status"
        aria-busy="true"
        aria-label="Loading programs"
        className="min-h-[100dvh] bg-gradient-to-b from-sky-50/70 via-background to-background p-4 text-foreground sm:p-6 dark:from-slate-950"
      >
        <div className="mx-auto w-full max-w-6xl space-y-6 py-6">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-10 w-72 max-w-full" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-96 w-full rounded-3xl" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  /* -------------------------------- Page -------------------------------- */

  return (
    <main className="relative min-h-[100dvh] bg-gradient-to-b from-sky-50/70 via-background to-background text-foreground selection:bg-sky-500 selection:text-white dark:from-slate-950">
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700 sm:py-12">
        {/* Header */}
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="group inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-500"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
            Back to Dashboard
          </button>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                Choose Your{" "}
                <span className="bg-gradient-to-r from-sky-500 to-blue-700 bg-clip-text text-transparent">
                  Program
                </span>
              </h1>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                Pick the certificate program you want. You will continue to
                payment right after.
              </p>
            </div>
            {programs.length > 0 && (
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3.5 py-1.5 text-xs font-semibold text-sky-700 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-300">
                <GraduationCap className="h-4 w-4" aria-hidden />
                {programs.length} {programs.length === 1 ? "program" : "programs"} open
              </span>
            )}
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700 animate-in fade-in slide-in-from-top-2 duration-300 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-400"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span className="flex-1">{error}</span>
            {programs.length === 0 && (
              <button
                type="button"
                onClick={() => void loadPrograms()}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-bold underline-offset-4 hover:underline"
              >
                <RefreshCw className="h-3.5 w-3.5" aria-hidden />
                Retry
              </button>
            )}
          </div>
        )}

        {programs.length === 0 ? (
          <Card className="rounded-3xl border-dashed shadow-none">
            <CardContent className="flex flex-col items-center justify-center space-y-3 py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
                <GraduationCap className="h-7 w-7" aria-hidden />
              </div>
              <h3 className="text-base font-semibold">No Programs Available</h3>
              <p className="max-w-sm text-sm text-muted-foreground">
                There are currently no active certificate programs open for
                enrollment. Please check back later.
              </p>
            </CardContent>
          </Card>
        ) : (
          <ul
            aria-label="Available programs"
            aria-busy={selecting !== null}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {programs.map((program) => {
              const isSelected = selecting === program.id;
              const isDisabled = selecting !== null && !isSelected;
              const imageUrl = getProgramImageUrl(program.name);
              const fee = formatFee(program.monthly_fee);

              return (
                <li key={program.id} className="flex">
                  {/* The title button stretches over the card (after:absolute): one tab stop, whole card tappable. */}
                  <Card
                    className={`group relative flex w-full flex-col overflow-hidden rounded-3xl border-border/60 bg-card shadow-md transition-all duration-500 focus-within:ring-2 focus-within:ring-sky-500 focus-within:ring-offset-2 motion-reduce:transition-none ${
                      isSelected
                        ? "border-transparent shadow-xl ring-2 ring-sky-500"
                        : isDisabled
                        ? "pointer-events-none opacity-60"
                        : "hover:-translate-y-2 hover:border-sky-400/60 hover:shadow-2xl hover:shadow-sky-500/15 motion-reduce:hover:translate-y-0"
                    }`}
                  >
                    {/* Loading overlay */}
                    {isSelected && (
                      <div
                        role="status"
                        className="absolute inset-0 z-30 flex flex-col items-center justify-center space-y-3 bg-background/85 backdrop-blur-sm animate-in fade-in duration-200"
                      >
                        <Loader2 className="h-9 w-9 animate-spin text-sky-500" aria-hidden />
                        <p className="text-sm font-bold tracking-wide">
                          Enrolling you in program...
                        </p>
                      </div>
                    )}

                    {/* Image */}
                    <div className="relative h-52 w-full overflow-hidden bg-gradient-to-br from-[#06142e] to-blue-900 sm:h-56">
                      <ProgramImage src={imageUrl} alt="" />

                      <div className="absolute inset-0 bg-gradient-to-t from-[#06142e]/90 via-[#06142e]/30 to-[#06142e]/10" />

                      {/* Top row */}
                      <div className="absolute left-3 right-3 top-3 z-10 flex items-center justify-between">
                        <Badge className="gap-1 border border-white/15 bg-black/40 font-medium text-white shadow-sm backdrop-blur-md">
                          <Sparkles className="h-3 w-3 text-sky-300" aria-hidden />
                          Active Course
                        </Badge>
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:bg-sky-500">
                          <ArrowUpRight className="h-4 w-4" aria-hidden />
                        </div>
                      </div>

                      {/* Title + duration (always visible, works on touch) */}
                      <div className="absolute inset-x-4 bottom-4 z-10 space-y-2">
                        <h2 className="line-clamp-2 text-lg font-bold tracking-tight text-white drop-shadow-sm transition-colors group-hover:text-sky-200">
                          <button
                            type="button"
                            onClick={() => void handleSelectProgram(program.id)}
                            disabled={selecting !== null}
                            aria-label={`Enroll in ${program.name}`}
                            className="cursor-pointer text-left after:absolute after:inset-0 after:z-20 after:content-[''] focus:outline-none disabled:cursor-wait"
                          >
                            {program.name}
                          </button>
                        </h2>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-xs font-semibold text-slate-100 backdrop-blur-md">
                          <Clock className="h-3.5 w-3.5 text-sky-300" aria-hidden />
                          {program.duration || "Self-paced"}
                        </span>
                      </div>
                    </div>

                    {/* Body */}
                    <CardContent className="flex flex-1 flex-col justify-between gap-4 p-5">
                      <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                        {program.description ||
                          "Practical, career-focused training program designed for real-world skill mastery."}
                      </p>

                      <div className="space-y-3">
                        {fee && (
                          <div className="flex items-center gap-3 rounded-2xl border border-emerald-200/70 bg-emerald-500/5 p-3 dark:border-emerald-900/40">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                              <Banknote className="h-5 w-5" aria-hidden />
                            </span>
                            <div className="leading-tight">
                              <p className="text-base font-black text-emerald-700 dark:text-emerald-400">
                                {fee}
                              </p>
                              <p className="text-[11px] font-medium text-muted-foreground">
                                per month
                              </p>
                            </div>
                          </div>
                        )}

                        <div
                          aria-hidden
                          className="flex items-center justify-between border-t border-border/40 pt-3 text-xs font-bold text-muted-foreground transition-colors group-hover:text-sky-600 dark:group-hover:text-sky-400"
                        >
                          <span>Enroll in this program</span>
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}