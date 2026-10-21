import Image from "next/image";
import type { StaticImageData } from "next/image";
import Link from "next/link";
import Navbar from "../components/navbar";
import FashionDesign from "../../public/assets/fashion.png";
import Camera from "../../public/assets/camera.jpg";
import MobileMaintenance from "../../public/assets/mobile.jpg";

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

// shadcn UI & Lucide Components
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Clock,
  GraduationCap,
  Sparkles,
  Users,
  Wrench,
  Phone,
  MapPin,
  Mail,
  ArrowUpRight,
  CheckCircle2,
  ShieldCheck,
  Star,
} from "lucide-react";

// Inline Social Icon SVGs
const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" />
  </svg>
);

const TelegramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
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

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 flex flex-col justify-between selection:bg-blue-400 selection:text-white">
      <div>
        <Navbar />

        {/* Hero Section */}
        <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden">
          {/* Animated Background Blobs */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-400/15 dark:bg-blue-400/10 blur-[130px] rounded-full pointer-events-none -z-10 animate-pulse" />
          <div className="absolute top-1/3 left-10 w-[300px] h-[300px] bg-indigo-400/10 dark:bg-indigo-400/5 blur-[100px] rounded-full pointer-events-none -z-10 animate-bounce" style={{ animationDuration: '8s' }} />
          <div className="absolute bottom-1/4 right-10 w-[400px] h-[400px] bg-blue-500/10 dark:bg-blue-500/5 blur-[120px] rounded-full pointer-events-none -z-10 animate-bounce" style={{ animationDuration: '10s', animationDelay: '2s' }} />

          <div className="mx-auto max-w-6xl px-5 text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Top Pill */}
            <div className="inline-flex items-center">
              <Badge variant="outline" className="px-4 py-1.5 border-blue-400/40 text-blue-500 dark:text-blue-400 bg-blue-400/10 font-semibold gap-2 text-xs sm:text-sm rounded-full shadow-sm">
                <Sparkles className="h-4 w-4 text-blue-400" /> Practical Vocational Education
              </Badge>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight max-w-4xl mx-auto leading-[1.1] text-slate-950 dark:text-white">
              Master Practical Skills for <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent">Real-World Success</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
              Logos College provides practical certificate programs designed to turn your interests into job-ready technical skills and career confidence.
            </p>

            {/* Call To Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                href="/register"
                className={buttonVariants({
                  size: "lg",
                  className: "w-full sm:w-auto font-bold gap-2 text-base px-8 h-12 shadow-lg shadow-blue-400/25 !bg-blue-400 hover:!bg-blue-500 text-white border-none rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-400/30 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-200",
                })}
              >
                Enroll Online Now
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="#programs"
                className={buttonVariants({
                  variant: "outline",
                  size: "lg",
                  className: "w-full sm:w-auto font-bold text-base px-8 h-12 border-slate-300 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition-all animate-in fade-in slide-in-from-bottom-2 duration-700 delay-300",
                })}
              >
                Explore Programs
              </Link>
            </div>

            {/* Highlight Badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-blue-400" /> Hands-on Labs
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-blue-400" /> Career Clearance
              </span>
              <span className="flex items-center gap-1.5">
                <Star className="h-4 w-4 text-blue-400" /> Certified Programs
              </span>
            </div>

            {/* Stats Summary Box */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 pt-8 sm:pt-10 mt-6 sm:mt-8 max-w-4xl mx-auto border-t border-slate-200/80 dark:border-slate-800">
              <div className="group p-3 sm:p-4 rounded-2xl bg-white/60 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/60 backdrop-blur-xs transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-400/10 animate-in fade-in slide-in-from-bottom-3 duration-700 delay-400">
                <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-blue-400 group-hover:scale-110 transition-transform">100%</p>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">Practical Workshops</p>
              </div>
              <div className="group p-3 sm:p-4 rounded-2xl bg-white/60 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/60 backdrop-blur-xs transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-400/10 animate-in fade-in slide-in-from-bottom-3 duration-700 delay-500">
                <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-blue-400 group-hover:scale-110 transition-transform">Flexible</p>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">Schedules & Shifts</p>
              </div>
              <div className="col-span-2 md:col-span-1 group p-3 sm:p-4 rounded-2xl bg-white/60 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/60 backdrop-blur-xs transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-400/10 animate-in fade-in slide-in-from-bottom-3 duration-700 delay-600">
                <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-blue-400 group-hover:scale-110 transition-transform">Accredited</p>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">Certificate Options</p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="px-5 py-16 sm:py-20 bg-slate-100/70 dark:bg-slate-900/40 border-y border-slate-200/80 dark:border-slate-800/80">
          <div className="mx-auto max-w-6xl">
            <div className="text-center space-y-2 mb-12">
              <p className="text-xs font-bold uppercase tracking-widest text-blue-400 animate-in fade-in slide-in-from-bottom-2 duration-700">Why Logos College</p>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-950 dark:text-white animate-in fade-in slide-in-from-bottom-2 duration-700 delay-100">Built for hands-on learners</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feat, index) => {
                const IconComponent = feat.icon;
                const delays = [0, 100, 200];
                return (
                  <div key={feat.title} style={{ animationDelay: `${delays[index]}ms` }} className="group relative flex flex-col items-center text-center p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-blue-400/50 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="h-14 w-14 rounded-2xl bg-blue-400/10 text-blue-400 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-blue-400 group-hover:text-white transition-all duration-300">
                      <IconComponent className="h-7 w-7" />
                    </div>
                    <h3 className="font-bold text-xl mb-2 text-slate-900 dark:text-slate-100">{feat.title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{feat.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Image-Covered Touchable Programs Section */}
        <section id="programs" className="px-5 py-20 sm:py-24">
          <div className="mx-auto max-w-6xl space-y-12">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-blue-400 animate-in fade-in slide-in-from-bottom-2 duration-700">
                  Learn by doing
                </p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl animate-in fade-in slide-in-from-bottom-2 duration-700 delay-100">
                  Featured Programs
                </h2>
                <p className="mt-2 max-w-xl text-slate-600 dark:text-slate-400 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-200">
                  Tap any card below to explore and start your online registration.
                </p>
              </div>
              <Link
                href="/register"
                className={buttonVariants({
                  variant: "link",
                  className: "group p-0 font-bold text-blue-400 hover:text-blue-500 hover:no-underline text-sm animate-in fade-in slide-in-from-right-2 duration-700 delay-300"
                })}
              >
                Browse all programs
                <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {courses.map((course: Course, index: number) => {
                const delays = [0, 150, 300];
                return (
                  <Link key={course.id} href={`/courses/${course.id}`} style={{ animationDelay: `${delays[index]}ms` }} className="group block focus:outline-none animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <Card className="relative flex flex-col h-full overflow-hidden rounded-3xl border-border/60 bg-card shadow-md transition-all duration-500 hover:-translate-y-2 hover:border-blue-400/60 hover:shadow-2xl hover:shadow-blue-400/15 group-focus:ring-2 group-focus:ring-blue-400">
                    <div className="flex flex-col h-full justify-between">
                      {/* Image Container with Title & Badges */}
                      <div className="relative h-64 w-full overflow-hidden bg-gradient-to-br from-blue-900/20 to-indigo-900/30">
                        <Image
                          src={course.image}
                          alt={course.alt}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />

                        {/* Gradient Overlay for Text Readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />

                        {/* Header Overlay Badges */}
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                          <Badge className="bg-black/40 backdrop-blur-md text-white font-medium border border-white/10 shadow-sm gap-1 text-[11px]">
                            <Sparkles className="h-3 w-3 text-blue-400" />
                            {course.category}
                          </Badge>
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white transition-all duration-300 group-hover:bg-blue-400 group-hover:scale-110">
                            <ArrowUpRight className="h-5 w-5" />
                          </div>
                        </div>

                        {/* Course Title Over Image */}
                        <div className="absolute bottom-4 left-4 right-4 z-10">
                          <h3 className="text-xl font-bold text-white tracking-tight line-clamp-2 drop-shadow-sm group-hover:text-blue-300 transition-colors">
                            {course.title}
                          </h3>
                        </div>

                        {/* Animated Hover Reveal Badge Bar */}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/95 via-slate-950/90 to-transparent p-4 pt-8 text-white z-20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold">
                            <Clock className="h-3.5 w-3.5 text-blue-400" />
                            <span>Duration: {course.duration}</span>
                          </div>
                          <span className="text-xs font-bold text-blue-400 underline">View Details</span>
                        </div>
                      </div>

                      {/* Card Body - Description Below Image */}
                      <CardContent className="p-6 flex-1 flex flex-col justify-between space-y-4">
                        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 line-clamp-3">
                          {course.description}
                        </p>

                        {/* Skills Tags */}
                        <div className="flex flex-wrap gap-2">
                          {course.skills.map((skill, index) => (
                            <Badge key={index} variant="outline" className="text-xs font-medium border-blue-400/30 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30">
                              {skill}
                            </Badge>
                          ))}
                        </div>

                        <div className="pt-3 border-t border-border/40 flex items-center justify-between text-xs font-bold text-slate-500 group-hover:text-blue-400 transition-colors">
                          <span>View course details</span>
                          <span className="text-sm transition-transform group-hover:translate-x-1">→</span>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Banner Call-To-Action */}
        <section className="px-5 pb-20 sm:pb-24">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 sm:gap-8 overflow-hidden rounded-3xl bg-slate-900 dark:bg-slate-900/90 border border-slate-800 p-6 sm:p-8 md:p-12 text-white shadow-2xl sm:flex-row sm:items-center relative">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
            <div className="max-w-2xl space-y-3 z-10">
              <Badge className="bg-blue-400/20 text-blue-400 border-none font-bold text-xs uppercase tracking-widest">
                Start Today
              </Badge>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
                Your future is worth investing in.
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Create your account today and start building practical technical skills with Logos College.
              </p>
            </div>
            <Link
              href="/register"
              className={buttonVariants({
                size: "lg",
                className: "group shrink-0 font-bold shadow-lg gap-2 !bg-blue-400 hover:!bg-blue-500 text-white border-none rounded-xl h-12 px-6 sm:px-7 transition-all duration-300 hover:scale-[1.03] z-10 w-full sm:w-auto",
              })}
            >
              Start Registration Now
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </section>
      </div>

      {/* Footer Section */}
      <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-600 dark:text-slate-400 text-sm pt-10 sm:pt-12 pb-8">
        <div className="max-w-6xl mx-auto px-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 pb-8 sm:pb-10 border-b border-slate-200 dark:border-slate-800">

            {/* Column 1: Identity */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Image src="/assets/logo.png" alt="Logos College" width={80} height={32} className="rounded-lg object-contain" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Empowering individuals through practical vocational education and career-focused technical training.
              </p>
            </div>

            {/* Column 2: Quick Links */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                Quick Navigation
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link href="#programs" className="hover:text-blue-400 transition-colors">
                    Available Programs
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="hover:text-blue-400 transition-colors">
                    Online Registration
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Contact Info */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                Contact Details
              </h4>
              <ul className="space-y-2.5 text-xs">
                <li className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 text-blue-400 shrink-0" />
                  <div className="flex flex-col sm:flex-row gap-1">
                    <a href="tel:+251947788899" className="hover:text-blue-400 transition-colors">
                      +251 947788899
                    </a>
                    <span>/</span>
                    <a href="tel:+251947628899" className="hover:text-blue-400 transition-colors">
                      +251 947628899
                    </a>
                  </div>
                </li>
                <li className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 text-blue-400 shrink-0" />
                  <a href="mailto:info@logoscollege.edu.et" className="hover:text-blue-400 transition-colors">
                    info@logoscollege.edu.et
                  </a>
                </li>
                <li className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                  <span>Holeta 44, Ethiopia</span>
                </li>
              </ul>
            </div>

            {/* Column 4: Social Links */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                Follow Us
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Stay updated with announcements and program news:
              </p>
              <div className="flex items-center gap-3 pt-1">
                <a
                  href="https://www.tiktok.com/@logosofficial12?_r=1&_d=f4i6b4175dlhdl&sec_uid=MS4wLjABAAAAv4gPm6tMBgCBrB-fAIDiLuiUsEvuArLRyQwrHoMeRucgYJ5OiYAO-k43mejuCG1l&share_author_id=7390807151968519173&sharer_language=en&source=h5_m&u_code=ehi68hc36c6k4f&timestamp=1791986238&user_id=7446472599016735750&sec_user_id=MS4wLjABAAAA7nJ38wpRHyRqh1LC4PXTfU_Jak5kSwfMul3DOY7ER8D471lDMV_jUsSnNrTD9o3a&item_author_type=2&utm_source=copy&utm_campaign=client_share&utm_medium=android&share_iid=7693848782064092948&share_link_id=bc11668b-5e4d-443f-b001-c2733cc7254b&share_app_id=1233&ugbiz_name=ACCOUNT&ug_btm=b6880%2Cb5836&social_share_type=5&share_enter_from=others_homepage&item_author_type=2&enable_checksum=1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
                  aria-label="TikTok"
                >
                  <TikTokIcon className="h-4 w-4" />
                </a>
                <a
                  href="https://www.instagram.com/logos_4796/?utm_source=ig_web_button_share_sheet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-gradient-to-br hover:from-[#F58529] hover:via-[#DD2A7B] hover:to-[#8134AF] hover:text-white dark:hover:text-white transition-all"
                  aria-label="Instagram"
                >
                  <InstagramIcon className="h-4 w-4" />
                </a>
                <a
                  href="https://t.me"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-[#26A5E4] hover:text-white dark:hover:bg-[#26A5E4] dark:hover:text-white transition-all"
                  aria-label="Telegram"
                >
                  <TelegramIcon className="h-4 w-4" />
                </a>
              </div>
            </div>

          </div>

          {/* Sub-Footer */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© {new Date().getFullYear()} Logos College. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="hover:text-blue-400 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-blue-400 transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}