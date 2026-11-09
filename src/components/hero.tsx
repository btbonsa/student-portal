import Image from "next/image";
import Link from "next/link";
import { Source_Serif_4 } from "next/font/google";
import { buttonVariants } from "@/components/ui/button";
import {
  ArrowRight,
  Camera,
  Check,
  Clock,
  GraduationCap,
  Globe,
  User,
  UserCheck,
} from "lucide-react";

const serif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["700", "800"],
});

const highlights = [
  { icon: GraduationCap, title: "Certificate programs", text: "Hands-on, career-focused" },
  { icon: Clock, title: "Flexible learning", text: "Study at your own pace" },
  { icon: UserCheck, title: "Expert instructors", text: "Industry professionals" },
  { icon: Globe, title: "Global opportunities", text: "Build your future" },
];

export default function Hero() {
  return (
    <section className="relative isolate flex min-h-[100svh] flex-col justify-between overflow-hidden bg-[#06142e] text-white">
      {/* Background photo */}
      <Image
        src="https://res.cloudinary.com/jdlwtfgh/image/upload/v1793310544/Smiling_Student_on_Campus.png"
        alt="Smiling Logos College student holding a tablet on campus"
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover object-[70%_center] md:object-right"
      />

      {/* Ambient glow accents */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-1/4 -z-10 h-96 w-96 rounded-full bg-blue-600/25 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 bottom-24 -z-10 h-80 w-80 rounded-full bg-blue-400/15 blur-3xl"
      />

      {/* One overlay: dark enough on mobile for text, opens up on the right on larger screens */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#06142e] via-[#06142e]/75 to-[#06142e]/60 md:bg-gradient-to-r md:from-[#06142e] md:via-[#06142e]/70 md:to-transparent" />

      {/* Content */}
      <div className="mx-auto flex w-full max-w-6xl flex-1 items-center px-5 pb-10 pt-28 sm:pt-36">
        <div className="max-w-xl space-y-5 sm:space-y-6">
          <p
            className="hero-reveal inline-flex items-center gap-2 rounded-lg border border-blue-300/30 bg-blue-400/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-blue-200 backdrop-blur-sm"
            style={{ animationDelay: "0.05s" }}
          >
            Now enrolling — 2026 intake
          </p>

          <h1
            className={`${serif.className} hero-reveal text-balance text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl`}
            style={{ animationDelay: "0.15s" }}
          >
            Your{" "}
            <span className="bg-gradient-to-r from-blue-300 via-blue-200 to-cyan-200 bg-clip-text text-transparent">
              future
            </span>{" "}
            starts here.
          </h1>

          <p
            className="hero-reveal max-w-md text-base leading-relaxed text-slate-200 sm:text-lg"
            style={{ animationDelay: "0.25s" }}
          >
            Hands-on certificate programs in fashion design, camera, and mobile
            maintenance, taught by working professionals.
          </p>

          <div
            className="hero-reveal flex flex-col gap-3 pt-1 sm:flex-row sm:gap-4"
            style={{ animationDelay: "0.35s" }}
          >
            <Link
              href="#programs"
              className={buttonVariants({
                size: "lg",
                className:
                  "group h-10 w-full gap-2 rounded-full border-none !bg-blue-600 px-8 text-base font-semibold text-white shadow-lg shadow-blue-600/30 hover:!bg-blue-500 sm:w-auto",
              })}
            >
              Explore programs
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/login"
              className={buttonVariants({
                variant: "ghost",
                size: "lg",
                className:
                  "h-10 w-full gap-2 rounded-lg border border-white/25 bg-white/5 px-8 text-base font-semibold text-white backdrop-blur-sm hover:bg-white/15 hover:text-white sm:w-auto",
              })}
            >
              <User className="h-5 w-5" />
              Student portal
            </Link>
          </div>

          <ul
            className="hero-reveal flex flex-wrap gap-x-5 gap-y-1 pt-1"
            style={{ animationDelay: "0.42s" }}
          >
            {[
              "Certificate on completion",
              "No experience needed",
              "Small class sizes",
            ].map((item) => (
              <li
                key={item}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 sm:text-sm"
              >
                <Check className="h-2 w-2 text-blue-300" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Floating program preview card (large screens) */}
      <div
        aria-hidden
        className="hero-reveal absolute right-10 top-32 hidden w-72 xl:block"
        style={{ animationDelay: "0.6s" }}
      >
        <div className="animate-float rounded-2xl border border-white/15 bg-white/10 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/30 text-blue-200 ring-1 ring-white/20">
              <Camera className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <p className="text-sm font-bold">Camera &amp; Media</p>
              <p className="text-xs text-slate-300">Certificate program</p>
            </div>
          </div>
          <div className="mt-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">Program progress</span>
              <span className="font-bold text-blue-200">68%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/15">
              <div className="h-full w-[68%] rounded-full bg-gradient-to-r from-blue-400 to-cyan-300" />
            </div>
            <div className="flex items-center justify-between pt-1 text-xs text-slate-300">
              <span>Duration</span>
              <span className="font-semibold text-white">2 months</span>
            </div>
          </div>
        </div>
      </div>

      {/* Feature bar: 2 columns on phones, 4 on large screens */}
      <div
        className="hero-reveal mx-auto w-full max-w-6xl px-5 pb-6 sm:pb-8"
        style={{ animationDelay: "0.45s" }}
      >
        <ul className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
          {highlights.map(({ icon: Icon, title, text }) => (
            <li
              key={title}
              className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300/40 hover:bg-white/10 hover:shadow-lg hover:shadow-blue-950/30 sm:gap-3.5 sm:p-4"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/20 text-blue-300 ring-1 ring-blue-300/20 transition-colors duration-300 group-hover:bg-blue-500 group-hover:text-white sm:h-10 sm:w-10">
                <Icon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="truncate text-xs font-bold leading-tight text-white sm:text-sm">
                  {title}
                </p>
                <p className="mt-0.5 truncate text-[11px] text-slate-300 sm:text-xs">
                  {text}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
