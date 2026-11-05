import Image from "next/image";
import Link from "next/link";
import { Source_Serif_4 } from "next/font/google";
import { buttonVariants } from "@/components/ui/button";
import {
  ArrowRight,
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

      {/* One overlay: dark enough on mobile for text, opens up on the right on larger screens */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#06142e] via-[#06142e]/75 to-[#06142e]/60 md:bg-gradient-to-r md:from-[#06142e] md:via-[#06142e]/70 md:to-transparent" />

      {/* Content */}
      <div className="mx-auto flex w-full max-w-6xl flex-1 items-center px-5 pb-10 pt-28 sm:pt-36">
        <div className="max-w-xl space-y-5 sm:space-y-6">
          <h1
            className={`${serif.className} text-balance text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl`}
          >
            Your future starts here.
          </h1>

          <p className="max-w-md text-base leading-relaxed text-slate-200 sm:text-lg">
            Hands-on certificate programs in fashion design, camera, and mobile
            maintenance, taught by working professionals.
          </p>

          <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:gap-4">
            <Link
              href="#programs"
              className={buttonVariants({
                size: "lg",
                className:
                  "group h-12 w-full gap-2 rounded-full border-none !bg-blue-600 px-8 text-base font-semibold text-white shadow-lg shadow-blue-600/30 hover:!bg-blue-500 sm:w-auto",
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
                  "h-12 w-full gap-2 rounded-full border border-white/25 bg-white/5 px-8 text-base font-semibold text-white backdrop-blur-sm hover:bg-white/15 hover:text-white sm:w-auto",
              })}
            >
              <User className="h-5 w-5" />
              Student portal
            </Link>
          </div>
        </div>
      </div>

      {/* Feature bar: 2 columns on phones, 4 on large screens */}
      <div className="mx-auto w-full max-w-6xl px-5 pb-6 sm:pb-8">
        <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md lg:grid-cols-4">
          {highlights.map(({ icon: Icon, title, text }) => (
            <li
              key={title}
              className="flex flex-col gap-2 bg-[#06142e]/70 p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5"
            >
              <Icon className="h-6 w-6 shrink-0 text-blue-300" aria-hidden />
              <div>
                <p className="text-sm font-bold leading-tight sm:text-base">{title}</p>
                <p className="mt-0.5 text-xs text-slate-300 sm:text-sm">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}