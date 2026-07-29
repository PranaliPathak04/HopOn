"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Car,
  Phone,
  Clock,
  Calendar,
  Users,
  IndianRupee,
  Route,
  TrendingUp,
  ChevronDown,
  MapPin,
  Loader2,
} from "lucide-react";
import {
  StatusPill,
  SkeletonCard,
  EmptyState,
  formatDate,
  type DriverRide,
} from "./dashboard-shared";

// ─── Types for stops ──────────────────────────────────────────────────────────

interface Stop {
  key: string;
  latitude: number;
  longitude: number;
  label: string | null;
  pickupSequence: number | null;
  riders: {
    name: string;
    phone: string;
    seatsBooked: number;
    bookingId: string;
  }[];
  totalSeats: number;
}

// ─── Stops list — expandable per ride card ───────────────────────────────────

function StopsList({ rideId }: { rideId: string }) {
  const [expanded, setExpanded] = useState(false);
  const [stops, setStops] = useState<Stop[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (!expanded && stops === null) {
      setLoading(true);
      try {
        const res = await fetch(`/api/rides/${rideId}/stops`);
        const data = await res.json();
        if (data.success) setStops(data.stops);
      } finally {
        setLoading(false);
      }
    }
    setExpanded(!expanded);
  }

  return (
    <div
      className="mt-4"
      style={{ borderTop: "1px solid var(--color-border)", paddingTop: 16 }}
    >
      <button
        onClick={toggle}
        className="flex w-full items-center justify-between text-sm font-semibold transition-colors"
        style={{ color: "var(--color-ink-muted)" }}
      >
        <span className="flex items-center gap-1.5">
          <MapPin size={13} style={{ color: "var(--color-go)" }} />
          Pickup stops
        </span>
        <ChevronDown
          size={15}
          style={{
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
            color: "var(--color-ink-dim)",
          }}
        />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-2">
              {loading ? (
                <div
                  className="flex items-center gap-2 text-sm"
                  style={{ color: "var(--color-ink-dim)" }}
                >
                  <Loader2 size={13} className="animate-spin" /> Loading
                  stops...
                </div>
              ) : !stops || stops.length === 0 ? (
                <p
                  className="text-sm"
                  style={{ color: "var(--color-ink-dim)" }}
                >
                  No confirmed bookings yet.
                </p>
              ) : (
                stops.map((stop, idx) => (
                  <div
                    key={stop.key}
                    className="rounded-xl p-3"
                    style={{
                      background: "var(--color-surface-2)",
                      border: "1px solid var(--color-border)",
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                        style={{
                          background: "var(--color-go)",
                          color: "#0f0f0f",
                        }}
                      >
                        {idx + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p
                          className="text-xs font-medium line-clamp-2"
                          style={{ color: "var(--color-ink)" }}
                        >
                          {stop.label ??
                            `${stop.latitude.toFixed(4)}, ${stop.longitude.toFixed(4)}`}
                        </p>
                        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
                          {stop.riders.map((r) => (
                            <span
                              key={r.bookingId}
                              className="flex items-center gap-1 text-[11px]"
                              style={{ color: "var(--color-ink-muted)" }}
                            >
                              <Users
                                size={11}
                                style={{ color: "var(--color-ink-dim)" }}
                              />
                              {r.name} ({r.seatsBooked})
                              {r.phone && (
                                <a
                                  href={`tel:${r.phone}`}
                                  className="ml-1"
                                  style={{ color: "var(--color-go)" }}
                                >
                                  <Phone size={11} />
                                </a>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                      <span
                        className="shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold"
                        style={{
                          background: "var(--color-go-glow)",
                          color: "var(--color-go)",
                        }}
                      >
                        {stop.totalSeats} seat{stop.totalSeats !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── My Rides Tab ─────────────────────────────────────────────────────────────

export default function MyRidesTab() {
  const [rides, setRides] = useState<DriverRide[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/users/me/rides")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setRides(d.rides);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );

  if (rides.length === 0)
    return (
      <EmptyState
        icon={Route}
        title="No rides posted yet"
        body="If you're driving somewhere, split the cost with a fellow traveller."
        cta="Publish a ride"
        href="/publish"
      />
    );

  const totalRevenue = rides.reduce((sum, r) => sum + r.totalRevenue, 0);
  const activeCount = rides.filter((r) => r.status === "active").length;

  return (
    <div className="space-y-4">
      <motion.div
        className="grid grid-cols-3 gap-3"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {[
          {
            icon: <Car size={16} />,
            label: "Total rides",
            value: rides.length,
            color: "var(--color-ink)",
          },
          {
            icon: <TrendingUp size={16} />,
            label: "Active now",
            value: activeCount,
            color: "var(--color-tide)",
          },
          {
            icon: <IndianRupee size={16} />,
            label: "Est. earnings",
            value: `₹${totalRevenue}`,
            color: "var(--color-go)",
          },
        ].map(({ icon, label, value, color }) => (
          <div
            key={label}
            className="rounded-xl p-4 text-center"
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div className="flex justify-center mb-1" style={{ color }}>
              {icon}
            </div>
            <p
              className="font-display text-xl font-extrabold"
              style={{ color }}
            >
              {value}
            </p>
            <p
              className="text-xs mt-0.5"
              style={{ color: "var(--color-ink-dim)" }}
            >
              {label}
            </p>
          </div>
        ))}
      </motion.div>

      {rides.map((r, i) => (
        <motion.div
          key={r._id}
          className="rounded-2xl p-5"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
          }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.06 }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p
                className="font-display font-bold"
                style={{ color: "var(--color-ink)" }}
              >
                {r.vehicle}
              </p>
              <p
                className="flex items-center gap-1.5 text-sm mt-0.5"
                style={{ color: "var(--color-ink-muted)" }}
              >
                <Calendar size={12} /> {formatDate(r.date)}
                <span style={{ color: "var(--color-border)" }}>·</span>
                <Clock size={12} /> {r.time}
              </p>
            </div>
            <div className="text-right shrink-0">
              <StatusPill status={r.status} />
              <p
                className="mt-1.5 flex items-center justify-end gap-1 text-xs font-semibold"
                style={{ color: "var(--color-go)" }}
              >
                <IndianRupee size={11} /> ₹{r.price}{" "}
                <span
                  style={{ color: "var(--color-ink-dim)", fontWeight: 400 }}
                >
                  / seat (full route)
                </span>
              </p>
            </div>
          </div>

          {/* Pickup & drop locations */}
          {(r.pickupLabel || r.destLabel) && (
            <div className="mt-3 flex gap-3">
              <div className="flex flex-col items-center pt-1">
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "var(--color-go)",
                    boxShadow: "0 0 6px var(--color-go)",
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    width: 2,
                    height: 24,
                    background: "var(--color-border)",
                    margin: "3px 0",
                  }}
                />
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "var(--color-signal)",
                    boxShadow: "0 0 6px var(--color-signal)",
                    flexShrink: 0,
                  }}
                />
              </div>
              <div className="flex-1 min-w-0 space-y-2.5">
                <p
                  className="text-xs line-clamp-2"
                  style={{ color: "var(--color-ink-muted)" }}
                >
                  {r.pickupLabel ?? "Pickup location"}
                </p>
                <p
                  className="text-xs line-clamp-2"
                  style={{ color: "var(--color-ink-muted)" }}
                >
                  {r.destLabel ?? "Drop location"}
                </p>
              </div>
            </div>
          )}

          <div className="my-4 route-line" />

          <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            {[
              { label: "Total seats", value: r.seats },
              { label: "Seats left", value: r.seatsAvailable },
              { label: "Bookings", value: r.bookingCount },
              { label: "Revenue", value: `₹${r.totalRevenue}`, accent: true },
            ].map(({ label, value, accent }) => (
              <div key={label}>
                <p
                  className="text-xs mb-0.5"
                  style={{ color: "var(--color-ink-dim)" }}
                >
                  {label}
                </p>
                <p
                  className="font-medium"
                  style={{
                    color: accent ? "var(--color-go)" : "var(--color-ink)",
                    fontFamily: accent ? "var(--font-display)" : undefined,
                    fontWeight: accent ? 700 : undefined,
                  }}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <div
              className="mb-1.5 flex justify-between text-xs"
              style={{ color: "var(--color-ink-dim)" }}
            >
              <span className="flex items-center gap-1">
                <Users size={11} /> Seat fill
              </span>
              <span>
                {r.seats - r.seatsAvailable}/{r.seats} booked
              </span>
            </div>
            <div
              className="h-1.5 w-full overflow-hidden rounded-full"
              style={{ background: "var(--color-surface-2)" }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{ background: "var(--color-tide)" }}
                initial={{ width: 0 }}
                animate={{
                  width: `${((r.seats - r.seatsAvailable) / r.seats) * 100}%`,
                }}
                transition={{
                  duration: 0.6,
                  delay: 0.2 + i * 0.06,
                  ease: "easeOut",
                }}
              />
            </div>
          </div>

          {/* Expandable pickup stops — only useful once someone has booked */}
          {r.bookingCount > 0 && <StopsList rideId={r._id} />}
        </motion.div>
      ))}
    </div>
  );
}
