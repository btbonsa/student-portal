"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, X } from "lucide-react";

export function ApiErrorAlert({ missing = false }: { missing?: boolean }) {
  const [showAlert, setShowAlert] = useState(false);
  const [entered, setEntered] = useState(false);

  // Only show the alert if the API URL is completely missing
  useEffect(() => {
    if (missing) {
      setShowAlert(true);
      // Next frame, so the slide-in transition actually plays
      const id = requestAnimationFrame(() => setEntered(true));
      return () => cancelAnimationFrame(id);
    }
  }, [missing]);

  const dismiss = () => {
    setEntered(false);
    setTimeout(() => setShowAlert(false), 200);
  };

  // Close on Escape
  useEffect(() => {
    if (!showAlert) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showAlert]);

  if (!showAlert) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`fixed bottom-4 right-4 z-50 w-[calc(100%-2rem)] max-w-md overflow-hidden rounded-2xl border border-amber-200/80 bg-white shadow-xl shadow-amber-900/10 ring-1 ring-black/5 transition-all duration-300 ease-out dark:border-amber-500/20 dark:bg-slate-900 dark:shadow-black/40 ${
        entered ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
      }`}
    >
      {/* Accent bar */}
      <div aria-hidden className="h-1 w-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500" />

      <div className="flex items-start gap-3.5 p-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300">
          <AlertTriangle className="h-5 w-5" aria-hidden />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            API configuration required
          </p>
          <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            The{" "}
            <code className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-slate-800 dark:bg-slate-800 dark:text-amber-200">
              NEXT_PUBLIC_API_URL
            </code>{" "}
            environment variable is not set. Add it in your deployment settings, then redeploy. Both HTTP and HTTPS URLs are supported.
          </p>
        </div>

        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss alert"
          className="-mr-1 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}