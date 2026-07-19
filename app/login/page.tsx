"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";

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
      setError("Invalid email or password.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main
      className="flex min-h-screen items-center justify-center p-6"
      style={{ background: "var(--color-paper)" }}
    >
      <motion.div
        className="w-full max-w-sm"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div
          className="rounded-2xl p-7 space-y-5"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          {/* Back link */}
          <Link
            href="/"
            className="nav-link flex items-center gap-1.5 text-sm font-semibold transition-colors w-fit"
          >
            <ArrowLeft size={14} />
            <div className="flex items-center gap-1.5">
              <img src="/hopon-car.svg" alt="" width={22} height={20} />
              <span className="font-display font-extrabold">
                Hop<span style={{ color: "var(--color-go)" }}>On</span>
              </span>
            </div>
          </Link>

          <div>
            <h1
              className="font-display text-2xl font-extrabold"
              style={{ color: "var(--color-ink)" }}
            >
              Welcome back
            </h1>
            <p
              className="mt-1 text-sm"
              style={{ color: "var(--color-ink-muted)" }}
            >
              Log in to find or offer a ride.
            </p>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                className="flex items-start gap-2.5 rounded-xl p-3 text-sm"
                style={{
                  background: "var(--color-spark-glow)",
                  border: "1px solid rgba(255,107,53,0.2)",
                  color: "var(--color-signal)",
                }}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                <AlertCircle
                  size={15}
                  style={{ flexShrink: 0, marginTop: 1 }}
                />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Email */}
            <div
              className="flex items-center gap-3 rounded-xl px-4 py-3"
              style={{
                background: "var(--color-surface-2)",
                border: "1px solid var(--color-border)",
              }}
            >
              <Mail
                size={15}
                style={{ color: "var(--color-ink-dim)", flexShrink: 0 }}
              />
              <input
                className="flex-1 bg-transparent text-sm focus:outline-none"
                style={{ color: "var(--color-ink)" }}
                placeholder="Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            {/* Password */}
            <div
              className="flex items-center gap-3 rounded-xl px-4 py-3"
              style={{
                background: "var(--color-surface-2)",
                border: "1px solid var(--color-border)",
              }}
            >
              <Lock
                size={15}
                style={{ color: "var(--color-ink-dim)", flexShrink: 0 }}
              />
              <input
                className="flex-1 bg-transparent text-sm focus:outline-none"
                style={{ color: "var(--color-ink)" }}
                placeholder="Password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-go mt-1 w-full py-3 text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" /> Logging in...
                </>
              ) : (
                <>
                  Log in <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* Signup link */}
          <p
            className="text-center text-sm"
            style={{ color: "var(--color-ink-muted)" }}
          >
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-semibold transition-colors"
              style={{ color: "var(--color-go)" }}
            >
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </main>
  );
}
