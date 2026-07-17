"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

function statusPill(status: string) {
  const map: Record<string, { label: string; cls: string }> = {
    confirmed: { label: "Confirmed", cls: "bg-success/15 text-success" },
    cancelled: { label: "Cancelled", cls: "bg-red-100 text-red-700" },
    completed: { label: "Completed", cls: "bg-lane-light text-lane" },
    active: { label: "Active", cls: "bg-signal/15 text-signal-dark" },
    full: { label: "Full", cls: "bg-road/10 text-road" },
    pending: { label: "Pending", cls: "bg-signal/10 text-signal-dark" },
    paid: { label: "Paid", cls: "bg-success/15 text-success" },
    refunded: { label: "Refunded", cls: "bg-lane-light text-lane" },
  };
  const s = map[status] ?? { label: status, cls: "bg-lane-light text-lane" };
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.cls}`}
    >
      {s.label}
    </span>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function EmptyState({
  icon,
  title,
  body,
  cta,
  href,
}: {
  icon: string;
  title: string;
  body: string;
  cta: string;
  href: string;
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-lane-light py-16 text-center">
      <span className="text-4xl">{icon}</span>
      <div>
        <p className="font-display text-lg font-bold text-ink">{title}</p>
        <p className="mt-1 text-sm text-ink/60">{body}</p>
      </div>
      <Link
        href={href}
        className="rounded-xl bg-road px-5 py-2.5 font-display font-bold text-paper hover:bg-road-light"
      >
        {cta}
      </Link>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-lane-light bg-white p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-4 w-32 rounded bg-lane-light" />
          <div className="h-3 w-20 rounded bg-lane-light/60" />
        </div>
        <div className="h-4 w-16 rounded bg-lane-light" />
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 w-full rounded bg-lane-light/60" />
        <div className="h-3 w-2/3 rounded bg-lane-light/40" />
      </div>
    </div>
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
        icon="🚗"
        title="No bookings yet"
        body="Find a ride that's already going your way."
        cta="Search rides"
        href="/search"
      />
    );

  return (
    <div className="space-y-4">
      {bookings.map((b) => (
        <div
          key={b._id}
          className="rounded-2xl border border-lane-light bg-white p-5 shadow-[0_2px_12px_rgba(27,26,24,0.06)]"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="font-display font-bold text-ink">
                {b.ride?.driverName ?? "Unknown driver"}
              </p>
              <p className="text-sm text-ink/60">{b.ride?.vehicle ?? "—"}</p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1.5">
              {statusPill(b.status)}
              {statusPill(b.paymentStatus)}
            </div>
          </div>

          <div className="my-4 flex items-center gap-3">
            <div className="route-line flex-1" />
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <div>
              <p className="text-xs text-ink/50">Date</p>
              <p className="font-medium text-ink">
                {b.ride?.date ? formatDate(b.ride.date) : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-ink/50">Time</p>
              <p className="font-medium text-ink">{b.ride?.time ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-ink/50">Seats</p>
              <p className="font-medium text-ink">{b.seatsBooked}</p>
            </div>
            <div>
              <p className="text-xs text-ink/50">Fare</p>
              <p className="font-display font-bold text-road">₹{b.fare}</p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 border-t border-lane-light pt-4">
            <p className="text-xs text-ink/40">
              Booked {formatDate(b.createdAt)} ·{" "}
              {b.segmentDistanceKm.toFixed(1)} km
            </p>
            {b.status === "confirmed" && (
              <button
                onClick={() => handleCancel(b._id)}
                disabled={cancelling === b._id}
                className="rounded-xl border border-lane-light px-4 py-1.5 text-sm font-semibold text-ink/70 hover:border-red-300 hover:text-red-600 disabled:opacity-50"
              >
                {cancelling === b._id ? "Cancelling…" : "Cancel"}
              </button>
            )}
          </div>
        </div>
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
        icon="🛣️"
        title="You haven't posted any rides"
        body="If you're driving somewhere, split the cost with a fellow traveller."
        cta="Publish a ride"
        href="/publish"
      />
    );

  const totalRevenue = rides.reduce((sum, r) => sum + r.totalRevenue, 0);
  const activeCount = rides.filter((r) => r.status === "active").length;

  return (
    <div className="space-y-4">
      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total rides", value: rides.length },
          { label: "Active now", value: activeCount },
          { label: "Est. earnings", value: `₹${totalRevenue}` },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="rounded-xl border border-lane-light bg-white p-4 text-center"
          >
            <p className="font-display text-xl font-extrabold text-road">
              {value}
            </p>
            <p className="text-xs text-ink/50">{label}</p>
          </div>
        ))}
      </div>

      {rides.map((r) => (
        <div
          key={r._id}
          className="rounded-2xl border border-lane-light bg-white p-5 shadow-[0_2px_12px_rgba(27,26,24,0.06)]"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-display font-bold text-ink">{r.vehicle}</p>
              <p className="text-sm text-ink/60">
                {formatDate(r.date)} at {r.time}
              </p>
            </div>
            {statusPill(r.status)}
          </div>

          <div className="my-4 flex items-center gap-3">
            <div className="route-line flex-1" />
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <div>
              <p className="text-xs text-ink/50">Total seats</p>
              <p className="font-medium text-ink">{r.seats}</p>
            </div>
            <div>
              <p className="text-xs text-ink/50">Seats left</p>
              <p className="font-medium text-ink">{r.seatsAvailable}</p>
            </div>
            <div>
              <p className="text-xs text-ink/50">Bookings</p>
              <p className="font-medium text-ink">{r.bookingCount}</p>
            </div>
            <div>
              <p className="text-xs text-ink/50">Revenue</p>
              <p className="font-display font-bold text-road">
                ₹{r.totalRevenue}
              </p>
            </div>
          </div>

          {/* Seat fill bar */}
          <div className="mt-4">
            <div className="mb-1 flex justify-between text-xs text-ink/50">
              <span>Seat fill</span>
              <span>
                {r.seats - r.seatsAvailable}/{r.seats} booked
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-lane-light">
              <div
                className="h-full rounded-full bg-road transition-all"
                style={{
                  width: `${((r.seats - r.seatsAvailable) / r.seats) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
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
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-road border-t-transparent" />
      </div>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "bookings", label: "My bookings" },
    { id: "rides", label: "My rides" },
  ];

  return (
    <div className="min-h-screen bg-paper">
      {/* Nav */}
      <header className="border-b border-lane-light bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <Link
            href="/"
            className="font-display text-xl font-extrabold text-road"
          >
            HopOn
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/publish"
              className="rounded-xl border border-lane-light px-4 py-1.5 font-display text-sm font-bold text-road hover:border-road"
            >
              + Publish ride
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-sm text-ink/50 hover:text-ink"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        {/* Greeting */}
        <div className="mb-6">
          <h1 className="font-display text-2xl font-extrabold text-ink">
            Hey, {session.user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-sm text-ink/60">{session.user?.email}</p>
        </div>

        {/* Tab switcher */}
        <div className="mb-6 flex gap-1 rounded-xl bg-lane-light/40 p-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 rounded-lg py-2 font-display text-sm font-bold transition-all ${
                tab === t.id
                  ? "bg-white text-road shadow-sm"
                  : "text-ink/50 hover:text-ink"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === "bookings" ? <BookingsTab /> : <MyRidesTab />}
      </main>
    </div>
  );
}
