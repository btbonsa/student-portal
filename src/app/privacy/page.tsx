import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy — Logos College",
};

const sections = [
  {
    title: "Information we collect",
    body: "We collect the information you provide during registration and use of the portal, including your name, phone number, payment details, and program enrollment data.",
  },
  {
    title: "How we use your information",
    body: "Your information is used to process registrations, verify payments, communicate important updates about your programs, and improve our services.",
  },
  {
    title: "Data security",
    body: "We apply reasonable technical and organizational measures to protect your personal data. Access to student records is restricted to authorized staff.",
  },
  {
    title: "Data sharing",
    body: "We do not sell your personal information. Data may be shared with trusted service providers strictly as needed to operate the portal, or when required by law.",
  },
  {
    title: "Your rights",
    body: "You may request access to, correction of, or deletion of your personal data by contacting us at info@logoscollege.edu.et.",
  },
  {
    title: "Changes to this policy",
    body: "We may update this policy from time to time. Continued use of the portal after changes take effect constitutes acceptance of the revised policy.",
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-5 py-16 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <article className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-500 dark:text-blue-400"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to home
        </Link>

        <h1 className="mt-6 text-3xl font-black tracking-tight sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Last updated: November 2026
        </p>

        <div className="mt-10 space-y-8">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-lg font-bold">{section.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {section.body}
              </p>
            </section>
          ))}
        </div>

        <p className="mt-10 border-t border-slate-200 pt-6 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
          Questions? Contact us at{" "}
          <a
            href="mailto:info@logoscollege.edu.et"
            className="font-semibold text-blue-600 hover:underline dark:text-blue-400"
          >
            info@logoscollege.edu.et
          </a>
        </p>
      </article>
    </main>
  );
}
