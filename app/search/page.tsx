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
      setError("Please select a pickup, destination, and date.");
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
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: "#0f0f0f", color: "#fff" }}
    >
      {/* Nav */}
      <header
        style={{
          borderBottom: "1px solid #1f1f1f",
          background: "rgba(15,15,15,0.9)",
          backdropFilter: "blur(12px)",
        }}
        className="sticky top-0 z-50"
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link href="/" className="font-display text-xl font-extrabold">
            Hop<span style={{ color: "#00e676" }}>On</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="hidden text-sm transition-colors hover:text-white sm:block"
              style={{ color: "#a0a0a0" }}
            >
              Dashboard
            </Link>
            <Link href="/publish" className="btn-outline px-4 py-1.5 text-sm">
              + Offer a ride
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-5 py-10">
        <div className="mb-8">
          <h1 className="font-display text-4xl font-extrabold">Find a ride</h1>
          <p className="mt-2 text-base" style={{ color: "#a0a0a0" }}>
            Tell us your route — we'll find who's already on it.
          </p>
        </div>

        {/* Search card */}
        <div className="card p-5" style={{ background: "#141414" }}>
          <form onSubmit={handleSearch} className="space-y-3">
            {/* Route inputs with connector */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center pt-3.5">
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: "#00e676",
                    boxShadow: "0 0 8px #00e676",
                    display: "block",
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    width: 2,
                    height: 28,
                    background: "#2a2a2a",
                    display: "block",
                    margin: "4px 0",
                  }}
                />
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: "#ff6b35",
                    boxShadow: "0 0 8px #ff6b35",
                    display: "block",
                    flexShrink: 0,
                  }}
                />
              </div>
              <div className="flex-1 space-y-2">
                <LocationSearch
                  placeholder="Pickup location"
                  onSelect={setPickup}
                />
                <LocationSearch
                  placeholder="Where to?"
                  onSelect={setDestination}
                />
              </div>
            </div>

            {/* Date */}
            <div
              className="flex items-center gap-3 rounded-xl px-4 py-3"
              style={{ background: "#1f1f1f", border: "1px solid #2a2a2a" }}
            >
              <span style={{ color: "#555" }}>📅</span>
              <input
                className="flex-1 bg-transparent text-sm focus:outline-none"
                style={{ color: "#fff" }}
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            {error && (
              <p
                className="rounded-xl p-3 text-sm"
                style={{
                  background: "rgba(255,107,53,0.1)",
                  color: "#ff6b35",
                  border: "1px solid rgba(255,107,53,0.2)",
                }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-go w-full py-4 text-base disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                  Searching...
                </span>
              ) : (
                "Search rides →"
              )}
            </button>
          </form>
        </div>

        {/* Results */}
        <div className="mt-6 space-y-4">
          {/* Skeletons */}
          {loading &&
            [1, 2, 3].map((i) => (
              <div
                key={i}
                className="card animate-pulse p-5"
                style={{ background: "#141414" }}
              >
                <div className="flex justify-between mb-4">
                  <div className="space-y-2">
                    <div
                      className="h-4 w-28 rounded"
                      style={{ background: "#2a2a2a" }}
                    />
                    <div
                      className="h-3 w-20 rounded"
                      style={{ background: "#222" }}
                    />
                  </div>
                  <div
                    className="h-6 w-14 rounded"
                    style={{ background: "#2a2a2a" }}
                  />
                </div>
                <div className="h-px mb-4" style={{ background: "#2a2a2a" }} />
                <div
                  className="h-10 rounded-xl"
                  style={{ background: "#1f1f1f" }}
                />
              </div>
            ))}

          {/* Empty */}
          {results !== null && results.length === 0 && (
            <div
              className="rounded-2xl p-12 text-center"
              style={{ border: "1px dashed #2a2a2a" }}
            >
              <p className="text-4xl mb-4">🛣️</p>
              <p className="font-display text-xl font-extrabold text-white">
                No rides on this route yet
              </p>
              <p className="mt-2 text-sm" style={{ color: "#555" }}>
                Try a different date, or be the first to offer this route.
              </p>
              <Link
                href="/publish"
                className="btn-outline mt-6 inline-block px-6 py-2.5 text-sm"
              >
                Offer this route
              </Link>
            </div>
          )}

          {results !== null && results.length > 0 && (
            <p className="text-sm" style={{ color: "#555" }}>
              {results.length} ride{results.length !== 1 ? "s" : ""} found
            </p>
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
      </div>
    </div>
  );
}
