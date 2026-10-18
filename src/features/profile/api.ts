import { apiRequest } from "@/lib/api";
import type { AuthUser, MessageResponse } from "@/features/auth/types";
import { appendUploadFile, prepareImageForUpload } from "@/lib/upload";

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

export async function uploadAvatarRequest(token: string, uri: string) {
  const file = await prepareImageForUpload(uri, "avatar.jpg");
  const formData = new FormData();
  appendUploadFile(formData, "file", file);

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
