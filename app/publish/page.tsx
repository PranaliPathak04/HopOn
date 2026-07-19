"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Navigation,
  Car,
  Calendar,
  Clock,
  Users,
  IndianRupee,
  ArrowLeft,
  ArrowRight,
  Loader2,
  AlertCircle,
  Route,
  Plus,
  Minus,
} from "lucide-react";
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
    setError(null);
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

  const inputClass =
    "flex items-center gap-3 rounded-xl px-4 py-3 w-full text-sm focus-within:border-[var(--color-go)] transition-colors";
  const inputStyle = {
    background: "var(--color-surface-2)",
    border: "1px solid var(--color-border)",
  };

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
        <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2">
            <img src="/hopon-car.svg" alt="" width={36} height={32} />
            <span className="font-display text-xl font-extrabold tracking-tight">
              Hop<span style={{ color: "var(--color-go)" }}>On</span>
            </span>
          </div>
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-sm transition-colors hover:text-white"
            style={{ color: "var(--color-ink-muted)" }}
          >
            <ArrowLeft size={14} />
            Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-5 py-10">
        {/* Page header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <h1 className="font-display text-4xl font-extrabold">
            Publish a ride
          </h1>
          <p
            className="mt-2 text-base"
            style={{ color: "var(--color-ink-muted)" }}
          >
            Share your route and split the cost with fellow travellers.
          </p>
        </motion.div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="mb-5 flex items-start gap-3 rounded-xl p-4 text-sm"
              style={{
                background: "var(--color-spark-glow)",
                border: "1px solid rgba(255,107,53,0.2)",
                color: "var(--color-signal)",
              }}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
        >
          {/* Route card */}
          <div
            className="card p-5"
            style={{ background: "var(--color-surface)" }}
          >
            <p
              className="mb-3 text-xs font-bold uppercase tracking-widest"
              style={{ color: "var(--color-ink-dim)" }}
            >
              Route
            </p>

            <div className="flex gap-4">
              {/* Connector */}
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
                  onSelect={handlePickupSelect}
                  icon={
                    <MapPin size={15} style={{ color: "var(--color-go)" }} />
                  }
                />
                <LocationSearch
                  placeholder="Destination"
                  onSelect={handleDestinationSelect}
                  icon={
                    <Navigation
                      size={15}
                      style={{ color: "var(--color-signal)" }}
                    />
                  }
                />
              </div>
            </div>

            {/* Route loading / info */}
            <AnimatePresence>
              {loadingRoute && (
                <motion.div
                  className="mt-4 flex items-center gap-2 text-sm"
                  style={{ color: "var(--color-ink-dim)" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Loader2 size={14} className="animate-spin" />
                  Calculating route...
                </motion.div>
              )}

              {routeInfo && !loadingRoute && (
                <motion.div
                  className="mt-4 flex items-center gap-3"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="route-line flex-1" />
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="pill-go flex items-center gap-1.5 px-3 py-1">
                      <Route size={11} />
                      {routeInfo.distanceKm.toFixed(1)} km
                    </span>
                    <span
                      className="rounded-full px-3 py-1 text-xs font-semibold"
                      style={{
                        background: "var(--color-surface-2)",
                        border: "1px solid var(--color-border)",
                        color: "var(--color-ink-muted)",
                      }}
                    >
                      ~{Math.round(routeInfo.durationMin)} min
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Map */}
          {(pickup || destination) && (
            <motion.div
              className="card overflow-hidden"
              style={{ height: 220, background: "var(--color-surface)" }}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <RouteMap
                pickup={pickup}
                destination={destination}
                routeCoordinates={routeCoords}
              />
            </motion.div>
          )}

          {/* Trip details card */}
          <div
            className="card p-5"
            style={{ background: "var(--color-surface)" }}
          >
            <p
              className="mb-3 text-xs font-bold uppercase tracking-widest"
              style={{ color: "var(--color-ink-dim)" }}
            >
              Trip details
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Vehicle */}
              <div className={inputClass} style={inputStyle}>
                <Car
                  size={15}
                  style={{ color: "var(--color-ink-dim)", flexShrink: 0 }}
                />
                <input
                  className="flex-1 bg-transparent text-sm focus:outline-none"
                  style={{ color: "var(--color-ink)" }}
                  placeholder="Vehicle (e.g. Honda City, White)"
                  value={vehicle}
                  onChange={(e) => setVehicle(e.target.value)}
                  required
                />
              </div>

              {/* Date + Time */}
              <div className="grid grid-cols-2 gap-3">
                <div className={inputClass} style={inputStyle}>
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
                <div className={inputClass} style={inputStyle}>
                  <Clock
                    size={15}
                    style={{ color: "var(--color-ink-dim)", flexShrink: 0 }}
                  />
                  <input
                    className="flex-1 bg-transparent text-sm focus:outline-none"
                    style={{ color: "var(--color-ink)" }}
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Seats + Price */}
              <div className="grid grid-cols-2 gap-3">
                {/* Seats */}
                <div>
                  <label
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wide"
                    style={{ color: "var(--color-ink-dim)" }}
                  >
                    Seats available
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSeats(Math.max(1, seats - 1))}
                      className="flex h-10 w-10 items-center justify-center rounded-xl transition-colors"
                      style={{
                        background: "var(--color-surface-2)",
                        border: "1px solid var(--color-border)",
                        color: "var(--color-ink-muted)",
                      }}
                    >
                      <Minus size={14} />
                    </button>
                    <div
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-bold"
                      style={{
                        background: "var(--color-surface-2)",
                        border: "1px solid var(--color-border)",
                        color: "var(--color-ink)",
                      }}
                    >
                      <Users
                        size={13}
                        style={{ color: "var(--color-ink-dim)" }}
                      />
                      {seats}
                    </div>
                    <button
                      type="button"
                      onClick={() => setSeats(Math.min(8, seats + 1))}
                      className="flex h-10 w-10 items-center justify-center rounded-xl transition-colors"
                      style={{
                        background: "var(--color-surface-2)",
                        border: "1px solid var(--color-border)",
                        color: "var(--color-ink-muted)",
                      }}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {/* Price */}
                <div>
                  <label
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wide"
                    style={{ color: "var(--color-ink-dim)" }}
                  >
                    Price per seat (₹)
                  </label>
                  <div className={inputClass} style={inputStyle}>
                    <IndianRupee
                      size={14}
                      style={{ color: "var(--color-go)", flexShrink: 0 }}
                    />
                    <input
                      className="flex-1 bg-transparent text-sm font-bold focus:outline-none"
                      style={{ color: "var(--color-ink)" }}
                      type="number"
                      min={1}
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="btn-go mt-2 w-full py-4 text-base disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    Publish ride
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
