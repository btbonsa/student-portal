"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LanguageToggle } from "./language-provider";
import { Menu, X } from "lucide-react";

const links = [
  ["Overview", "/dashboard"],
  ["Profile", "/dashboard/profile"],
  ["Programs", "/dashboard/programs"],
  ["Payment", "/dashboard/payment"],
  ["Schedule", "/dashboard/schedule"],
] as const;

export default function PortalNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav aria-label="Student portal" className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center gap-1 py-2">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-center rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 lg:hidden"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-1 overflow-x-auto lg:flex lg:flex-1">
          {links.map(([label, href]) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={`shrink-0 rounded-lg px-3 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 ${
                  isActive
                    ? "bg-blue-400/10 text-green-900"
                    : "text-slate-600 hover:bg-blue-400/10 hover:text-green-900"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {/* Language Toggle */}
        <div className="ml-auto shrink-0 rounded-lg bg-slate-900 px-1">
          <LanguageToggle />
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden">
          <div className="flex flex-col gap-1 py-2">
            {links.map(([label, href]) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsOpen(false)}
                  aria-current={isActive ? "page" : undefined}
                  className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                    isActive
                      ? "bg-blue-400/10 text-green-900"
                      : "text-slate-600 hover:bg-blue-400/10 hover:text-green-900"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
