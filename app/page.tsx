import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import SignOutButton from "@/components/SignOutButton";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <main className="min-h-screen">
      <nav className="mx-auto flex max-w-5xl items-center justify-between p-6">
        <span className="font-display text-xl font-extrabold tracking-tight text-road">
          HopOn
        </span>
        <div className="flex items-center gap-6 text-sm">
          {session?.user ? (
            <>
              <Link href="/dashboard" className="text-ink/70 hover:text-ink">
                Dashboard
              </Link>
              <Link
                href="/publish"
                className="rounded-xl bg-road px-4 py-1.5 font-display font-bold text-paper hover:bg-road-light"
              >
                + Publish ride
              </Link>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="text-ink/70 hover:text-ink">
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-road px-4 py-1.5 text-paper hover:bg-road-light"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>

      <section className="mx-auto max-w-5xl px-6 pt-16 pb-24 text-center">
        <p className="mb-3 font-display text-sm font-semibold uppercase tracking-[0.2em] text-signal-dark">
          Same road, split the cost
        </p>
        <h1 className="font-display text-5xl font-extrabold leading-tight text-ink sm:text-6xl">
          Someone&apos;s already
          <br />
          going your way.
        </h1>
        <p className="mx-auto mt-5 max-w-md text-lg text-ink/70">
          HopOn matches your route with drivers already headed there — not just
          your city, your actual path.
        </p>

        {/* Signature element: the route-line motif connecting the two CTAs,
            echoing the pickup -> destination line used throughout the app. */}
        <div className="mx-auto mt-10 flex max-w-md items-center gap-4">
          <Link
            href="/search"
            className="flex-1 rounded-xl bg-road py-3 font-display font-bold text-paper hover:bg-road-light"
          >
            Find a ride
          </Link>
          <div className="route-line w-10 flex-shrink-0" />
          <Link
            href="/publish"
            className="flex-1 rounded-xl border-2 border-road py-3 font-display font-bold text-road hover:bg-road hover:text-paper"
          >
            Offer a ride
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-6 pb-24 sm:grid-cols-3">
        {[
          {
            label: "01",
            title: "Real route matching",
            body: "We check your whole path, not just your city — so matches actually make sense.",
          },
          {
            label: "02",
            title: "See the match, not a guess",
            body: "Every ride shows exactly how close the pickup and drop are to your route.",
          },
          {
            label: "03",
            title: "Split it fairly",
            body: "Priced per kilometre, so you only pay for the distance you actually share.",
          },
        ].map((f) => (
          <div
            key={f.label}
            className="rounded-xl border border-lane-light bg-white/60 p-5"
          >
            <span className="font-display text-xs font-bold text-lane">
              {f.label}
            </span>
            <h3 className="mt-2 font-display text-lg font-bold text-ink">
              {f.title}
            </h3>
            <p className="mt-1 text-sm text-ink/70">{f.body}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
