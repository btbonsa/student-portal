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
    const phoneDigits = phone.replace(/\D/g, "");
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

      if (errorMessage.includes("API URL") || errorMessage.includes("configured")) {
        setError("Server configuration error. Please contact support.");
      } else if (errorMessage.includes("API returned")) {
        setError("Unable to connect to server. Please try again later.");
      } else if (errorMessage.includes("phone:") || errorMessage.includes("password:")) {
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
    <main className="grid min-h-screen bg-slate-50 selection:bg-blue-600 selection:text-white dark:bg-slate-950 lg:grid-cols-2">
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

      <section className="flex items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-md space-y-8 animate-in fade-in duration-700">
          <MobileBrand />

          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
              Welcome back
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Sign in to your student portal to continue your journey.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-xl border border-rose-200/70 bg-rose-50 p-3.5 text-sm font-medium text-rose-600 animate-in fade-in slide-in-from-top-2 duration-300 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-400"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
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
              hint="Enter your phone number without the country code"
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
              labelAction={
                <a
                  href="#"
                  className="text-xs font-semibold text-blue-600 transition-colors hover:text-blue-500 hover:underline dark:text-blue-400"
                >
                  Forgot password?
                </a>
              }
            />

            <Button
              type="submit"
              disabled={loading}
              className="h-12 w-full gap-2 rounded-xl bg-blue-600 text-base font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-500 hover:shadow-xl hover:shadow-blue-600/30 active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-xs font-medium text-slate-400">
              <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
              New student?
              <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
            </div>
            <Link href="/register" className="block">
              <Button
                type="button"
                variant="outline"
                className="h-12 w-full rounded-xl border-slate-200 text-base font-semibold hover:bg-white hover:border-blue-300 hover:text-blue-600 transition-all dark:border-slate-800 dark:hover:bg-slate-900 dark:hover:border-blue-800 dark:hover:text-blue-400"
              >
                Create new account
              </Button>
            </Link>
          </div>

          <p className="flex items-center justify-center gap-2 text-xs font-medium text-slate-400">
            <ShieldCheck className="h-4 w-4 text-blue-600" />
            Secure SSL encrypted connection
          </p>
        </div>
      </section>
    </main>
  );
}