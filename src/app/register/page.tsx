"use client";

import { FormEvent, useState } from "react";
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
import { Input } from "@base-ui/react";
import {
  Mail,
  Phone,
  Lock,
  ArrowRight,
  ShieldCheck,
  UserPlus,
} from "lucide-react";

import { registerStudent } from "../../services/authservices";
import { saveAuth } from "@/lib/auth";
import apiRequest from "@/services/apiservices";

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
    password: "",
    confirm_password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!form.first_name || !form.last_name || !form.date_of_birth || !form.email || !form.phone || !form.password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (form.password !== form.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await registerStudent({
        email: form.email,
        phone: form.phone,
        password: form.password,
      });

      saveAuth(response.token, response.user);
      await apiRequest("/students/profile", { method: "POST", body: JSON.stringify({ first_name: form.first_name, last_name: form.last_name, gender: form.gender, date_of_birth: form.date_of_birth }) }, response.token);
      router.push("/dashboard/programs");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Registration failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">

        <div className="relative flex items-center justify-center p-6 pt-20 lg:pt-12 sm:p-12">
          {/* Background Ambient Glow */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-gradient-to-tr from-blue-500/10 via-transparent to-indigo-500/10 blur-3xl" />

          <div className="relative w-full max-w-md space-y-6">
            {/* Header & Logo */}
            <div className="flex flex-col items-center space-y-2 text-center">
              <div className="mb-2 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-white p-2 shadow-lg shadow-blue-500/10 border border-slate-100">
                <Image src={logo} alt="Logo" width={64} height={64} className="object-contain" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                Create Student Account
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Register to start your academic registration
              </p>

              {error && (
                <div className="w-full rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600 border border-red-200/60 dark:bg-red-950/30 dark:border-red-900 dark:text-red-400">
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
                  Fill in your registration details below
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <form className="space-y-4" onSubmit={handleSubmit}>
                  {/* Student profile fields */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5"><label htmlFor="first_name" className="text-xs font-medium text-slate-700 dark:text-slate-300">First Name</label><Input id="first_name" name="first_name" value={form.first_name} onChange={handleChange} required placeholder="First name" className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-800 dark:bg-slate-950" /></div>
                    <div className="space-y-1.5"><label htmlFor="last_name" className="text-xs font-medium text-slate-700 dark:text-slate-300">Last Name</label><Input id="last_name" name="last_name" value={form.last_name} onChange={handleChange} required placeholder="Last name" className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-800 dark:bg-slate-950" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5"><label htmlFor="gender" className="text-xs font-medium text-slate-700 dark:text-slate-300">Gender</label><select id="gender" name="gender" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"><option value="MALE">Male</option><option value="FEMALE">Female</option></select></div>
                    <div className="space-y-1.5"><label htmlFor="date_of_birth" className="text-xs font-medium text-slate-700 dark:text-slate-300">Date of Birth</label><Input id="date_of_birth" type="date" name="date_of_birth" value={form.date_of_birth} onChange={handleChange} required className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-sm outline-none dark:border-slate-800 dark:bg-slate-950" /></div>
                  </div>

                  {/* Email Field */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="email"
                      className="text-xs font-medium text-slate-700 dark:text-slate-300"
                    >
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
                        className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-slate-800 dark:bg-slate-950 dark:focus:border-blue-400"
                      />
                    </div>
                  </div>

                  {/* Phone Field */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="phone"
                      className="text-xs font-medium text-slate-700 dark:text-slate-300"
                    >
                      Phone Number
                    </label>
                    <div className="relative flex items-center">
                      <Phone className="absolute left-3.5 h-4 w-4 text-slate-400" />
                      <Input
                        id="phone"
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="+251..."
                        required
                        className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-slate-800 dark:bg-slate-950 dark:focus:border-blue-400"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="password"
                      className="text-xs font-medium text-slate-700 dark:text-slate-300"
                    >
                      Password
                    </label>
                    <div className="relative flex items-center">
                      <Lock className="absolute left-3.5 h-4 w-4 text-slate-400" />
                      <Input
                        id="password"
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="At least 6 characters"
                        required
                        className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-slate-800 dark:bg-slate-950 dark:focus:border-blue-400"
                      />
                    </div>
                  </div>

                  {/* Confirm Password Field */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="confirm_password"
                      className="text-xs font-medium text-slate-700 dark:text-slate-300"
                    >
                      Confirm Password
                    </label>
                    <div className="relative flex items-center">
                      <Lock className="absolute left-3.5 h-4 w-4 text-slate-400" />
                      <Input
                        id="confirm_password"
                        type="password"
                        name="confirm_password"
                        value={form.confirm_password}
                        onChange={handleChange}
                        placeholder="Confirm password"
                        required
                        className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-slate-800 dark:bg-slate-950 dark:focus:border-blue-400"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={loading}
                    className="mt-2 h-11 w-full bg-blue-400 font-medium text-white transition-all hover:bg-blue-400 active:scale-[0.99] dark:bg-blue-600 dark:hover:bg-blue-500"
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
                  className="inline-flex h-11 w-full mt-4 items-center justify-center rounded-lg border border-slate-200 bg-transparent font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Login to existing account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </CardFooter>
            </Card>

            {/* Security Badge */}
            <div className="flex items-center justify-center gap-1.5 text-center text-xs text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Secure SSL Encrypted Connection</span>
            </div>
          </div>
        </div>
    </main>
  );
}