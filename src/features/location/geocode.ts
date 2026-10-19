import type { GeoLocation } from "./types";

const NOMINATIM_HEADERS = {
  Accept: "application/json",
  "User-Agent": "SnapTask/1.0",
} as const;

export type PlaceSearchResult = GeoLocation & {
  id: string;
  label: string;
  kind: "city" | "country" | "place";
};

/** Best-effort reverse geocode via OpenStreetMap (no API key). */
export async function reverseGeocode(
  latitude: number,
  longitude: number,
): Promise<string | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`;
    const response = await fetch(url, { headers: NOMINATIM_HEADERS });
    if (!response.ok) return null;
    const data = (await response.json()) as { display_name?: string };
    return data.display_name ?? null;
  } catch {
    return null;
  }
}

/** Search cities / countries / places by name via OpenStreetMap. */
export async function searchPlaces(query: string): Promise<PlaceSearchResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  try {
    const url =
      `https://nominatim.openstreetmap.org/search?format=jsonv2` +
      `&q=${encodeURIComponent(q)}` +
      `&addressdetails=1&limit=8`;
    const response = await fetch(url, { headers: NOMINATIM_HEADERS });
    if (!response.ok) return [];

    const data = (await response.json()) as Array<{
      place_id: number;
      lat: string;
      lon: string;
      display_name: string;
      type?: string;
      class?: string;
      address?: {
        city?: string;
        town?: string;
        village?: string;
        state?: string;
        country?: string;
      };
    }>;

    return data.map((item) => {
      const isCountry =
        item.type === "country" || item.class === "boundary";
      const isCity =
        item.type === "city" ||
        item.type === "town" ||
        item.type === "village" ||
        item.type === "administrative";

      const city =
        item.address?.city ??
        item.address?.town ??
        item.address?.village ??
        item.address?.state;
      const country = item.address?.country;
      const shortLabel =
        isCountry && country
          ? country
          : [city, country].filter(Boolean).join(", ") || item.display_name;

      return {
        id: String(item.place_id),
        latitude: Number(item.lat),
        longitude: Number(item.lon),
        address: item.display_name,
        label: shortLabel,
        kind: isCountry ? "country" : isCity ? "city" : "place",
      };
    });
  } catch {
    return [];
  }
}

export function formatCoords(location: GeoLocation) {
  return `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`;
}
