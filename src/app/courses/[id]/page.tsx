"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getPrograms, Program } from "@/services/programservices";
import { createRegistration } from "@/services/registrationservices";
import { getToken } from "@/lib/auth";
import { getProgramImageUrl } from "@/lib/program-image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  GraduationCap,
  Loader2,
  Users,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Static content                                                      */
/* ------------------------------------------------------------------ */

const OUTCOMES: { keywords: string[]; items: string[] }[] = [
  {
    keywords: ["camera", "photography"],
    items: [
      "Photography",
      "Videography",
      "Video editing",
      "Photo editing",
      "Studio lighting",
      "Visual storytelling",
    ],
  },
  {
    keywords: ["fashion", "design"],
    items: [
      "Sketching",
      "Color theory",
      "Pattern making",
      "Sewing",
      "Garment construction",
      "Building a fashion portfolio",
    ],
  },
  {
    keywords: ["mobile", "maintenance"],
    items: [
      "Hardware maintenance",
      "Software maintenance",
      "Handling customers",
      "Saving money on repairs",
      "Diagnostic techniques",
      "Setting up a repair business",
    ],
  },
];

const DEFAULT_OUTCOMES = [
  "Practical hands-on training",
  "Industry-standard techniques",
  "Real-world project experience",
  "Professional portfolio development",
  "Career guidance and support",
  "Certificate on completion",
];

function getLearningOutcomes(programName: string): string[] {
  const name = programName.toLowerCase();
  const match = OUTCOMES.find((o) => o.keywords.some((k) => name.includes(k)));
  return match ? match.items : DEFAULT_OUTCOMES;
}

const STAGES = [
  {
    title: "Foundation skills",
    text: "Learn the fundamentals and core concepts you'll build on.",
  },
  {
    title: "Advanced techniques",
    text: "Move on to professional-level skills and methods.",
  },
  {
    title: "Practical projects",
    text: "Apply everything on real projects for your portfolio.",
  },
];

