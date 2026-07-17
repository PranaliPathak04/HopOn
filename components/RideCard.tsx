"use client";

import { useState } from "react";
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
      setMessage("Something went wrong booking this ride.");
    }
  }

  return (
    <div className="rounded-2xl border border-lane-light bg-white p-5 shadow-[0_2px_12px_rgba(27,26,24,0.06)]">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-display font-bold text-ink">{ride.driverName}</p>
          <p className="text-sm text-ink/60">{ride.vehicle}</p>
        </div>
        <div className="text-right">
          <p className="font-display text-2xl font-extrabold text-road">
            ₹{ride.price}
          </p>
          <p className="text-xs text-ink/50">per seat</p>
        </div>
      </div>

      <div className="my-4 flex items-center gap-3">
        <span className="whitespace-nowrap text-xs font-medium text-lane">
          {ride.distanceToPickupKm} km away
        </span>
        <div className="route-line flex-1" />
        <span className="whitespace-nowrap text-xs font-medium text-lane">
          {ride.distanceToDestinationKm} km to drop
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-3 text-sm text-ink/70">
          <span>🕒 {ride.time}</span>
          <span>
            💺 {ride.seatsAvailable} seat{ride.seatsAvailable !== 1 ? "s" : ""}{" "}
            left
          </span>
        </div>
        <span className="rounded-full bg-signal/15 px-2.5 py-1 text-xs font-bold text-signal-dark">
          {ride.matchScore}% match
        </span>
      </div>

      {message && (
        <p
          className={`mt-3 rounded-lg p-2 text-sm ${
            status === "error"
              ? "bg-red-50 text-red-700"
              : "bg-green-50 text-green-700"
          }`}
        >
          {message}
        </p>
      )}

      <button
        onClick={handleBook}
        disabled={status === "booking" || status === "booked"}
        className="mt-4 w-full rounded-xl bg-road py-2.5 font-display font-bold text-paper hover:bg-road-light disabled:opacity-50"
      >
        {status === "booking" && "Booking..."}
        {status === "booked" && "Booked ✓"}
        {(status === "idle" || status === "error") && "Book seat"}
      </button>
    </div>
  );
}
