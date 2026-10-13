"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearAuth, getToken } from "@/lib/auth";
import { getStudentProfile, StudentProfile } from "@/services/studentservices";
import {
  LayoutDashboard,
  Calendar,
  LogOut,
  User,
  Menu,
  X,
  GraduationCap,
  ChevronDown,
} from "lucide-react";

function Avatar({ photoUrl, size, initials }: { photoUrl: string | null; size: number; initials?: string }) {
  const [imgError, setImgError] = useState(false);

  const sizeMap: Record<number, string> = {
    8: "h-8 w-8",
    9: "h-9 w-9",
    10: "h-10 w-10",
  };
  const sizeClasses = sizeMap[size] ?? "h-10 w-10";

  if (photoUrl && !imgError) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoUrl}
        alt="Profile"
        className={`${sizeClasses} rounded-full object-cover ring-2 ring-blue-400/40 shadow-sm`}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div className={`${sizeClasses} rounded-full bg-blue-400 text-white flex items-center justify-center ring-2 ring-blue-400/40 font-bold text-sm shadow-sm shrink-0`}>
      {initials || <User className="h-4 w-4" />}
    </div>
  );
}

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/schedule", label: "Schedule", icon: Calendar },
  { href: "/dashboard/profile", label: "Profile", icon: User, exact: true },
];

// Onboarding pages — no sidebar
const noSidebarRoutes = [
  "/dashboard/pending",
  "/dashboard/profile",
  "/dashboard/programs",
  "/dashboard/payment",
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      const token = getToken();
      if (!token) return;
      try {
        const p = await getStudentProfile(token);
        setProfile(p);
      } catch (err) {
        console.error("Failed to load profile in layout:", err);
      }
    };

    loadProfile();

    const handler = (e: Event) => {
      const newPhotoUrl = (e as CustomEvent<string>).detail;
      setProfile(prev => prev ? { ...prev, profile_photo_url: newPhotoUrl } : null);
    };
    window.addEventListener("profile-photo-updated", handler);
    return () => {
      window.removeEventListener("profile-photo-updated", handler);
    };
  }, []);

  if (noSidebarRoutes.includes(pathname)) return <>{children}</>;

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const handleLogout = () => {
    clearAuth();
    router.replace("/login");
  };

  const getInitials = () => {
    if (!profile) return "";
    return `${profile.first_name?.[0] || ""}${profile.last_name?.[0] || ""}`.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background text-foreground antialiased flex">

      {/* ── Sidebar Navigation Drawer (Positioned on Left) ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-card shadow-sm transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand Header inside Drawer */}
        <div className="flex h-16 items-center justify-between border-b px-6 bg-card/50">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-400 text-white shadow-md shadow-blue-400/20 font-bold">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight block leading-none">
                Student <span className="text-blue-400">Portal</span>
              </span>
              <span className="text-[10px] text-muted-foreground font-medium">Workspace</span>
            </div>
          </div>

          {/* Close button inside mobile drawer */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted lg:hidden transition-colors"
            aria-label="Close menu drawer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1.5 px-3 py-6">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
            Navigation
          </p>
          {navItems.map(({ href, label, icon: Icon, exact }) => {
            const active = isActive(href, exact);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all active:scale-[0.98] ${
                  active
                    ? "bg-blue-400 text-white shadow-md shadow-blue-400/25 font-semibold"
                    : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${active ? "text-white" : "text-muted-foreground"}`} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Logout Action Footer */}
        <div className="border-t p-4 bg-muted/20">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 active:scale-[0.98]"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Main Layout Wrapper ── */}
      <div className="flex-1 flex flex-col lg:ml-64 min-w-0">
        
        {/* Desktop Header Bar */}
        <header className="hidden lg:flex sticky top-0 z-30 h-16 items-center justify-between border-b bg-card/80 px-8 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold text-muted-foreground">
              Welcome back, <span className="text-foreground font-bold">{profile?.first_name || "Student"}</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-3 rounded-xl px-3 py-1.5 hover:bg-muted/80 transition-colors border border-transparent hover:border-border"
              >
                <Avatar photoUrl={profile?.profile_photo_url || null} size={9} initials={getInitials()} />
                <div className="text-left">
                  <p className="text-xs font-semibold leading-tight">
                    {profile?.first_name} {profile?.last_name}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-medium">Student Account</p>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>

              {profileDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-50"
                    onClick={() => setProfileDropdownOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border bg-card shadow-xl z-50 p-1.5">
                    <Link
                      href="/dashboard/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium hover:bg-muted transition-colors"
                    >
                      <User className="h-3.5 w-3.5" />
                      My Profile
                    </Link>
                    <div className="my-1 border-t" />
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors dark:hover:bg-rose-950/30"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Mobile Sticky Header Bar */}
        <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b bg-card/80 px-4 backdrop-blur-md lg:hidden relative">
          
          {/* Left Element: Menu Toggle Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="z-10 flex h-9 w-9 items-center justify-center rounded-xl border bg-card text-foreground shadow-sm active:scale-95 transition"
            aria-label="Toggle sidebar menu"
          >
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>

          {/* Centered Brand Title */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-400 text-white shadow-sm font-bold">
              <GraduationCap className="h-3.5 w-3.5" />
            </div>
            <span className="text-sm font-bold tracking-tight">
              Student <span className="text-blue-400">Portal</span>
            </span>
          </div>

          {/* Right Element: Profile Avatar */}
          <div className="flex items-center z-10">
            <Link href="/dashboard/profile">
              <Avatar photoUrl={profile?.profile_photo_url || null} size={8} initials={getInitials()} />
            </Link>
          </div>
        </header>

        {/* Main Workspace Content Area */}
        <main className="flex-1 pb-12 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}