"use client";

import { FormEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Lock, ArrowRight, ShieldCheck, Eye, EyeOff, Loader2, ChevronDown } from "lucide-react";

import { loginStudent } from "../../services/authservices";
import { saveAuth } from "@/lib/auth";
import { loginSchema, countryCodes } from "@/lib/validation";

import logo from "../../../public/assets/llogo.jpg";

export default function Login() {
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+251");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.country-dropdown')) {
        setShowCountryDropdown(false);
      }
    };

    if (showCountryDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCountryDropdown]);

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
        const fieldErrors: Record<string, string> = {};
        const errorParts = errorMessage.split(', ');
        errorParts.forEach((part) => {
          const [field, message] = part.split(': ');
          if (field && message) {
            fieldErrors[field] = message;
          }
        });
        setFieldErrors(fieldErrors);
        setError("Please fix the validation errors below.");
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center overflow-hidden selection:bg-blue-400 selection:text-white">
      <div className="relative flex min-h-screen w-full items-center justify-center p-4 pt-16 lg:pt-4">
        {/* Animated Background Blobs */}
        <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-blue-400/15 dark:bg-blue-400/10 blur-[130px] rounded-full animate-pulse" />
        <div className="pointer-events-none absolute top-1/3 left-10 w-[250px] h-[250px] bg-indigo-400/10 dark:bg-indigo-400/5 blur-[100px] rounded-full animate-bounce" style={{ animationDuration: '8s' }} />
        <div className="pointer-events-none absolute bottom-1/4 right-10 w-[350px] h-[350px] bg-blue-500/10 dark:bg-blue-500/5 blur-[120px] rounded-full animate-bounce" style={{ animationDuration: '10s', animationDelay: '2s' }} />

        <div className="relative w-full max-w-md space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Header & Logo */}
          <div className="flex flex-col items-center space-y-3 text-center">
            <div className="mx-auto mb-2 flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl bg-white p-2 shadow-xl shadow-blue-400/20 border border-slate-100 dark:border-slate-800 dark:bg-slate-900 group hover:scale-105 transition-transform duration-300">
              <Image
                src={logo}
                alt="Logo"
                width={80}
                height={80}
                className="object-contain"
                priority
              />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-50">
              Student Portal
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
              Sign in to manage your program registrations and payments
            </p>

            {error && (
              <div className="w-full rounded-2xl bg-rose-50 p-3.5 text-sm font-medium text-rose-600 border border-rose-200/60 dark:bg-rose-950/30 dark:border-rose-900 dark:text-rose-400 animate-in fade-in slide-in-from-top-2 duration-300">
                {error}
              </div>
            )}
          </div>

          {/* Card Component */}
          <Card className="border-slate-200/80 bg-white/90 backdrop-blur-md shadow-2xl shadow-blue-400/10 dark:border-slate-800 dark:bg-slate-900/90 rounded-3xl overflow-hidden">
            <CardHeader className="space-y-1 pb-6 pt-6">
              <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
              <CardDescription className="text-sm">
                Enter your registered credentials below
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5 px-6 pb-6">
              <form className="space-y-5" onSubmit={handleSubmit}>
                {/* Phone Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="phone"
                    className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Phone Number
                  </label>
                  <div className="relative flex items-center w-full">
                    {/* Country Code Selector */}
                    <div className="relative country-dropdown">
                      <button
                        type="button"
                        onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                        className="flex items-center gap-1.5 px-3 h-11 border border-r-0 border-input rounded-l-xl bg-background hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <span className="text-sm">
                          {countryCodes.find((c) => c.dialCode === countryCode)?.flag || "🇪🇹"}
                        </span>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          {countryCode}
                        </span>
                        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                      </button>
                      
                      {/* Country Dropdown */}
                      {showCountryDropdown && (
                        <div className="absolute top-full left-0 mt-1 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 max-h-60 overflow-y-auto p-1 animate-in fade-in slide-in-from-top-2 duration-200">
                          {countryCodes.map((country) => (
                            <button
                              key={country.code}
                              type="button"
                              onClick={() => {
                                setCountryCode(country.dialCode);
                                setShowCountryDropdown(false);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors rounded-xl"
                            >
                              <span>{country.flag}</span>
                              <span className="text-slate-700 dark:text-slate-300 font-medium">{country.name}</span>
                              <span className="ml-auto text-xs text-slate-500">{country.dialCode}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Phone Input */}
                    <div className="relative flex-1">
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          if (fieldErrors.phone) {
                            setFieldErrors((prev) => {
                              const newErrors = { ...prev };
                              delete newErrors.phone;
                              return newErrors;
                            });
                          }
                        }}
                        placeholder="912345678"
                        required
                        disabled={loading}
                        className={`h-11 rounded-r-xl rounded-l-none border-l-0 focus-visible:ring-blue-400 ${fieldErrors.phone ? "border-red-500" : ""}`}
                      />
                    </div>
                  </div>
                  {fieldErrors.phone && (
                    <p className="text-xs text-red-500 font-medium">{fieldErrors.phone}</p>
                  )}
                  <p className="text-[11px] text-slate-400">
                    Enter phone number without country code
                  </p>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                    >
                      Password
                    </label>
                    <a
                      href="#"
                      className="text-xs font-medium text-blue-400 hover:text-blue-500 hover:underline transition-colors"
                    >
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3.5 h-4 w-4 text-slate-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (fieldErrors.password) {
                          setFieldErrors((prev) => {
                            const newErrors = { ...prev };
                            delete newErrors.password;
                            return newErrors;
                          });
                        }
                      }}
                      required
                      disabled={loading}
                      className={`pl-10 pr-10 h-11 rounded-xl focus-visible:ring-blue-400 ${fieldErrors.password ? "border-red-500" : ""}`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-1.5 h-8 w-8 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {fieldErrors.password && (
                    <p className="text-xs text-red-500 font-medium">{fieldErrors.password}</p>
                  )}
                </div>

                {/* Submit Action Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="mt-2 h-12 w-full bg-blue-400 font-bold text-white transition-all hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-400/25 active:scale-[0.98] gap-2 rounded-xl"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              {/* Visual Divider */}
              <div className="relative flex items-center justify-center py-2">
                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                <span className="absolute bg-white dark:bg-slate-900 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  New Student?
                </span>
              </div>
            </CardContent>

            <CardFooter className="pt-0 px-6 pb-6">
              <Link href="/register" className="w-full">
                <Button
                  variant="outline"
                  className="h-12 w-full border-slate-200 font-bold hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 rounded-xl transition-all hover:scale-[1.02]"
                >
                  Create New Account
                </Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Security Badge */}
          <div className="flex items-center justify-center gap-2 text-center text-xs text-slate-400 font-medium">
            <ShieldCheck className="h-4 w-4 text-blue-400" />
            <span>Secure SSL Encrypted Connection</span>
          </div>
        </div>
      </div>
    </main>
  );
}