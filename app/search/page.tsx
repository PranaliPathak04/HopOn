"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Navigation,
  Calendar,
  ArrowRight,
  Loader2,
  Route,
  Plus,
  Home,
  Briefcase,
  GraduationCap,
  Heart,
} from "lucide-react";
import LocationSearch from "@/components/LocationSearch";
import RideCard from "@/components/RideCard";
import type { GeoResult } from "@/lib/geocode";
import type { RideSearchResult } from "@/types";

// ── Saved address types ──────────────────────────────────────────────────────

interface SavedAddress {
  _id: string;
  label: string;
  latitude: number;
  longitude: number;
  displayName: string;
}

const ADDRESS_LABEL_ICONS: Record<string, React.ReactNode> = {
  Home: <Home size={12} />,
  Office: <Briefcase size={12} />,
  College: <GraduationCap size={12} />,
  School: <GraduationCap size={12} />,
  Other: <Heart size={12} />,
};

export default function SearchPage() {
  const [pickup, setPickup] = useState<GeoResult | null>(null);
  const [destination, setDestination] = useState<GeoResult | null>(null);
  const [date, setDate] = useState("");
  const [results, setResults] = useState<RideSearchResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Saved addresses
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [activeQuickPick, setActiveQuickPick] = useState<
    "pickup" | "destination" | null
  >(null);

  useEffect(() => {
    fetch("/api/users/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setSavedAddresses(d.user.addresses ?? []);
      })
      .catch(() => {});
  }, []);

  function selectSavedAddress(
    addr: SavedAddress,
    type: "pickup" | "destination",
  ) {
    const geo: GeoResult = {
      label: addr.displayName,
      latitude: addr.latitude,
      longitude: addr.longitude,
    };
    if (type === "pickup") setPickup(geo);
    else setDestination(geo);
    setActiveQuickPick(type);
  }

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
      style={{ background: "var(--color-paper)", color: "var(--color-ink)" }}
    >
      {/* Nav */}
      <header
        style={{
          borderBottom: "1px solid var(--color-border)",
          background: "rgba(15,15,15,0.9)",
          backdropFilter: "blur(12px)",
        }}
        className="sticky top-0 z-50"
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2">
            <img src="/hopon-car.svg" alt="" width={36} height={32} />
            <span className="font-display text-2xl font-extrabold tracking-tight">
              Hop<span style={{ color: "var(--color-go)" }}>On</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="hidden text-sm transition-colors hover:text-white sm:block"
              style={{ color: "var(--color-ink-muted)" }}
            >
              Dashboard
            </Link>
            <Link
              href="/publish"
              className="btn-outline px-4 py-1.5 text-sm flex items-center gap-1.5"
            >
              <Plus size={14} />
              Offer a ride
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-5 py-10">
        {/* Page header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <h1 className="font-display text-4xl font-extrabold">Find a ride</h1>
          <p
            className="mt-2 text-base"
            style={{ color: "var(--color-ink-muted)" }}
          >
            Tell us your route — we'll find who's already on it.
          </p>
        </motion.div>

        {/* Search card */}
        <motion.div
          className="card p-5"
          style={{ background: "var(--color-surface)" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
        >
          <form onSubmit={handleSearch} className="space-y-3">
            {/* Saved addresses quick-pick */}
            {savedAddresses.length > 0 && (
              <div className="space-y-1.5">
                <p
                  className="text-xs font-semibold uppercase tracking-wide"
                  style={{ color: "var(--color-ink-dim)" }}
                >
                  Quick pick — tap for pickup, or select then tap destination
                </p>
                <div className="flex flex-wrap gap-2">
                  {savedAddresses.map((addr) => (
                    <div
                      key={addr._id}
                      className="flex rounded-full overflow-hidden"
                      style={{ border: "1px solid var(--color-border)" }}
                    >
                      <button
                        type="button"
                        onClick={() => selectSavedAddress(addr, "pickup")}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors"
                        style={{
                          background:
                            pickup?.latitude === addr.latitude &&
                            pickup?.longitude === addr.longitude
                              ? "var(--color-go)"
                              : "var(--color-surface-2)",
                          color:
                            pickup?.latitude === addr.latitude &&
                            pickup?.longitude === addr.longitude
                              ? "#0f0f0f"
                              : "var(--color-ink-muted)",
                        }}
                        title={`Set as pickup: ${addr.displayName}`}
                      >
                        {ADDRESS_LABEL_ICONS[addr.label] ?? (
                          <MapPin size={12} />
                        )}
                        {addr.label}
                      </button>
                      <button
                        type="button"
                        onClick={() => selectSavedAddress(addr, "destination")}
                        className="flex items-center px-2 py-1.5 text-xs font-semibold transition-colors"
                        style={{
                          background:
                            destination?.latitude === addr.latitude &&
                            destination?.longitude === addr.longitude
                              ? "var(--color-signal)"
                              : "var(--color-surface-2)",
                          color:
                            destination?.latitude === addr.latitude &&
                            destination?.longitude === addr.longitude
                              ? "#0f0f0f"
                              : "var(--color-ink-dim)",
                          borderLeft: "1px solid var(--color-border)",
                        }}
                        title={`Set as destination: ${addr.displayName}`}
                      >
                        <Navigation size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Route inputs with connector */}
            <div className="flex gap-4">
              {/* Connector line */}
              <div className="flex flex-col items-center pt-3.5">
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: "var(--color-go)",
                    boxShadow: "0 0 8px var(--color-go)",
                    display: "block",
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    width: 2,
                    height: 28,
                    background: "var(--color-border)",
                    display: "block",
                    margin: "4px 0",
                  }}
                />
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: "var(--color-signal)",
                    boxShadow: "0 0 8px var(--color-signal)",
                    display: "block",
                    flexShrink: 0,
                  }}
                />
              </div>

              <div className="flex-1 space-y-2">
                <LocationSearch
                  placeholder="Pickup location"
                  onSelect={setPickup}
                  value={pickup}
                  icon={
                    <MapPin size={15} style={{ color: "var(--color-go)" }} />
                  }
                />
                <LocationSearch
                  placeholder="Where to?"
                  onSelect={setDestination}
                  value={destination}
                  icon={
                    <Navigation
                      size={15}
                      style={{ color: "var(--color-signal)" }}
                    />
                  }
                />
              </div>
            </div>

            {/* Date */}
            <div
              className="flex items-center gap-3 rounded-xl px-4 py-3"
              style={{
                background: "var(--color-surface-2)",
                border: "1px solid var(--color-border)",
              }}
            >
              <Calendar
                size={15}
                style={{ color: "var(--color-ink-dim)", flexShrink: 0 }}
              />
              <input
                className="flex-1 bg-transparent text-sm focus:outline-none"
                style={{ color: "var(--color-ink)" }}
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.p
                  className="rounded-xl p-3 text-sm"
                  style={{
                    background: "var(--color-spark-glow)",
                    color: "var(--color-signal)",
                    border: "1px solid rgba(255,107,53,0.2)",
                  }}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="btn-go w-full py-4 text-base disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  Search rides
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Results */}
        <div className="mt-6 space-y-4">
          {/* Skeletons */}
          {loading &&
            [1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="card animate-pulse p-5"
                style={{ background: "var(--color-surface)" }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
              >
                <div className="flex justify-between mb-4">
                  <div className="space-y-2">
                    <div
                      className="h-4 w-28 rounded"
                      style={{ background: "var(--color-border)" }}
                    />
                    <div
                      className="h-3 w-20 rounded"
                      style={{ background: "var(--color-surface-2)" }}
                    />
                  </div>
                  <div
                    className="h-6 w-14 rounded"
                    style={{ background: "var(--color-border)" }}
                  />
                </div>
                <div
                  className="h-px mb-4"
                  style={{ background: "var(--color-border)" }}
                />
                <div
                  className="h-10 rounded-xl"
                  style={{ background: "var(--color-surface-2)" }}
                />
              </motion.div>
            ))}

          {/* Empty state */}
          <AnimatePresence>
            {results !== null && results.length === 0 && (
              <motion.div
                className="rounded-2xl p-12 text-center"
                style={{ border: "1px dashed var(--color-border)" }}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div
                  className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
                  style={{
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <Route size={24} style={{ color: "var(--color-ink-dim)" }} />
                </div>
                <p
                  className="font-display text-xl font-extrabold"
                  style={{ color: "var(--color-ink)" }}
                >
                  No rides on this route yet
                </p>
                <p
                  className="mt-2 text-sm"
                  style={{ color: "var(--color-ink-dim)" }}
                >
                  Try a different date, or be the first to offer this route.
                </p>
                <Link
                  href="/publish"
                  className="btn-outline mt-6 inline-flex items-center gap-2 px-6 py-2.5 text-sm"
                >
                  <Plus size={14} />
                  Offer this route
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Result count */}
          {results !== null && results.length > 0 && (
            <motion.p
              className="text-sm"
              style={{ color: "var(--color-ink-dim)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {results.length} ride{results.length !== 1 ? "s" : ""} found
            </motion.p>
          )}

          {/* Ride cards */}
          <AnimatePresence>
            {results?.map((ride, i) => (
              <motion.div
                key={ride._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, delay: i * 0.06 }}
              >
                <RideCard
                  ride={ride}
                  pickup={pickup!}
                  destination={destination!}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
