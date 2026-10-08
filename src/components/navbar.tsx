"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed left-1/2 top-4 z-50 w-[calc(100%-2rem)] max-w-6xl -translate-x-1/2 rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 shadow-2xl shadow-black/20 backdrop-blur-xl sm:w-[calc(100%-3rem)] sm:rounded-full sm:px-5">
      <div className="flex h-12 items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          aria-label="Logos College home"
          className="group flex items-center gap-3"
          onClick={() => setIsOpen(false)}
        >
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-md ring-1 ring-white/10 transition-transform duration-300 group-hover:scale-105">
            <Image
              src="/assets/logo.png"
              alt="Logos College logo"
              fill
              priority
              sizes="44px"
              className="object-contain p-1"
            />
          </div>

          <div className="hidden leading-tight sm:block">
            <span className="block text-base font-extrabold tracking-tight text-white">
              Logos{" "}
              <span className="bg-gradient-to-r from-blue-400 ">
                College
              </span>
            </span>

            <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400">
              Excellence in Education
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-1.5 sm:flex sm:gap-2">
          <Link
            href="/login"
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-300 transition-all duration-200 hover:bg-white/5 hover:text-white"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="rounded-xl bg-blue-400 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:from-blue-500 hover:to-indigo-500 hover:shadow-blue-500/30 active:translate-y-0"
          >
            Register
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-center rounded-lg p-2 text-slate-300 transition-colors hover:bg-white/10 hover:text-white sm:hidden"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="mt-4 flex flex-col gap-2 border-t border-white/10 pt-4 sm:hidden">
          <Link
            href="/login"
            onClick={() => setIsOpen(false)}
            className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-300 transition-all duration-200 hover:bg-white/5 hover:text-white"
          >
            Login
          </Link>

          <Link
            href="/register"
            onClick={() => setIsOpen(false)}
            className="rounded-xl bg-blue-400 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all duration-200 hover:bg-blue-500"
          >
            Register
          </Link>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
