"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Car,
  Phone,
  Hash,
  Clock,
  Calendar,
  Users,
  Search,
  X,
  Route,
  ChevronDown,
} from "lucide-react";
import {
  StatusPill,
  SkeletonCard,
  EmptyState,
  formatDate,
  type BookingWithRide,
} from "./dashboard-shared";

// ─── Booking Card ─────────────────────────────────────────────────────────────

function BookingCard({
  b,
  i,
  cancelling,
  onCancel,
}: {
  b: BookingWithRide;
  i: number;
  cancelling: string | null;
  onCancel: (id: string) => void;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      className="rounded-2xl p-5"
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
      }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: i * 0.06 }}
    >
      {/* Headline row — photo, name, vehicle, status, fare */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {b.ride?.driverPhoto ? (
            <img
              src={b.ride.driverPhoto}
              alt={b.ride.driverName}
              className="h-10 w-10 rounded-full object-cover shrink-0"
              style={{ border: "2px solid var(--color-border)" }}
            />
          ) : (
            <div
              className="h-10 w-10 shrink-0 rounded-full flex items-center justify-center font-bold text-sm"
              style={{
                background: "var(--color-surface-2)",
                border: "2px solid var(--color-border)",
                color: "var(--color-ink-muted)",
              }}
            >
              {(b.ride?.driverName ?? "?").charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p
              className="font-display font-bold truncate"
              style={{ color: "var(--color-ink)" }}
            >
              {b.ride?.driverName ?? "Unknown driver"}
            </p>
            <p
              className="flex items-center gap-1.5 text-xs mt-0.5 truncate"
              style={{ color: "var(--color-ink-muted)" }}
            >
              <Car size={11} /> {b.ride?.vehicle ?? "—"}
            </p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <StatusPill status={b.status} />
          <p
            className="mt-1.5 font-display text-lg font-extrabold"
            style={{ color: "var(--color-go)" }}
          >
            ₹{b.fare}
          </p>
        </div>
      </div>

      {/* Compact trip essentials — one row, icons only, no labels */}
      <div
        className="mt-3 flex items-center gap-4 text-xs rounded-xl px-3 py-2.5"
        style={{
          background: "var(--color-surface-2)",
          color: "var(--color-ink-muted)",
        }}
      >
        <span className="flex items-center gap-1.5">
          <Calendar size={12} style={{ color: "var(--color-ink-dim)" }} />
          {b.ride?.date ? formatDate(b.ride.date) : "—"}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock size={12} style={{ color: "var(--color-ink-dim)" }} />
          {b.ride?.time ?? "—"}
        </span>
        <span className="flex items-center gap-1.5">
          <Users size={12} style={{ color: "var(--color-ink-dim)" }} />
          {b.seatsBooked}
        </span>
        <span className="flex items-center gap-1.5 ml-auto">
          <Route size={12} style={{ color: "var(--color-ink-dim)" }} />
          {b.segmentDistanceKm.toFixed(1)} km
        </span>
      </div>

      {/* Always-visible compact route line — truncated to one line each, keeps the
          card from feeling empty when collapsed, without the full address wrap */}
      {(b.pickupLabel || b.dropLabel) && (
        <div className="mt-3 flex items-center gap-2.5">
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "var(--color-go)",
              flexShrink: 0,
            }}
          />
          <p
            className="flex-1 min-w-0 line-clamp-2 text-xs"
            style={{ color: "var(--color-ink-muted)" }}
          >
            {b.pickupLabel ?? "Pickup location"}
          </p>
        </div>
      )}
      {(b.pickupLabel || b.dropLabel) && (
        <div className="mt-1.5 flex items-center gap-2.5">
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "var(--color-signal)",
              flexShrink: 0,
            }}
          />
          <p
            className="flex-1 min-w-0 line-clamp-2 text-xs"
            style={{ color: "var(--color-ink-muted)" }}
          >
            {b.dropLabel ?? "Drop location"}
          </p>
        </div>
      )}

      {/* Expandable — just contact + plate now, route already shown above */}
      {(b.ride?.driverPhone || b.ride?.vehicleNumber) && (
        <div className="mt-3">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex w-full items-center justify-between text-xs font-semibold transition-colors"
            style={{ color: "var(--color-ink-dim)" }}
          >
            <span>Contact & vehicle</span>
            <ChevronDown
              size={14}
              style={{
                transform: showDetails ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s",
              }}
            />
          </button>

          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-3 flex flex-wrap gap-2">
                  {b.ride?.driverPhone && (
                    <a
                      href={`tel:${b.ride.driverPhone}`}
                      className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors"
                      style={{
                        background: "var(--color-surface-2)",
                        border: "1px solid var(--color-border)",
                        color: "var(--color-ink-muted)",
                      }}
                    >
                      <Phone size={11} style={{ color: "var(--color-go)" }} />
                      {b.ride.driverPhone}
                    </a>
                  )}
                  {b.ride?.vehicleNumber && (
                    <span
                      className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold"
                      style={{
                        background: "var(--color-surface-2)",
                        border: "1px solid var(--color-border)",
                        color: "var(--color-ink-muted)",
                      }}
                    >
                      <Hash size={11} style={{ color: "var(--color-go)" }} />
                      {b.ride.vehicleNumber}
                    </span>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Footer — booked date + cancel */}
      <div
        className="mt-4 flex items-center justify-between gap-3 pt-4"
        style={{ borderTop: "1px solid var(--color-border)" }}
      >
        <p className="text-xs" style={{ color: "var(--color-ink-dim)" }}>
          Booked {formatDate(b.createdAt)}
        </p>
        {b.status === "confirmed" && (
          <button
            onClick={() => onCancel(b._id)}
            disabled={cancelling === b._id}
            className="flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-sm font-semibold transition-colors disabled:opacity-50"
            style={{
              background: "var(--color-surface-2)",
              border: "1px solid var(--color-border)",
              color: "var(--color-ink-muted)",
            }}
          >
            <X size={13} />
            {cancelling === b._id ? "Cancelling…" : "Cancel"}
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ─── Bookings Tab ─────────────────────────────────────────────────────────────

export default function BookingsTab() {
  const [bookings, setBookings] = useState<BookingWithRide[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/users/me/bookings")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setBookings(d.bookings);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleCancel(bookingId: string) {
    setCancelling(bookingId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        setBookings((prev) =>
          prev.map((b) =>
            b._id === bookingId ? { ...b, status: "cancelled" } : b,
          ),
        );
      }
    } finally {
      setCancelling(null);
    }
  }

  if (loading)
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );

  if (bookings.length === 0)
    return (
      <EmptyState
        icon={Search}
        title="No bookings yet"
        body="Find a ride that's already going your way."
        cta="Search rides"
        href="/search"
      />
    );

  return (
    <div className="space-y-4">
      {bookings.map((b, i) => (
        <BookingCard
          key={b._id}
          b={b}
          i={i}
          cancelling={cancelling}
          onCancel={handleCancel}
        />
      ))}
    </div>
  );
}
