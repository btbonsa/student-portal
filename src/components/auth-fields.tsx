"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, ReactNode } from "react";
import { AlertCircle, ChevronDown, Eye, EyeOff, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { countryCodes } from "@/lib/validation";

/** Shared input styling. Error state swaps the border color. */
export const fieldClass = (hasError?: boolean) =>
  `h-12 rounded-xl bg-white text-base shadow-sm dark:bg-slate-900 focus-visible:ring-2 focus-visible:ring-blue-500 ${
    hasError ? "border-red-500" : "border-slate-200 dark:border-slate-800"
  }`;

export function FieldLabel({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-semibold text-slate-700 dark:text-slate-300">
      {children}
    </label>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="flex items-center gap-1.5 text-xs font-medium text-red-500" role="alert">
      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
      {message}
    </p>
  );
}

interface PhoneFieldProps {
  value: string;
  onChange: (value: string) => void;
  countryCode: string;
  onCountryChange: (dialCode: string) => void;
  disabled?: boolean;
  error?: string;
  hint?: string;
}

export function PhoneField({
  value,
  onChange,
  countryCode,
  onCountryChange,
  disabled,
  error,
  hint,
}: PhoneFieldProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close the dropdown when clicking outside
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const selected = countryCodes.find((c) => c.dialCode === countryCode);

  return (
    <div className="space-y-2">
      <FieldLabel htmlFor="phone">Phone number</FieldLabel>
      <div className="flex items-stretch">
        <div ref={wrapperRef} className="relative">
          <button
            type="button"
            disabled={disabled}
            aria-haspopup="listbox"
            aria-expanded={open}
            onClick={() => setOpen((prev) => !prev)}
            className={`flex h-12 items-center gap-1.5 rounded-l-xl border border-r-0 bg-white px-3 shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50 dark:bg-slate-900 dark:hover:bg-slate-800 ${
              error ? "border-red-500" : "border-slate-200 dark:border-slate-800"
            }`}
          >
            <span className="text-base">{selected?.flag || "🇪🇹"}</span>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{countryCode}</span>
            <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
          </button>

          {open && (
            <div
              role="listbox"
              className="absolute left-0 top-full z-50 mt-2 max-h-64 w-60 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl animate-in fade-in slide-in-from-top-1 duration-150 dark:border-slate-800 dark:bg-slate-900"
            >
              {countryCodes.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  role="option"
                  aria-selected={country.dialCode === countryCode}
                  onClick={() => {
                    onCountryChange(country.dialCode);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 ${
                    country.dialCode === countryCode ? "bg-blue-50 dark:bg-blue-950/30" : ""
                  }`}
                >
                  <span>{country.flag}</span>
                  <span className="font-medium text-slate-700 dark:text-slate-200">{country.name}</span>
                  <span className="ml-auto text-xs text-slate-500">{country.dialCode}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <Input
          id="phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="912345678"
          required
          disabled={disabled}
          className={`${fieldClass(!!error)} rounded-l-none`}
        />
      </div>
      <FieldError message={error} />
      {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

interface PasswordFieldProps {
  id: string;
  name?: string;
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  autoComplete?: string;
  disabled?: boolean;
  error?: string;
  /** Optional content on the right side of the label row (e.g. "Forgot password?") */
  labelAction?: ReactNode;
  /** Optional content below the input (e.g. strength meter) */
  children?: ReactNode;
}

export function PasswordField({
  id,
  name,
  label,
  value,
  onChange,
  placeholder,
  autoComplete,
  disabled,
  error,
  labelAction,
  children,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
        {labelAction}
      </div>
      <div className="relative flex items-center">
        <Lock className="pointer-events-none absolute left-3.5 h-4 w-4 text-slate-400" />
        <Input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required
          disabled={disabled}
          className={`${fieldClass(!!error)} pl-10 pr-11`}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={visible ? "Hide password" : "Show password"}
          onClick={() => setVisible((prev) => !prev)}
          className="absolute right-1.5 h-9 w-9 rounded-lg text-slate-400 hover:text-slate-600"
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </div>
      <FieldError message={error} />
      {children}
    </div>
  );
}
