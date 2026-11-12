"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  ArrowRight,
  ClipboardList,
  CreditCard,
  Loader2,
  ShieldCheck,
} from "lucide-react";

import { loginStudent } from "../../services/authservices";
import { saveAuth } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";
import { AuthShowcase, MobileBrand } from "@/components/auth-showcase";
import { PasswordField, PhoneField } from "@/components/auth-fields";

export default function Login() {
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+251");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const clearFieldError = (name: string) => {
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    // Validate raw phone input (without country code)
    const phoneDigits = phone.replace(/\D/g, "").replace(/^0+/, "");
    if (phoneDigits.length < 7) {
      setFieldErrors({ phone: "Phone number must be at least 7 digits" });
      setError("Please fix the validation errors below.");
      return;
    }
    if (phoneDigits.length > 15) {
      setFieldErrors({ phone: "Phone number must be at most 15 digits" });
      setError("Please fix the validation errors below.");
      return;
    }
    if (!phoneDigits.startsWith("9")) {
      setFieldErrors({ phone: "Phone number must start with 9" });
      setError("Please fix the validation errors below.");
      return;
    }

    // Normalize phone with country code
    const normalizedPhone = `${countryCode}${phoneDigits}`;

    // Validate with Zod schema
    const validationResult = loginSchema.safeParse({
      phone: normalizedPhone,
      password,
    });

    if (!validationResult.success) {
      const errors: Record<string, string> = {};
      validationResult.error.issues.forEach((err) => {
        const field = err.path.join(".");
        errors[field] = err.message;
      });
      setFieldErrors(errors);
      setError("Please fix the validation errors below.");
      return;
    }

    try {
      setLoading(true);
      const validatedData = validationResult.data;
      const response = await loginStudent({
        phone: normalizedPhone,
        password: validatedData.password,
      });

      if (response.user.role !== "STUDENT") {
        setError("This account cannot access the student portal.");
        return;
      }

      saveAuth(response.token, response.user);
      router.push("/dashboard");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login failed.";

      if (
        errorMessage.includes("API URL") ||
        errorMessage.includes("configured")
      ) {
        setError("Server configuration error. Please contact support.");
      } else if (errorMessage.includes("API returned")) {
        setError("Unable to connect to server. Please try again later.");
      } else if (
        errorMessage.includes("phone:") ||
        errorMessage.includes("password:")
      ) {
        // Parse field-specific errors from backend
        const parsedErrors: Record<string, string> = {};
        const errorParts = errorMessage.split(", ");
        errorParts.forEach((part) => {
          const [field, message] = part.split(": ");
          if (field && message) {
            parsedErrors[field] = message;
          }
        });
        setFieldErrors(parsedErrors);
        setError("Please fix the validation errors below.");
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen bg-gray-100 dark:bg-slate-950 lg:grid-cols-2">
      <AuthShowcase
        headline="Pick up where"
        accent="you left off"
        subtitle="Sign in to follow your registration, view your programs and keep your payments in order."
        points={[
          { icon: ClipboardList, text: "Track your program registrations" },
          { icon: CreditCard, text: "Manage your payments in one place" },
          { icon: ShieldCheck, text: "Your student records stay private" },
        ]}
      />

      <section className="flex items-center justify-center px-4 py-5 sm:px-6 lg:px-8">
        <div className="w-full max-w-sm space-y-4 animate-in fade-in duration-700">
          <MobileBrand />

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-md shadow-slate-200/30 sm:p-6 dark:border-slate-800/80 dark:bg-slate-900/80 dark:shadow-none">
            <div className="space-y-0.1 mb-0.5">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-slate-50">
                Welcome back
              </h1>
            </div>

            {error && (
              <div
                role="alert"
                className="mt-3 flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50/70 p-2.5 text-xs font-medium text-rose-700 animate-in fade-in slide-in-from-top-2 duration-300 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300"
              >
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form className="mt-3 space-y-2.5" onSubmit={handleSubmit}>
              <PhoneField
                value={phone}
                onChange={(value) => {
                  setPhone(value);
                  clearFieldError("phone");
                }}
                countryCode={countryCode}
                onCountryChange={setCountryCode}
                disabled={loading}
                error={fieldErrors.phone}
                dense
              />

              <PasswordField
                id="password"
                name="password"
                label="Password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearFieldError("password");
                }}
                disabled={loading}
                error={fieldErrors.password}
                dense
              >
                <a
                  href="#"
                  className="inline-block pt-0.5 text-xs font-semibold text-blue-600/30 transition-colors hover:text-blue-500 hover:underline dark:text-blue-400"
                >
                  Forgot password?
                </a>
              </PasswordField>

              <Button
                type="submit"
                disabled={loading}
                className="h-9 w-full gap-1.5 rounded-lg bg-blue-600 text-xs font-semibold text-white shadow-xs shadow-blue-600/30 transition-all duration-200 hover:-translate-y-px hover:bg-blue-500 hover:shadow-sm hover:shadow-blue-600/50 active:scale-[0.98] mt-4"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-4 border-t border-slate-100 pt-3 text-center text-xs text-slate-500 dark:border-slate-800/80 dark:text-slate-400">
              New student?{" "}
              <Link
                href="/register"
                className="font-semibold text-blue-600 hover:underline focus-visible:outline-none dark:text-blue-400"
              >
                Create an account
              </Link>
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}
