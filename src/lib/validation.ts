import { z } from "zod";

/**
 * Ethiopian Phone Number Validation
 * - Country code: +251 (fixed)
 * - User enters 9 digits starting with 9 (e.g., 912345678)
 * - Full number becomes +251912345678
 * - Rejects incomplete numbers, letters, and invalid prefixes
 */

export interface CountryCode {
  code: string;
  dialCode: string;
  flag: string;
  name: string;
}

export const countryCodes: CountryCode[] = [
  { code: "ET", dialCode: "+251", flag: "🇪🇹", name: "Ethiopia" },
  { code: "KE", dialCode: "+254", flag: "🇰🇪", name: "Kenya" },
  { code: "UG", dialCode: "+256", flag: "🇺🇬", name: "Uganda" },
  { code: "TZ", dialCode: "+255", flag: "🇹🇿", name: "Tanzania" },
  { code: "SD", dialCode: "+249", flag: "🇸🇩", name: "Sudan" },
  { code: "DJ", dialCode: "+253", flag: "🇩🇯", name: "Djibouti" },
  { code: "ER", dialCode: "+291", flag: "🇪🇷", name: "Eritrea" },
  { code: "SO", dialCode: "+252", flag: "🇸🇴", name: "Somalia" },
];

// Normalize phone number with country code
export function normalizePhone(phone: string, countryCode: string): string {
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, "");
  
  // Remove country code digits if present
  const countryCodeDigits = countryCode.replace(/\D/g, "");
  if (digitsOnly.startsWith(countryCodeDigits)) {
    const numberPart = digitsOnly.slice(countryCodeDigits.length);
    return `${countryCode}${numberPart}`;
  }
  
  // If starts with 0, remove the 0
  if (digitsOnly.startsWith("0")) {
    const numberPart = digitsOnly.slice(1);
    return `${countryCode}${numberPart}`;
  }
  
  // Otherwise, just add the country code
  return `${countryCode}${digitsOnly}`;
}

// Zod schema for phone number with country code
export const phoneSchema = z
  .object({
    phone: z.string().min(1, "Phone number is required"),
    countryCode: z.string().default("+251"),
  })
  .transform((data) => ({
    ...data,
    normalizedPhone: normalizePhone(data.phone, data.countryCode),
  }))
  .refine(
    (data) => {
      const digitsOnly = data.normalizedPhone.replace(/\D/g, "");
      // Must be at least 10 digits total (country code + number)
      return digitsOnly.length >= 10;
    },
    { message: "Phone number is too short", path: ["phone"] }
  )
  .refine(
    (data) => {
      const digitsOnly = data.normalizedPhone.replace(/\D/g, "");
      // Must be at most 15 digits total
      return digitsOnly.length <= 15;
    },
    { message: "Phone number is too long", path: ["phone"] }
  )
  .transform((data) => data.normalizedPhone);

// Normalize Ethiopian phone number to +2519xxxxxxxx format (legacy function)
export function normalizeEthiopianPhone(phone: string): string {
  return normalizePhone(phone, "+251");
}

// Zod schema for Ethiopian phone number (legacy schema)
export const ethiopianPhoneSchema = z
  .string()
  .min(1, "Phone number is required")
  .transform((val) => val.trim())
  .transform((val) => normalizeEthiopianPhone(val))
  .refine(
    (val) => {
      const digitsOnly = val.replace(/\D/g, "");
      // Must be exactly 12 digits (251 + 9 digits)
      return digitsOnly.length === 12;
    },
    { message: "Phone number must be 9 digits (e.g., 912345678)" }
  )
  .refine(
    (val) => {
      const digitsOnly = val.replace(/\D/g, "");
      // After country code 251, must start with 9
      return digitsOnly.startsWith("2519");
    },
    { message: "Phone number must start with 9 (e.g., 912345678)" }
  )
  .refine(
    (val) => {
      const digitsOnly = val.replace(/\D/g, "");
      // Check for valid prefixes (9, 7, or 1 are common in Ethiopia)
      const validPrefixes = ["2519", "2517", "2511"];
      return validPrefixes.some((prefix) => digitsOnly.startsWith(prefix));
    },
    { message: "Invalid phone number prefix. Must start with 9, 7, or 1" }
  );

