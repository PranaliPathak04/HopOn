"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, LogOut, Menu, X, User } from "lucide-react";
import BookingsTab from "@/components/dashboard/BookingsTab";
import MyRidesTab from "@/components/dashboard/MyRidesTab";

// ─── Mobile nav drawer ────────────────────────────────────────────────────────

function MobileDrawer({
  open,
  onClose,
  onSignOut,
}: {
  open: boolean;
  onClose: () => void;
  onSignOut: () => void;
}) {
  const links = [
    { href: "/profile", label: "Profile", icon: User },
    { href: "/search", label: "Find a ride", icon: Search },
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 sm:hidden"
            style={{ background: "rgba(0,0,0,0.6)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed right-0 top-0 z-50 h-full w-64 sm:hidden"
            style={{
              background: "var(--color-surface)",
              borderLeft: "1px solid var(--color-border)",
            }}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
          >
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: "1px solid var(--color-border)" }}
            >
              <span
                className="font-display font-bold"
                style={{ color: "var(--color-ink)" }}
              >
                Menu
              </span>
              <button
                onClick={onClose}
                style={{ color: "var(--color-ink-dim)" }}
              >
                <X size={18} />
              </button>
            </div>

            <nav className="flex flex-col gap-1 p-3">
              {links.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors"
                  style={{ color: "var(--color-ink-muted)" }}
                >
                  <Icon size={16} style={{ color: "var(--color-ink-dim)" }} />
                  {label}
                </Link>
              ))}
              <button
                onClick={onSignOut}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition-colors"
                style={{ color: "var(--color-ink-muted)" }}
              >
                <LogOut size={16} style={{ color: "var(--color-ink-dim)" }} />
                Sign out
              </button>
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────

type Tab = "bookings" | "rides";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("bookings");
  const [menuOpen, setMenuOpen] = useState(false);

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
      <header
        style={{
          borderBottom: "1px solid var(--color-border)",
          background: "rgba(15,15,15,0.9)",
          backdropFilter: "blur(12px)",
        }}
        className="sticky top-0 z-30"
      >
        <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-4">
          <Link href="/" className="flex items-center gap-2">
            <img src="/hopon-car.svg" alt="" width={36} height={32} />
            <span className="font-display text-xl font-extrabold tracking-tight">
              Hop<span style={{ color: "var(--color-go)" }}>On</span>
            </span>
          </Link>

          {/* Desktop nav — unchanged */}
          <div className="hidden items-center gap-3 sm:flex">
            <Link
              href="/profile"
              style={{ color: "var(--color-ink-muted)" }}
              className="nav-link px-1 py-2"
            >
              Profile
            </Link>
            <Link
              href="/search"
              className="nav-link flex items-center gap-1.5 px-1 py-2"
              style={{ color: "var(--color-ink-muted)" }}
            >
              <Search size={14} /> Find a ride
            </Link>
            <Link
              href="/publish"
              className="btn-outline-tide flex items-center gap-1.5 px-4 py-1.5 text-sm"
              style={{ color: "var(--color-tide)" }}
            >
              <Plus size={14} /> Publish ride
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-1.5 text-sm transition-colors hover:text-white"
              style={{ color: "var(--color-ink-muted)" }}
            >
              <LogOut size={14} />
              <span>Sign out</span>
            </button>
          </div>

          {/* Mobile — decorative find-a-ride pill + menu trigger */}
          <div className="flex items-center gap-2 sm:hidden">
            <Link
              href="/search"
              className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors"
              style={{
                border: "1px solid var(--color-go)",
                color: "var(--color-go)",
              }}
            >
              <Search size={14} />
              Find a ride
            </Link>
            <button
              onClick={() => setMenuOpen(true)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                color: "var(--color-ink-muted)",
              }}
              aria-label="Open menu"
            >
              <Menu size={18} />
            </button>
          </div>
        </div>
      </header>

      <MobileDrawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onSignOut={() => {
          setMenuOpen(false);
          signOut({ callbackUrl: "/" });
        }}
      />

      <main className="mx-auto max-w-2xl px-5 py-10 pb-28 sm:pb-10">
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

      {/* Publish ride FAB — mobile only, desktop keeps the header button */}
      <Link
        href="/publish"
        className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full sm:hidden"
        style={{
          background: "var(--color-go)",
          boxShadow: "0 8px 24px rgba(251,191,36,0.35)",
        }}
        aria-label="Publish ride"
      >
        <Plus size={24} style={{ color: "#0f0f0f" }} />
      </Link>
    </div>
  );
}
