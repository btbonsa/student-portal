"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LanguageToggle } from "./language-provider";
import {
  CalendarDays,
  CreditCard,
  GraduationCap,
  LayoutDashboard,
  Menu,
  User,
  X,
  BookOpen,
} from "lucide-react";

const links = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Profile", href: "/dashboard/profile", icon: User },
  { label: "Programs", href: "/dashboard/programs", icon: BookOpen },
  { label: "Payment", href: "/dashboard/payment", icon: CreditCard },
  { label: "Schedule", href: "/dashboard/schedule", icon: CalendarDays },
] as const;

export default function PortalNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // "Overview" must match exactly; other links also match nested routes
  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);

  // Close the mobile menu when the route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  return (
    <>
      <nav
        aria-label="Student portal"
        className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 shadow-[0_1px_12px_rgba(15,23,42,0.04)] backdrop-blur-xl"
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setIsOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 lg:hidden"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
            aria-controls="portal-mobile-menu"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Brand */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 rounded-xl pr-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-700 text-white shadow-sm shadow-sky-500/30">
              <GraduationCap className="h-5 w-5" />
            </span>
            <span className="hidden leading-tight sm:block">
              <span className="block text-sm font-bold tracking-tight text-slate-900">
                Logos College
              </span>
              <span className="block text-[11px] font-medium text-slate-500">
                Student Portal
              </span>
            </span>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden items-center gap-1 lg:ml-6 lg:flex lg:flex-1">
            {links.map(({ label, href, icon: Icon }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`group relative flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 ${
                    active
                      ? "bg-sky-50 text-sky-700"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 transition-colors ${
                      active
                        ? "text-sky-600"
                        : "text-slate-400 group-hover:text-slate-600"
                    }`}
                  />
                  {label}
                  {/* Active underline accent */}
                  <span
                    className={`absolute inset-x-3 -bottom-[9px] h-0.5 rounded-full bg-gradient-to-r from-sky-400 to-blue-600 transition-opacity ${
                      active ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </Link>
              );
            })}
          </div>

          {/* Language toggle */}
          <div className="ml-auto shrink-0 rounded-xl bg-slate-900 px-1 py-0.5 shadow-sm ring-1 ring-slate-900/10">
            <LanguageToggle />
          </div>
        </div>

        {/* Mobile menu (animated height) */}
        <div
          id="portal-mobile-menu"
          className={`grid transition-all duration-300 ease-out lg:hidden ${
            isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className="mx-auto flex max-w-6xl flex-col gap-1 border-t border-slate-100 px-4 py-3">
              {links.map(({ label, href, icon: Icon }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    tabIndex={isOpen ? 0 : -1}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                      active
                        ? "bg-sky-50 text-sky-700"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        active
                          ? "bg-sky-100 text-sky-600"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    {label}
                    {active && (
                      <span className="ml-auto h-2 w-2 rounded-full bg-sky-500" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Backdrop for mobile menu */}
      {isOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-20 bg-slate-900/20 backdrop-blur-[1px] lg:hidden"
        />
      )}
    </>
  );
}