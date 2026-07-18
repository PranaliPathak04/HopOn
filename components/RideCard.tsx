"use client";

import { useState } from "react";
import Link from "next/link";
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
      setStatus("booked");
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  }

  return (
    <div
      className="card p-5 transition-all hover:shadow-lg"
      style={{
        background: "#141414",
        ["--tw-shadow" as string]: "0 0 30px rgba(0,230,118,0.05)",
      }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between">
        <div>
          <p className="font-display font-bold text-white">{ride.driverName}</p>
          <p className="text-sm" style={{ color: "#555" }}>
            {ride.vehicle}
          </p>
        </div>
        <div className="text-right">
          <p
            className="font-display text-2xl font-extrabold"
            style={{ color: "#00e676" }}
          >
            ₹{ride.price}
          </p>
          <p className="text-xs" style={{ color: "#555" }}>
            per seat
          </p>
        </div>
      </div>

      {/* Route proximity */}
      <div className="my-4 flex items-center gap-3">
        <span
          className="whitespace-nowrap text-xs font-medium"
          style={{ color: "#555" }}
        >
          {ride.distanceToPickupKm} km away
        </span>
        <div className="route-line flex-1" />
        <span
          className="whitespace-nowrap text-xs font-medium"
          style={{ color: "#555" }}
        >
          {ride.distanceToDestinationKm} km to drop
        </span>
      </div>

      {/* Meta row */}
      <div className="flex items-center justify-between">
        <div className="flex gap-4 text-sm" style={{ color: "#a0a0a0" }}>
          <span>🕒 {ride.time}</span>
          <span>💺 {ride.seatsAvailable} left</span>
        </div>
        <span className="pill-go">{ride.matchScore}% match</span>
      </div>

      {/* Error */}
      {status === "error" && message && (
        <p
          className="mt-3 rounded-xl p-3 text-sm"
          style={{
            background: "rgba(255,107,53,0.1)",
            color: "#ff6b35",
            border: "1px solid rgba(255,107,53,0.2)",
          }}
        >
          {message}
        </p>
      )}

      {/* Booked confirmation */}
      {status === "booked" ? (
        <div
          className="mt-4 rounded-2xl p-4"
          style={{
            background: "#0a1f12",
            border: "1px solid rgba(0,230,118,0.2)",
          }}
        >
          <p className="font-display font-bold" style={{ color: "#00e676" }}>
            Seat confirmed ✓
          </p>
          <p className="mt-0.5 text-sm" style={{ color: "#a0a0a0" }}>
            {ride.driverName} · {ride.vehicle}
          </p>
          <div className="route-line my-3" />
          <p className="text-sm" style={{ color: "#555" }}>
            🕒 {ride.time} · ₹{ride.price} · 1 seat
          </p>
          <Link
            href="/dashboard"
            className="btn-outline mt-3 block w-full py-2.5 text-center text-sm"
          >
            View in dashboard →
          </Link>
        </div>
      ) : (
        <button
          onClick={handleBook}
          disabled={status === "booking"}
          className="btn-go mt-4 w-full py-3 text-sm disabled:opacity-50"
        >
          {status === "booking" ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
              Booking...
            </span>
          ) : (
            "Book seat"
          )}
        </button>
      )}
    </div>
  );
}
