import { apiRequest } from "@/lib/api";
import type { AuthUser, MessageResponse } from "@/features/auth/types";

export function updateProfileRequest(
  token: string,
  input: { name: string },
) {
  return apiRequest<AuthUser>("/users/me", {
    method: "PATCH",
    token,
    body: input,
  });
}

export function updatePasswordRequest(
  token: string,
  input: { currentPassword: string; newPassword: string },
) {
  return apiRequest<{ message: string; user: AuthUser }>("/users/me/password", {
    method: "PATCH",
    token,
    body: input,
  });
}

export function uploadAvatarRequest(token: string, uri: string, mimeType: string) {
  const formData = new FormData();
  formData.append("file", {
    uri,
    name: "avatar.jpg",
    type: mimeType || "image/jpeg",
  } as unknown as Blob);

  return apiRequest<AuthUser>("/users/me/avatar", {
    method: "POST",
    token,
    formData,
  });
}

export function requestEmailChangeRequest(
  token: string,
  input: { newEmail: string },
) {
  return apiRequest<MessageResponse>("/users/me/email/request", {
    method: "POST",
    token,
    body: input,
  });
}

export function verifyEmailChangeRequest(
  token: string,
  input: { code: string },
) {
  return apiRequest<{ message: string; user: AuthUser }>("/users/me/email/verify", {
    method: "POST",
    token,
    body: input,
  });
}

export function resendEmailChangeRequest(token: string) {
  return apiRequest<MessageResponse>("/users/me/email/resend", {
    method: "POST",
    token,
  });
}
