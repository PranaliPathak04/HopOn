import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import SignOutButton from "@/components/SignOutButton";
import {
  MapPin,
  Navigation,
  Ruler,
  Armchair,
  Zap,
  IndianRupee,
  CheckCircle2,
  Clock,
  Target,
} from "lucide-react";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <main
      className="min-h-screen overflow-x-hidden"
      style={{ background: "var(--color-paper)", color: "var(--color-ink)" }}
    >
      {/* ── NAV ── */}
      <nav
        style={{
          borderBottom: "1px solid var(--color-border)",
          background: "rgba(15,15,15,0.85)",
          backdropFilter: "blur(12px)",
        }}
        className="sticky top-0 z-50"
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2">
            <img src="/hopon-car.svg" alt="" width={36} height={32} />
            <span className="font-display text-2xl font-extrabold tracking-tight">
              Hop<span style={{ color: "var(--color-go)" }}>On</span>
            </span>
          </div>

          {/* Desktop */}
          <div className="hidden items-center gap-6 text-sm sm:flex">
            {session?.user ? (
              <>
                <Link
                  href="/profile"
                  style={{ color: "var(--color-ink-muted)" }}
                  className="nav-link transition-colors"
                >
                  Profile
                </Link>
                <Link
                  href="/search"
                  style={{ color: "var(--color-ink-muted)" }}
                  className="hover:text-white transition-colors"
                >
                  Find a ride
                </Link>
                <Link
                  href="/dashboard"
                  style={{ color: "var(--color-ink-muted)" }}
                  className="hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
                <Link href="/publish" className="btn-go px-5 py-2 text-sm">
                  + Offer a ride
                </Link>
                <SignOutButton />
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  style={{ color: "var(--color-ink-muted)" }}
                  className="hover:text-white transition-colors"
                >
                  Log in
                </Link>
                <Link href="/signup" className="btn-go px-5 py-2 text-sm">
                  Get started →
                </Link>
              </>
            )}
          </div>

          {/* Mobile */}
          <div className="flex items-center gap-3 sm:hidden">
            {session?.user ? (
              <Link href="/dashboard" className="btn-go px-4 py-1.5 text-xs">
                Dashboard
              </Link>
            ) : (
              <Link href="/signup" className="btn-go px-4 py-1.5 text-xs">
                Get started
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="mx-auto max-w-6xl px-5 pt-20 pb-10 sm:pt-32 sm:pb-16">
        {/* Live badge */}

        {/* Big headline */}
        <h1
          className="text-center font-display font-extrabold leading-none tracking-tight"
          style={{ fontSize: "clamp(48px, 10vw, 96px)", lineHeight: 1.0 }}
        >
          <span style={{ color: "var(--color-ink)" }}>Share the</span>
          <br />
          <span style={{ color: "var(--color-go)" }}>road.</span>
        </h1>

        <p
          className="mx-auto mt-6 max-w-lg text-center text-lg leading-relaxed"
          style={{ color: "var(--color-ink-muted)" }}
        >
          HopOn matches your exact route with drivers already headed there — not
          just your city, your actual path. Split the cost, not your plans.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/search"
            className="btn-go w-full px-10 py-4 text-center text-base sm:w-auto"
          >
            Find a ride →
          </Link>
          <Link
            href="/publish"
            className="btn-outline w-full px-10 py-4 text-center text-base sm:w-auto"
          >
            Offer a ride
          </Link>
        </div>

        {/* Trust row */}
        <div
          className="mt-8 flex flex-wrap justify-center gap-5"
          style={{ color: "var(--color-ink-dim)" }}
        >
          {[
            "Route-level matching",
            "Per-km fair pricing",
            "Instant booking",
            "No commission",
          ].map((t) => (
            <span key={t} className="flex items-center gap-2 text-xs">
              <CheckCircle2 size={13} style={{ color: "var(--color-go)" }} />
              {t}
            </span>
          ))}
        </div>
      </section>

      {/* ── ANIMATED ROAD ── */}
      <section className="mx-auto max-w-4xl px-5 py-6">
        <div
          className="card relative overflow-hidden px-8 py-10"
          style={{ background: "var(--color-surface)" }}
        >
          {/* Glow behind */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 200,
              height: 200,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, var(--color-go-glow) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          <div
            className="mb-5 flex items-center justify-between text-xs font-bold uppercase tracking-widest"
            style={{ color: "var(--color-ink-dim)" }}
          >
            <span className="flex items-center gap-1.5">
              <MapPin size={12} style={{ color: "var(--color-go)" }} /> Pickup
            </span>
            <span className="flex items-center gap-1.5">
              Drop{" "}
              <Navigation size={12} style={{ color: "var(--color-signal)" }} />
            </span>
          </div>

          {/* Road */}
          <div className="relative" style={{ height: 56 }}>
            {/* Dashed road */}
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 800 56"
              preserveAspectRatio="none"
            >
              <line
                x1="0"
                y1="28"
                x2="800"
                y2="28"
                stroke="var(--color-border)"
                strokeWidth="2"
                strokeDasharray="18 10"
              />
            </svg>

            {/* A dot */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                transform: "translateY(-50%)",
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: "var(--color-paper)",
                border: "2px solid var(--color-go)",
                boxShadow: "0 0 20px var(--color-go-glow)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: 14,
                color: "var(--color-go)",
                animation: "slideRight 2.5s ease-in-out infinite alternate",
              }}
            >
              A
            </div>

            {/* B dot */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                transform: "translateY(-50%)",
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: "var(--color-paper)",
                border: "2px solid var(--color-signal)",
                boxShadow: "0 0 20px var(--color-spark-glow)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: 14,
                color: "var(--color-signal)",
                animation: "slideLeft 2.5s ease-in-out infinite alternate",
              }}
            >
              B
            </div>

            {/* Meet glow */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "var(--color-go-glow)",
                animation: "meetPulse 2.5s ease-in-out infinite",
              }}
            />
          </div>

          {/* Chips */}
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            {[
              { icon: <Ruler size={13} />, label: "12.9 km shared" },
              { icon: <Armchair size={13} />, label: "2 seats left" },
              { icon: <Zap size={13} />, label: "Instant confirm" },
              { icon: <IndianRupee size={13} />, label: "Fair per-km price" },
            ].map((c) => (
              <span
                key={c.label}
                className="flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium"
                style={{
                  background: "var(--color-surface-2)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-ink-muted)",
                }}
              >
                {c.icon} {c.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:py-28">
        <div className="mb-14 text-center">
          <span className="pill-go text-xs">How it works</span>
          <h2 className="mt-4 font-display text-3xl font-extrabold sm:text-5xl">
            Ride in 3 steps
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {[
            {
              step: "01",
              icon: <MapPin size={22} style={{ color: "var(--color-go)" }} />,
              title: "Set your route",
              body: "Drop your pickup and destination. We match against real driver paths — not just city names.",
              preview: (
                <div
                  className="mt-4 rounded-2xl p-4 text-xs"
                  style={{
                    background: "var(--color-paper)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <div
                    className="flex items-center gap-2 mb-2"
                    style={{ color: "var(--color-ink-muted)" }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "var(--color-go)",
                        display: "inline-block",
                        boxShadow: "0 0 6px var(--color-go)",
                        flexShrink: 0,
                      }}
                    />
                    Andheri West
                  </div>
                  <div
                    style={{
                      width: 1,
                      height: 16,
                      background: "var(--color-border)",
                      marginLeft: 3,
                      marginBottom: 2,
                    }}
                  />
                  <div
                    className="flex items-center gap-2"
                    style={{ color: "var(--color-ink-muted)" }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "var(--color-signal)",
                        display: "inline-block",
                        boxShadow: "0 0 6px var(--color-signal)",
                        flexShrink: 0,
                      }}
                    />
                    Powai
                  </div>
                </div>
              ),
            },
            {
              step: "02",
              icon: <Target size={22} style={{ color: "var(--color-go)" }} />,
              title: "See real matches",
              body: "Every result shows pickup proximity and drop distance — no guessing if it's actually on your route.",
              preview: (
                <div
                  className="mt-4 rounded-2xl p-4 text-xs"
                  style={{
                    background: "var(--color-paper)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p
                        className="font-bold"
                        style={{ color: "var(--color-ink)" }}
                      >
                        Rahul M.
                      </p>
                      <p style={{ color: "var(--color-ink-dim)" }}>
                        Swift Dzire · White
                      </p>
                    </div>
                    <p
                      className="font-display font-extrabold text-base"
                      style={{ color: "var(--color-go)" }}
                    >
                      ₹240
                    </p>
                  </div>
                  <div className="route-line my-2" />
                  <div className="flex items-center justify-between mt-2">
                    <span style={{ color: "var(--color-ink-dim)" }}>
                      0.3 km away
                    </span>
                    <span className="pill-go">94% match</span>
                  </div>
                </div>
              ),
            },
            {
              step: "03",
              icon: <Zap size={22} style={{ color: "var(--color-go)" }} />,
              title: "Book instantly",
              body: "One tap. Your seat is reserved atomically — no double-booking, no waiting for driver approval.",
              preview: (
                <div
                  className="mt-4 rounded-2xl p-4 text-xs"
                  style={{
                    background:
                      "color-mix(in srgb, var(--color-go) 6%, var(--color-paper))",
                    border:
                      "1px solid color-mix(in srgb, var(--color-go) 20%, transparent)",
                  }}
                >
                  <p
                    className="font-bold mb-1 flex items-center gap-1.5"
                    style={{ color: "var(--color-go)" }}
                  >
                    <CheckCircle2 size={13} /> Seat confirmed
                  </p>
                  <p style={{ color: "var(--color-ink-muted)" }}>
                    Rahul M. · Swift Dzire
                  </p>
                  <div className="route-line my-2" />
                  <p
                    className="flex items-center gap-1.5"
                    style={{ color: "var(--color-ink-dim)" }}
                  >
                    <Clock size={11} /> 08:30 · ₹240 · 1 seat
                  </p>
                </div>
              ),
            },
          ].map(({ step, icon, title, body, preview }) => (
            <div key={step} className="card p-6 transition-all hover:shadow-lg">
              <div className="flex items-start justify-between mb-4">
                <span className="text-2xl">{icon}</span>
                <span
                  className="font-display text-xs font-bold"
                  style={{ color: "var(--color-lane-light)" }}
                >
                  {step}
                </span>
              </div>
              <h3
                className="font-display text-lg font-extrabold"
                style={{ color: "var(--color-ink)" }}
              >
                {title}
              </h3>
              <p
                className="mt-2 text-sm leading-relaxed"
                style={{ color: "var(--color-ink-muted)" }}
              >
                {body}
              </p>
              {preview}
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "1px solid var(--color-border)" }}>
        <div
          className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-5 py-10 text-s sm:flex-row"
          style={{ color: "var(--color-go)" }}
        >
          <Link href="/" className="flex items-center gap-2">
            <img src="/hopon-car.svg" alt="" width={28} height={25} />
            <span
              className="font-display text-lg font-extrabold"
              style={{ color: "var(--color-ink)" }}
            >
              Hop<span style={{ color: "var(--color-go)" }}>On</span>
            </span>
          </Link>
          <span style={{ color: "var(--color-ink-muted)" }}>
            Share the road. Split the cost.
          </span>
          <div className="flex gap-6">
            <Link href="/search" className="hover:text-white transition-colors">
              Find a ride
            </Link>
            <Link
              href="/publish"
              className="hover:text-white transition-colors"
            >
              Offer a ride
            </Link>
            <Link href="/login" className="hover:text-white transition-colors">
              Log in
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
