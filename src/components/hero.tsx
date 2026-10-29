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
  { icon: GraduationCap, title: "Certificate Programs", text: "Hands-on, career-focused" },
  { icon: Clock, title: "Flexible Learning", text: "Study at your own pace" },
  { icon: UserCheck, title: "Expert Instructors", text: "Industry professionals" },
  { icon: Globe, title: "Global Opportunities", text: "Build your future" },
];

export default function Hero() {
  return (
    <section className="relative isolate flex min-h-[640px] md:min-h-screen flex-col justify-between overflow-hidden bg-[#06142e] text-white">
      {/* Background photo (pushed to the right so the student sits beside the text) */}
      <Image
        src="https://res.cloudinary.com/jdlwtfgh/image/upload/v1793310544/Smiling_Student_on_Campus.png"
        alt="Smiling Logos College student holding a tablet on campus"
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover object-[70%_center] md:object-right"
      />

      {/* Navy overlays: left side dark for readable text, bottom dark for the feature strip */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#06142e] via-[#06142e]/80 to-[#06142e]/0 md:via-[#06142e]/60" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#06142e] via-transparent to-[#06142e]/40" />

      {/* Content */}
      <div className="mx-auto w-full max-w-6xl flex-1 px-5 pt-32 pb-10 sm:pt-40 md:flex md:items-center">
        <div className="max-w-xl space-y-6">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-blue-500">
            Logos College
          </p>

          <h1
            className={`${serif.className} text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight`}
          >
            Your Future
            <span className="block bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              Starts Here
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-100">
            Quality education. Practical skills. A brighter future.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <Link
              href="#programs"
              className={buttonVariants({
                size: "lg",
                className:
                  "h-12 rounded-full px-8 text-base font-semibold gap-2 !bg-blue-600 hover:!bg-blue-500 text-white border-none shadow-lg shadow-blue-600/30",
              })}
            >
              Explore Programs
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/login"
              className={buttonVariants({
                variant: "ghost",
                size: "lg",
                className:
                  "h-12 rounded-full px-8 text-base font-semibold gap-2 bg-white/5 text-white backdrop-blur-sm hover:bg-white/15 hover:text-white",
              })}
            >
              <User className="h-5 w-5" />
              Student Portal
            </Link>
          </div>
        </div>
      </div>

      {/* Feature strip */}
      <div className="mx-auto w-full max-w-6xl px-5 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 rounded-2xl bg-[#06142e]/70 p-4 backdrop-blur-md">
          {highlights.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-center gap-4 p-2">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-600">
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-bold leading-tight">{title}</p>
                <p className="text-sm text-slate-300">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
