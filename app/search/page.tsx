"use client";

import { useState } from "react";
import Link from "next/link";
import LocationSearch from "@/components/LocationSearch";
import RideCard from "@/components/RideCard";
import type { GeoResult } from "@/lib/geocode";
import type { RideSearchResult } from "@/types";

export default function SearchPage() {
  const [pickup, setPickup] = useState<GeoResult | null>(null);
  const [destination, setDestination] = useState<GeoResult | null>(null);
  const [date, setDate] = useState("");

  const [results, setResults] = useState<RideSearchResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!pickup || !destination || !date) {
      setError("Please select a pickup, a destination, and a date.");
      return;
    }

    setLoading(true);
    setResults(null);

    try {
      const res = await fetch("/api/rides/find", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pickup: { latitude: pickup.latitude, longitude: pickup.longitude },
          destination: {
            latitude: destination.latitude,
            longitude: destination.longitude,
          },
          date,
        }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Search failed");
        return;
      }

      setResults(data.rides);
    } catch {
      setError("Something went wrong searching for rides.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-6 py-10">
      <Link href="/" className="font-display text-sm font-bold text-road">
        ← HopOn
      </Link>

      <h1 className="mt-4 font-display text-3xl font-extrabold text-ink">
        Find a ride
      </h1>
      <p className="mt-1 text-ink/60">
        Tell us your route, we&apos;ll find who&apos;s already on it.
      </p>

      <form
        onSubmit={handleSearch}
        className="mt-6 space-y-3 rounded-2xl border border-lane-light bg-white p-5"
      >
        <LocationSearch placeholder="Pickup location" onSelect={setPickup} />
        <div className="route-line ml-3 w-6" />
        <LocationSearch placeholder="Destination" onSelect={setDestination} />
        <input
          className="w-full rounded-lg border border-lane-light p-2.5 text-ink"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />

        {error && (
          <p className="rounded-lg bg-red-50 p-2.5 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-road py-3 font-display font-bold text-paper hover:bg-road-light disabled:opacity-50"
        >
          {loading ? "Searching..." : "Search rides"}
        </button>
      </form>

      <div className="mt-8 space-y-4">
        {results !== null && results.length === 0 && (
          <div className="rounded-2xl border border-dashed border-lane-light p-8 text-center">
            <p className="font-display font-bold text-ink">
              No rides on this route yet
            </p>
            <p className="mt-1 text-sm text-ink/60">
              Try a different date, or check back later — new rides get
              published often.
            </p>
          </div>
        )}
        {results?.map((ride) => (
          <RideCard
            key={ride._id}
            ride={ride}
            pickup={{
              latitude: pickup!.latitude,
              longitude: pickup!.longitude,
            }}
            destination={{
              latitude: destination!.latitude,
              longitude: destination!.longitude,
            }}
          />
        ))}
      </div>
    </main>
  );
}
