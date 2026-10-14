import Image from "next/image";
import Link from "next/link";
import Navbar from "../components/navbar";
import FashionDesign from "../../public/assets/fashionDesign.png";
import Camera from "../../public/assets/camera.png";
import MobileMaintenance from "../../public/assets/mobileMaintenance.png";

// shadcn UI & Lucide Components
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
} from "lucide-react";

// Inline Social Icon SVGs
const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.239-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
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

const courses = [
  {
    title: "Fashion Design",
    category: "CREATIVE ARTS",
    duration: "3 Months",
    description:
      "Turn your ideas into original looks and build the practical skills to bring your garments to life.",
    image: FashionDesign,
    alt: "Fashion design course",
    number: "01",
  },
  {
    title: "Photography",
    category: "MEDIA & PRODUCTION",
    duration: "2 Months",
    description:
      "Learn to see the story, shape light effectively, and capture high-quality images with confidence.",
    image: Camera,
    alt: "Camera and photography course",
    number: "02",
  },
  {
    title: "Mobile Maintenance",
    category: "TECHNOLOGY",
    duration: "3 Months",
    description:
      "Build hands-on diagnostic and hardware repair skills for modern mobile devices.",
    image: MobileMaintenance,
    alt: "Mobile phone maintenance course",
    number: "03",
  },
];

