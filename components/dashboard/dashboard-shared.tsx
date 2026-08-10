"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, AlertCircle, Users } from "lucide-react";

// ─── Shared Types ─────────────────────────────────────────────────────────────

export interface BookingWithRide {
  _id: string;
  rideId: string;
  seatsBooked: number;
  segmentDistanceKm: number;
  fare: number;
  pickupLabel?: string | null;
  dropLabel?: string | null;
  otp: string;
  otpVerified: boolean;
  status: "confirmed" | "cancelled" | "completed";
  paymentStatus: "pending" | "paid" | "refunded";
  createdAt: string;
  ride: {
    driverName: string;
    driverPhone: string;
    driverPhoto?: string | null;
    vehicle: string;
    vehicleNumber: string | null;
    date: string;
    time: string;
    price: number;
    status: string;
  } | null;
}

export interface DriverRide {
  _id: string;
  vehicle: string;
  pickupLabel?: string | null;
  destLabel?: string | null;
  seats: number;
  seatsAvailable: number;
  date: string;
  time: string;
  price: number;
  status: "active" | "full" | "completed" | "cancelled";
  bookingCount: number;
  totalSeatsBooked: number;
  totalRevenue: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ─── Status Pill ──────────────────────────────────────────────────────────────

export function StatusPill({ status }: { status: string }) {
  const map: Record<
    string,
    {
      label: string;
      icon: React.ReactNode;
      bg: string;
      color: string;
      border: string;
    }
  > = {
    confirmed: {
      label: "Confirmed",
      icon: <CheckCircle2 size={11} />,
      bg: "rgba(20,184,166,0.1)",
      color: "var(--color-tide)",
      border: "rgba(20,184,166,0.2)",
    },
    completed: {
      label: "Completed",
      icon: <CheckCircle2 size={11} />,
      bg: "var(--color-surface-2)",
      color: "var(--color-ink-muted)",
      border: "var(--color-border)",
    },
    cancelled: {
      label: "Cancelled",
      icon: <XCircle size={11} />,
      bg: "rgba(244,63,94,0.1)",
      color: "var(--color-spark)",
      border: "rgba(244,63,94,0.2)",
    },
    active: {
      label: "Active",
      icon: <CheckCircle2 size={11} />,
      bg: "rgba(20,184,166,0.1)",
      color: "var(--color-tide)",
      border: "rgba(20,184,166,0.2)",
    },
    full: {
      label: "Full",
      icon: <Users size={11} />,
      bg: "rgba(244,63,94,0.1)",
      color: "var(--color-spark)",
      border: "rgba(244,63,94,0.2)",
    },
    pending: {
      label: "Pending",
      icon: <AlertCircle size={11} />,
      bg: "rgba(251,191,36,0.08)",
      color: "var(--color-go)",
      border: "rgba(251,191,36,0.15)",
    },
    paid: {
      label: "Paid",
      icon: <CheckCircle2 size={11} />,
      bg: "rgba(20,184,166,0.1)",
      color: "var(--color-tide)",
      border: "rgba(20,184,166,0.2)",
    },
    refunded: {
      label: "Refunded",
      icon: <AlertCircle size={11} />,
      bg: "var(--color-surface-2)",
      color: "var(--color-ink-muted)",
      border: "var(--color-border)",
    },
  };
  const s = map[status] ?? map.completed;
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold"
      style={{
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
      }}
    >
      {s.icon}
      {s.label}
    </span>
  );
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────

export function SkeletonCard() {
  return (
    <div
      className="animate-pulse rounded-2xl p-5"
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
      }}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div
            className="h-4 w-32 rounded"
            style={{ background: "var(--color-border)" }}
          />
          <div
            className="h-3 w-20 rounded"
            style={{ background: "var(--color-surface-2)" }}
          />
        </div>
        <div
          className="h-5 w-16 rounded-full"
          style={{ background: "var(--color-border)" }}
        />
      </div>
      <div className="mt-4 space-y-2">
        <div
          className="h-3 w-full rounded"
          style={{ background: "var(--color-surface-2)" }}
        />
        <div
          className="h-3 w-2/3 rounded"
          style={{ background: "var(--color-surface-2)" }}
        />
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

export function EmptyState({
  icon: Icon,
  title,
  body,
  cta,
  href,
}: {
  icon: React.ElementType;
  title: string;
  body: string;
  cta: string;
  href: string;
}) {
  return (
    <motion.div
      className="flex flex-col items-center gap-4 rounded-2xl py-16 text-center"
      style={{ border: "1px dashed var(--color-border)" }}
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className="flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
        }}
      >
        <Icon size={24} style={{ color: "var(--color-ink-dim)" }} />
      </div>
      <div>
        <p
          className="font-display text-lg font-bold"
          style={{ color: "var(--color-ink)" }}
        >
          {title}
        </p>
        <p className="mt-1 text-sm" style={{ color: "var(--color-ink-dim)" }}>
          {body}
        </p>
      </div>
      <Link href={href} className="btn-go px-5 py-2.5 text-sm">
        {cta}
      </Link>
    </motion.div>
  );
}
