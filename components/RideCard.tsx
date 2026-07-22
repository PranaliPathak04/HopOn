"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Users,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Car,
} from "lucide-react";
import type { RideSearchResult } from "@/types";

interface Props {
  ride: RideSearchResult;
  pickup: { latitude: number; longitude: number };
  destination: { latitude: number; longitude: number };
}

export default function RideCard({ ride, pickup, destination }: Props) {
  const [status, setStatus] = useState<"idle" | "booking" | "booked" | "error">(
    "idle",
  );
  const [message, setMessage] = useState<string | null>(null);
  const [fare, setFare] = useState<number | null>(null);

  async function handleBook() {
    setStatus("booking");
    setMessage(null);
    try {
      const res = await fetch("/api/bookings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rideId: ride._id,
          seatsBooked: 1,
          pickupInfo: pickup,
          dropInfo: destination,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setStatus("error");
        setMessage(data.message);
        return;
      }
      setFare(data.booking.fare);
      setStatus("booked");
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  }

  return (
    <div
      className="card p-5 transition-all hover:shadow-lg"
      style={{ background: "var(--color-surface)" }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between">
        <div>
          <p
            className="font-display font-bold"
            style={{ color: "var(--color-ink)" }}
          >
            {ride.driverName}
          </p>
          <p
            className="flex items-center gap-1.5 text-sm mt-0.5"
            style={{ color: "var(--color-ink-dim)" }}
          >
            <Car size={12} /> {ride.vehicle}
          </p>
        </div>
        <div className="text-right">
          <p
            className="font-display text-2xl font-extrabold"
            style={{ color: "var(--color-go)" }}
          >
            ₹{ride.price}
          </p>
          <p className="text-xs" style={{ color: "var(--color-ink-dim)" }}>
            full route
          </p>
        </div>
      </div>

      {/* Route proximity */}
      <div className="my-4 flex items-center gap-3">
        <span
          className="whitespace-nowrap text-xs font-medium"
          style={{ color: "var(--color-ink-dim)" }}
        >
          {ride.distanceToPickupKm} km away
        </span>
        <div className="route-line flex-1" />
        <span
          className="whitespace-nowrap text-xs font-medium"
          style={{ color: "var(--color-ink-dim)" }}
        >
          {ride.distanceToDestinationKm} km to drop
        </span>
      </div>

      {/* Meta row */}
      <div className="flex items-center justify-between">
        <div
          className="flex gap-4 text-sm"
          style={{ color: "var(--color-ink-muted)" }}
        >
          <span className="flex items-center gap-1.5">
            <Clock size={13} /> {ride.time}
          </span>
          <span className="flex items-center gap-1.5">
            <Users size={13} /> {ride.seatsAvailable} left
          </span>
        </div>
        <span className="pill-go">{ride.matchScore}% match</span>
      </div>

      {/* Your fare note — clarifies the price shown above is for the full route */}
      <p className="mt-2 text-xs" style={{ color: "var(--color-ink-dim)" }}>
        You'll pay only for your segment — calculated at checkout based on
        distance.
      </p>

      {/* Error */}
      <AnimatePresence>
        {status === "error" && message && (
          <motion.p
            className="mt-3 flex items-start gap-2 rounded-xl p-3 text-sm"
            style={{
              background: "var(--color-spark-glow)",
              color: "var(--color-signal)",
              border: "1px solid rgba(255,107,53,0.2)",
            }}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
            {message}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Booked confirmation */}
      {status === "booked" ? (
        <motion.div
          className="mt-4 rounded-2xl p-4"
          style={{
            background:
              "color-mix(in srgb, var(--color-go) 6%, var(--color-paper))",
            border:
              "1px solid color-mix(in srgb, var(--color-go) 20%, transparent)",
          }}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <p
            className="font-display font-bold flex items-center gap-1.5"
            style={{ color: "var(--color-go)" }}
          >
            <CheckCircle2 size={15} /> Seat confirmed
          </p>
          <p
            className="mt-0.5 text-sm"
            style={{ color: "var(--color-ink-muted)" }}
          >
            {ride.driverName} · {ride.vehicle}
          </p>
          <div className="route-line my-3" />
          <p
            className="flex items-center gap-1.5 text-sm"
            style={{ color: "var(--color-ink-dim)" }}
          >
            <Clock size={12} /> {ride.time} ·{" "}
            <span className="font-bold" style={{ color: "var(--color-go)" }}>
              ₹{fare ?? "—"}
            </span>{" "}
            for your segment · 1 seat
          </p>
          <Link
            href="/dashboard"
            className="btn-outline mt-3 flex items-center justify-center gap-1.5 w-full py-2.5 text-center text-sm"
          >
            View in dashboard <ArrowRight size={14} />
          </Link>
        </motion.div>
      ) : (
        <button
          onClick={handleBook}
          disabled={status === "booking"}
          className="btn-go mt-4 w-full py-3 text-sm disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {status === "booking" ? (
            <>
              <Loader2 size={15} className="animate-spin" /> Booking...
            </>
          ) : (
            "Book seat"
          )}
        </button>
      )}
    </div>
  );
}
