"use client";

import { useState, useEffect } from "react";
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
  ChevronDown,
  Check,
} from "lucide-react";
import LocationSearch from "@/components/LocationSearch";
import { getRoute, type GeoResult } from "@/lib/geocode";
import dynamic from "next/dynamic";

const RouteMap = dynamic(() => import("@/components/RouteMap"), { ssr: false });

// ── Types ─────────────────────────────────────────────────────────────────────

interface SavedVehicle {
  _id: string;
  make: string;
  model: string;
  type: string;
  color: string;
  licensePlate: string;
  seats: number;
  isDefault: boolean;
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function PublishRidePage() {
  const router = useRouter();

  // Route state
  const [pickup, setPickup] = useState<GeoResult | null>(null);
  const [destination, setDestination] = useState<GeoResult | null>(null);
  const [routeCoords, setRouteCoords] = useState<[number, number][] | null>(
    null,
  );
  const [routeInfo, setRouteInfo] = useState<{
    distanceKm: number;
    durationMin: number;
  } | null>(null);
  const [loadingRoute, setLoadingRoute] = useState(false);

  // Vehicle state
  const [savedVehicles, setSavedVehicles] = useState<SavedVehicle[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(
    null,
  );
  const [vehicleDropdownOpen, setVehicleDropdownOpen] = useState(false);

  // Trip details
  const [seats, setSeats] = useState(3);
  const [price, setPrice] = useState(5);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Load saved vehicles on mount ─────────────────────────────────────────────

  useEffect(() => {
    async function loadVehicles() {
      try {
        const res = await fetch("/api/vehicles");
        const data = await res.json();
        if (data.success) {
          setSavedVehicles(data.vehicles);
          // Auto-select default vehicle
          const defaultV = data.vehicles.find((v: SavedVehicle) => v.isDefault);
          if (defaultV) {
            setSelectedVehicleId(defaultV._id);
            setSeats(defaultV.seats);
          } else if (data.vehicles.length > 0) {
            setSelectedVehicleId(data.vehicles[0]._id);
            setSeats(data.vehicles[0].seats);
          }
        }
      } catch {
        // silently fail — user will see "no vehicles" state
      } finally {
        setLoadingVehicles(false);
      }
    }
    loadVehicles();
  }, []);

  const selectedVehicle =
    savedVehicles.find((v) => v._id === selectedVehicleId) ?? null;

  // ── Route handlers ───────────────────────────────────────────────────────────

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

  // ── Submit ───────────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!pickup || !destination || !routeCoords) {
      setError("Please select both a pickup and a destination.");
      return;
    }
    if (!selectedVehicle) {
      setError("Please select a vehicle. You can add one from your profile.");
      return;
    }
    if (!date || !time) {
      setError("Please fill in date and time.");
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
          vehicle: `${selectedVehicle.make} ${selectedVehicle.model} · ${selectedVehicle.color}`,
          vehicleId: selectedVehicle._id,
          seats,
          price,
          date,
          time,
          distanceKm: routeInfo?.distanceKm,
          durationMin: routeInfo?.durationMin,
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

  // ── Styles ───────────────────────────────────────────────────────────────────

  const inputClass =
    "flex items-center gap-3 rounded-xl px-4 py-3 w-full text-sm focus-within:border-[var(--color-go)] transition-colors";
  const inputStyle = {
    background: "var(--color-surface-2)",
    border: "1px solid var(--color-border)",
  };

  // ── Render ───────────────────────────────────────────────────────────────────

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
            <ArrowLeft size={14} /> Dashboard
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
          {/* ── Vehicle selector card ── */}
          <div
            className="card p-5"
            style={{ background: "var(--color-surface)" }}
          >
            <p
              className="mb-3 text-xs font-bold uppercase tracking-widest"
              style={{ color: "var(--color-ink-dim)" }}
            >
              Vehicle
            </p>

            {loadingVehicles ? (
              <div
                className="flex items-center gap-2 text-sm"
                style={{ color: "var(--color-ink-dim)" }}
              >
                <Loader2 size={14} className="animate-spin" /> Loading your
                vehicles...
              </div>
            ) : savedVehicles.length === 0 ? (
              /* No vehicles saved yet */
              <div
                className="flex flex-col items-center gap-3 rounded-xl py-8 text-center"
                style={{ border: "1px dashed var(--color-border)" }}
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{
                    background: "var(--color-surface-2)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <Car size={20} style={{ color: "var(--color-ink-dim)" }} />
                </div>
                <div>
                  <p
                    className="font-semibold text-sm"
                    style={{ color: "var(--color-ink)" }}
                  >
                    No vehicles added yet
                  </p>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: "var(--color-ink-dim)" }}
                  >
                    Add a vehicle from your profile first
                  </p>
                </div>
                <Link
                  href="/profile"
                  className="btn-go px-5 py-2 text-sm flex items-center gap-1.5"
                >
                  <Plus size={14} /> Add a vehicle
                </Link>
              </div>
            ) : (
              /* Vehicle dropdown */
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setVehicleDropdownOpen(!vehicleDropdownOpen)}
                  className="w-full flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm transition-colors"
                  style={{
                    background: "var(--color-surface-2)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  {selectedVehicle ? (
                    <div className="flex items-center gap-3 min-w-0">
                      <Car
                        size={15}
                        style={{ color: "var(--color-go)", flexShrink: 0 }}
                      />
                      <div className="text-left min-w-0">
                        <p
                          className="font-semibold truncate"
                          style={{ color: "var(--color-ink)" }}
                        >
                          {selectedVehicle.make} {selectedVehicle.model}
                        </p>
                        <p
                          className="text-xs truncate"
                          style={{ color: "var(--color-ink-muted)" }}
                        >
                          {selectedVehicle.color} ·{" "}
                          {selectedVehicle.licensePlate} ·{" "}
                          {selectedVehicle.seats} seats
                        </p>
                      </div>
                    </div>
                  ) : (
                    <span style={{ color: "var(--color-ink-dim)" }}>
                      Select a vehicle
                    </span>
                  )}
                  <ChevronDown
                    size={16}
                    style={{
                      color: "var(--color-ink-dim)",
                      flexShrink: 0,
                      transform: vehicleDropdownOpen
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                      transition: "transform 0.2s",
                    }}
                  />
                </button>

                {/* Dropdown list */}
                <AnimatePresence>
                  {vehicleDropdownOpen && (
                    <motion.div
                      className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl py-1"
                      style={{
                        background: "var(--color-surface)",
                        border: "1px solid var(--color-border)",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                      }}
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                    >
                      {savedVehicles.map((v) => (
                        <button
                          key={v._id}
                          type="button"
                          onClick={() => {
                            setSelectedVehicleId(v._id);
                            setSeats(v.seats);
                            setVehicleDropdownOpen(false);
                          }}
                          className="w-full flex items-center justify-between gap-3 px-4 py-3 text-sm transition-colors text-left"
                          style={{
                            background:
                              selectedVehicleId === v._id
                                ? "var(--color-surface-2)"
                                : "transparent",
                            color: "var(--color-ink-muted)",
                          }}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Car
                              size={14}
                              style={{
                                color:
                                  selectedVehicleId === v._id
                                    ? "var(--color-go)"
                                    : "var(--color-ink-dim)",
                                flexShrink: 0,
                              }}
                            />
                            <div className="min-w-0">
                              <p
                                className="font-semibold truncate"
                                style={{ color: "var(--color-ink)" }}
                              >
                                {v.make} {v.model}
                                {v.isDefault && (
                                  <span
                                    className="ml-2 text-xs font-normal"
                                    style={{ color: "var(--color-go)" }}
                                  >
                                    default
                                  </span>
                                )}
                              </p>
                              <p
                                className="text-xs truncate"
                                style={{ color: "var(--color-ink-dim)" }}
                              >
                                {v.color} · {v.licensePlate} · {v.seats} seats
                              </p>
                            </div>
                          </div>
                          {selectedVehicleId === v._id && (
                            <Check
                              size={14}
                              style={{
                                color: "var(--color-go)",
                                flexShrink: 0,
                              }}
                            />
                          )}
                        </button>
                      ))}

                      {/* Add another vehicle */}
                      <div
                        style={{
                          borderTop: "1px solid var(--color-border)",
                          marginTop: 4,
                          paddingTop: 4,
                        }}
                      >
                        <Link
                          href="/profile"
                          className="flex items-center gap-2 px-4 py-2.5 text-sm transition-colors"
                          style={{ color: "var(--color-go)" }}
                        >
                          <Plus size={14} /> Add another vehicle
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* ── Route card ── */}
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

            <AnimatePresence>
              {loadingRoute && (
                <motion.div
                  className="mt-4 flex items-center gap-2 text-sm"
                  style={{ color: "var(--color-ink-dim)" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Loader2 size={14} className="animate-spin" /> Calculating
                  route...
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

          {/* ── Trip details card ── */}
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
                {/* Seats — locked to vehicle capacity */}
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
                      onClick={() =>
                        setSeats(
                          Math.min(selectedVehicle?.seats ?? 8, seats + 1),
                        )
                      }
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
                  {selectedVehicle && (
                    <p
                      className="mt-1 text-xs"
                      style={{ color: "var(--color-ink-dim)" }}
                    >
                      Max {selectedVehicle.seats} for {selectedVehicle.model}
                    </p>
                  )}
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
                disabled={submitting || savedVehicles.length === 0}
                className="btn-go mt-2 w-full py-4 text-base disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Publishing...
                  </>
                ) : (
                  <>
                    Publish ride <ArrowRight size={16} />
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
