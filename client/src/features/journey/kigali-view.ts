export interface MapPoint {
  lat: number;
  lng: number;
}

/** A compact area within central Kigali, not the entire Kigali province. */
export function randomKigaliPoint(): MapPoint {
  return {
    lat: -1.965 + Math.random() * 0.03,
    lng: 30.06 + Math.random() * 0.065,
  };
}

export function kigaliIpPoint(value: unknown): MapPoint | null {
  if (!value || typeof value !== "object") return null;
  const p = value as Record<string, unknown>;
  const lat = p.latitude,
    lng = p.longitude;
  if (
    p.error ||
    p.country_code !== "RW" ||
    typeof p.city !== "string" ||
    p.city.trim().toLowerCase() !== "kigali" ||
    typeof lat !== "number" ||
    typeof lng !== "number" ||
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    lat < -2.1 ||
    lat > -1.8 ||
    lng < 29.95 ||
    lng > 30.25
  )
    return null;
  return { lat, lng };
}

/** Only a map-view hint. Never store the IP or treat this as a journey endpoint. */
export async function approximateKigaliPoint(
  signal: AbortSignal,
): Promise<MapPoint | null> {
  try {
    const response = await fetch("https://ipapi.co/json/", {
      signal,
      credentials: "omit",
      referrerPolicy: "no-referrer",
      cache: "no-store",
    });
    return response.ok ? kigaliIpPoint(await response.json()) : null;
  } catch {
    return null;
  }
}
