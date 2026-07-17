"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.message);
        return;
      }

      router.push("/login");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
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
          Create your account
        </h1>

        {error && (
          <p className="rounded-lg bg-red-50 p-2.5 text-sm text-red-700">
            {error}
          </p>
        )}

        <input
          className="w-full rounded-lg border border-lane-light p-2.5"
          placeholder="Full name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
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
          placeholder="Phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          required
        />
        <input
          className="w-full rounded-lg border border-lane-light p-2.5"
          placeholder="Password (min 8 characters)"
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
          {loading ? "Creating account..." : "Sign up"}
        </button>

        <p className="text-center text-sm text-ink/60">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-road underline">
            Log in
          </Link>
        </p>
      </form>
    </main>
  );
}
