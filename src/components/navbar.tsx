"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const links = [
  { href: "/#programs", label: "Programs" },
  { href: "/login", label: "Login" },
];

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const close = () => setIsOpen(false);

  return (
    <nav
      aria-label="Main"
      className={`fixed left-1/2 top-3 z-50 w-[calc(100%-1.5rem)] max-w-6xl -translate-x-1/2 border border-white/10 bg-slate-950/80 px-3 py-2 shadow-xl shadow-black/20 backdrop-blur-xl sm:top-4 sm:w-[calc(100%-3rem)] sm:rounded-full sm:px-5 ${
        isOpen ? "rounded-3xl" : "rounded-full"
      }`}
    >
      <div className="flex h-12 items-center justify-between">
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
            <span className="block text-base font-extrabold tracking-tight text-white">
              Logos <span className="text-blue-300">College</span>
            </span>
            <span className="hidden text-xs text-slate-400 sm:block">
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
              className="rounded-full px-4 py-2 text-sm font-semibold text-slate-300 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              {label}
            </Link>
          ))}
          <Link
            href="/register"
            className="ml-1 rounded-full bg-blue-500 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition-colors hover:bg-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
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
          className="flex h-10 w-10 items-center justify-center rounded-full text-slate-200 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 sm:hidden"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div
          id="mobile-menu"
          className="flex flex-col gap-1 border-t border-white/10 pb-2 pt-3 sm:hidden"
        >
          {links.map(({ href, label }) => (
            <Link
              key={label}
              href={href}
              onClick={close}
              className="rounded-2xl px-4 py-3 text-base font-semibold text-slate-200 transition-colors hover:bg-white/10 hover:text-white"
            >
              {label}
            </Link>
          ))}
          <Link
            href="/register"
            onClick={close}
            className="mt-1 rounded-2xl bg-blue-500 px-4 py-3 text-center text-base font-bold text-white transition-colors hover:bg-blue-400"
          >
            Register
          </Link>
        </div>
      )}
    </nav>
  );
}

export default Navbar;