"use client";

import { useEffect } from "react";
import Image from "next/image";
import type { StaticImageData } from "next/image";
import Link from "next/link";
import Navbar from "../components/navbar";
import Hero from "../components/hero";
import FashionDesign from "../../public/assets/fashion.png";
import Camera from "../../public/assets/camera.jpg";
import MobileMaintenance from "../../public/assets/mobile.jpg";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { getPrograms } from "@/services/programservices";

// shadcn UI & Lucide Components
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  ClipboardCheck,
  Clock,
  CreditCard,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Quote,
  Sparkles,
  Star,
  Users,
  Wrench,
} from "lucide-react";

interface Course {
  id: number;
  title: string;
  category: string;
  duration: string;
  description: string;
  skills: string[];
  image: StaticImageData;
  alt: string;
}

// Inline Social Icon SVGs
const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg fill="currentColor" viewBox="0 0 24 24" aria-hidden {...props}>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg fill="currentColor" viewBox="0 0 24 24" aria-hidden {...props}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" />
  </svg>
);

const TelegramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg fill="currentColor" viewBox="0 0 24 24" aria-hidden {...props}>
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
  </svg>
);

const courses: Course[] = [
  {
    id: 1,
    title: "Fashion Design",
    category: "CREATIVE ARTS",
    duration: "3 Months",
    description:
      "Turn your creative ideas into original garments and master practical tailoring, pattern making, and fashion design techniques.",
    skills: ["Sketch", "Color theory", "Pattern", "Sewing"],
    image: FashionDesign,
    alt: "Fashion design course",
  },
  {
    id: 2,
    title: "Camera",
    category: "MEDIA & PRODUCTION",
    duration: "2 Months",
    description:
      "Learn camera mastery, composition, portrait lighting, and visual storytelling with studio equipment.",
    skills: ["Photography", "Videography", "Video editing", "Photo editing"],
    image: Camera,
    alt: "Camera and photography course",
  },
  {
    id: 3,
    title: "Mobile Maintenance",
    category: "TECHNOLOGY",
    duration: "3 Months",
    description:
      "Build practical hardware diagnostic skills, component replacement, and repair techniques for modern mobile devices.",
    skills: [
      "Hardware maintenance",
      "Software maintenance",
      "Customer handling",
      "How to save money",
    ],
    image: MobileMaintenance,
    alt: "Mobile phone maintenance course",
  },
];

const features = [
  {
    icon: Wrench,
    title: "100% Practical Training",
    description:
      "Hands-on experience with real equipment and practical projects right from your first day.",
  },
  {
    icon: BadgeCheck,
    title: "Industry Expert Instructors",
    description:
      "Learn directly from active professionals with real-world technical expertise.",
  },
  {
    icon: Users,
    title: "Small Class Sizes",
    description:
      "Focused lab sessions ensuring personalized 1-on-1 feedback and skill mastery.",
  },
];

const stepTints = [
  {
    card: "bg-blue-50 border-blue-200/70 dark:bg-blue-950/30 dark:border-blue-900",
    chip: "bg-blue-600 text-white dark:bg-blue-500",
    label: "text-blue-600 dark:text-blue-400",
    hover: "hover:border-blue-400 dark:hover:border-blue-700",
  },
  {
    card: "bg-orange-50 border-orange-200/70 dark:bg-orange-950/30 dark:border-orange-900",
    chip: "bg-orange-600 text-white dark:bg-orange-500",
    label: "text-orange-600 dark:text-orange-400",
    hover: "hover:border-orange-400 dark:hover:border-orange-700",
  },
  {
    card: "bg-emerald-50 border-emerald-200/70 dark:bg-emerald-950/30 dark:border-emerald-900",
    chip: "bg-emerald-600 text-white dark:bg-emerald-500",
    label: "text-emerald-600 dark:text-emerald-400",
    hover: "hover:border-emerald-400 dark:hover:border-emerald-700",
  },
];

const steps = [
  {
    icon: GraduationCap,
    title: "Choose a program",
    description: "Pick the certificate program that fits your goals.",
  },
  {
    icon: CreditCard,
    title: "Register & pay",
    description:
      "Create your account, transfer the fee and upload your receipt.",
  },
  {
    icon: ClipboardCheck,
    title: "Get verified",
    description:
      "An admin confirms your payment and activates your registration.",
  },
];

