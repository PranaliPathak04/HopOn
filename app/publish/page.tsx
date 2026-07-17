"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import LocationSearch from "@/components/LocationSearch";
import { getRoute, type GeoResult } from "@/lib/geocode";

// Loaded dynamically to avoid SSR issues (MapLibre needs the browser window)
import dynamic from "next/dynamic";
const RouteMap = dynamic(() => import("@/components/RouteMap"), { ssr: false });

export default function PublishRidePage() {
  const router = useRouter();

  const [pickup, setPickup] = useState<GeoResult | null>(null);
  const [destination, setDestination] = useState<GeoResult | null>(null);
  const [routeCoords, setRouteCoords] = useState<[number, number][] | null>(
    null,
  );
  const [routeInfo, setRouteInfo] = useState<{
    distanceKm: number;
    durationMin: number;
  } | null>(null);

  const [vehicle, setVehicle] = useState("");
  const [seats, setSeats] = useState(3);
  const [price, setPrice] = useState(5);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const [loadingRoute, setLoadingRoute] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePickupSelect(r: GeoResult) {
    setPickup(r);
    if (destination) await fetchRoute(r, destination);
  }

  async function handleDestinationSelect(r: GeoResult) {
    setDestination(r);
    if (pickup) await fetchRoute(pickup, r);
  }

  async function fetchRoute(p: GeoResult, d: GeoResult) {
    setLoadingRoute(true);
    const route = await getRoute(p, d);
    setLoadingRoute(false);

    if (!route) {
      setError(
        "Couldn't calculate a route between those two points. Try different addresses.",
      );
      return;
    }

    setRouteCoords(route.coordinates);
    setRouteInfo({
      distanceKm: route.distanceKm,
      durationMin: route.durationMin,
    });
    // Default price suggestion: ~₹8/km, rounded
    setPrice(Math.max(5, Math.round(route.distanceKm * 8)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!pickup || !destination || !routeCoords) {
      setError("Please select both a pickup and a destination.");
      return;
    }
    if (!vehicle || !date || !time) {
      setError("Please fill in vehicle, date and time.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/rides/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pickup: { latitude: pickup.latitude, longitude: pickup.longitude },
          destination: {
            latitude: destination.latitude,
            longitude: destination.longitude,
          },
          routeCoordinates: routeCoords,
          vehicle,
          seats,
          price,
          date,
          time,
        }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.message);
        return;
      }

      router.push("/");
    } catch {
      setError("Something went wrong publishing the ride.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Publish a ride</h1>

      {error && (
        <p className="mb-4 rounded bg-red-50 p-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mb-4 space-y-3">
        <LocationSearch
          placeholder="Pickup location"
          onSelect={handlePickupSelect}
        />
        <LocationSearch
          placeholder="Destination"
          onSelect={handleDestinationSelect}
        />
      </div>

      <RouteMap
        pickup={pickup}
        destination={destination}
        routeCoordinates={routeCoords}
      />

      {loadingRoute && (
        <p className="mt-2 text-sm text-gray-500">Calculating route...</p>
      )}
      {routeInfo && (
        <p className="mt-2 text-sm text-gray-600">
          {routeInfo.distanceKm.toFixed(1)} km ·{" "}
          {Math.round(routeInfo.durationMin)} min
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-3">
        <input
          className="w-full rounded border border-gray-300 p-2"
          placeholder="Vehicle (e.g. Honda City, White)"
          value={vehicle}
          onChange={(e) => setVehicle(e.target.value)}
          required
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            className="rounded border border-gray-300 p-2"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
          <input
            className="rounded border border-gray-300 p-2"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm text-gray-600">
            Seats available
            <input
              className="mt-1 w-full rounded border border-gray-300 p-2"
              type="number"
              min={1}
              max={8}
              value={seats}
              onChange={(e) => setSeats(Number(e.target.value))}
            />
          </label>
          <label className="text-sm text-gray-600">
            Price per seat (₹)
            <input
              className="mt-1 w-full rounded border border-gray-300 p-2"
              type="number"
              min={1}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded bg-black p-2 text-white disabled:opacity-50"
        >
          {submitting ? "Publishing..." : "Publish ride"}
        </button>
      </form>
    </main>
  );
}
