"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearAuth, getToken } from "@/lib/auth";
import { getStudentProfile, StudentProfile } from "@/services/studentservices";
import {
  Calendar,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  User,
  X,
} from "lucide-react";

import icon from "../../../public/icons/icon.png";

/* -------------------------------- Constants -------------------------------- */

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

const isActive = (pathname: string, href: string, exact?: boolean) =>
  exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

/* --------------------------------- Avatar --------------------------------- */

function Avatar({
  photoUrl,
  initials,
  className = "h-9 w-9",
}: {
  photoUrl: string | null;
  initials?: string;
  className?: string;
}) {
  const [imgError, setImgError] = useState(false);

  // Try again when the photo changes
  useEffect(() => {
    setImgError(false);
  }, [photoUrl]);

  if (photoUrl && !imgError) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoUrl}
        alt=""
        className={`${className} shrink-0 rounded-full object-cover shadow-sm ring-2 ring-sky-400/40`}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div
      aria-hidden
      className={`${className} flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-blue-700 text-sm font-bold text-white shadow-sm ring-2 ring-sky-400/40`}
    >
      {initials || <User className="h-4 w-4" />}
    </div>
  );
}

/* --------------------------------- Layout --------------------------------- */

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const hideSidebar = noSidebarRoutes.includes(pathname);

  // Keep the photo-update listener active on every dashboard route
  useEffect(() => {
    const handler = (e: Event) => {
      const newPhotoUrl = (e as CustomEvent<string>).detail;
      setProfile((prev) => (prev ? { ...prev, profile_photo_url: newPhotoUrl } : null));
    };
    window.addEventListener("profile-photo-updated", handler);
    return () => window.removeEventListener("profile-photo-updated", handler);
  }, []);

  // Fetch the profile only when the sidebar is shown and we don't have it yet
  useEffect(() => {
    if (hideSidebar || profile) return;

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

    void loadProfile();
  }, [hideSidebar, profile]);

  // Close the drawer and dropdown when the route changes
  useEffect(() => {
    setSidebarOpen(false);
    setProfileDropdownOpen(false);
  }, [pathname]);

  // Escape closes whichever is open
  useEffect(() => {
    if (!sidebarOpen && !profileDropdownOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSidebarOpen(false);
        setProfileDropdownOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [sidebarOpen, profileDropdownOpen]);

  // Click outside closes the profile dropdown
  useEffect(() => {
    if (!profileDropdownOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [profileDropdownOpen]);

  // Lock page scroll while the mobile drawer is open
  useEffect(() => {
    if (!sidebarOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [sidebarOpen]);

  const handleLogout = useCallback(() => {
    clearAuth();
    router.replace("/login");
  }, [router]);

  if (hideSidebar) return <>{children}</>;

  const initials = profile
    ? `${profile.first_name?.[0] || ""}${profile.last_name?.[0] || ""}`.toUpperCase()
    : "";
  const fullName = profile ? `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() : "";
  const currentItem = navItems.find((i) => isActive(pathname, i.href, i.exact));
  const pageTitle = currentItem?.label ?? "Dashboard";

  return (
    <div className="flex min-h-[100dvh] bg-gradient-to-b from-sky-50/50 via-background to-background text-foreground antialiased dark:from-slate-950">
      {/* Skip link */}
      <a
        href="#dashboard-content"
        className="sr-only z-[60] rounded-lg bg-card px-4 py-2 text-sm font-semibold shadow-lg focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>

      {/* ── Sidebar (drawer on mobile, fixed on desktop) ── */}
      <aside
        id="dashboard-sidebar"
        aria-label="Student portal sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-card shadow-sm transition-[transform,visibility] duration-300 ease-in-out motion-reduce:transition-none lg:visible lg:translate-x-0 ${
          sidebarOpen ? "visible translate-x-0 shadow-2xl" : "invisible -translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex h-16 items-center justify-between border-b px-5">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-500"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white p-1.5 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700">
              <Image src={icon} alt="" width={28} height={28} className="object-contain" />
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-bold tracking-tight">Logos College</span>
              <span className="block text-[11px] font-medium text-muted-foreground">
                Student Portal
              </span>
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-sky-500 lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        {/* Navigation */}
        <nav aria-label="Dashboard" className="flex-1 space-y-1.5 overflow-y-auto px-3 py-6">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
            Navigation
          </p>
          {navItems.map(({ href, label, icon: Icon, exact }) => {
            const active = isActive(pathname, href, exact);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 active:scale-[0.98] ${
                  active
                    ? "bg-gradient-to-r from-blue-600 to-sky-500 font-semibold text-white shadow-md shadow-blue-600/25"
                    : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 ${
                    active ? "text-white" : "text-muted-foreground group-hover:text-foreground"
                  }`}
                  aria-hidden
                />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Account + sign out */}
        <div className="space-y-2 border-t bg-muted/20 p-3">
          {profile && (
            <Link
              href="/dashboard/profile"
              className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-muted/80 focus-visible:outline-2 focus-visible:outline-sky-500"
            >
              <Avatar photoUrl={profile.profile_photo_url || null} initials={initials} />
              <span className="min-w-0 leading-tight">
                <span className="block truncate text-sm font-semibold">{fullName}</span>
                <span className="block text-[11px] text-muted-foreground">View profile</span>
              </span>
            </Link>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-2 focus-visible:outline-rose-500 active:scale-[0.98] dark:hover:bg-rose-950/30"
          >
            <LogOut className="h-4 w-4 shrink-0" aria-hidden />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          tabIndex={-1}
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm animate-in fade-in duration-200 lg:hidden"
        />
      )}

      {/* ── Main wrapper ── */}
      <div className="flex min-w-0 flex-1 flex-col lg:ml-64">
        {/* Desktop header */}
        <header className="sticky top-0 z-30 hidden h-16 items-center justify-between border-b bg-card/80 px-8 shadow-[0_1px_12px_rgba(15,23,42,0.04)] backdrop-blur-xl lg:flex">
          <div className="flex items-center gap-3">
            <span
              aria-hidden
              className="h-5 w-1 rounded-full bg-gradient-to-b from-sky-400 to-blue-600"
            />
            <p className="text-base font-bold tracking-tight">{pageTitle}</p>
          </div>

          <div ref={dropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setProfileDropdownOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={profileDropdownOpen}
              className="flex items-center gap-3 rounded-xl border border-transparent px-3 py-1.5 transition-colors hover:border-border hover:bg-muted/80 focus-visible:outline-2 focus-visible:outline-sky-500"
            >
              <Avatar
                photoUrl={profile?.profile_photo_url || null}
                initials={initials}
                className="h-8 w-8"
              />
              <div className="text-left">
                <p className="text-xs font-semibold leading-tight">{fullName || "Student"}</p>
                <p className="text-[10px] font-medium text-muted-foreground">Student Account</p>
              </div>
              <ChevronDown
                className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${
                  profileDropdownOpen ? "rotate-180" : ""
                }`}
                aria-hidden
              />
            </button>

            {profileDropdownOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full z-50 mt-2 w-52 rounded-xl border bg-card p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-150"
              >
                <Link
                  href="/dashboard/profile"
                  role="menuitem"
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors hover:bg-muted"
                >
                  <User className="h-3.5 w-3.5" aria-hidden />
                  My Profile
                </Link>
                <div className="my-1 border-t" />
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50 dark:hover:bg-rose-950/30"
                >
                  <LogOut className="h-3.5 w-3.5" aria-hidden />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Mobile header */}
        <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b bg-card/80 px-4 backdrop-blur-xl lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label={sidebarOpen ? "Close menu" : "Open menu"}
            aria-expanded={sidebarOpen}
            aria-controls="dashboard-sidebar"
            className="z-10 flex h-11 w-11 items-center justify-center rounded-xl border bg-card text-foreground shadow-sm transition active:scale-95 focus-visible:outline-2 focus-visible:outline-sky-500"
          >
            {sidebarOpen ? (
              <X className="h-5 w-5" aria-hidden />
            ) : (
              <Menu className="h-5 w-5" aria-hidden />
            )}
          </button>

          <p className="absolute left-1/2 -translate-x-1/2 text-sm font-bold tracking-tight">
            {pageTitle}
          </p>

          <Link
            href="/dashboard/profile"
            aria-label="My profile"
            className="z-10 flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-sky-500"
          >
            <Avatar photoUrl={profile?.profile_photo_url || null} initials={initials} />
          </Link>
        </header>

        {/* Content (pages render their own <main>) */}
        <div id="dashboard-content" className="flex-1 p-4 pb-12 md:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}