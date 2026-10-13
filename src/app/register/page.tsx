"use client";

import { FormEvent, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

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
import {
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  UserPlus,
  Eye,
  EyeOff,
  ChevronDown,
} from "lucide-react";

import { registerStudent } from "../../services/authservices";
import { saveAuth } from "@/lib/auth";
import apiRequest from "@/services/apiservices";
import { registerSchema, checkPasswordStrength, countryCodes } from "@/lib/validation";

import logo from "../../../public/assets/llogo.jpg";

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

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [passwordStrength, setPasswordStrength] = useState(checkPasswordStrength(""));
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });

    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // Update password strength when password changes
    if (name === "password") {
      setPasswordStrength(checkPasswordStrength(value));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setFieldErrors({});

    // Validate required fields
    if (!form.first_name || !form.last_name || !form.date_of_birth || !form.email || !form.phone || !form.password) {
      setError("Please fill in all required fields.");
      return;
    }

    // Validate raw phone input (without country code)
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

    // Normalize phone with country code
    const normalizedPhone = `${form.countryCode}${phoneDigits}`;

    // Validate with Zod schema
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
            date_of_birth: form.date_of_birth 
          }) 
        }, 
        response.token
      );

      router.push("/dashboard/programs");
    } catch (err) {
      console.error('Registration error:', err);
      const errorMessage = err instanceof Error ? err.message : "Registration failed.";

      if (errorMessage.includes("API URL") || errorMessage.includes("configured")) {
        setError("Server configuration error. Please contact support.");
      } else if (errorMessage.includes("API returned")) {
        setError("Unable to connect to server. Please try again later.");
      } else if (errorMessage.includes("phone:") || errorMessage.includes("password:") || errorMessage.includes("email:")) {
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
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="relative flex items-center justify-center p-6 pt-20 lg:pt-12 sm:p-12">
        {/* Background Ambient Glow */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-gradient-to-tr from-blue-500/10 via-transparent to-indigo-500/10 blur-3xl" />

        <div className="relative w-full max-w-lg space-y-6">
          {/* Header & Logo */}
          <div className="flex flex-col items-center space-y-2 text-center">
            <div className="mb-2 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-white p-2 shadow-lg shadow-blue-500/10 border border-slate-100 dark:border-slate-800 dark:bg-slate-900">
              <Image src={logo} alt="Logo" width={64} height={64} className="object-contain" priority />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              Create Student Account
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Register to start your academic application
            </p>

            {error && (
              <div className="w-full rounded-lg bg-rose-50 p-3 text-sm font-medium text-rose-600 border border-rose-200/60 dark:bg-rose-950/30 dark:border-rose-900 dark:text-rose-400">
                {error}
              </div>
            )}

            {success && (
              <div className="w-full rounded-lg bg-emerald-50 p-3 text-sm font-medium text-emerald-600 border border-emerald-200/60 dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-400">
                {success}
              </div>
            )}
          </div>

          {/* Card Component */}
          <Card className="border-slate-200/80 bg-white/90 backdrop-blur-md shadow-xl dark:border-slate-800 dark:bg-slate-900/90">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-xl font-semibold">Get started</CardTitle>
              <CardDescription className="text-xs">
                Fill in your personal and contact details below
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <form className="space-y-4" onSubmit={handleSubmit}>
                
                {/* First and Last Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label htmlFor="first_name" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      First Name
                    </label>
                    <Input 
                      id="first_name" 
                      name="first_name" 
                      value={form.first_name} 
                      onChange={handleChange} 
                      required 
                      placeholder="First name" 
                                            className="h-10"

                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="last_name" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Last Name
                    </label>
                    <Input 
                      id="last_name" 
                      name="last_name" 
                      value={form.last_name} 
                      onChange={handleChange} 
                      required 
                      placeholder="Last name" 
                                            className="h-10"

                    />
                  </div>
                </div>

                {/* Gender and Date of Birth */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label htmlFor="gender" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Gender
                    </label>
                    <select 
                      id="gender" 
                      name="gender" 
                      value={form.gender} 
                      onChange={handleChange} 
                      className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="date_of_birth" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Date of Birth
                    </label>
                    <Input 
                      id="date_of_birth" 
                      type="date" 
                      name="date_of_birth" 
                      value={form.date_of_birth} 
                      onChange={handleChange} 
                      required 
                      className="h-10"
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Email Address
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-3.5 h-4 w-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      required
                      className={`pl-10 h-10 ${fieldErrors.email ? "border-red-500" : ""}`}
                    />
                  </div>
                  {fieldErrors.email && (
                    <p className="text-xs text-red-500">{fieldErrors.email}</p>
                  )}
                </div>

                {/* Phone Field */}
                <div className="space-y-1.5">
                  <label htmlFor="phone" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Phone Number
                  </label>
                  <div className="relative flex items-center w-full">
                    {/* Country Code Selector */}
                    <div className="relative country-dropdown">
                      <button
                        type="button"
                        onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                        className="flex items-center gap-1.5 px-3 h-10 border border-r-0 border-input rounded-l-md bg-background hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <span className="text-sm">
                          {countryCodes.find((c) => c.dialCode === form.countryCode)?.flag || "🇪🇹"}
                        </span>
                        <span className="text-xs text-slate-600 dark:text-slate-400">
                          {form.countryCode}
                        </span>
                        <ChevronDown className="h-3 w-3 text-slate-400" />
                      </button>
                      
                      {/* Country Dropdown */}
                      {showCountryDropdown && (
                        <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                          {countryCodes.map((country) => (
                            <button
                              key={country.code}
                              type="button"
                              onClick={() => {
                                setForm({ ...form, countryCode: country.dialCode });
                                setShowCountryDropdown(false);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                              <span>{country.flag}</span>
                              <span className="text-slate-700 dark:text-slate-300">{country.name}</span>
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
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="912345678"
                        required
                        className={`pl-10 h-10 rounded-l-none rounded-r-md ${fieldErrors.phone ? "border-red-500" : ""}`}
                      />
                    </div>
                  </div>
                  {fieldErrors.phone && (
                    <p className="text-xs text-red-500">{fieldErrors.phone}</p>
                  )}
                  <p className="text-[10px] text-slate-400">
                    Enter phone number without country code
                  </p>
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <label htmlFor="password" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3.5 h-4 w-4 text-slate-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="At least 8 characters"
                      required
                      className={`pl-10 pr-10 h-10 ${fieldErrors.password ? "border-red-500" : ""}`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-1 h-8 w-8 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {fieldErrors.password && (
                    <p className="text-xs text-red-500">{fieldErrors.password}</p>
                  )}
                  {/* Password Strength Indicator */}
                  {form.password && (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                            style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-medium text-slate-600">
                          {passwordStrength.label}
                        </span>
                      </div>
                      {passwordStrength.feedback.length > 0 && (
                        <p className="text-[10px] text-slate-400">
                          Add: {passwordStrength.feedback.join(", ")}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-1.5">
                  <label htmlFor="confirm_password" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Confirm Password
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3.5 h-4 w-4 text-slate-400" />
                    <Input
                      id="confirm_password"
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirm_password"
                      value={form.confirm_password}
                      onChange={handleChange}
                      placeholder="Confirm password"
                      required
                      className={`pl-10 pr-10 h-10 ${fieldErrors.confirm_password ? "border-red-500" : ""}`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-1 h-10 w-8 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {fieldErrors.confirm_password && (
                    <p className="text-xs text-red-500">{fieldErrors.confirm_password}</p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="mt-2 h-11 w-full bg-blue-400 font-medium text-white transition-all hover:bg-blue-500 active:scale-[0.99]"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  {loading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>

              {/* Visual Divider */}
              <div className="relative flex items-center justify-center py-1">
                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                <span className="absolute bg-white px-3 text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:bg-slate-900">
                  Already registered?
                </span>
              </div>
            </CardContent>

            <CardFooter className="pt-0">
              <Link
                href="/login"
                className="inline-flex h-11 w-full mt-2 items-center justify-center rounded-lg border border-slate-200 bg-transparent font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Login to existing account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </CardFooter>
          </Card>

          {/* Security Badge */}
          <div className="flex items-center justify-center gap-1.5 text-center text-xs text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
            <span>Secure SSL Encrypted Connection</span>
          </div>
        </div>
      </div>
    </main>
  );
}