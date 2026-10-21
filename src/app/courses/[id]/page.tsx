"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getPrograms, Program } from "@/services/programservices";
import { createRegistration } from "@/services/registrationservices";
import { getToken } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Clock,
  Loader2,
  Sparkles,
  CheckCircle2,
  GraduationCap,
  BookOpen,
  TrendingUp,
  Calendar,
  Users,
  Award,
  ArrowRight,
} from "lucide-react";

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const programId = Number(params.id);

  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    const loadProgram = async () => {
      try {
        const programs = await getPrograms();
        const foundProgram = programs.find((p) => Number(p.id) === programId);
        
        if (!foundProgram) {
          setError("Program not found");
          return;
        }
        
        setProgram(foundProgram);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load program."
        );
      } finally {
        setLoading(false);
      }
    };

    if (programId) {
      loadProgram();
    }
  }, [programId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-6xl px-4 py-12 space-y-8">
          <Skeleton className="h-8 w-48" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-96 w-full rounded-3xl" />
              <Skeleton className="h-40 w-full rounded-2xl" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-80 w-full rounded-3xl" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !program) {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
        <Card className="max-w-md w-full rounded-3xl">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <GraduationCap className="h-8 w-8" />
            </div>
            <h3 className="font-bold text-xl">Program Not Found</h3>
            <p className="text-sm text-muted-foreground">
              {error || "The program you're looking for doesn't exist."}
            </p>
            <Link href="/#programs">
              <Button className="mt-4 bg-blue-400 hover:bg-blue-500 text-white font-bold">
                Browse All Programs
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  // Get specific learning outcomes based on program
  const getLearningOutcomes = (programName: string) => {
    const name = programName.toLowerCase();
    
    if (name.includes('camera') || name.includes('photography')) {
      return [
        "Photography",
        "Videography",
        "Video editing",
        "Photo editing",
        "Studio lighting",
        "Visual storytelling",
      ];
    } else if (name.includes('fashion') || name.includes('design')) {
      return [
        "Sketch",
        "Color theory",
        "Pattern making",
        "Sewing",
        "Garment construction",
        "Fashion portfolio",
      ];
    } else if (name.includes('mobile') || name.includes('maintenance')) {
      return [
        "Hardware maintenance",
        "Software maintenance",
        "Customer handling",
        "How to save money",
        "Diagnostic techniques",
        "Repair business setup",
      ];
    }
    
    // Default outcomes
    return [
      "Practical hands-on training",
      "Industry-standard techniques",
      "Real-world project experience",
      "Professional portfolio development",
      "Career guidance & support",
      "Certificate upon completion",
    ];
  };

  const learningOutcomes = getLearningOutcomes(program.name);

  const handleEnroll = async () => {
    const token = getToken();
    
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setEnrolling(true);
      setError("");
      
      // Create registration with DRAFT status
      await createRegistration(programId, token);
      
      // Navigate to payment page
      router.push("/dashboard/payment");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to enroll in program."
      );
      setEnrolling(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-blue-400 selection:text-white">
      {/* Header Navigation */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/40">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <Link
            href="/#programs"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground font-medium transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
            Back to Programs
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 space-y-8">
        {/* Hero Section */}
        <div className="grid lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Program Image */}
            <div className="relative h-[400px] sm:h-[500px] w-full overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900/20 to-indigo-900/30">
              {program.fee ? (
                <Image
                  src={program.fee}
                  alt={program.name}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
                  onError={(e) => {
                    const fallback = e.currentTarget.parentElement?.querySelector('.fallback-icon') as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : null}
              <div className={`absolute inset-0 flex items-center justify-center fallback-icon ${program.fee ? 'hidden' : 'flex'}`}>
                <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-blue-400/10 text-blue-400">
                  <GraduationCap className="h-12 w-12" />
                </div>
              </div>
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              {/* Badge */}
              <div className="absolute top-4 left-4">
                <Badge className="bg-blue-400 hover:bg-blue-500 text-white font-medium border-0 shadow-lg gap-1.5 px-4 py-2">
                  <Sparkles className="h-4 w-4" />
                  Active Course
                </Badge>
              </div>
            </div>

            {/* Program Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-foreground mb-4">
                  {program.name}
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {program.description || "Practical, career-focused training program designed for real-world skill mastery."}
                </p>
              </div>

              {/* What You'll Learn */}
              <Card className="rounded-3xl border-border/60 shadow-sm">
                <CardContent className="p-6 sm:p-8 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-400/10 text-blue-400">
                      <BookOpen className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">What You&apos;ll Learn</h2>
                      <p className="text-sm text-muted-foreground">Core skills and competencies</p>
                    </div>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    {learningOutcomes.map((item, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Program Structure */}
              <Card className="rounded-3xl border-border/60 shadow-sm">
                <CardContent className="p-6 sm:p-8 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-400/10 text-blue-400">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Program Structure</h2>
                      <p className="text-sm text-muted-foreground">How the course is organized</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-muted/50">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-400 text-white font-bold text-sm">
                        1
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground">Foundation Skills</h3>
                        <p className="text-sm text-muted-foreground mt-1">Learn the fundamentals and core concepts</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-muted/50">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-400 text-white font-bold text-sm">
                        2
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground">Advanced Techniques</h3>
                        <p className="text-sm text-muted-foreground mt-1">Master professional-level skills and methods</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-muted/50">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-400 text-white font-bold text-sm">
                        3
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground">Practical Projects</h3>
                        <p className="text-sm text-muted-foreground mt-1">Apply skills through real-world projects</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            {/* Enrollment Card */}
            <Card className="rounded-3xl border-border/60 shadow-lg shadow-blue-400/10">
              <CardContent className="p-6 space-y-6">
                {error && (
                  <div className="rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-700 border border-rose-200/60 dark:bg-rose-950/30 dark:border-rose-900 dark:text-rose-400">
                    {error}
                  </div>
                )}
                
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center gap-2 text-blue-400 font-bold text-sm uppercase tracking-wider">
                    <Award className="h-4 w-4" />
                    Certificate Program
                  </div>
                  <div className="text-4xl font-black text-foreground">
                    {Number(program.monthly_fee).toLocaleString()} ETB
                  </div>
                  <p className="text-sm text-muted-foreground">Monthly fee</p>
                </div>

                <div className="space-y-3 pt-4 border-t border-border/40">
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="h-5 w-5 text-blue-400 flex-shrink-0" />
                    <span className="text-foreground font-medium">Duration: {program.duration || "Self-paced"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Users className="h-5 w-5 text-blue-400 flex-shrink-0" />
                    <span className="text-foreground font-medium">Small class sizes</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-5 w-5 text-blue-400 flex-shrink-0" />
                    <span className="text-foreground font-medium">Flexible schedules</span>
                  </div>
                </div>

                <Button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="w-full bg-blue-400 hover:bg-blue-500 text-white font-bold h-12 gap-2 shadow-lg shadow-blue-400/25 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] rounded-xl"
                >
                  {enrolling ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Enrolling...
                    </>
                  ) : (
                    <>
                      Enroll Now
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Start your journey today with expert instructors
                </p>
              </CardContent>
            </Card>

            {/* Why Choose This Program */}
            <Card className="rounded-3xl border-border/60 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-bold text-lg">Why This Program?</h3>
                <ul className="space-y-3">
                  {[
                    "100% practical training",
                    "Industry expert instructors",
                    "Hands-on projects",
                    "Career support",
                    "Recognized certificate",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
