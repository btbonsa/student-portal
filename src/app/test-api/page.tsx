import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@base-ui/react"
import Image from "next/image"
import { Phone, Lock, ArrowRight, ShieldCheck } from "lucide-react"

import logo from '../../../public/assets/logo.png'


export default function Home() {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-slate-50/50 p-4 dark:bg-slate-950">
      {/* Background Ambient Glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-gradient-to-tr from-blue-500/10 via-transparent to-indigo-500/10 blur-3xl" />

      <div className="relative w-full max-w-md space-y-6">
        {/* Header & Logo */}
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="mx-auto mb-5 flex h-18 w-18 items-center justify-center overflow-hidden rounded-2xl shadow-lg shadow-blue-00/20">
            <Image src={logo} alt="Logo" width={72} height={72} className="object-contain" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Student Portal
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Sign in to access your dashboard, courses, and fee details.
          </p>
        </div>

        {/* Card Component */}
        <Card className="bg-white shadow-md">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-semibold">Welcome back</CardTitle>
            <CardDescription className="text-xs">
              Enter your registered credentials below
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <form className="space-y-4">
              {/* Phone Field with Icon */}
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
                    placeholder="e.g. 0911234567"
                    required
                    className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-slate-800 dark:bg-slate-950 dark:focus:border-blue-400"
                  />
                </div>
              </div>

              {/* Password Field with Icon */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-xs font-medium text-slate-700 dark:text-slate-300"
                  >
                    Password
                  </label>
                  <a
                    href="#"
                    className="text-xs font-medium text-blue-600 hover:text-blue-500 hover:underline dark:text-blue-400"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-slate-800 dark:bg-slate-950 dark:focus:border-blue-400"
                  />
                </div>
              </div>

              {/* Action Button */}
              <Button
                type="submit"
                className="mt-2 h-11 w-full bg-blue-400 font-medium text-white transition-all hover:bg-blue-700 active:scale-[0.99] dark:bg-blue-600 dark:hover:bg-blue-500"
              >
                Sign In
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>

            {/* Visual Divider */}
            <div className="relative flex items-center justify-center py-1">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              <span className="absolute bg-white px-3 text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:bg-slate-900">
                New Student?
              </span>
            </div>
          </CardContent>

          <CardFooter className="pt-0">
            <Button
              variant="outline"
              className="h-11 w-full border-slate-200 font-medium hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
            >
              Create New Account
            </Button>
          </CardFooter>
        </Card>

        {/* Security Badge */}
        <div className="flex items-center justify-center gap-1.5 text-center text-xs text-slate-400">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Secure SSL Encrypted Connection</span>
        </div>
      </div>
    </div>
  )
}





