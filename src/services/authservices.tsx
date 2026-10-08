import apiRequest from "./apiservices";

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
  return apiRequest<RegisterResponse>(
    "/auth/register",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
};

export const loginStudent = async (
  data: LoginData
): Promise<LoginResponse> => {
  return apiRequest<LoginResponse>(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
};