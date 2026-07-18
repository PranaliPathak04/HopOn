import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import SignOutButton from "@/components/SignOutButton";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <main
      className="min-h-screen overflow-x-hidden"
      style={{ background: "#0f0f0f", color: "#fff" }}
    >
      {/* ── NAV ── */}
      <nav
        style={{
          borderBottom: "1px solid #1f1f1f",
          background: "rgba(15,15,15,0.85)",
          backdropFilter: "blur(12px)",
        }}
        className="sticky top-0 z-50"
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <span className="font-display text-2xl font-extrabold tracking-tight">
            Hop<span style={{ color: "#00e676" }}>On</span>
          </span>

          {/* Desktop */}
          <div className="hidden items-center gap-6 text-sm sm:flex">
            {session?.user ? (
              <>
                <Link
                  href="/search"
                  style={{ color: "#a0a0a0" }}
                  className="hover:text-white transition-colors"
                >
                  Find a ride
                </Link>
                <Link
                  href="/dashboard"
                  style={{ color: "#a0a0a0" }}
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
                  style={{ color: "#a0a0a0" }}
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
        <div className="flex justify-center mb-8">
          <span className="pill-go flex items-center gap-2 text-xs px-4 py-2">
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#00e676",
                display: "inline-block",
                boxShadow: "0 0 8px #00e676",
                animation: "meetPulse 2s ease-in-out infinite",
              }}
            />
            Rides live on your route right now
          </span>
        </div>

        {/* Big headline */}
        <h1
          className="text-center font-display font-extrabold leading-none tracking-tight"
          style={{ fontSize: "clamp(48px, 10vw, 96px)", lineHeight: 1.0 }}
        >
          <span style={{ color: "#fff" }}>Share the</span>
          <br />
          <span
            style={{
              background:
                "linear-gradient(90deg, #00e676 0%, #69f0ae 50%, #00e676 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            road.
          </span>
        </h1>

        <p
          className="mx-auto mt-6 max-w-lg text-center text-lg leading-relaxed"
          style={{ color: "#a0a0a0" }}
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
          style={{ color: "#555" }}
        >
          {[
            "Route-level matching",
            "Per-km fair pricing",
            "Instant booking",
            "No commission",
          ].map((t) => (
            <span key={t} className="flex items-center gap-2 text-xs">
              <span style={{ color: "#00e676" }}>✓</span> {t}
            </span>
          ))}
        </div>
      </section>

      {/* ── ANIMATED ROAD ── */}
      <section className="mx-auto max-w-4xl px-5 py-6">
        <div
          className="card relative overflow-hidden px-8 py-10"
          style={{ background: "#141414" }}
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
                "radial-gradient(circle, rgba(0,230,118,0.08) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          <div
            className="mb-5 flex items-center justify-between text-xs font-bold uppercase tracking-widest"
            style={{ color: "#555" }}
          >
            <span>📍 Pickup</span>
            <span>Drop 📍</span>
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
                stroke="#2a2a2a"
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
                background: "#0f0f0f",
                border: "2px solid #00e676",
                boxShadow: "0 0 20px rgba(0,230,118,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: 14,
                color: "#00e676",
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
                background: "#0f0f0f",
                border: "2px solid #ff6b35",
                boxShadow: "0 0 20px rgba(255,107,53,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: 14,
                color: "#ff6b35",
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
                background: "rgba(0,230,118,0.25)",
                animation: "meetPulse 2.5s ease-in-out infinite",
              }}
            />
          </div>

          {/* Chips */}
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            {[
              { icon: "📏", label: "12.9 km shared" },
              { icon: "💺", label: "2 seats left" },
              { icon: "⚡", label: "Instant confirm" },
              { icon: "₹", label: "Fair per-km price" },
            ].map((c) => (
              <span
                key={c.label}
                className="flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium"
                style={{
                  background: "#1f1f1f",
                  border: "1px solid #2a2a2a",
                  color: "#a0a0a0",
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
              icon: "📍",
              title: "Set your route",
              body: "Drop your pickup and destination. We match against real driver paths — not just city names.",
              preview: (
                <div
                  className="mt-4 rounded-2xl p-4 text-xs"
                  style={{ background: "#111", border: "1px solid #222" }}
                >
                  <div
                    className="flex items-center gap-2 mb-2"
                    style={{ color: "#a0a0a0" }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "#00e676",
                        display: "inline-block",
                        boxShadow: "0 0 6px #00e676",
                        flexShrink: 0,
                      }}
                    />
                    Andheri West
                  </div>
                  <div
                    style={{
                      width: 1,
                      height: 16,
                      background: "#2a2a2a",
                      marginLeft: 3,
                      marginBottom: 2,
                    }}
                  />
                  <div
                    className="flex items-center gap-2"
                    style={{ color: "#a0a0a0" }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "#ff6b35",
                        display: "inline-block",
                        boxShadow: "0 0 6px #ff6b35",
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
              icon: "🎯",
              title: "See real matches",
              body: "Every result shows pickup proximity and drop distance — no guessing if it's actually on your route.",
              preview: (
                <div
                  className="mt-4 rounded-2xl p-4 text-xs"
                  style={{ background: "#111", border: "1px solid #222" }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-bold text-white">Rahul M.</p>
                      <p style={{ color: "#555" }}>Swift Dzire · White</p>
                    </div>
                    <p
                      className="font-display font-extrabold text-base"
                      style={{ color: "#00e676" }}
                    >
                      ₹240
                    </p>
                  </div>
                  <div className="route-line my-2" />
                  <div className="flex items-center justify-between mt-2">
                    <span style={{ color: "#555" }}>0.3 km away</span>
                    <span className="pill-go">94% match</span>
                  </div>
                </div>
              ),
            },
            {
              step: "03",
              icon: "⚡",
              title: "Book instantly",
              body: "One tap. Your seat is reserved atomically — no double-booking, no waiting for driver approval.",
              preview: (
                <div
                  className="mt-4 rounded-2xl p-4 text-xs"
                  style={{
                    background: "#0a1f12",
                    border: "1px solid rgba(0,230,118,0.2)",
                  }}
                >
                  <p className="font-bold mb-1" style={{ color: "#00e676" }}>
                    Seat confirmed ✓
                  </p>
                  <p style={{ color: "#a0a0a0" }}>Rahul M. · Swift Dzire</p>
                  <div className="route-line my-2" />
                  <p style={{ color: "#555" }}>🕒 08:30 · ₹240 · 1 seat</p>
                </div>
              ),
            },
          ].map(({ step, icon, title, body, preview }) => (
            <div
              key={step}
              className="card p-6 transition-all hover:shadow-lg"
              style={{
                ["--tw-shadow" as string]: "0 0 30px rgba(0,230,118,0.05)",
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-2xl">{icon}</span>
                <span
                  className="font-display text-xs font-bold"
                  style={{ color: "#2a2a2a" }}
                >
                  {step}
                </span>
              </div>
              <h3 className="font-display text-lg font-extrabold text-white">
                {title}
              </h3>
              <p
                className="mt-2 text-sm leading-relaxed"
                style={{ color: "#a0a0a0" }}
              >
                {body}
              </p>
              {preview}
            </div>
          ))}
        </div>
      </section>

      {/* ── STATS ── */}
      <section
        style={{
          borderTop: "1px solid #1f1f1f",
          borderBottom: "1px solid #1f1f1f",
          background: "#111",
        }}
      >
        <div className="mx-auto max-w-6xl px-5 py-12">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {[
              { value: "Route-level", label: "Matching" },
              { value: "₹8/km", label: "Starting price" },
              { value: "1-tap", label: "Booking" },
              { value: "0%", label: "Commission" },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <p
                  className="font-display text-2xl font-extrabold sm:text-3xl"
                  style={{ color: "#00e676" }}
                >
                  {value}
                </p>
                <p className="mt-1 text-xs" style={{ color: "#555" }}>
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="mx-auto max-w-3xl px-5 py-24 text-center sm:py-32">
        <h2
          className="font-display text-4xl font-extrabold sm:text-6xl"
          style={{ lineHeight: 1.1 }}
        >
          Your ride is
          <br />
          <span
            style={{
              background: "linear-gradient(90deg, #00e676, #69f0ae)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            already out there.
          </span>
        </h2>
        <p className="mt-5 text-lg" style={{ color: "#a0a0a0" }}>
          Someone's driving your route today. Match in seconds.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/search"
            className="btn-go w-full px-12 py-4 text-center text-base sm:w-auto"
          >
            Find my ride →
          </Link>
          <Link
            href="/signup"
            className="btn-outline w-full px-12 py-4 text-center text-base sm:w-auto"
          >
            Create account
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "1px solid #1f1f1f" }}>
        <div
          className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-5 py-10 text-xs sm:flex-row"
          style={{ color: "#555" }}
        >
          <span className="font-display text-lg font-extrabold text-white">
            Hop<span style={{ color: "#00e676" }}>On</span>
          </span>
          <span>Share the road. Split the cost.</span>
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
