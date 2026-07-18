"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LocationSearch from "@/components/LocationSearch";
import { getRoute, type GeoResult } from "@/lib/geocode";

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

      router.push("/dashboard");
    } catch {
      setError("Something went wrong publishing the ride.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-paper">
      {/* Nav */}
      <header className="border-b border-lane-light bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <Link
            href="/"
            className="font-display text-xl font-extrabold text-road"
          >
            HopOn
          </Link>
          <Link
            href="/dashboard"
            className="text-sm text-ink/60 hover:text-ink"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-extrabold text-ink">
            Publish a ride
          </h1>
          <p className="mt-1 text-sm text-ink/60">
            Share your route and split the cost with fellow travellers.
          </p>
        </div>

        {error && (
          <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
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
          <p className="mt-2 text-sm text-ink/50">Calculating route...</p>
        )}
        {routeInfo && (
          <div className="mt-3 flex items-center gap-3">
            <div className="route-line flex-1" />
            <p className="shrink-0 text-sm font-medium text-ink/70">
              {routeInfo.distanceKm.toFixed(1)} km ·{" "}
              {Math.round(routeInfo.durationMin)} min
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            className="w-full rounded-xl border border-lane-light bg-white p-3 text-ink placeholder-ink/40 focus:border-road focus:outline-none"
            placeholder="Vehicle (e.g. Honda City, White)"
            value={vehicle}
            onChange={(e) => setVehicle(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <input
              className="rounded-xl border border-lane-light bg-white p-3 text-ink focus:border-road focus:outline-none"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
            <input
              className="rounded-xl border border-lane-light bg-white p-3 text-ink focus:border-road focus:outline-none"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-ink/50 uppercase tracking-wide">
                Seats available
              </label>
              <input
                className="w-full rounded-xl border border-lane-light bg-white p-3 text-ink focus:border-road focus:outline-none"
                type="number"
                min={1}
                max={8}
                value={seats}
                onChange={(e) => setSeats(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-ink/50 uppercase tracking-wide">
                Price per seat (₹)
              </label>
              <input
                className="w-full rounded-xl border border-lane-light bg-white p-3 text-ink focus:border-road focus:outline-none"
                type="number"
                min={1}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-road py-3 font-display font-bold text-paper hover:bg-road-light disabled:opacity-50"
          >
            {submitting ? "Publishing..." : "Publish ride"}
          </button>
        </form>
      </main>
    </div>
  );
}
