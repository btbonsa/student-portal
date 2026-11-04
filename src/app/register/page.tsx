"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  GraduationCap,
  Loader2,
  Users,
  Wrench,
} from "lucide-react";

import { registerStudent } from "../../services/authservices";
import { saveAuth } from "@/lib/auth";
import apiRequest from "@/services/apiservices";
import { registerSchema, checkPasswordStrength } from "@/lib/validation";
import { AuthShowcase, MobileBrand } from "@/components/auth-showcase";
import {
  FieldLabel,
  PasswordField,
  PhoneField,
  fieldClass,
} from "@/components/auth-fields";

const genders = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
];

const steps = [
  { title: "About you", hint: "Name and date of birth" },
  { title: "Your account", hint: "Phone and password" },
];

function InlineError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="text-xs font-medium text-rose-600 dark:text-rose-400">
      {message}
    </p>
  );
}

function StepTracker({ current }: { current: number }) {
  return (
    <ol className="grid grid-cols-2 gap-3" aria-label="Registration progress">
      {steps.map((step, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <li key={step.title} aria-current={active ? "step" : undefined} className="space-y-2.5">
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              <div
                className={`h-full rounded-full bg-blue-600 transition-all duration-500 ${
                  done || active ? "w-full" : "w-0"
                } ${active ? "opacity-60" : ""}`}
              />
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-colors ${
                  done
                    ? "bg-blue-600 text-white"
                    : active
                    ? "bg-blue-600/10 text-blue-600 ring-1 ring-blue-600 dark:text-blue-400"
                    : "bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                {done ? <Check className="h-3 w-3" strokeWidth={3} /> : index + 1}
              </span>
              <div className="min-w-0 leading-tight">
                <p
                  className={`truncate text-sm font-semibold ${
                    active || done
                      ? "text-slate-900 dark:text-slate-100"
                      : "text-slate-400 dark:text-slate-500"
                  }`}
                >
                  {step.title}
                </p>
                <p className="hidden truncate text-xs text-slate-500 dark:text-slate-400 sm:block">
                  {step.hint}
                </p>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export default function RegisterPage() {
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    gender: "MALE",
    date_of_birth: "",
    phone: "",
    countryCode: "+251",
    password: "",
    confirm_password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [passwordStrength, setPasswordStrength] = useState(checkPasswordStrength(""));

  // Once the account exists, a retry only needs to redo the profile call
  const accountToken = useRef<string | null>(null);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    router.prefetch("/dashboard/programs");
  }, [router]);

  const updateField = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }

    if (name === "password") {
      setPasswordStrength(checkPasswordStrength(value));
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateField(e.target.name, e.target.value);
  };

  const goNext = () => {
    setError("");
    const errors: Record<string, string> = {};

    if (!form.first_name.trim()) errors.first_name = "Enter your first name";
    if (!form.last_name.trim()) errors.last_name = "Enter your last name";
    if (!form.date_of_birth) errors.date_of_birth = "Choose your date of birth";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setStep(1);
  };

  const goBack = () => {
    setError("");
    setFieldErrors({});
    setStep(0);
  };

  const submitAccount = async () => {
    setError("");
    setFieldErrors({});

    if (!form.phone || !form.password) {
      setFieldErrors({
        ...(form.phone ? {} : { phone: "Enter your phone number" }),
        ...(form.password ? {} : { password: "Create a password" }),
      });
      return;
    }

    // Strip non-digits and leading zeros (the hint says "without leading zeros")
    const phoneDigits = form.phone.replace(/\D/g, "").replace(/^0+/, "");
    if (phoneDigits.length < 7) {
      setFieldErrors({ phone: "Phone number must be at least 7 digits" });
      return;
    }
    if (phoneDigits.length > 15) {
      setFieldErrors({ phone: "Phone number must be at most 15 digits" });
      return;
    }

    const normalizedPhone = `${form.countryCode}${phoneDigits}`;

    const validationResult = registerSchema.safeParse({
      phone: normalizedPhone,
      password: form.password,
      confirm_password: form.confirm_password,
    });

    if (!validationResult.success) {
      const errors: Record<string, string> = {};
      validationResult.error.issues.forEach((issue) => {
        errors[issue.path.join(".")] = issue.message;
      });
      setFieldErrors(errors);
      return;
    }

    try {
      setLoading(true);

      if (!accountToken.current) {
        const response = await registerStudent({
          phone: normalizedPhone,
          password: validationResult.data.password,
        });
        saveAuth(response.token, response.user);
        accountToken.current = response.token;
      }

      try {
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
          accountToken.current
        );
      } catch (profileErr) {
        console.error("Profile creation error:", profileErr);
        setError(
          "Your account was created, but we couldn't save your details. Select Create account again to retry."
        );
        return;
      }

      router.push("/dashboard/programs");
    } catch (err) {
      console.error("Registration error:", err);
      const message = err instanceof Error ? err.message : "Registration failed.";

      if (message.includes("API URL") || message.includes("configured")) {
        setError("Server configuration error. Please contact support.");
      } else if (message.includes("API returned")) {
        setError("Unable to connect to the server. Please try again later.");
      } else if (message.includes("phone:") || message.includes("password:")) {
        const parsed: Record<string, string> = {};
        message.split(", ").forEach((part) => {
          const [field, text] = part.split(": ");
          if (field && text) parsed[field] = text;
        });
        setFieldErrors(parsed);
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (step === 0) goNext();
    else submitAccount();
  };

  const passwordsMatch =
    form.confirm_password.length > 0 && form.password === form.confirm_password;

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
        <div className="w-full max-w-md space-y-7">
          <MobileBrand />

          <div className="space-y-1.5">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              Create your account
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Two quick steps and you can register for a program.
            </p>
          </div>

          <StepTracker current={step} />

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-xl border border-rose-200/70 bg-rose-50 p-3.5 text-sm font-medium text-rose-600 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-400"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            {step === 0 && (
              <div
                key="step-0"
                className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300"
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <FieldLabel htmlFor="first_name">First name</FieldLabel>
                    <Input
                      id="first_name"
                      name="first_name"
                      autoComplete="given-name"
                      value={form.first_name}
                      onChange={handleChange}
                      aria-invalid={!!fieldErrors.first_name}
                      placeholder="Abebe"
                      className={fieldClass()}
                    />
                    <InlineError message={fieldErrors.first_name} />
                  </div>
                  <div className="space-y-2">
                    <FieldLabel htmlFor="last_name">Last name</FieldLabel>
                    <Input
                      id="last_name"
                      name="last_name"
                      autoComplete="family-name"
                      value={form.last_name}
                      onChange={handleChange}
                      aria-invalid={!!fieldErrors.last_name}
                      placeholder="Kebede"
                      className={fieldClass()}
                    />
                    <InlineError message={fieldErrors.last_name} />
                  </div>
                </div>

                <div className="space-y-2">
                  <span
                    id="gender-label"
                    className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Gender
                  </span>
                  <div role="radiogroup" aria-labelledby="gender-label" className="grid grid-cols-2 gap-3">
                    {genders.map((g) => {
                      const active = form.gender === g.value;
                      return (
                        <button
                          key={g.value}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          onClick={() => updateField("gender", g.value)}
                          className={`flex h-12 items-center justify-between rounded-xl border px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                            active
                              ? "border-blue-600 bg-blue-600/5 text-blue-700 dark:text-blue-300"
                              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-700"
                          }`}
                        >
                          {g.label}
                          <span
                            className={`flex h-5 w-5 items-center justify-center rounded-full border transition-colors ${
                              active
                                ? "border-blue-600 bg-blue-600 text-white"
                                : "border-slate-300 dark:border-slate-700"
                            }`}
                          >
                            {active && <Check className="h-3 w-3" strokeWidth={3} />}
                          </span>
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
                    max={today}
                    value={form.date_of_birth}
                    onChange={handleChange}
                    aria-invalid={!!fieldErrors.date_of_birth}
                    className={fieldClass()}
                  />
                  <InlineError message={fieldErrors.date_of_birth} />
                </div>

                <Button
                  type="submit"
                  className="h-12 w-full gap-2 rounded-xl bg-blue-600 text-base font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-500 active:scale-[0.99]"
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {step === 1 && (
              <div
                key="step-1"
                className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300"
              >
                <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                      {form.first_name.trim().charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0 leading-tight">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {form.first_name.trim()} {form.last_name.trim()}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Details saved for this account
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={goBack}
                    disabled={loading}
                    className="shrink-0 rounded-md px-2 py-1 text-sm font-semibold text-blue-600 hover:bg-blue-600/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50 dark:text-blue-400"
                  >
                    Edit
                  </button>
                </div>

                <PhoneField
                  value={form.phone}
                  onChange={(value) => updateField("phone", value)}
                  countryCode={form.countryCode}
                  onCountryChange={(dialCode) =>
                    setForm((prev) => ({ ...prev, countryCode: dialCode }))
                  }
                  disabled={loading}
                  error={fieldErrors.phone}
                  hint="Enter your phone number without leading zeros"
                />

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
                        <div className="grid flex-1 grid-cols-5 gap-1" aria-hidden="true">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <span
                              key={n}
                              className={`h-1.5 rounded-full transition-colors duration-300 ${
                                n <= passwordStrength.score
                                  ? passwordStrength.color
                                  : "bg-slate-200 dark:bg-slate-800"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="w-16 text-right text-xs font-semibold text-slate-600 dark:text-slate-300">
                          {passwordStrength.label}
                        </span>
                      </div>
                      {passwordStrength.feedback.length > 0 && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Make it stronger by adding {passwordStrength.feedback.join(", ")}.
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
                >
                  {passwordsMatch && (
                    <p className="flex items-center gap-1.5 pt-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      Passwords match
                    </p>
                  )}
                </PasswordField>

                <div className="grid grid-cols-[auto_1fr] gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={goBack}
                    disabled={loading}
                    className="h-12 gap-2 rounded-xl border-slate-200 px-5 font-semibold dark:border-slate-800"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="h-12 gap-2 rounded-xl bg-blue-600 text-base font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-500 active:scale-[0.99]"
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
                </div>
              </div>
            )}
          </form>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            Already registered?{" "}
            <Link
              href="/login"
              className="font-semibold text-blue-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-blue-400"
            >
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}