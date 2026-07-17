// Free, key-free geocoding (Nominatim) and routing (OSRM) helpers.
// Both are public OpenStreetMap-based services — no signup, no API key.
// Nominatim asks for max ~1 request/second and a descriptive User-Agent,
// which is fine for address-search-as-you-type with debouncing (see
// components/LocationSearch.tsx) and totally fine for a dev/demo project.

export interface GeoResult {
  label: string;
  latitude: number;
  longitude: number;
}

export async function searchAddress(query: string): Promise<GeoResult[]> {
  if (!query || query.trim().length < 3) return [];

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    query,
  )}&limit=5`;

  const res = await fetch(url, {
    headers: {
      // Nominatim's usage policy asks for an identifiable User-Agent/Referer.
      // The browser sets Referer automatically; this header is best-effort.
      "Accept-Language": "en",
    },
  });

  if (!res.ok) return [];

  const data = await res.json();

  return data.map((item: any) => ({
    label: item.display_name,
    latitude: parseFloat(item.lat),
    longitude: parseFloat(item.lon),
  }));
}

export interface RouteResult {
  coordinates: [number, number][]; // [lng, lat] pairs along the route
  distanceKm: number;
  durationMin: number;
}

// Uses OSRM's public demo server. Fine for dev/demo traffic; if this project
// ever goes to real production scale, self-hosting OSRM is the next step.
export async function getRoute(
  pickup: { latitude: number; longitude: number },
  destination: { latitude: number; longitude: number },
): Promise<RouteResult | null> {
  const url = `https://router.project-osrm.org/route/v1/driving/${pickup.longitude},${pickup.latitude};${destination.longitude},${destination.latitude}?overview=full&geometries=geojson`;

  const res = await fetch(url);
  if (!res.ok) return null;

  const data = await res.json();
  if (!data.routes || data.routes.length === 0) return null;

  const route = data.routes[0];

  return {
    coordinates: route.geometry.coordinates,
    distanceKm: route.distance / 1000,
    durationMin: route.duration / 60,
  };
}