/**
 * Strong Password Validation
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */

export const strongPasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
    "Password must contain at least one special character"
  );

/**
 * Common weak passwords to reject
 */
const commonPasswords = [
  "password",
  "123456",
  "12345678",
  "qwerty",
  "abc123",
  "password123",
  "admin",
  "letmein",
  "welcome",
  "monkey",
  "dragon",
  "sunshine",
  "iloveyou",
  "princess",
  "football",
  "baseball",
  "trustno1",
  "master",
  "hello",
  "freedom",
  "whatever",
  "qazwsx",
  "passw0rd",
];

export const passwordSchema = strongPasswordSchema.refine(
  (val) => {
    const lowerVal = val.toLowerCase();
    return !commonPasswords.some((common) => lowerVal === common);
  },
  { message: "Password is too common. Please choose a stronger password." }
);

/**
 * Complete registration schema (includes confirm_password for frontend)
 */
export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .transform((val) => val.trim())
    .refine(
      (val) => /^\+\d+$/.test(val),
      { message: "Phone number must be in international format (e.g., +251912345678)" }
    )
    .refine(
      (val) => {
        const digitsOnly = val.replace(/\D/g, "");
        return digitsOnly.length >= 10;
      },
      { message: "Phone number is too short" }
    )
    .refine(
      (val) => {
        const digitsOnly = val.replace(/\D/g, "");
        return digitsOnly.length <= 15;
      },
      { message: "Phone number is too long" }
    ),
  password: passwordSchema,
  confirm_password: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});

/**
 * Backend registration schema (without confirm_password)
 */
export const registerBackendSchema = z.object({
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .transform((val) => val.trim())
    .refine(
      (val) => /^\+\d+$/.test(val),
      { message: "Phone number must be in international format (e.g., +251912345678)" }
    )
    .refine(
      (val) => {
        const digitsOnly = val.replace(/\D/g, "");
        return digitsOnly.length >= 10;
      },
      { message: "Phone number is too short" }
    )
    .refine(
      (val) => {
        const digitsOnly = val.replace(/\D/g, "");
        return digitsOnly.length <= 15;
      },
      { message: "Phone number is too long" }
    ),
  password: passwordSchema,
});

/**
 * Login schema (for frontend with phone normalization)
 */
export const loginSchema = z.object({
  phone: z
    .string()
    .min(1, "Phone number is required")
    .transform((val) => val.trim())
    .refine(
      (val) => /^\+\d+$/.test(val),
      { message: "Phone number must be in international format (e.g., +251912345678)" }
    )
    .refine(
      (val) => {
        const digitsOnly = val.replace(/\D/g, "");
        return digitsOnly.length >= 10;
      },
      { message: "Phone number is too short" }
    )
    .refine(
      (val) => {
        const digitsOnly = val.replace(/\D/g, "");
        return digitsOnly.length <= 15;
      },
      { message: "Phone number is too long" }
    ),
  password: z.string().min(1, "Password is required"),
});

/**
 * Backend login schema (same as loginSchema, kept for consistency)
 */
export const loginBackendSchema = loginSchema;

/**
 * Password strength checker
 * Returns strength level (0-4) and feedback
 */
export function checkPasswordStrength(password: string): {
  score: number;
  feedback: string[];
  label: string;
  color: string;
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push("At least 8 characters");
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push("Uppercase letter");
  }

  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push("Lowercase letter");
  }

  if (/[0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push("Number");
  }

  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score += 1;
  } else {
    feedback.push("Special character");
  }

  // Define strength levels
  const strengthLevels = [
    { label: "Very Weak", color: "bg-red-500" },
    { label: "Weak", color: "bg-orange-500" },
    { label: "Fair", color: "bg-yellow-500" },
    { label: "Good", color: "bg-blue-500" },
    { label: "Strong", color: "bg-green-500" },
  ];

  // Cap score at 4 to match array length
  const cappedScore = Math.min(score, 4);

  return {
    score,
    feedback,
    label: strengthLevels[cappedScore].label,
    color: strengthLevels[cappedScore].color,
  };
}

export type RegisterInput = z.infer<typeof registerSchema>;
export type RegisterBackendInput = z.infer<typeof registerBackendSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type LoginBackendInput = z.infer<typeof loginBackendSchema>;
