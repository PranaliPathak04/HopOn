"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Car,
  MapPin,
  Clock,
  Calendar,
  Users,
  IndianRupee,
  Search,
  Plus,
  LogOut,
  X,
  Route,
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BookingWithRide {
  _id: string;
  rideId: string;
  seatsBooked: number;
  segmentDistanceKm: number;
  fare: number;
  status: "confirmed" | "cancelled" | "completed";
  paymentStatus: "pending" | "paid" | "refunded";
  createdAt: string;
  ride: {
    driverName: string;
    driverPhone: string;
    vehicle: string;
    date: string;
    time: string;
    price: number;
    status: string;
  } | null;
}

interface DriverRide {
  _id: string;
  vehicle: string;
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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Status colors now follow a clear rule:
// teal (--color-tide)  = confirmed / active / paid — "this is good, it's happening"
// red  (--color-spark) = cancelled / full — "this needs attention, negative"
// gold (--color-go)    = pending — "action needed from you"
// muted gray           = neutral/past states (completed, refunded)
function StatusPill({ status }: { status: string }) {
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

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard() {
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

function EmptyState({
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

// ─── Bookings Tab ─────────────────────────────────────────────────────────────

function BookingsTab() {
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
        <motion.div
          key={b._id}
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
            <div className="min-w-0">
              <p
                className="font-display font-bold"
                style={{ color: "var(--color-ink)" }}
              >
                {b.ride?.driverName ?? "Unknown driver"}
              </p>
              <p
                className="flex items-center gap-1.5 text-sm mt-0.5"
                style={{ color: "var(--color-ink-muted)" }}
              >
                <Car size={12} />
                {b.ride?.vehicle ?? "—"}
              </p>
            </div>
            <StatusPill status={b.status} />
          </div>

          <div className="my-4 route-line" />

          <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            {[
              {
                icon: <Calendar size={12} />,
                label: "Date",
                value: b.ride?.date ? formatDate(b.ride.date) : "—",
              },
              {
                icon: <Clock size={12} />,
                label: "Time",
                value: b.ride?.time ?? "—",
              },
              {
                icon: <Users size={12} />,
                label: "Seats",
                value: b.seatsBooked,
              },
              {
                icon: <IndianRupee size={12} />,
                label: "Fare",
                value: `₹${b.fare}`,
                accent: true,
              },
            ].map(({ icon, label, value, accent }) => (
              <div key={label}>
                <p
                  className="flex items-center gap-1 text-xs mb-0.5"
                  style={{ color: "var(--color-ink-dim)" }}
                >
                  {icon} {label}
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

          <div
            className="mt-4 flex items-center justify-between gap-3 pt-4"
            style={{ borderTop: "1px solid var(--color-border)" }}
          >
            <p
              className="flex items-center gap-1.5 text-xs"
              style={{ color: "var(--color-ink-dim)" }}
            >
              <Route size={11} />
              {b.segmentDistanceKm.toFixed(1)} km · Booked{" "}
              {formatDate(b.createdAt)}
            </p>
            {b.status === "confirmed" && (
              <button
                onClick={() => handleCancel(b._id)}
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
      ))}
    </div>
  );
}

// ─── My Rides Tab ─────────────────────────────────────────────────────────────

function MyRidesTab() {
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
      {/* Summary strip — each stat gets its own color so they're easy to tell apart at a glance */}
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
            <StatusPill status={r.status} />
          </div>

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

          {/* Seat fill bar — teal, since this shows live status, not an action to take */}
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
        </motion.div>
      ))}
    </div>
  );
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────

type Tab = "bookings" | "rides";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("bookings");

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  if (status === "loading" || !session) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: "var(--color-paper)" }}
      >
        <div
          className="h-6 w-6 animate-spin rounded-full border-2 border-t-transparent"
          style={{
            borderColor: "var(--color-go)",
            borderTopColor: "transparent",
          }}
        />
      </div>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "bookings", label: "My bookings" },
    { id: "rides", label: "My rides" },
  ];

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
          <Link href="/" className="flex items-center gap-2">
            <img src="/hopon-car.svg" alt="" width={36} height={32} />
            <span className="font-display text-xl font-extrabold tracking-tight">
              Hop<span style={{ color: "var(--color-go)" }}>On</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/profile"
              style={{ color: "var(--color-ink-muted)" }}
              className="nav-link px-1 py-2"
            >
              Profile
            </Link>
            <Link
              href="/search"
              className="nav-link hidden sm:flex items-center gap-1.5 px-1 py-2 "
              style={{ color: "var(--color-ink-muted)" }}
            >
              <Search size={14} /> Find a ride
            </Link>
            <Link
              href="/publish"
              className="btn-outline-tide flex items-center gap-1.5 px-4 py-1.5 text-sm "
            >
              <Plus size={14} /> Publish ride
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-1.5 text-sm transition-colors hover:text-white"
              style={{ color: "var(--color-ink-muted)" }}
            >
              <LogOut size={14} />
              <span className="hidden sm:block">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-5 py-10">
        {/* Greeting */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <h1 className="font-display text-4xl font-extrabold">
            Hey, {session.user?.name?.split(" ")[0]} 👋
          </h1>
          <p
            className="mt-1 text-sm"
            style={{ color: "var(--color-ink-muted)" }}
          >
            {session.user?.email}
          </p>
        </motion.div>

        {/* Tab switcher */}
        <motion.div
          className="mb-6 flex gap-1 rounded-xl p-1"
          style={{ background: "var(--color-surface)" }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.08 }}
        >
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="relative flex-1 rounded-lg py-2.5 text-sm font-semibold transition-colors"
              style={{
                color:
                  tab === t.id ? "var(--color-ink)" : "var(--color-ink-dim)",
                background:
                  tab === t.id ? "var(--color-surface-2)" : "transparent",
              }}
            >
              {t.label}
              {tab === t.id && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-1 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full"
                  style={{ background: "var(--color-go)" }}
                />
              )}
            </button>
          ))}
        </motion.div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            {tab === "bookings" ? <BookingsTab /> : <MyRidesTab />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
