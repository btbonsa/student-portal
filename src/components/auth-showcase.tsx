import Image from "next/image";
import Link from "next/link";
import { Source_Serif_4 } from "next/font/google";
import type { LucideIcon } from "lucide-react";

import logo from "../../public/assets/llogo.jpg";

const serif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["700", "800"],
});

interface AuthShowcaseProps {
  headline: string;
  accent: string;
  subtitle: string;
  points: { icon: LucideIcon; text: string }[];
}

export function AuthShowcase({ headline, accent, subtitle, points }: AuthShowcaseProps) {
  return (
    <aside className="relative isolate hidden overflow-hidden bg-[#06142e] p-12 text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:justify-between">
      {/* Background photo */}
      <Image
        src="https://res.cloudinary.com/jdlwtfgh/image/upload/v1793310544/Smiling_Student_on_Campus.png"
        alt="Smiling Logos College student on campus"
        fill
        priority
        sizes="50vw"
        className="-z-20 object-cover object-[75%_center]"
      />
      {/* Navy overlays for readability */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#06142e]/95 via-[#06142e]/70 to-[#06142e]/20" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#06142e] via-transparent to-[#06142e]/50" />

      {/* Brand */}
      <Link href="/" className="flex w-fit items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-white p-1.5 shadow-lg">
          <Image src={logo} alt="Logos College" width={48} height={48} className="object-contain" priority />
        </span>
        <span className="leading-tight">
          <span className="block text-lg font-bold">Logos College</span>
          <span className="block text-xs text-slate-300">Excellence in Education</span>
        </span>
      </Link>

      {/* Message */}
      <div className="max-w-md space-y-5">
        <h2 className={`${serif.className} text-5xl font-extrabold leading-[1.08] tracking-tight`}>
          {headline}
          <span className="block bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            {accent}
          </span>
        </h2>
        <p className="text-lg text-slate-200">{subtitle}</p>
      </div>

      {/* Points */}
      <ul className="space-y-3 rounded-2xl bg-[#06142e]/70 p-5 backdrop-blur-md">
        {points.map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600">
              <Icon className="h-5 w-5" />
            </span>
            <span className="text-sm font-medium text-slate-100">{text}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

/** Compact brand header shown above the form on small screens (the showcase panel is hidden there). */
export function MobileBrand() {
  return (
    <Link href="/" className="flex w-fit items-center gap-3 lg:hidden">
      <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm dark:border-slate-800">
        <Image src={logo} alt="Logos College" width={44} height={44} className="object-contain" priority />
      </span>
      <span className="font-bold text-slate-900 dark:text-slate-50">Logos College</span>
    </Link>
  );
}