const PERKS = [
  "100% practical training",
  "Industry expert instructors",
  "Hands-on projects",
  "Career support",
  "Recognized certificate",
];

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const programId = Number(params.id);

  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [enrollError, setEnrollError] = useState("");
  const [enrolling, setEnrolling] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    if (!programId) {
      setLoadError("Invalid program");
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadProgram = async () => {
      try {
        // Public catalog: fetched without a token so the proxy cache applies
        const programs = await getPrograms();
        if (cancelled) return;

        const found = programs.find((p) => p.id === programId) ?? null;
        if (!found) {
          setLoadError("Program not found");
          return;
        }
        setProgram(found);
      } catch (err) {
        if (cancelled) return;
        setLoadError(
          err instanceof Error ? err.message : "Failed to load program."
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadProgram();
    return () => {
      cancelled = true;
    };
  }, [programId]);

  /* ---------------------------- Loading ---------------------------- */

  if (loading) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
          <Skeleton className="h-5 w-40" />
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            <div className="space-y-8">
              <Skeleton className="h-[320px] w-full rounded-3xl sm:h-[420px]" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-56 w-full rounded-3xl" />
            </div>
            <Skeleton className="hidden h-[420px] w-full rounded-3xl lg:block" />
          </div>
        </div>
      </main>
    );
  }

  /* ----------------------------- Error ----------------------------- */

  if (loadError || !program) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground">
        <Card className="w-full max-w-md rounded-3xl">
          <CardContent className="flex flex-col items-center space-y-4 py-14 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <GraduationCap className="h-8 w-8" aria-hidden="true" />
            </div>
            <h1 className="text-xl font-bold">Program not found</h1>
            <p className="text-sm text-muted-foreground">
              {loadError || "The program you're looking for doesn't exist."}
            </p>
            <Link
              href="/#programs"
              className="mt-2 inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Browse all programs
            </Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  /* ----------------------------- Derived ---------------------------- */

  const learningOutcomes = getLearningOutcomes(program.name);
  const imageUrl = getProgramImageUrl(program.name);
  const showImage = Boolean(imageUrl) && !imageFailed;

  const fee = Number(program.monthly_fee);
  const priceLabel = Number.isFinite(fee)
    ? `${fee.toLocaleString()} ETB`
    : "Contact us";
  const duration = program.duration || "Self-paced";

  const handleEnroll = async () => {
    const token = getToken();

    if (!token) {
      router.push("/register");
      return;
    }

    try {
      setEnrolling(true);
      setEnrollError("");

      // Creates the registration with DRAFT status
      await createRegistration(programId, token);

      router.push("/dashboard/payment");
    } catch (err) {
      setEnrollError(
        err instanceof Error ? err.message : "Failed to enroll in program."
      );
      setEnrolling(false);
    }
  };

  const enrollButton = (
    <Button
      onClick={handleEnroll}
      disabled={enrolling}
      size="lg"
      className="h-12 w-full gap-2 rounded-xl bg-blue-600 font-semibold text-white shadow-md shadow-blue-600/20 transition-colors hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
    >
      {enrolling ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Enrolling...
        </>
      ) : (
        <>
          Enroll now
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </>
      )}
    </Button>
  );

  const errorNote = enrollError ? (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-xl border border-rose-200/70 bg-rose-50 p-3 text-sm font-medium text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-400"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{enrollError}</span>
    </div>
  ) : null;

  /* ------------------------------ View ------------------------------ */

  return (
    <main className="min-h-screen bg-background pb-28 text-foreground selection:bg-blue-600 selection:text-white lg:pb-0">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/85 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5">
          <Link
            href="/#programs"
            className="group inline-flex items-center gap-2 rounded-md text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <ArrowLeft
              className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
              aria-hidden="true"
            />
            All programs
          </Link>
          <span className="hidden max-w-[50%] truncate text-sm font-semibold sm:block">
            {program.name}
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8 lg:py-10">
        <div className="grid gap-10 lg:grid-cols-[1fr_380px] lg:gap-12">
          {/* ------------------------ Main column ------------------------ */}
          <div className="min-w-0 space-y-12">
            {/* Hero */}
            <section
              aria-labelledby="program-title"
              className="motion-safe:animate-in motion-safe:fade-in motion-safe:duration-500"
            >
              <div className="relative isolate h-[320px] w-full overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-950 sm:h-[420px]">
                {showImage ? (
                  <Image
                    src={imageUrl as string}
                    alt=""
                    fill
                    priority
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    onError={() => setImageFailed(true)}
                  />
                ) : (
                  <GraduationCap
                    className="absolute right-8 top-8 h-40 w-40 text-white/10"
                    aria-hidden="true"
                  />
                )}

                {/* Legibility scrim for the title */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                  <h1
                    id="program-title"
                    className="max-w-2xl text-balance text-3xl font-black leading-tight tracking-tight text-white sm:text-5xl"
                  >
                    {program.name}
                  </h1>

                  <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium text-white/90">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-4 w-4" aria-hidden="true" />
                      {duration}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Award className="h-4 w-4" aria-hidden="true" />
                      Certificate on completion
                    </span>
                  </div>
                </div>
              </div>

              <p className="mt-6 max-w-prose text-lg leading-relaxed text-muted-foreground">
                {program.description ||
                  "Practical, career-focused training designed to build real-world skills."}
              </p>
            </section>

            {/* What you'll learn */}
            <section aria-labelledby="learn-title">
              <h2
                id="learn-title"
                className="text-2xl font-bold tracking-tight"
              >
                What you&apos;ll learn
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Core skills you&apos;ll leave with
              </p>

              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {learningOutcomes.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card px-4 py-3.5"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                      <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="text-sm font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* How the course works: a real sequence, so numbered */}
            <section aria-labelledby="structure-title">
              <h2
                id="structure-title"
                className="text-2xl font-bold tracking-tight"
              >
                How the course works
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Three stages, from basics to real projects
              </p>

              <ol className="relative mt-8 space-y-8 before:absolute before:bottom-2 before:left-[17px] before:top-2 before:w-px before:bg-border">
                {STAGES.map((stage, index) => (
                  <li key={stage.title} className="relative pl-14">
                    <span className="absolute left-0 top-0 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white ring-4 ring-background">
                      {index + 1}
                    </span>
                    <h3 className="font-semibold leading-9">{stage.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {stage.text}
                    </p>
                  </li>
                ))}
              </ol>
            </section>
          </div>

          {/* -------------------------- Sidebar -------------------------- */}
          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <Card className="rounded-3xl border-border/60 shadow-lg shadow-blue-600/5">
              <CardContent className="space-y-6 p-6">
                <div>
                  <p className="text-sm text-muted-foreground">Monthly fee</p>
                  <p className="mt-1 text-4xl font-black tracking-tight">
                    {priceLabel}
                  </p>
                </div>

                <ul className="space-y-3 border-t border-border/50 pt-5 text-sm">
                  <li className="flex items-center gap-3">
                    <Clock
                      className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400"
                      aria-hidden="true"
                    />
                    <span>
                      Duration:{" "}
                      <span className="font-semibold">{duration}</span>
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Users
                      className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400"
                      aria-hidden="true"
                    />
                    <span className="font-semibold">Small class sizes</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Calendar
                      className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400"
                      aria-hidden="true"
                    />
                    <span className="font-semibold">Flexible schedules</span>
                  </li>
                </ul>

                {/* Desktop-only: mobile uses the sticky bar below */}
                <div className="hidden space-y-3 lg:block">
                  {errorNote}
                  {enrollButton}
                  <p className="text-center text-xs text-muted-foreground">
                    You&apos;ll confirm payment on the next step.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="px-2">
              <h2 className="font-semibold">Why this program</h2>
              <ul className="mt-3 space-y-2.5">
                {PERKS.map((perk) => (
                  <li
                    key={perk}
                    className="flex items-start gap-2.5 text-sm text-muted-foreground"
                  >
                    <CheckCircle2
                      className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400"
                      aria-hidden="true"
                    />
                    {perk}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile enroll bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] pt-3 backdrop-blur-lg lg:hidden">
        <div className="mx-auto max-w-6xl space-y-2">
          {errorNote}
          <div className="flex items-center gap-4">
            <div className="shrink-0">
              <p className="text-lg font-black leading-none">{priceLabel}</p>
              <p className="mt-1 text-xs text-muted-foreground">per month</p>
            </div>
            <div className="flex-1">{enrollButton}</div>
          </div>
        </div>
      </div>
    </main>
  );
}