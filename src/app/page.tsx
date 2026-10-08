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
} from "lucide-react";


const courses = [
  {
    title: "Fashion Design",
    category: "CREATIVE ARTS",
    description:
      "Turn your ideas into original looks and build the skills to bring them to life.",
    image: FashionDesign,
    alt: "Fashion design course",
    number: "01",
  },
  {
    title: "Photography",
    category: "MEDIA & PRODUCTION",
    description:
      "Learn to see the story, shape the light, and capture images with confidence.",
    image: Camera,
    alt: "Camera and photography course",
    number: "02",
  },
  {
    title: "Mobile Maintenance",
    category: "TECHNOLOGY",
    description:
      "Build practical repair skills for the devices that keep the world connected.",
    image: MobileMaintenance,
    alt: "Mobile phone maintenance course",
    number: "03",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <Navbar />

      {/* Programs Grid Section */}
      <section id="programs" className="px-5 pt-24 pb-20 sm:pt-24 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex flex-col justify-between gap-5 sm:mb-12 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-800 dark:text-emerald-400">
                Learn by doing
              </p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
                Find your next skill
              </h2>
              <p className="mt-2 max-w-xl text-slate-600 dark:text-slate-400">
                Explore practical programs designed to help turn your interests
                into real opportunities.
              </p>
            </div>
            <Link href="/register" className={buttonVariants({ variant: "link", className: "group p-0 font-bold text-emerald-800 hover:text-blue-600 dark:text-emerald-400" })}>
                Browse all programs
                <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {courses.map((course) => (
              <Card
                key={course.title}
                className="group overflow-hidden border-slate-200/80 transition-all duration-300 hover:-translate-y-1.5 hover:border-blue-300 hover:shadow-xl dark:border-slate-800 dark:hover:border-blue-800"
              >
                <div className="relative overflow-hidden">
                  <Image
                    src={course.image}
                    alt={course.alt}
                    className="h-64 w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <Badge className="absolute left-4 top-4 border-white/60 bg-white/90 text-[10px] font-extrabold tracking-wider text-emerald-900 backdrop-blur dark:bg-slate-900/90 dark:text-emerald-400">
                    {course.category}
                  </Badge>
               
                </div>

                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-bold">
                    {course.title}
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <CardDescription className="min-h-12 leading-relaxed">
                    {course.description}
                  </CardDescription>
                </CardContent>

                <CardFooter >
                  <Link href="/register" className="no-underline">
                      <div className="bg-blue-400 px-4 py-2 text-white rounded-lg font-bold transition-colors">
                        Enroll now
                      </div>
                    </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Banner Call-To-Action */}
      <section className="px-5 pb-20 sm:pb-24">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-7 overflow-hidden rounded-3xl bg-slate-900 px-7 py-10 text-white shadow-2xl dark:bg-blue-950 sm:flex-row sm:items-center sm:px-12 sm:py-12">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-400">
              Ready when you are
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Your future is worth investing in.
            </h2>
            <p className="mt-2 text-slate-300">
              Create your account and start building the skills you want to be known for.
            </p>
          </div>
          <Link href="/register" className={buttonVariants({ size: "lg", className: "group shrink-0 rounded-xl !bg-blue-400 font-bold text-white shadow-lg hover:!bg-blue-300 hover:text-white" })}>
            start Registration online
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-5 py-7 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-950">
        © {new Date().getFullYear()} Logos College. All rights reserved.
      </footer>
    </main>
  );
}