const features = [
  {
    icon: Wrench,
    title: "100% Practical Training",
    description: "Work directly with industry-standard equipment and real-world tools from day one.",
  },
  {
    icon: GraduationCap,
    title: "Certified Instructors",
    description: "Learn from experienced professionals who actively work in their respective fields.",
  },
  {
    icon: Users,
    title: "Small Class Sizes",
    description: "Get personalized guidance and one-on-one feedback in focused classroom environments.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 flex flex-col justify-between">
      <div>
        <Navbar />

        {/* Hero Section */}
        <section className="relative px-5 pt-28 pb-16 sm:pt-36 sm:pb-24 bg-gradient-to-b from-blue-500/5 via-transparent to-transparent">
          <div className="mx-auto max-w-6xl text-center space-y-6">
            <Badge variant="outline" className="px-3 py-1 border-blue-400/40 text-blue-500 dark:text-blue-400 bg-blue-400/10 font-semibold gap-1.5 text-xs sm:text-sm">
              <Sparkles className="h-3.5 w-3.5" /> Empowering Practical Skills
            </Badge>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight text-slate-950 dark:text-white">
              Master Practical Skills for <span className="text-blue-400">Real-World Success</span>
            </h1>

            <p className="text-base sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Logos College provides career-focused certificate programs designed to transform your creative interests into professional opportunities.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/register"
                className={buttonVariants({
                  size: "lg",
                  className: "w-full sm:w-auto font-bold gap-2 text-base px-8 shadow-lg !bg-blue-400 hover:!bg-blue-500 text-white border-none",
                })}
              >
                Start Online Registration
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#programs"
                className={buttonVariants({
                  variant: "outline",
                  size: "lg",
                  className: "w-full sm:w-auto font-bold text-base px-8 border-slate-300 dark:border-slate-800",
                })}
              >
                Explore Programs
              </Link>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-12 max-w-3xl mx-auto border-t border-slate-200 dark:border-slate-800">
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-blue-400">100%</p>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">Practical Workshops</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-blue-400">Flexible</p>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">Class Schedules</p>
              </div>
              <div className="col-span-2 md:col-span-1">
                <p className="text-2xl sm:text-3xl font-extrabold text-blue-400">Certified</p>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">Program Clearances</p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="px-5 py-16 bg-slate-100/70 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
          <div className="mx-auto max-w-6xl">
            <div className="text-center space-y-2 mb-12">
              <p className="text-xs font-bold uppercase tracking-widest text-blue-400">Why Logos College</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">Built for hands-on learners</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feat) => {
                const IconComponent = feat.icon;
                return (
                  <div key={feat.title} className="flex flex-col items-center text-center p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                    <div className="h-12 w-12 rounded-xl bg-blue-400/10 text-blue-400 flex items-center justify-center mb-4">
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-slate-100">{feat.title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{feat.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Programs Grid Section */}
        <section id="programs" className="px-5 py-20 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 flex flex-col justify-between gap-5 sm:mb-12 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-blue-400">
                  Learn by doing
                </p>
                <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
                  Find your next skill
                </h2>
                <p className="mt-2 max-w-xl text-slate-600 dark:text-slate-400">
                  Explore practical programs designed to help turn your interests
                  into real career opportunities.
                </p>
              </div>
              <Link
                href="/register"
                className={buttonVariants({
                  variant: "link",
                  className: "group p-0 font-bold text-blue-400 hover:text-blue-500 hover:no-underline"
                })}
              >
                Browse all programs
                <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {courses.map((course) => (
                <Card
                  key={course.title}
                  className="group overflow-hidden border-slate-200/80 bg-white/90 dark:bg-slate-900/90 dark:border-slate-800 transition-all duration-300 hover:-translate-y-1.5 hover:border-blue-300 dark:hover:border-blue-800 hover:shadow-xl flex flex-col justify-between"
                >
                  <div>
                    <div className="relative overflow-hidden">
                      <Image
                        src={course.image}
                        alt={course.alt}
                        className="h-56 w-full object-cover transition duration-500 group-hover:scale-105"
                        priority={course.number === "01"}
                      />
                      <Badge className="absolute left-4 top-4 border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 text-[10px] font-extrabold tracking-wider text-blue-400 backdrop-blur">
                        {course.category}
                      </Badge>
                      <Badge variant="secondary" className="absolute right-4 top-4 text-[10px] font-medium gap-1 bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 backdrop-blur border border-slate-200 dark:border-slate-800">
                        <Clock className="h-3 w-3 text-blue-400" /> {course.duration}
                      </Badge>
                    </div>

                    <CardHeader className="pb-2">
                      <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
                        {course.title}
                      </CardTitle>
                    </CardHeader>

                    <CardContent>
                      <CardDescription className="leading-relaxed text-slate-600 dark:text-slate-400">
                        {course.description}
                      </CardDescription>
                    </CardContent>
                  </div>

                  <CardFooter className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <Link
                      href="/register"
                      className={buttonVariants({
                        className: "w-full font-bold gap-2 !bg-blue-400 hover:!bg-blue-500 text-white shadow-sm border-none",
                        size: "sm"
                      })}
                    >
                      Enroll Now
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Banner Call-To-Action */}
        <section className="px-5 pb-20 sm:pb-24">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-7 overflow-hidden rounded-3xl bg-slate-900 dark:bg-slate-900/90 border border-slate-800 p-8 sm:p-12 text-white shadow-2xl sm:flex-row sm:items-center">
            <div className="max-w-2xl space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-blue-400">
                Ready when you are
              </p>
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                Your future is worth investing in.
              </h2>
              <p className="text-slate-300 text-sm sm:text-base">
                Create your account today and start building practical skills with Logos College.
              </p>
            </div>
            <Link
              href="/register"
              className={buttonVariants({
                size: "lg",
                className: "group shrink-0 font-bold shadow-lg gap-2 !bg-blue-400 hover:!bg-blue-500 text-white border-none",
              })}
            >
              Start Online Registration
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </section>
      </div>

      {/* Rich Footer with Contact Details and Custom Social Icons */}
      <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-600 dark:text-slate-400 text-sm pt-12 pb-8">
        <div className="max-w-6xl mx-auto px-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-200 dark:border-slate-800">

            {/* Column 1: College Identity */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-18 w-18 rounded-lg bg-blue-400 flex items-center justify-center text-white font-black text-lg">
                  <Image src="/assets/logo.png" alt="Logos College" width={80} height={32} className="rounded-lg" />

                </div>
                <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight">
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Empowering individuals through hands-on technical skills and practical vocational training.
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
                Contact Information
              </h4>
              <ul className="space-y-2.5 text-xs">
                <li className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 text-blue-400 shrink-0" />
                  <a href="tel:+25947788899" className="hover:text-blue-400 transition-colors">
                    +251947788899
                  </a>
                  <a href="tel:+251947628899" className="hover:text-blue-400 transition-colors">
                    +251947628899
                  </a>
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

            {/* Column 4: Social Media Links */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                Connect With Us
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Follow our official social channels for announcements and news:
              </p>
              <div className="flex items-center gap-3 pt-1">
                <a
                  href="tiktok.com/@logosofficial12"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 w-9 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
                  aria-label="TikTok"
                >
                  <TikTokIcon className="h-4 w-4" />
                </a>
                <a
                  href="https://www.instagram.com/logos_4796/?utm_source=ig_web_button_share_sheet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 w-9 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-gradient-to-br hover:from-[#F58529] hover:via-[#DD2A7B] hover:to-[#8134AF] hover:text-white dark:hover:text-white transition-all"
                  aria-label="Instagram"
                >
                  <InstagramIcon className="h-4 w-4" />
                </a>

                <a
                  href="https://t.me"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 w-9 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-[#26A5E4] hover:text-white dark:hover:bg-[#26A5E4] dark:hover:text-white transition-all"
                  aria-label="Telegram"
                >
                  <TelegramIcon className="h-4 w-4" />
                </a>
              </div>
            </div>

          </div>

          {/* Copyright Sub-Footer */}
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