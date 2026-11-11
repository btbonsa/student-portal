import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import logo from "../../public/icons/icon.png";

interface AuthShowcaseProps {
  headline: string;
  accent: string;
  subtitle: string;
  points: { icon: LucideIcon; text: string }[];
}

export function AuthShowcase({
  headline,
  accent,
  subtitle,
  points,
}: AuthShowcaseProps) {
  return (
    <aside className="relative isolate hidden overflow-hidden bg-[#06142e] p-10 text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:justify-between xl:p-14">
      {/* Background photo */}
      <Image
        src="https://res.cloudinary.com/jdlwtfgh/image/upload/v1793310544/Smiling_Student_on_Campus.png"
        alt="Smiling Logos College student on campus"
        fill
        priority
        sizes="50vw"
        className="-z-30 object-cover object-[75%_center]"
      />

      {/* Navy overlays for readability */}
      <div
        aria-hidden
        className="absolute inset-0 -z-20 bg-gradient-to-r from-[#06142e]/95 via-[#06142e]/70 to-[#06142e]/20"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-20 bg-gradient-to-t from-[#06142e] via-[#06142e]/20 to-[#06142e]/50"
      />

      {/* Decorative: soft glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 -top-32 -z-10 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 left-1/3 -z-10 h-80 w-80 rounded-full bg-sky-400/10 blur-3xl"
      />

      {/* Brand */}
      <Link
        href="/"
        className="group flex w-fit items-center gap-3 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-400"
      >
        <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-white p-1.5 shadow-lg shadow-black/30 ring-4 ring-white/10 transition-transform duration-300 group-hover:scale-105">
          <Image
            src={logo}
            alt="Logos College"
            width={48}
            height={48}
            className="object-contain"
            priority
          />
        </span>
        <span className="leading-tight">
          <span className="block text-lg font-bold tracking-tight">
            Logos College
          </span>
          <span className="block text-xs font-medium text-sky-200/80">
            Excellence in Education
          </span>
        </span>
      </Link>

      {/* Message */}
      <div className="max-w-lg space-y-6">
        <h2 className="text-4xl font-extrabold leading-[1.1] tracking-tight xl:text-5xl">
          {headline}
          <span className="block bg-gradient-to-r from-sky-300 to-blue-400 bg-clip-text pb-1 text-transparent">
            {accent}
          </span>
        </h2>

        <p className="max-w-md text-base leading-relaxed text-slate-300/90">
          {subtitle}
        </p>
      </div>

      {/* Points + footer */}
      <div className="space-y-8">
        <ul aria-label="Highlights" className="grid gap-3">
          {points.map(({ icon: Icon, text }) => (
            <li
              key={text}
              className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3.5 backdrop-blur-md transition duration-300 hover:-translate-y-0.5 hover:border-sky-300/30 hover:bg-white/[0.1]"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-700 shadow-md shadow-blue-900/40">
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-sm font-medium leading-snug text-slate-100">
                {text}
              </span>
            </li>
          ))}
        </ul>

        <p className="text-xs text-slate-400">
          © {new Date().getFullYear()} Logos College. All rights reserved.
        </p>
      </div>
    </aside>
  );
}

/** Compact brand header shown above the form on small screens (the showcase panel is hidden there). */
export function MobileBrand() {
  return (
    <Link
      href="/"
      className="mx-auto flex w-fit items-center gap-3 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-500 lg:hidden"
    >
        <Image
          src={logo}
          alt="Logos College"
          width={34}
          height={34}
          className="object-contain"
          priority
        />
      <span className="leading-tight">
        <span className="block font-bold tracking-tight text-slate-900 dark:text-slate-50">
          Logos College
        </span>
        <span className="block text-[11px] font-medium text-slate-500 dark:text-slate-400">
          Excellence in Education
        </span>
      </span>
    </Link>
  );
}