const marqueeSkills = [
  "Fashion Design",
  "Pattern Making",
  "Photography",
  "Videography",
  "Video Editing",
  "Mobile Repair",
  "Hardware Diagnostics",
  "Customer Service",
  "Color Theory",
  "Sewing",
];

const testimonials: {
  quote: string;
  name: string;
  role: string;
  initials: string;
  image?: string;
}[] = [
  {
    quote:
      "The hands-on labs made all the difference. I walked in with zero experience and left the mobile maintenance program confident enough to open my own repair shop.",
    name: "Bonsa T.",
    role: "Mobile Maintenance graduate",
    initials: "HG",
    image:
      "https://res.cloudinary.com/dzqma6sfk/image/upload/v1794247413/college-registration/student-profiles/fqoua0mac88a3mxoyzax.jpg",
  },
  {
    quote:
      "The instructors are working professionals, so every lesson is practical. My fashion portfolio got me noticed by local boutiques within weeks of finishing.",
    name: "Dawit M.",
    role: "Fashion Design graduate",
    initials: "DM",
    image:
      "https://res.cloudinary.com/dzqma6sfk/image/upload/v1791910227/college-registration/student-profiles/aybspnbubc9nfwyzdhv9.png",
  },
  {
    quote:
      "Small classes meant I got real feedback on my photography every single week. The online portal made registration and payments completely stress-free.",
    name: "Melkamu L.",
    role: "Camera & Media student",
    initials: "ST",
    image:
      "https://res.cloudinary.com/dzqma6sfk/image/upload/v1791979789/college-registration/student-profiles/skrgjmlwek2bsrcnmf1c.jpg",
  },
];

/** Section heading — always left-aligned. */
function SectionHeading({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="max-w-2xl text-left">
      <h2 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-3 text-base leading-relaxed text-slate-600 dark:text-slate-400">
          {description}
        </p>
      )}
    </div>
  );
}

