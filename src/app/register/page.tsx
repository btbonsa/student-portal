"use client";

import { FormEvent, useState } from "react";
import type { ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  Loader2,
  Mail,
  ShieldCheck,
  Users,
  Wrench,
} from "lucide-react";

import { registerStudent } from "../../services/authservices";
import { saveAuth } from "@/lib/auth";
import apiRequest from "@/services/apiservices";
import { registerSchema, checkPasswordStrength } from "@/lib/validation";
import { AuthShowcase, MobileBrand } from "@/components/auth-showcase";
import {
  FieldError,
  FieldLabel,
  PasswordField,
  PhoneField,
  fieldClass,
} from "@/components/auth-fields";

const genders = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
];

function SectionTitle({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-3">
      <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">{children}</h2>
      <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    gender: "MALE",
    date_of_birth: "",
    email: "",
    phone: "",
    countryCode: "+251",
    password: "",
    confirm_password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [passwordStrength, setPasswordStrength] = useState(checkPasswordStrength(""));

  const updateField = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    if (name === "password") {
      setPasswordStrength(checkPasswordStrength(value));
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateField(e.target.name, e.target.value);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setFieldErrors({});

    if (!form.first_name || !form.last_name || !form.date_of_birth || !form.email || !form.phone || !form.password) {
      setError("Please fill in all required fields.");
      return;
    }

    const phoneDigits = form.phone.replace(/\D/g, "");
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

    const normalizedPhone = `${form.countryCode}${phoneDigits}`;

    const validationResult = registerSchema.safeParse({
      email: form.email.trim(),
      phone: normalizedPhone,
      password: form.password,
      confirm_password: form.confirm_password,
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

      const response = await registerStudent({
        email: validatedData.email,
        phone: normalizedPhone,
        password: validatedData.password,
      });

      saveAuth(response.token, response.user);

      await apiRequest(
        "/students/profile",
        {
          method: "POST",
          body: JSON.stringify({
            first_name: form.first_name.trim(),
            last_name: form.last_name.trim(),
            gender: form.gender,
            date_of_birth: form.date_of_birth,
          }),
        },
        response.token
      );

      router.push("/dashboard/programs");
    } catch (err) {
      console.error("Registration error:", err);
      const errorMessage = err instanceof Error ? err.message : "Registration failed.";

      if (errorMessage.includes("API URL") || errorMessage.includes("configured")) {
        setError("Server configuration error. Please contact support.");
      } else if (errorMessage.includes("API returned")) {
        setError("Unable to connect to server. Please try again later.");
      } else if (
        errorMessage.includes("phone:") ||
        errorMessage.includes("password:") ||
        errorMessage.includes("email:")
      ) {
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
        headline="Start your"
        accent="journey today"
        subtitle="Create your account to register for a program, pay online and follow your progress."
        points={[
          { icon: Wrench, text: "100% practical, hands-on training" },
          { icon: GraduationCap, text: "Certificate programs taught by professionals" },
          { icon: Users, text: "Small classes with personal feedback" },
        ]}
      />

      <section className="flex justify-center px-5 py-10 sm:px-10 lg:items-center">
        <div className="w-full max-w-lg space-y-8 animate-in fade-in duration-700">
          <MobileBrand />

          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
              Create your account
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Join Logos College and start building your future today.
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

          {success && (
            <div
              role="status"
              className="flex items-start gap-2.5 rounded-xl border border-emerald-200/70 bg-emerald-50 p-3.5 text-sm font-medium text-emerald-600 animate-in fade-in slide-in-from-top-2 duration-300 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-400"
            >
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              {success}
            </div>
          )}

          <form className="space-y-8" onSubmit={handleSubmit}>
            {/* Personal details */}
            <div className="space-y-5">
              <SectionTitle>Personal details</SectionTitle>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <FieldLabel htmlFor="first_name">First name</FieldLabel>
                  <Input
                    id="first_name"
                    name="first_name"
                    autoComplete="given-name"
                    value={form.first_name}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    placeholder="First name"
                    className={fieldClass()}
                  />
                </div>
                <div className="space-y-2">
                  <FieldLabel htmlFor="last_name">Last name</FieldLabel>
                  <Input
                    id="last_name"
                    name="last_name"
                    autoComplete="family-name"
                    value={form.last_name}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    placeholder="Last name"
                    className={fieldClass()}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <span id="gender-label" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Gender
                  </span>
                  <div
                    role="radiogroup"
                    aria-labelledby="gender-label"
                    className="grid h-12 grid-cols-2 gap-1 rounded-xl bg-slate-200/60 p-1 dark:bg-slate-900"
                  >
                    {genders.map((g) => {
                      const active = form.gender === g.value;
                      return (
                        <button
                          key={g.value}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          disabled={loading}
                          onClick={() => updateField("gender", g.value)}
                          className={`rounded-lg text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                            active
                              ? "bg-white text-blue-600 shadow-sm dark:bg-slate-800 dark:text-blue-400"
                              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                          }`}
                        >
                          {g.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <FieldLabel htmlFor="date_of_birth">Date of birth</FieldLabel>
                  <Input
                    id="date_of_birth"
                    type="date"
                    name="date_of_birth"
                    autoComplete="bday"
                    value={form.date_of_birth}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className={fieldClass()}
                  />
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="space-y-5">
              <SectionTitle>Contact</SectionTitle>

              <div className="space-y-2">
                <FieldLabel htmlFor="email">Email address</FieldLabel>
                <div className="relative flex items-center">
                  <Mail className="pointer-events-none absolute left-3.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                    disabled={loading}
                    className={`${fieldClass(!!fieldErrors.email)} pl-10`}
                  />
                </div>
                <FieldError message={fieldErrors.email} />
              </div>

              <PhoneField
                value={form.phone}
                onChange={(value) => updateField("phone", value)}
                countryCode={form.countryCode}
                onCountryChange={(dialCode) => setForm((prev) => ({ ...prev, countryCode: dialCode }))}
                disabled={loading}
                error={fieldErrors.phone}
                hint="Enter your phone number without leading zeros"
              />
            </div>

            {/* Security */}
            <div className="space-y-5">
              <SectionTitle>Security</SectionTitle>

              <PasswordField
                id="password"
                name="password"
                label="Password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={form.password}
                onChange={handleChange}
                disabled={loading}
                error={fieldErrors.password}
              >
                {form.password && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center gap-3">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color}`}
                          style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        {passwordStrength.label}
                      </span>
                    </div>
                    {passwordStrength.feedback.length > 0 && (
                      <p className="text-xs text-slate-400">
                        Suggestion: Add {passwordStrength.feedback.join(", ")}
                      </p>
                    )}
                  </div>
                )}
              </PasswordField>

              <PasswordField
                id="confirm_password"
                name="confirm_password"
                label="Confirm password"
                autoComplete="new-password"
                placeholder="Re-enter your password"
                value={form.confirm_password}
                onChange={handleChange}
                disabled={loading}
                error={fieldErrors.confirm_password}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="h-12 w-full gap-2 rounded-xl bg-blue-600 text-base font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-500 hover:shadow-xl hover:shadow-blue-600/30 active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-xs font-medium text-slate-400">
              <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
              Already registered?
              <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
            </div>
            <Link href="/login" className="block">
              <Button
                type="button"
                variant="outline"
                className="h-12 w-full rounded-xl border-slate-200 text-base font-semibold hover:bg-white hover:border-blue-300 hover:text-blue-600 transition-all dark:border-slate-800 dark:hover:bg-slate-900 dark:hover:border-blue-800 dark:hover:text-blue-400"
              >
                Sign in instead
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