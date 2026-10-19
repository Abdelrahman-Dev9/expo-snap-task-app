import type { AuthUser } from "@/features/auth/types";
import { apiRequest } from "@/lib/api";
import type { GeoLocation } from "./types";

export function updateUserLocationRequest(token: string, location: GeoLocation) {
  return apiRequest<AuthUser>("/users/me/location", {
    method: "PATCH",
    token,
    body: {
      latitude: location.latitude,
      longitude: location.longitude,
      address: location.address ?? undefined,
    },
  });
}

export function clearUserLocationRequest(token: string) {
  return apiRequest<AuthUser>("/users/me/location", {
    method: "DELETE",
    token,
  });
}
