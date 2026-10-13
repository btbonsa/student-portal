"use client";

import { useEffect, useState } from "react";

export function ApiErrorAlert() {
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    // Only show alert if API URL is completely missing
    if (!apiUrl) {
      setShowAlert(true);
    }
  }, []);

  if (!showAlert) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md rounded-lg border border-amber-200 bg-amber-50 p-4 shadow-lg dark:border-amber-800 dark:bg-amber-950">
      <div className="flex items-start gap-3">
        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-200 text-amber-800 dark:bg-amber-800 dark:text-amber-200">
          !
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
            API Configuration Required
          </p>
          <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
            The NEXT_PUBLIC_API_URL environment variable is not configured. Please configure it in your deployment settings. Both HTTP and HTTPS URLs are supported.
          </p>
        </div>
        <button
          onClick={() => setShowAlert(false)}
          className="text-amber-500 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-200"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
