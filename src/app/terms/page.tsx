import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms of Service — Logos College",
};

const sections = [
  {
    title: "Acceptance of terms",
    body: "By accessing or using the Logos College student portal, you agree to be bound by these Terms of Service. If you do not agree, please do not use the portal.",
  },
  {
    title: "Student accounts",
    body: "You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. Notify us immediately of any unauthorized use.",
  },
  {
    title: "Registrations and payments",
    body: "Program registrations are subject to fee payment and administrative verification. Registration is confirmed only after your payment receipt is reviewed and approved by an administrator.",
  },
  {
    title: "Acceptable use",
    body: "You agree not to misuse the portal, including attempting unauthorized access, interfering with the service, or submitting false payment information.",
  },
  {
    title: "Certificates and content",
    body: "Certificates are issued upon successful completion of program requirements. Course content and materials remain the property of Logos College.",
  },
  {
    title: "Limitation of liability",
    body: "The portal is provided \"as is\". Logos College is not liable for indirect or consequential damages arising from your use of the service.",
  },
  {
    title: "Changes to these terms",
    body: "We may revise these terms at any time. Continued use of the portal after changes take effect constitutes acceptance of the revised terms.",
  },
];

export default function TermsPage() {
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
          Terms of Service
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
