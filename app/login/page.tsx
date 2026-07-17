"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await signIn("credentials", {
      redirect: false,
      email: form.email,
      password: form.password,
    });

    setLoading(false);

    if (res?.error) {
      setError("Invalid email or password");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-2xl border border-lane-light bg-white p-7"
      >
        <Link href="/" className="font-display text-sm font-bold text-road">
          ← HopOn
        </Link>
        <h1 className="font-display text-2xl font-extrabold text-ink">
          Log in
        </h1>

        {error && (
          <p className="rounded-lg bg-red-50 p-2.5 text-sm text-red-700">
            {error}
          </p>
        )}

        <input
          className="w-full rounded-lg border border-lane-light p-2.5"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          className="w-full rounded-lg border border-lane-light p-2.5"
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-road py-2.5 font-display font-bold text-paper hover:bg-road-light disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Log in"}
        </button>

        <p className="text-center text-sm text-ink/60">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-semibold text-road underline">
            Sign up
          </Link>
        </p>
      </form>
    </main>
  );
}
