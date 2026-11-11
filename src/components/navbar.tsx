"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const links = [
  { href: "/#programs", label: "Programs" },
  { href: "/login", label: "Login" },
];

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const close = () => setIsOpen(false);

  // At the top the bar is a transparent overlay; once scrolled it becomes a white pill
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu on navigation or Escape
  useEffect(() => {
    close();
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  return (
    <nav aria-label="Main" className="fixed inset-x-0 top-0 z-50">
      <div
        className={`relative mx-auto flex max-w-6xl items-center justify-between px-5 transition-all duration-300 sm:px-8 ${
          scrolled
            ? "mt-3 h-14 rounded-full border border-slate-200 bg-white/95 px-4 shadow-lg shadow-blue-950/10 backdrop-blur-md sm:px-5"
            : "h-16"
        }`}
      >
        {/* Logo and name */}
        <Link
          href="/"
          aria-label="Logos College home"
          onClick={close}
          className="group flex items-center gap-3 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        >
          <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full transition-transform duration-300 group-hover:scale-105">
            <Image
              src="/icons/icon.png"
              alt=""
              fill
              priority
              sizes="40px"
              className="object-contain p-1"
            />
          </span>
          <span className="leading-tight">
            <span
              className={`block text-base font-extrabold tracking-tight transition-colors duration-300 ${
                scrolled ? "text-slate-900" : "text-white"
              }`}
            >
              Logos{" "}
              <span className={scrolled ? "text-blue-600" : "text-blue-300"}>
                College
              </span>
            </span>
            <span
              className={`hidden text-xs transition-colors duration-300 sm:block ${
                scrolled ? "text-slate-500" : "text-slate-400"
              }`}
            >
              Excellence in education
            </span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 sm:flex">
          {links.map(({ href, label }) => (
            <Link
              key={label}
              href={href}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
                scrolled
                  ? "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/register"
            className="ml-1 rounded-full bg-blue-600 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition-all hover:-translate-y-px hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            Register
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
          className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 sm:hidden ${
            scrolled
              ? "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
              : "text-white hover:bg-white/10"
          }`}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Mobile menu — floats below the bar so it works in both states */}
        {isOpen && (
          <div
            id="mobile-menu"
            className={`absolute inset-x-3 top-full z-50 mt-2 flex flex-col gap-1 rounded-3xl border p-2 shadow-2xl shadow-blue-950/20 backdrop-blur-xl sm:hidden ${
              scrolled
                ? "border-slate-200 bg-white/95"
                : "border-white/10 bg-[#0a1f3d]/95"
            }`}
          >
            {links.map(({ href, label }) => (
              <Link
                key={label}
                href={href}
                onClick={close}
                className={`rounded-2xl px-4 py-3 text-base font-semibold transition-colors ${
                  scrolled
                    ? "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                    : "text-slate-200 hover:bg-white/10"
                }`}
              >
                {label}
              </Link>
            ))}
            <Link
              href="/register"
              onClick={close}
              className="mt-1 rounded-2xl bg-blue-600 px-4 py-3 text-center text-base font-bold text-white transition-colors hover:bg-blue-500 "
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
