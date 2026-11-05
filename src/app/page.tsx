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
  ClipboardCheck,
  Clock,
  CreditCard,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Sparkles,
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
    skills: ["Hardware maintenance", "Software maintenance", "Customer handling", "How to save money"],
    image: MobileMaintenance,
    alt: "Mobile phone maintenance course",
  },
];

const features = [
  {
    icon: Wrench,
    title: "100% Practical Training",
    description: "Hands-on experience with real equipment and practical projects right from your first day.",
  },
  {
    icon: GraduationCap,
    title: "Industry Expert Instructors",
    description: "Learn directly from active professionals with real-world technical expertise.",
  },
  {
    icon: Users,
    title: "Small Class Sizes",
    description: "Focused lab sessions ensuring personalized 1-on-1 feedback and skill mastery.",
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
    description: "Create your account, transfer the fee and upload your receipt.",
  },
  {
    icon: ClipboardCheck,
    title: "Get verified",
    description: "An admin confirms your payment and activates your registration.",
  },
];

function SectionHeading({
  title,
  description,
  center = false,
}: {
  title: string;
  description?: string;
  center?: boolean;
}) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-xl"}>
      <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-sky-600 dark:text-sky-400">
        <span aria-hidden className="h-px w-6 bg-gradient-to-r from-sky-400 to-blue-600" />
      </p>
      <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-3 text-slate-600 dark:text-slate-400">{description}</p>
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
  // Warm the proxy's public /programs cache so the course detail page
  // (and its LCP image) renders from cache instead of waiting on the backend.
  useEffect(() => {
    getPrograms().catch(() => {});
  }, []);

  return (
    <main className="flex min-h-[100dvh] flex-col justify-between overflow-hidden bg-slate-50 text-slate-900 selection:bg-sky-500 selection:text-white dark:bg-slate-950 dark:text-slate-50">
      <div>
        <Navbar />
        <Hero />

        <ScrollSection className="relative border-y border-slate-200/80 bg-gradient-to-b from-slate-100/80 to-slate-50 px-5 py-16 dark:border-slate-800/80 dark:from-slate-900/50 dark:to-slate-950 sm:py-20">
          <div className="mx-auto max-w-6xl">
            <SectionHeading
              center
              title="Built for hands-on learners"
              description="Real equipment, real professionals and small groups, so you learn skills you can use straight away."
            />

            <div className="mt-12 grid gap-6 md:grid-cols-3 md:gap-8">
              {features.map((feat, i) => {
                const Icon = feat.icon;
                return (
                  <div
                    key={feat.title}
                    className="group relative flex flex-col items-center overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-8 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-sky-400/50 hover:shadow-xl hover:shadow-sky-900/10 dark:border-slate-800 dark:bg-slate-900"
                  >
                    <span
                      aria-hidden
                      className="absolute right-5 top-4 text-5xl font-black text-slate-100 transition-colors group-hover:text-sky-100 dark:text-slate-800 dark:group-hover:text-sky-950"
                    >
                      0{i + 1}
                    </span>
                    <div className="relative mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-700 text-white shadow-md shadow-blue-900/25 transition-transform duration-300 group-hover:scale-110">
                      <Icon className="h-7 w-7" aria-hidden />
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
        <ScrollSection id="programs" className="px-5 py-20 sm:py-24">
          <div className="mx-auto max-w-6xl space-y-12">
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
                    "group min-h-11 p-0 text-sm font-bold text-sky-600 hover:text-sky-700 hover:no-underline dark:text-sky-400",
                })}
              >
                Browse all programs
                <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-3 md:gap-8">
              {courses.map((course) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.id}`}
                  className="group block rounded-3xl focus:outline-none"
                >
                  <Card className="relative flex h-full flex-col overflow-hidden rounded-3xl border-border/60 bg-card shadow-md transition-all duration-500 hover:-translate-y-2 hover:border-sky-400/60 hover:shadow-2xl hover:shadow-sky-500/15 group-focus-visible:ring-2 group-focus-visible:ring-sky-500 group-focus-visible:ring-offset-2">
                    {/* Image */}
                    <div className="relative h-60 w-full overflow-hidden bg-gradient-to-br from-blue-900/20 to-indigo-900/30 sm:h-64">
                      <Image
                        src={course.image}
                        alt={course.alt}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#06142e]/90 via-[#06142e]/30 to-[#06142e]/10" />

                      {/* Top row */}
                      <div className="absolute left-3 right-3 top-3 z-10 flex items-center justify-between">
                        <Badge className="gap-1 border border-white/15 bg-black/40 text-[11px] font-medium text-white shadow-sm backdrop-blur-md">
                          <Sparkles className="h-3 w-3 text-sky-300" aria-hidden />
                          {course.category}
                        </Badge>
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:bg-sky-500">
                          <ArrowUpRight className="h-5 w-5" aria-hidden />
                        </div>
                      </div>

                      {/* Title + duration (always visible, works on touch) */}
                      <div className="absolute inset-x-4 bottom-4 z-10 space-y-2">
                        <h3 className="line-clamp-2 text-xl font-bold tracking-tight text-white drop-shadow-sm transition-colors group-hover:text-sky-200">
                          {course.title}
                        </h3>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-xs font-semibold text-slate-100 backdrop-blur-md">
                          <Clock className="h-3.5 w-3.5 text-sky-300" aria-hidden />
                          {course.duration}
                        </span>
                      </div>
                    </div>

                    {/* Body */}
                    <CardContent className="flex flex-1 flex-col justify-between space-y-4 p-6">
                      <p className="line-clamp-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                        {course.description}
                      </p>

                      <ul aria-label={`${course.title} skills`} className="flex flex-wrap gap-2">
                        {course.skills.map((skill) => (
                          <li key={skill}>
                            <Badge
                              variant="outline"
                              className="border-sky-400/30 bg-sky-50 text-xs font-medium text-sky-700 dark:bg-sky-950/30 dark:text-sky-300"
                            >
                              {skill}
                            </Badge>
                          </li>
                        ))}
                      </ul>

                      <div className="flex items-center justify-between border-t border-border/40 pt-3 text-xs font-bold text-slate-500 transition-colors group-hover:text-sky-600 dark:group-hover:text-sky-400">
                        <span>View course details</span>
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </ScrollSection>

        {/* How it works */}
        <ScrollSection className="border-y border-slate-200/80 bg-white px-5 py-16 dark:border-slate-800/80 dark:bg-slate-900/40 sm:py-20">
          <div className="mx-auto max-w-6xl">
            <SectionHeading
              center
              title="Start in three simple steps"
            />

            <ol className="mt-12 grid gap-8 md:grid-cols-3 md:gap-6">
              {steps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <li key={step.title} className="relative flex flex-col items-center text-center">
                    {i < steps.length - 1 && (
                      <span
                        aria-hidden
                        className="absolute left-[calc(50%+2.5rem)] top-8 hidden h-px w-[calc(100%-5rem)] border-t-2 border-dashed border-sky-300/60 md:block dark:border-sky-700/60"
                      />
                    )}
                    <span className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-700 text-white shadow-lg shadow-blue-900/25">
                      <Icon className="h-7 w-7" aria-hidden />
                      <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-black text-blue-700 shadow ring-1 ring-slate-200 dark:bg-slate-900 dark:text-sky-300 dark:ring-slate-700">
                        {i + 1}
                      </span>
                    </span>
                    <h3 className="mt-5 text-lg font-bold text-slate-900 dark:text-slate-100">
                      {step.title}
                    </h3>
                    <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                      {step.description}
                    </p>
                  </li>
                );
              })}
            </ol>
          </div>
        </ScrollSection>

        {/* Call-to-action banner */}
        <ScrollSection className="px-5 py-16 sm:py-20">
          <div className="relative isolate mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 overflow-hidden rounded-3xl border border-slate-800 bg-[#06142e] p-6 text-white shadow-2xl shadow-blue-950/30 sm:flex-row sm:items-center sm:gap-8 sm:p-8 md:p-12">
            <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 -z-10 h-72 w-72 rounded-full bg-blue-500/30 blur-3xl" />
            <div aria-hidden className="pointer-events-none absolute -bottom-24 left-1/4 -z-10 h-64 w-64 rounded-full bg-sky-400/15 blur-3xl" />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-10 opacity-[0.06]"
              style={{
                backgroundImage:
                  "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
                backgroundSize: "44px 44px",
                maskImage: "linear-gradient(to bottom right, black, transparent 70%)",
                WebkitMaskImage: "linear-gradient(to bottom right, black, transparent 70%)",
              }}
            />

            <div className="max-w-2xl space-y-3">
              <Badge className="border border-sky-300/20 bg-sky-400/15 text-xs font-bold uppercase tracking-widest text-sky-200">
                Start Today
              </Badge>
              <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl md:text-4xl">
                Your future is worth{" "}
                <span className="bg-gradient-to-r from-sky-300 to-blue-400 bg-clip-text text-transparent">
                  investing in.
                </span>
              </h2>
              <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
                Create your account today and start building practical technical skills with Logos College.
              </p>
            </div>

            <Link
              href="/register"
              className={buttonVariants({
                size: "lg",
                className:
                  "group h-12 w-full shrink-0 gap-2 rounded-xl border-none !bg-gradient-to-r !from-blue-600 !to-sky-500 px-6 font-bold text-white shadow-lg shadow-blue-600/40 transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 sm:w-auto sm:px-7",
              })}
            >
              Start Registration Now
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
          </div>
        </ScrollSection>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white pb-8 pt-10 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 sm:pt-12">
        <div className="mx-auto max-w-6xl px-5">
          <div className="grid grid-cols-1 gap-8 border-b border-slate-200 pb-8 dark:border-slate-800 sm:grid-cols-2 sm:pb-10 lg:grid-cols-4">
            {/* Identity */}
            <div className="space-y-3">
              <Link href="/" className="inline-block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-500">
                <Image
                  src="/assets/logo.png"
                  alt="Logos College"
                  width={80}
                  height={32}
                  className="rounded-lg object-contain"
                />
              </Link>
              <p className="max-w-xs text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                Empowering individuals through practical vocational education and career-focused technical training.
              </p>
            </div>

            {/* Quick links */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                Quick Navigation
              </h4>
              <ul className="space-y-2 text-xs">
                {[
                  ["Available Programs", "#programs"],
                  ["Online Registration", "/register"],
                  ["Student Portal", "/login"],
                ].map(([label, href]) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="inline-flex min-h-6 items-center transition-colors hover:text-sky-600 dark:hover:text-sky-400"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                Contact Details
              </h4>
              <ul className="space-y-3 text-xs">
                <li className="flex items-start gap-2.5">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-sky-500" aria-hidden />
                  <div className="flex flex-col gap-1">
                    <a href="tel:+251947788899" className="transition-colors hover:text-sky-600 dark:hover:text-sky-400">
                      +251 947788899
                    </a>
                    <a href="tel:+251947628899" className="transition-colors hover:text-sky-600 dark:hover:text-sky-400">
                      +251 947628899
                    </a>
                  </div>
                </li>
                <li className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 shrink-0 text-sky-500" aria-hidden />
                  <a
                    href="mailto:info@logoscollege.edu.et"
                    className="break-all transition-colors hover:text-sky-600 dark:hover:text-sky-400"
                  >
                    info@logoscollege.edu.et
                  </a>
                </li>
                <li className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sky-500" aria-hidden />
                  <span>Holeta 44, Ethiopia</span>
                </li>
              </ul>
            </div>

            {/* Social */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                Follow Us
              </h4>
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
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-all hover:-translate-y-0.5 hover:bg-gradient-to-br hover:from-[#F58529] hover:via-[#DD2A7B] hover:to-[#8134AF] hover:text-white dark:bg-slate-900 dark:text-slate-300"
                  aria-label="Instagram"
                >
                  <InstagramIcon className="h-4 w-4" />
                </a>
                <a
                  href="https://t.me"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-all hover:-translate-y-0.5 hover:bg-[#26A5E4] hover:text-white dark:bg-slate-900 dark:text-slate-300"
                  aria-label="Telegram"
                >
                  <TelegramIcon className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Sub-footer */}
          <div className="flex flex-col items-center justify-between gap-4 pt-6 text-xs text-slate-500 sm:flex-row">
            <p>© {new Date().getFullYear()} Logos College. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="transition-colors hover:text-sky-600 dark:hover:text-sky-400">
                Privacy Policy
              </Link>
              <Link href="/terms" className="transition-colors hover:text-sky-600 dark:hover:text-sky-400">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}