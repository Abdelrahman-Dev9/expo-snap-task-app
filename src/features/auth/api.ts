import { apiRequest } from "@/lib/api";
import type {
  AuthResponse,
  AuthUser,
  MessageResponse,
  ResetTokenResponse,
} from "./types";

export function registerRequest(input: {
  name: string;
  email: string;
  password: string;
}) {
  return apiRequest<MessageResponse>("/auth/register", {
    method: "POST",
    body: input,
  });
}

export function verifyEmailRequest(input: { email: string; code: string }) {
  return apiRequest<AuthResponse>("/auth/verify-email", {
    method: "POST",
    body: input,
  });
}

export function loginRequest(input: { email: string; password: string }) {
  return apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: input,
  });
}

export function forgotPasswordRequest(input: { email: string }) {
  return apiRequest<MessageResponse>("/auth/forgot-password", {
    method: "POST",
    body: input,
  });
}

export function verifyResetOtpRequest(input: { email: string; code: string }) {
  return apiRequest<ResetTokenResponse>("/auth/verify-reset-otp", {
    method: "POST",
    body: input,
  });
}

export function resetPasswordRequest(input: {
  resetToken: string;
  newPassword: string;
}) {
  return apiRequest<MessageResponse>("/auth/reset-password", {
    method: "POST",
    body: input,
  });
}

export function resendOtpRequest(input: {
  email: string;
  purpose: "register" | "reset";
}) {
  return apiRequest<MessageResponse>("/auth/resend-otp", {
    method: "POST",
    body: input,
  });
}

export function meRequest(token: string) {
  return apiRequest<AuthUser>("/auth/me", {
    method: "GET",
    token,
  });
}
