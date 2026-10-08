export type UserRole =
  | "STUDENT"
  | "ADMIN"
  | "SUPER_ADMIN";

export interface User {
  id: number;
  email: string;
  phone: string;
  role: UserRole;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  token: string;
  user: {
    id: number;
    email: string;
    phone: string;
    role: "STUDENT";
  };
}