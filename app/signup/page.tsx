"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Lock,
  ArrowRight,
  Loader2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";

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

  const inputRow = (
    icon: React.ReactNode,
    placeholder: string,
    type: string,
    field: keyof typeof form,
  ) => (
    <div
      className="flex items-center gap-3 rounded-xl px-4 py-3"
      style={{
        background: "var(--color-surface-2)",
        border: "1px solid var(--color-border)",
      }}
    >
      <span
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          color: "var(--color-ink-dim)",
        }}
      >
        {icon}
      </span>
      <input
        className="flex-1 bg-transparent text-sm focus:outline-none"
        style={{ color: "var(--color-ink)" }}
        placeholder={placeholder}
        type={type}
        value={form[field]}
        onChange={(e) => setForm({ ...form, [field]: e.target.value })}
        required
      />
    </div>
  );

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
        {/* Card */}
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
              Create your account
            </h1>
            <p
              className="mt-1 text-sm"
              style={{ color: "var(--color-ink-muted)" }}
            >
              Join thousands already sharing the road.
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
            {inputRow(<User size={15} />, "Full name", "text", "name")}
            {inputRow(<Mail size={15} />, "Email", "email", "email")}
            {inputRow(<Phone size={15} />, "Phone", "tel", "phone")}
            {inputRow(
              <Lock size={15} />,
              "Password (min 8 chars)",
              "password",
              "password",
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-go mt-1 w-full py-3 text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" /> Creating
                  account...
                </>
              ) : (
                <>
                  Sign up <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* Login link */}
          <p
            className="text-center text-sm"
            style={{ color: "var(--color-ink-muted)" }}
          >
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold transition-colors"
              style={{ color: "var(--color-go)" }}
            >
              Log in
            </Link>
          </p>
        </div>
      </motion.div>
    </main>
  );
}
