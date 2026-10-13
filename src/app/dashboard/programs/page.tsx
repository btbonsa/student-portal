"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";
import { getPrograms, Program } from "../../../services/programservices";
import { createRegistration } from "../../../services/registrationservices";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, GraduationCap, Clock, DollarSign, Loader2, ArrowRight } from "lucide-react";

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
          err instanceof Error
            ? err.message
            : "Failed to load programs."
        );
      } finally {
        setLoading(false);
      }
    };

    loadPrograms();
  }, [router]);

  const handleSelectProgram = async (programId: number) => {
    const token = getToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      setError("");
      setSelecting(programId);

      await createRegistration(programId, token);
      router.push("/dashboard/payment");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to select program."
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
              <Skeleton key={i} className="h-72 w-full rounded-2xl" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:py-12 space-y-8">
        
        {/* Navigation & Header */}
        <div className="space-y-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard")}
            className="gap-2 text-muted-foreground hover:text-foreground p-0 h-auto font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>

          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Choose Your Program
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Select the certificate program you want to enroll in to proceed with your academic registration.
            </p>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-400">
            {error}
          </div>
        )}

        {programs.length === 0 ? (
          <Card className="border-dashed shadow-none">
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
            {programs.map((program) => (
              <Card
                key={program.id}
                className="group flex flex-col justify-between border-border/60 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-blue-400 hover:shadow-xl"
              >
                <div>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-400/10 text-blue-400 font-bold">
                        <GraduationCap className="h-6 w-6" />
                      </div>
                      <Badge variant="outline" className="font-mono text-xs text-muted-foreground">
                        Active Course
                      </Badge>
                    </div>
                    <CardTitle className="text-xl font-bold tracking-tight">
                      {program.name}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-4 pb-4">
                    <CardDescription className="text-sm leading-relaxed text-muted-foreground min-h-[48px]">
                      {program.description || "Practical, career-focused training program designed for real-world skill mastery."}
                    </CardDescription>

                    <div className="space-y-2.5 pt-4 border-t text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-blue-400" /> Duration
                        </span>
                        <span className="font-semibold">
                          {program.duration || "Not specified"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <DollarSign className="h-3.5 w-3.5 text-emerald-500" /> Mothly fee
                        </span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 text-base">
                          {Number(program.fee).toLocaleString()} ETB
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </div>

                <CardFooter className="pt-2">
                  <Button
                    onClick={() => handleSelectProgram(program.id)}
                    disabled={selecting === program.id}
                    className="w-full bg-blue-400 hover:bg-blue-500 text-white font-bold h-11 gap-2 shadow-sm"
                  >
                    {selecting === program.id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Enrolling...
                      </>
                    ) : (
                      <>
                        Select Program
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}