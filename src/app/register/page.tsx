"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertCircle,
  ArrowRight,
  Check,
  GraduationCap,
  Loader2,
  Users,
  Wrench,
  UserCheck,
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
  denseFieldClass,
} from "@/components/auth-fields";

const genders = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
];

const mutedLabelClass = "text-xs font-medium text-slate-500 dark:text-slate-400";

function InlineError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="text-[11px] font-medium text-rose-600 dark:text-rose-400 animate-in fade-in duration-150 pt-0.5"
    >
      {message}
    </p>
  );
}

function StepTracker({ current }: { current: number }) {
  return (
    <div aria-label="Registration progress">
      <div className="relative h-1 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className="h-full rounded-full bg-blue-600 transition-all duration-300 ease-out"
          style={{ width: current === 0 ? "50%" : "100%" }}
        />
      </div>
    </div>
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
  const [passwordStrength, setPasswordStrength] = useState(
    checkPasswordStrength("")
  );

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
      const message =
        err instanceof Error ? err.message : "Registration failed.";

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
          {
            icon: GraduationCap,
            text: "Certificate programs taught by professionals",
          },
          { icon: Users, text: "Small classes with personal feedback" },
        ]}
      />

      <section className="flex items-center justify-center px-4 py-5 sm:px-6 lg:px-8">
        <div className="w-full max-w-sm space-y-4">
          <MobileBrand />

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-md shadow-slate-200/30 sm:p-6 dark:border-slate-800/80 dark:bg-slate-900/80 dark:shadow-none">
            <div className="space-y-0.5 mb-3.5">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-slate-50">
                Create account
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Complete two quick steps to start your enrollment.
              </p>
            </div>

            <StepTracker current={step} />

            {error && (
              <div
                role="alert"
                className="mt-3 flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50/70 p-2.5 text-xs font-medium text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300"
              >
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form className="mt-3 space-y-0.5" onSubmit={handleSubmit} noValidate>
              {step === 0 && (
                <div
                  key="step-0"
                  className="space-y-1.5 animate-in fade-in slide-in-from-right-2 duration-200"
                >
                  <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                    <div className="space-y-0.5">
                      <FieldLabel htmlFor="first_name">
                        First name
                      </FieldLabel>
                      <Input
                        id="first_name"
                        name="first_name"
                        autoComplete="given-name"
                        value={form.first_name}
                        onChange={handleChange}
                        aria-invalid={!!fieldErrors.first_name}
                        placeholder="Abebe"
                        className={denseFieldClass(!!fieldErrors.first_name)}
                      />
                      <InlineError message={fieldErrors.first_name} />
                    </div>
                    <div className="space-y-0.5">
                      <FieldLabel htmlFor="last_name">
                        Last name
                      </FieldLabel>
                      <Input
                        id="last_name"
                        name="last_name"
                        autoComplete="family-name"
                        value={form.last_name}
                        onChange={handleChange}
                        aria-invalid={!!fieldErrors.last_name}
                        placeholder="Kebede"
                        className={denseFieldClass(!!fieldErrors.last_name)}
                      />
                      <InlineError message={fieldErrors.last_name} />
                    </div>
                  </div>

                  {/* Muted Label Segmented Gender Selection */}
                  <div className="space-y-0.5">
                    <span className={mutedLabelClass}>
                      Gender
                    </span>
                    <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800/80">
                      {genders.map((g) => {
                        const active = form.gender === g.value;
                        return (
                          <button
                            key={g.value}
                            type="button"
                            onClick={() => updateField("gender", g.value)}
                            className={`h-7 rounded-md text-xs font-semibold transition-all ${
                              active
                                ? "bg-white text-blue-600 shadow-sm dark:bg-slate-900 dark:text-blue-400"
                                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                            }`}
                          >
                            {g.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <FieldLabel htmlFor="date_of_birth">
                      Date of birth
                    </FieldLabel>
                    <Input
                      id="date_of_birth"
                      type="date"
                      name="date_of_birth"
                      autoComplete="bday"
                      max={today}
                      value={form.date_of_birth}
                      onChange={handleChange}
                      aria-invalid={!!fieldErrors.date_of_birth}
                      className={denseFieldClass(!!fieldErrors.date_of_birth)}
                    />
                    <InlineError message={fieldErrors.date_of_birth} />
                  </div>

                  <Button
                    type="submit"
                    className="mt-1 h-9 w-full gap-1.5 rounded-lg bg-blue-600 text-xs font-semibold text-white shadow-sm transition-all hover:bg-blue-500 active:scale-[0.99]"
                  >
                    Continue
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}

              {step === 1 && (
                <div
                  key="step-1"
                  className="space-y-2.5 animate-in fade-in slide-in-from-right-2 duration-200"
                >
                  <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-200/80 bg-slate-50/60 p-2 dark:border-slate-800 dark:bg-slate-800/40">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white shadow-sm">
                        {form.first_name.trim().charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0 leading-tight">
                        <p className="truncate text-xs font-bold text-slate-900 dark:text-slate-100">
                          {form.first_name.trim()} {form.last_name.trim()}
                        </p>
                        <p className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                          <UserCheck className="h-2.5 w-2.5" /> Details saved
                        </p>
                      </div>
                    </div>
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
                    hint="Enter phone without leading zeros"
                    dense
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
                    dense
                  >
                    {form.password && (
                      <div className="space-y-0.5 pt-0.5">
                        <div className="flex items-center gap-2">
                          <div
                            className="grid flex-1 grid-cols-5 gap-1"
                            aria-hidden="true"
                          >
                            {[1, 2, 3, 4, 5].map((n) => (
                              <span
                                key={n}
                                className={`h-1 rounded-full transition-colors duration-300 ${
                                  n <= passwordStrength.score
                                    ? passwordStrength.color
                                    : "bg-slate-200 dark:bg-slate-800"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="w-14 text-right text-[11px] font-medium text-slate-500 dark:text-slate-400">
                            {passwordStrength.label}
                          </span>
                        </div>
                        {passwordStrength.feedback.length > 0 && (
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">
                            Add {passwordStrength.feedback.join(", ")}.
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
                    placeholder="Re-enter password"
                    value={form.confirm_password}
                    onChange={handleChange}
                    disabled={loading}
                    error={fieldErrors.confirm_password}
                    dense
                  >
                    {passwordsMatch && (
                      <p className="flex items-center gap-1 pt-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                        <Check className="h-3 w-3" strokeWidth={3} />
                        Passwords match
                      </p>
                    )}
                  </PasswordField>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="h-9 w-full gap-1.5 rounded-lg bg-blue-600 text-xs font-semibold text-white shadow-sm transition-all hover:bg-blue-500 active:scale-[0.99]"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        Create account
                        <ArrowRight className="h-3.5 w-3.5" />
                      </>
                    )}
                  </Button>
                </div>
              )}
            </form>

            <div className="mt-4 border-t border-slate-100 pt-3 text-center text-xs text-slate-500 dark:border-slate-800/80 dark:text-slate-400">
              Already registered?{" "}
              <Link
                href="/login"
                className="font-semibold text-blue-600 hover:underline focus-visible:outline-none dark:text-blue-400"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}