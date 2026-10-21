"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getToken } from "@/lib/auth";
import { getPrograms, Program } from "../../../services/programservices";
import { createRegistration } from "../../../services/registrationservices";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  GraduationCap,
  Clock,
  DollarSign,
  Loader2,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";

export default function ProgramsPage() {
  const router = useRouter();

  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPrograms = async () => {
      const token = getToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const data = await getPrograms();
        setPrograms(data || []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load programs."
        );
      } finally {
        setLoading(false);
      }
    };

    loadPrograms();
  }, [router]);

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
      setError(
        err instanceof Error ? err.message : "Failed to select program."
      );
      setSelecting(null);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
        <div className="w-full max-w-6xl space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-80 w-full rounded-3xl" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground relative selection:bg-blue-400 selection:text-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:py-12 space-y-8">
        
        {/* Header */}
        <div className="space-y-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground font-medium transition-colors group cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
            Back to Dashboard
          </button>

          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Choose Your Program
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Select any program card below to enroll and proceed to registration.
            </p>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-400">
            {error}
          </div>
        )}

        {programs.length === 0 ? (
          <Card className="border-dashed shadow-none rounded-3xl">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <GraduationCap className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-base">No Programs Available</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                There are currently no active certificate programs open for enrollment. Please check back later.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {programs.map((program) => {
              const isSelected = selecting === program.id;

              return (
                <Card
                  key={program.id}
                  onClick={() => handleSelectProgram(program.id)}
                  tabIndex={0}
                  role="button"
                  aria-label={`Enroll in ${program.name}`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleSelectProgram(program.id);
                    }
                  }}
                  className={`group relative flex flex-col justify-between cursor-pointer overflow-hidden rounded-3xl border-border/60 bg-card shadow-md transition-all duration-500 hover:-translate-y-2 hover:border-blue-400/60 hover:shadow-2xl hover:shadow-blue-400/15 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    isSelected ? "ring-2 ring-blue-400 border-transparent shadow-xl" : ""
                  }`}
                >
                  {/* Loading overlay */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-background/85 backdrop-blur-sm z-30 flex flex-col items-center justify-center space-y-3 animate-in fade-in duration-200">
                      <Loader2 className="h-9 w-9 animate-spin text-blue-400" />
                      <p className="text-sm font-bold tracking-wide">Enrolling you in program...</p>
                    </div>
                  )}

                  <div className="flex flex-col h-full justify-between">
                    {/* Image Container with Title & Badges */}
                    <div className="relative h-56 w-full overflow-hidden bg-gradient-to-br from-blue-900/20 to-indigo-900/30">
                      {program.fee ? (
                        <Image
                          src={program.fee}
                          alt={program.name}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          onError={(e) => {
                            const fallback = e.currentTarget.parentElement?.querySelector('.fallback-icon') as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : null}

                      {/* Fallback Icon */}
                      <div className={`absolute inset-0 flex items-center justify-center fallback-icon ${program.fee ? 'hidden' : 'flex'}`}>
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-400/10 text-blue-400">
                          <GraduationCap className="h-8 w-8" />
                        </div>
                      </div>

                      {/* Gradient Overlay for Text Visibility */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

                      {/* Active Status Badge & Quick Enroll Arrow */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                        <Badge className="bg-black/40 backdrop-blur-md text-white font-medium border border-white/10 shadow-sm gap-1">
                          <Sparkles className="h-3 w-3 text-blue-400" />
                          Active Course
                        </Badge>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white transition-all duration-300 group-hover:bg-blue-400 group-hover:scale-110">
                          <ArrowUpRight className="h-4 w-4" />
                        </div>
                      </div>

                      {/* Program Title directly over bottom of the image */}
                      <div className="absolute bottom-3 left-4 right-4 z-10">
                        <h3 className="text-lg font-bold text-white tracking-tight line-clamp-2 drop-shadow-sm group-hover:text-blue-300 transition-colors">
                          {program.name}
                        </h3>
                      </div>

                      {/* Animated Hover/Touch Details (Duration & Fee) */}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/95 via-slate-950/90 to-transparent p-4 pt-8 text-white z-20 translate-y-full group-hover:translate-y-0 group-focus:translate-y-0 transition-transform duration-300 ease-out flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
                          <Clock className="h-3.5 w-3.5 text-blue-400" />
                          <span>{program.duration || "Self-paced"}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm font-bold text-emerald-400">
                          <DollarSign className="h-4 w-4" />
                          <span>{Number(program.monthly_fee).toLocaleString()} ETB / mo</span>
                        </div>
                      </div>
                    </div>

                    {/* Description Below Card Image */}
                    <CardContent className="p-5 flex-1 flex flex-col justify-between">
                      <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3">
                        {program.description ||
                          "Practical, career-focused training program designed for real-world skill mastery."}
                      </p>

                      {/* Tap/Click visual hint */}
                      <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground group-hover:text-blue-400 font-medium transition-colors">
                        <span>Tap anywhere to enroll</span>
                        <span className="font-bold">→</span>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

      </div>
    </main>
  );
}