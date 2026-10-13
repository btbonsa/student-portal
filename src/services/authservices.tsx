import {
  LoginResponse,
  RegisterResponse,
} from "@/types/auth";

export interface RegisterData {
  email: string;
  phone: string;
  password: string;
}

export interface LoginData {
  phone: string;
  password: string;
}

export const registerStudent = async (
  data: RegisterData
): Promise<RegisterResponse> => {
  // Use server-side API route to avoid mixed content issues
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Registration API error:', error);
    if (error.details) {
      // Handle field-specific validation errors
      const fieldErrors = Object.entries(error.details)
        .map(([field, message]) => `${field}: ${message}`)
        .join(', ');
      throw new Error(fieldErrors || error.error || 'Registration failed');
    }
    throw new Error(error.error || error.message || 'Registration failed');
  }

  return response.json();
};

export const loginStudent = async (
  data: LoginData
): Promise<LoginResponse> => {
  // Use server-side API route to avoid mixed content issues
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    if (error.details) {
      // Handle field-specific validation errors
      const fieldErrors = Object.entries(error.details)
        .map(([field, message]) => `${field}: ${message}`)
        .join(', ');
      throw new Error(fieldErrors || error.error || 'Login failed');
    }
    throw new Error(error.error || 'Login failed');
  }

  return response.json();
};