import type { GeoLocation } from "./types";

let pending: GeoLocation | null = null;

export function setPendingLocationPick(location: GeoLocation | null) {
  pending = location;
}

export function consumePendingLocationPick(): GeoLocation | null {
  const value = pending;
  pending = null;
  return value;
}