function ScrollSection({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  const { ref, isVisible } = useScrollAnimation(0.1);

  return (
    <section
      ref={ref}
      id={id}
      className={`scroll-mt-20 transition-all duration-1000 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      } ${className}`}
    >
      {children}
    </section>
  );
}

export default function Home() {
  useEffect(() => {
    getPrograms().catch(() => {});
  }, []);

  return (
    <main className="flex min-h-[100dvh] flex-col justify-between overflow-hidden bg-slate-50 text-slate-900 selection:bg-blue-400 selection:text-white dark:bg-slate-950 dark:text-slate-50">
      <div>
        <Navbar />
        <Hero />

        {/* Skills marquee */}
        <div className="relative overflow-hidden border-b border-slate-200 bg-white py-4 dark:border-slate-800 dark:bg-slate-900/40">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-white to-transparent dark:from-slate-950"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-white to-transparent dark:from-slate-950"
          />
          <div className="flex w-max animate-marquee gap-3 motion-reduce:animate-none">
            {[...marqueeSkills, ...marqueeSkills].map((skill, i) => (
              <span
                key={`${skill}-${i}`}
                className="flex items-center gap-2 whitespace-nowrap rounded-lg border border-blue-400/30 bg-blue-600/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-700 dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-300"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <ScrollSection className="relative border-y border-slate-200/80 bg-gradient-to-b from-blue-50/50 via-slate-50 to-slate-50 px-5 py-16 dark:border-slate-800/80 dark:from-blue-950/20 dark:via-slate-950 dark:to-slate-950 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-6xl">
            <SectionHeading
              title="Built for hands-on learners"
              description="Real equipment, real professionals and small groups, so you learn skills you can use straight away."
            />

            <div className="mt-10 grid gap-5 sm:mt-12 md:grid-cols-3 md:gap-8">
              {features.map((feat) => {
                const Icon = feat.icon;
                return (
                  <div
                    key={feat.title}
                    className="group relative flex flex-col items-start overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-7 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-400/50 hover:shadow-xl hover:shadow-blue-950/10 dark:border-slate-800 dark:bg-slate-900/90 dark:hover:border-blue-400/60 sm:p-8"
                  >
                    {/* Top accent line */}
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-400 to-blue-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                    <div className="relative mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-100 transition-colors duration-300 group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-950/50 dark:text-blue-300 dark:ring-blue-900 dark:group-hover:bg-blue-500 dark:group-hover:text-white">
                      <Icon className="h-5 w-5" aria-hidden />
                    </div>

                    <h3 className="relative mb-2 text-xl font-bold text-slate-900 dark:text-slate-100">
                      {feat.title}
                    </h3>
                    <p className="relative text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                      {feat.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollSection>

        {/* Programs */}
        <ScrollSection id="programs" className="px-5 py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-6xl space-y-10 sm:space-y-12">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <SectionHeading
                title="Featured Programs"
                description="Tap any card below to explore and start your online registration."
              />
              <Link
                href="/register"
                className={buttonVariants({
                  variant: "link",
                  className:
                    "group min-h-11 shrink-0 justify-start p-0 text-sm font-bold text-blue-600 hover:text-blue-500 hover:no-underline dark:text-blue-400",
                })}
              >
                Browse all programs
                <ArrowRight
                  className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1"
                  aria-hidden
                />
              </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-3 md:gap-8">
              {courses.map((course) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.id}`}
                  className="group block rounded-3xl focus:outline-none"
                >
                  <Card className="relative flex h-full flex-col overflow-hidden rounded-3xl border-border/60 bg-card shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:border-blue-400/50 hover:shadow-xl hover:shadow-blue-500/10 group-focus-visible:ring-2 group-focus-visible:ring-blue-400 group-focus-visible:ring-offset-2">
                    {/* Image */}
                    <div className="relative h-56 w-full overflow-hidden bg-gradient-to-br from-blue-950/40 to-slate-900 sm:h-60">
                      <Image
                        src={course.image}
                        alt={course.alt}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#06142e]/70 via-transparent to-transparent" />

                      <div className="absolute left-3 right-3 top-3 z-10 flex items-center justify-between">
                        <Badge className="gap-1 border border-white/15 bg-black/40 text-[11px] font-medium text-white shadow-sm backdrop-blur-md">
                          <Sparkles
                            className="h-3 w-3 text-blue-400"
                            aria-hidden
                          />
                          {course.category}
                        </Badge>
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-600">
                          <ArrowUpRight className="h-5 w-5" aria-hidden />
                        </div>
                      </div>

                      <span className="absolute bottom-3 left-4 z-10 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/40 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-md">
                        <Clock
                          className="h-3.5 w-3.5 text-blue-400"
                          aria-hidden
                        />
                        {course.duration}
                      </span>
                    </div>

                    {/* Body */}
                    <CardContent className="flex flex-1 flex-col justify-between gap-4 p-6 text-left">
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold tracking-tight text-slate-900 transition-colors group-hover:text-blue-700 dark:text-slate-100 dark:group-hover:text-blue-300">
                          {course.title}
                        </h3>
                        <p className="line-clamp-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                          {course.description}
                        </p>
                      </div>

                      <ul
                        aria-label={`${course.title} skills`}
                        className="flex flex-wrap gap-2"
                      >
                        {course.skills.map((skill) => (
                          <li key={skill}>
                            <Badge
                              variant="outline"
                              className="border-slate-200 bg-slate-50/70 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300"
                            >
                              {skill}
                            </Badge>
                          </li>
                        ))}
                      </ul>

                      <div className="flex items-center justify-between border-t border-border/40 pt-3 text-xs font-bold text-slate-500 transition-colors group-hover:text-blue-600 dark:text-slate-400 dark:group-hover:text-blue-400">
                        <span>View program details</span>
                        <ArrowRight
                          className="h-4 w-4 transition-transform group-hover:translate-x-1"
                          aria-hidden
                        />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </ScrollSection>

        {/* How it works */}
        <ScrollSection className="border-y border-slate-200/80 bg-white px-5 py-16 dark:border-slate-800/80 dark:bg-slate-900/40 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-6xl">
            <SectionHeading
              title="Start in three simple steps"
              description="From choosing a program to confirmed registration, the whole process happens online."
            />

            <ol className="mt-10 grid gap-5 sm:mt-12 md:grid-cols-3 md:gap-8">
              {steps.map((step, i) => {
                const Icon = step.icon;
                const tint = stepTints[i];
                return (
                  <li
                    key={step.title}
                    className={`group relative flex h-full flex-col gap-5 overflow-hidden rounded-3xl border p-6 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-7 ${tint.card} ${tint.hover}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span
                        className={`flex h-11 w-11 items-center justify-center rounded-2xl shadow-sm transition-transform duration-300 group-hover:scale-110 ${tint.chip}`}
                      >
                        <Icon className="h-5 w-5" aria-hidden />
                      </span>
                      <span
                        className={`text-xs font-extrabold uppercase tracking-[0.1em] ${tint.label}`}
                      >
                        Step {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>

                    <div className="relative">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                        {step.title}
                      </h3>
                      <p className="mt-1 text-[13px] leading-relaxed text-slate-600 dark:text-slate-400 sm:text-sm">
                        {step.description}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </ScrollSection>

        {/* Testimonials */}
        <ScrollSection className="px-5 py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-6xl">
            <SectionHeading
              title="What our graduates say"
              description="Real experiences from students who turned practical training into real opportunities."
            />

            <div className="mt-10 grid gap-5 sm:mt-12 md:grid-cols-3 md:gap-8">
              {testimonials.map((t) => (
                <figure
                  key={t.name}
                  className="group relative flex flex-col justify-between gap-6 overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-400/50 hover:shadow-xl hover:shadow-blue-950/10 dark:border-slate-800 dark:bg-slate-900/90 dark:hover:border-blue-400/60 sm:p-8"
                >
                  <Quote
                    aria-hidden
                    className="absolute -right-3 -top-3 h-16 w-16 text-blue-100 transition-colors duration-300 group-hover:text-blue-200 dark:text-blue-950 dark:group-hover:text-blue-900"
                  />

                  <div className="relative">
                    <div
                      className="mb-4 flex items-center gap-1"
                      aria-label="5 out of 5 stars"
                    >
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 fill-amber-400 text-amber-400"
                          aria-hidden
                        />
                      ))}
                    </div>
                    <blockquote className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 sm:text-base">
                      &ldquo;{t.quote}&rdquo;
                    </blockquote>
                  </div>

                  <figcaption className="relative flex items-center gap-3 border-t border-slate-200/80 pt-4 dark:border-slate-800">
                    {t.image ? (
                      // eslint-disable-next-line @next/next/no-img-element -- testimonial avatars come from arbitrary URLs
                      <img
                        src={t.image}
                        alt={t.name}
                        className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-blue-100 dark:ring-blue-900"
                      />
                    ) : (
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-sm font-bold text-white">
                        {t.initials}
                      </span>
                    )}
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {t.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {t.role}
                      </p>
                    </div>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </ScrollSection>

        {/* Call-to-action banner */}
        <ScrollSection className="px-5 py-16 sm:py-20 lg:py-24">
          <div className="relative isolate mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 overflow-hidden rounded-3xl border border-blue-950 bg-[#06142e] p-6 text-left text-white shadow-2xl shadow-blue-950/40 sm:flex-row sm:items-center sm:gap-8 sm:p-8 md:p-12">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 -z-10 h-72 w-72 rounded-full bg-blue-500/30 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-24 left-1/4 -z-10 h-64 w-64 rounded-full bg-blue-400/20 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-10 opacity-[0.06]"
              style={{
                backgroundImage:
                  "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
                backgroundSize: "44px 44px",
                maskImage:
                  "linear-gradient(to bottom right, black, transparent 70%)",
                WebkitMaskImage:
                  "linear-gradient(to bottom right, black, transparent 70%)",
              }}
            />

            <div className="max-w-2xl space-y-3">
              <Badge className="border border-blue-400/30 bg-blue-400/20 text-xs font-bold uppercase tracking-widest text-blue-200">
                Start Today
              </Badge>
              <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl md:text-4xl">
                Your future is worth{" "}
                <span className="bg-gradient-to-r from-blue-300 to-blue-400 bg-clip-text text-transparent">
                  investing in.
                </span>
              </h2>
              <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
                Create your account today and start building practical technical
                skills with Logos College.
              </p>
            </div>

            <Link
              href="/register"
              className={buttonVariants({
                size: "lg",
                className:
                  "group h-12 w-full shrink-0 gap-2 rounded-xl border-none !bg-gradient-to-r !from-blue-600 !to-blue-400 px-6 font-bold text-white shadow-lg shadow-blue-600/40 transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 sm:w-auto sm:px-7",
              })}
            >
              Start Registration Now
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                aria-hidden
              />
            </Link>
          </div>
        </ScrollSection>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white pb-8 pt-10 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 sm:pt-12">
        <div className="mx-auto max-w-6xl px-5">
          <div className="grid grid-cols-1 gap-8 border-b border-slate-200 pb-8 text-left dark:border-slate-800 sm:grid-cols-2 sm:pb-10 lg:grid-cols-4">
            {/* Identity */}
            <div className="space-y-3">
              <Link
                href="/"
                className="inline-block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-400"
              >
                <Image
                  src="/assets/logo.png"
                  alt="Logos College"
                  width={80}
                  height={32}
                  className="rounded-lg object-contain"
                />
              </Link>
              <p className="max-w-xs text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                Empowering individuals through practical vocational education
                and career-focused technical training.
              </p>
            </div>

            {/* Quick links */}
            <nav aria-label="Quick navigation" className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                Quick Navigation
              </h3>
              <ul className="space-y-1 text-xs">
                {[
                  ["Available Programs", "#programs"],
                  ["Online Registration", "/register"],
                  ["Student Portal", "/login"],
                ].map(([label, href]) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="inline-flex min-h-8 items-center transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Contact */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                Contact Details
              </h3>
              <ul className="space-y-3 text-xs">
                <li className="flex items-start gap-2.5">
                  <Phone
                    className="mt-0.5 h-4 w-4 shrink-0 text-blue-500"
                    aria-hidden
                  />
                  <div className="flex flex-col gap-1">
                    <a
                      href="tel:+251947788899"
                      className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      +251 947788899
                    </a>
                    <a
                      href="tel:+251947628899"
                      className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      +251 947628899
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <Mail
                    className="mt-0.5 h-4 w-4 shrink-0 text-blue-500"
                    aria-hidden
                  />
                  <a
                    href="mailto:info@logoscollege.edu.et"
                    className="break-all transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    info@logoscollege.edu.et
                  </a>
                </li>
                <li className="flex items-start gap-2.5">
                  <MapPin
                    className="mt-0.5 h-4 w-4 shrink-0 text-blue-500"
                    aria-hidden
                  />
                  <span>Holeta 44, Ethiopia</span>
                </li>
              </ul>
            </div>

            {/* Social */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                Follow Us
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Stay updated with announcements and program news:
              </p>
              <div className="flex items-center gap-3 pt-1">
                <a
                  href="https://www.tiktok.com/@logosofficial12"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-all hover:-translate-y-0.5 hover:bg-black hover:text-white dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-white dark:hover:text-black"
                  aria-label="TikTok"
                >
                  <TikTokIcon className="h-4 w-4" />
                </a>
                <a
                  href="https://www.instagram.com/logos_4796/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-all hover:-translate-y-0.5 hover:bg-gradient-to-br hover:from-[#F58529] hover:via-[#DD2A7B] hover:to-[#8134AF] hover:text-white dark:bg-slate-900 dark:text-slate-300 dark:hover:text-white"
                  aria-label="Instagram"
                >
                  <InstagramIcon className="h-4 w-4" />
                </a>
                <a
                  href="https://t.me"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-all hover:-translate-y-0.5 hover:bg-[#26A5E4] hover:text-white dark:bg-slate-900 dark:text-slate-300 dark:hover:text-white"
                  aria-label="Telegram"
                >
                  <TelegramIcon className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Sub-footer */}
          <div className="flex flex-col items-start justify-between gap-4 pt-6 text-xs text-slate-500 dark:text-slate-400 sm:flex-row sm:items-center">
            <p>
              © {new Date().getFullYear()} Logos College. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="/privacy"
                className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
