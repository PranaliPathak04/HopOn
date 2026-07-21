"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Car,
  Plus,
  Trash2,
  Star,
  LogOut,
  ArrowLeft,
  Loader2,
  Check,
  AlertCircle,
  BadgeCheck,
  ShieldAlert,
  Clock,
  ChevronDown,
  Home,
  Briefcase,
  GraduationCap,
  Heart,
  Navigation,
} from "lucide-react";
import LocationSearch from "@/components/LocationSearch";
import type { GeoResult } from "@/lib/geocode";
import carsData from "@/data/cars.json";
import ImageUpload from "@/components/ImageUpload";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Address {
  _id: string;
  label: string;
  latitude: number;
  longitude: number;
  displayName: string;
}

interface Vehicle {
  _id: string;
  make: string;
  model: string;
  type: string;
  color: string;
  licensePlate: string;
  seats: number;
  isDefault: boolean;
}

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string | null;
  photoUrl: string | null;
  licensePhotoUrl: string | null;
  verificationStatus: "unverified" | "pending" | "verified" | "rejected";
  addresses: Address[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const ADDRESS_LABEL_ICONS: Record<string, React.ReactNode> = {
  Home: <Home size={14} />,
  Office: <Briefcase size={14} />,
  College: <GraduationCap size={14} />,
  School: <GraduationCap size={14} />,
  Other: <Heart size={14} />,
};

const ADDRESS_LABELS = ["Home", "Office", "College", "School", "Other"];

const COLORS = [
  "White",
  "Black",
  "Silver",
  "Grey",
  "Red",
  "Blue",
  "Green",
  "Brown",
  "Orange",
  "Yellow",
  "Beige",
];

function VerificationBadge({
  status,
}: {
  status: UserProfile["verificationStatus"];
}) {
  const map = {
    verified: {
      icon: <BadgeCheck size={13} />,
      label: "Verified driver",
      bg: "rgba(163,230,53,0.1)",
      color: "var(--color-go)",
      border: "rgba(163,230,53,0.2)",
    },
    pending: {
      icon: <Clock size={13} />,
      label: "Verification pending",
      bg: "rgba(251,191,36,0.1)",
      color: "#fbbf24",
      border: "rgba(251,191,36,0.2)",
    },
    rejected: {
      icon: <ShieldAlert size={13} />,
      label: "Verification rejected",
      bg: "rgba(255,107,53,0.1)",
      color: "var(--color-signal)",
      border: "rgba(255,107,53,0.2)",
    },
    unverified: {
      icon: <ShieldAlert size={13} />,
      label: "Not verified",
      bg: "var(--color-surface-2)",
      color: "var(--color-ink-dim)",
      border: "var(--color-border)",
    },
  };
  const s = map[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
      style={{
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
      }}
    >
      {s.icon} {s.label}
    </span>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card p-5" style={{ background: "var(--color-surface)" }}>
      <p
        className="mb-4 text-xs font-bold uppercase tracking-widest"
        style={{ color: "var(--color-ink-dim)" }}
      >
        {title}
      </p>
      {children}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingVehicles, setLoadingVehicles] = useState(true);

  // Personal info edit

  const [editLicense, setEditLicense] = useState("");
  const [editingLicense, setEditingLicense] = useState(false);
  const [savingInfo, setSavingInfo] = useState(false);
  const [infoSaved, setInfoSaved] = useState(false);

  // Address form
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [addrLocation, setAddrLocation] = useState<GeoResult | null>(null);
  const [addrLabel, setAddrLabel] = useState("Home");
  const [savingAddress, setSavingAddress] = useState(false);
  const [editingInfo, setEditingInfo] = useState(false);

  // Vehicle form
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [vMake, setVMake] = useState("");
  const [vModel, setVModel] = useState("");
  const [vColor, setVColor] = useState("");
  const [vPlate, setVPlate] = useState("");
  const [vSeats, setVSeats] = useState(0);
  const [savingVehicle, setSavingVehicle] = useState(false);

  const [error, setError] = useState<string | null>(null);

  // Derived car data
  const makes = [...new Set(carsData.map((c) => c.make))].sort();
  const models = carsData.filter((c) => c.make === vMake);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  useEffect(() => {
    if (!session?.user) return;
    // Load profile
    fetch("/api/users/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setProfile(d.user);

          setEditLicense(d.user.licenseNumber ?? "");
        }
      })
      .finally(() => setLoadingProfile(false));

    // Load vehicles
    fetch("/api/vehicles")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setVehicles(d.vehicles);
      })
      .finally(() => setLoadingVehicles(false));
  }, [session]);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  async function savePersonalInfo() {
    setSavingInfo(true);
    setError(null);
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          licenseNumber: editLicense,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message);
        return;
      }
      setProfile(data.user);
      setInfoSaved(true);
      setTimeout(() => setInfoSaved(false), 2000);
    } catch {
      setError("Failed to save changes.");
    } finally {
      setSavingInfo(false);
    }
  }

  async function saveAddress() {
    if (!addrLocation) {
      setError("Please select a location.");
      return;
    }
    if (!profile) return;
    setSavingAddress(true);
    setError(null);
    try {
      const newAddresses = [
        ...profile.addresses.map((a) => ({
          label: a.label,
          latitude: a.latitude,
          longitude: a.longitude,
          displayName: a.displayName,
        })),
        {
          label: addrLabel,
          latitude: addrLocation.latitude,
          longitude: addrLocation.longitude,
          displayName: addrLocation.label,
        },
      ];
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addresses: newAddresses }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message);
        return;
      }
      setProfile(data.user);
      setShowAddAddress(false);
      setAddrLocation(null);
      setAddrLabel("Home");
    } catch (e) {
      console.error(e);
      setError("Failed to save address.");
    } finally {
      setSavingAddress(false);
    }
  }

  async function deleteAddress(id: string) {
    if (!profile) return;
    const newAddresses = profile.addresses
      .filter((a) => a._id !== id)
      .map((a) => ({
        label: a.label,
        latitude: a.latitude,
        longitude: a.longitude,
        displayName: a.displayName,
      }));
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addresses: newAddresses }),
      });
      const data = await res.json();
      if (data.success) setProfile(data.user);
    } catch (e) {
      console.error(e);
      setError("Failed to delete address.");
    }
  }
  async function saveVehicle() {
    if (!vMake || !vModel || !vColor || !vPlate) {
      setError("Please fill in all vehicle fields.");
      return;
    }
    setSavingVehicle(true);
    setError(null);
    try {
      const carData = carsData.find(
        (c) => c.make === vMake && c.model === vModel,
      );
      const res = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          make: vMake,
          model: vModel,
          type: carData?.type ?? "car",
          color: vColor,
          licensePlate: vPlate,
          seats: carData?.seats ?? vSeats,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message);
        return;
      }
      setVehicles((prev) => [...prev, data.vehicle]);
      setShowAddVehicle(false);
      setVMake("");
      setVModel("");
      setVColor("");
      setVPlate("");
      setVSeats(0);
    } catch {
      setError("Failed to save vehicle.");
    } finally {
      setSavingVehicle(false);
    }
  }

  async function setDefaultVehicle(id: string) {
    try {
      const res = await fetch(`/api/vehicles/${id}`, { method: "PATCH" });
      const data = await res.json();
      if (data.success) {
        setVehicles((prev) =>
          prev.map((v) => ({ ...v, isDefault: v._id === id })),
        );
      }
    } catch {
      setError("Failed to set default vehicle.");
    }
  }

  async function deleteVehicle(id: string) {
    try {
      const res = await fetch(`/api/vehicles/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) setVehicles((prev) => prev.filter((v) => v._id !== id));
    } catch {
      setError("Failed to delete vehicle.");
    }
  }

  // ── Loading ───────────────────────────────────────────────────────────────────

  if (status === "loading" || loadingProfile) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: "var(--color-paper)" }}
      >
        <Loader2
          size={24}
          className="animate-spin"
          style={{ color: "var(--color-go)" }}
        />
      </div>
    );
  }

  const inputStyle = {
    background: "var(--color-surface-2)",
    border: "1px solid var(--color-border)",
  };
  const inputClass =
    "flex items-center gap-3 rounded-xl px-4 py-3 w-full text-sm";

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
          <div className="flex items-center gap-2">
            <img src="/hopon-car.svg" alt="" width={36} height={32} />
            <span className="font-display text-xl font-extrabold tracking-tight">
              Hop<span style={{ color: "var(--color-go)" }}>On</span>
            </span>
          </div>
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-sm transition-colors hover:text-white"
            style={{ color: "var(--color-ink-muted)" }}
          >
            <ArrowLeft size={14} /> Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-5 py-10 space-y-4">
        {/* Page header */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <h1 className="font-display text-4xl font-extrabold">Profile</h1>
          <p
            className="mt-2 text-base"
            style={{ color: "var(--color-ink-muted)" }}
          >
            Manage your personal info, addresses and vehicles.
          </p>
        </motion.div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="flex items-start gap-3 rounded-xl p-4 text-sm"
              style={{
                background: "var(--color-spark-glow)",
                border: "1px solid rgba(255,107,53,0.2)",
                color: "var(--color-signal)",
              }}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
              {error}
              <button onClick={() => setError(null)} className="ml-auto">
                <span>×</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
        >
          {/* ── Personal Info ── */}
          <Section title="Personal Info">
            <div className="space-y-3">
              <ImageUpload
                label="Profile photo"
                folder="profile"
                currentUrl={profile?.photoUrl}
                shape="circle"
                onUploaded={async (url) => {
                  const res = await fetch("/api/users/me", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ photoUrl: url }),
                  });
                  const data = await res.json();
                  if (data.success) setProfile(data.user);
                }}
              />
              {/* Verification badge */}
              {profile && (
                <VerificationBadge status={profile.verificationStatus} />
              )}

              {/* Name */}
              <div
                className={inputClass}
                style={{ ...inputStyle, opacity: 0.6 }}
              >
                <User
                  size={15}
                  style={{ color: "var(--color-ink-dim)", flexShrink: 0 }}
                />
                <input
                  className="flex-1 bg-transparent text-sm focus:outline-none"
                  style={{ color: "var(--color-ink)" }}
                  placeholder="Full name"
                  value={profile?.name ?? ""}
                  readOnly
                />
                <span
                  className="text-xs"
                  style={{ color: "var(--color-ink-dim)" }}
                >
                  read-only
                </span>
              </div>

              {/* Email — read only */}
              <div
                className={inputClass}
                style={{ ...inputStyle, opacity: 0.6 }}
              >
                <Mail
                  size={15}
                  style={{ color: "var(--color-ink-dim)", flexShrink: 0 }}
                />
                <input
                  className="flex-1 bg-transparent text-sm focus:outline-none"
                  style={{ color: "var(--color-ink)" }}
                  value={profile?.email ?? ""}
                  readOnly
                />
                <span
                  className="text-xs"
                  style={{ color: "var(--color-ink-dim)" }}
                >
                  read-only
                </span>
              </div>

              {/* Phone */}
              <div
                className={inputClass}
                style={{ ...inputStyle, opacity: 0.6 }}
              >
                <Phone
                  size={15}
                  style={{ color: "var(--color-ink-dim)", flexShrink: 0 }}
                />
                <input
                  className="flex-1 bg-transparent text-sm focus:outline-none"
                  style={{ color: "var(--color-ink)" }}
                  placeholder="Phone number"
                  value={profile?.phone ?? ""}
                  readOnly
                />
                <span
                  className="text-xs"
                  style={{ color: "var(--color-ink-dim)" }}
                >
                  read-only
                </span>
              </div>

              {/* License number */}
              {!editingLicense ? (
                /* Read-only view */
                <div
                  className="flex items-center justify-between rounded-xl px-4 py-3"
                  style={inputStyle}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <BadgeCheck
                      size={15}
                      style={{ color: "var(--color-ink-dim)", flexShrink: 0 }}
                    />
                    <span
                      className="text-sm truncate"
                      style={{
                        color: profile?.licenseNumber
                          ? "var(--color-ink)"
                          : "var(--color-ink-dim)",
                      }}
                    >
                      {profile?.licenseNumber || "No license number added"}
                    </span>
                  </div>
                  <button
                    onClick={() => setEditingLicense(true)}
                    className="flex-shrink-0 text-xs font-semibold transition-colors"
                    style={{ color: "var(--color-go)" }}
                  >
                    {profile?.licenseNumber ? "Update" : "Add"}
                  </button>
                </div>
              ) : (
                /* Edit mode */
                <div className="space-y-2">
                  <div className={inputClass} style={inputStyle}>
                    <BadgeCheck
                      size={15}
                      style={{ color: "var(--color-ink-dim)", flexShrink: 0 }}
                    />
                    <input
                      className="flex-1 bg-transparent text-sm focus:outline-none"
                      style={{ color: "var(--color-ink)" }}
                      placeholder="Driving license number (drivers only)"
                      value={editLicense}
                      onChange={(e) => setEditLicense(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        await savePersonalInfo();
                        setEditingLicense(false);
                      }}
                      disabled={savingInfo}
                      className="btn-go flex-1 py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {savingInfo ? (
                        <>
                          <Loader2 size={13} className="animate-spin" />{" "}
                          Saving...
                        </>
                      ) : (
                        <>
                          <Check size={13} /> Save
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setEditingLicense(false);
                        setEditLicense(profile?.licenseNumber ?? "");
                      }}
                      className="rounded-xl px-4 py-2.5 text-sm transition-colors"
                      style={{
                        background: "var(--color-surface)",
                        border: "1px solid var(--color-border)",
                        color: "var(--color-ink-muted)",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <ImageUpload
                label="Driving license photo"
                folder="license"
                currentUrl={profile?.licensePhotoUrl}
                shape="rounded"
                onUploaded={async (url) => {
                  const res = await fetch("/api/users/me", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ licensePhotoUrl: url }),
                  });
                  const data = await res.json();
                  if (data.success) setProfile(data.user);
                }}
              />
            </div>
          </Section>

          {/* ── Saved Addresses ── */}
          <Section title="Saved Addresses">
            <div className="space-y-3">
              {(profile?.addresses?.length ?? 0) === 0 && !showAddAddress && (
                <p
                  className="text-sm"
                  style={{ color: "var(--color-ink-dim)" }}
                >
                  No saved addresses yet.
                </p>
              )}

              {/* Address list */}
              {(profile?.addresses ?? []).map((addr) => (
                <motion.div
                  key={addr._id}
                  className="flex items-center justify-between gap-3 rounded-xl px-4 py-3"
                  style={{
                    background: "var(--color-surface-2)",
                    border: "1px solid var(--color-border)",
                  }}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span style={{ color: "var(--color-go)" }}>
                      {ADDRESS_LABEL_ICONS[addr.label] ?? <MapPin size={14} />}
                    </span>
                    <div className="min-w-0">
                      <p
                        className="text-sm font-semibold"
                        style={{ color: "var(--color-ink)" }}
                      >
                        {addr.label}
                      </p>
                      <p
                        className="text-xs truncate"
                        style={{ color: "var(--color-ink-muted)" }}
                      >
                        {addr.displayName}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteAddress(addr._id)}
                    className="flex-shrink-0 rounded-lg p-1.5 transition-colors hover:bg-red-500/10"
                  >
                    <Trash2
                      size={14}
                      style={{ color: "var(--color-ink-dim)" }}
                    />
                  </button>
                </motion.div>
              ))}

              {/* Add address form */}
              <AnimatePresence>
                {showAddAddress && (
                  <motion.div
                    className="space-y-3 rounded-xl p-4"
                    style={{
                      background: "var(--color-surface-2)",
                      border: "1px solid var(--color-border)",
                    }}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    {/* Label selector */}
                    <div className="flex flex-wrap gap-2">
                      {ADDRESS_LABELS.map((l) => (
                        <button
                          key={l}
                          type="button"
                          onClick={() => setAddrLabel(l)}
                          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors"
                          style={{
                            background:
                              addrLabel === l
                                ? "var(--color-go)"
                                : "var(--color-surface)",
                            color:
                              addrLabel === l
                                ? "#0f0f0f"
                                : "var(--color-ink-muted)",
                            border: `1px solid ${addrLabel === l ? "var(--color-go)" : "var(--color-border)"}`,
                          }}
                        >
                          {ADDRESS_LABEL_ICONS[l]} {l}
                        </button>
                      ))}
                    </div>

                    {/* Location search */}
                    <LocationSearch
                      placeholder="Search location..."
                      onSelect={(r) => setAddrLocation(r)}
                      icon={
                        <Navigation
                          size={15}
                          style={{ color: "var(--color-go)" }}
                        />
                      }
                    />

                    {addrLocation && (
                      <p
                        className="text-xs truncate"
                        style={{ color: "var(--color-ink-muted)" }}
                      >
                        Selected: {addrLocation.label}
                      </p>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={saveAddress}
                        disabled={savingAddress || !addrLocation}
                        className="btn-go flex-1 py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {savingAddress ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <Check size={13} />
                        )}
                        Save address
                      </button>
                      <button
                        onClick={() => {
                          setShowAddAddress(false);
                          setAddrLocation(null);
                        }}
                        className="rounded-xl px-4 py-2.5 text-sm transition-colors"
                        style={{
                          background: "var(--color-surface)",
                          border: "1px solid var(--color-border)",
                          color: "var(--color-ink-muted)",
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Add address button */}
              {!showAddAddress && (profile?.addresses?.length ?? 0) < 5 && (
                <button
                  onClick={() => setShowAddAddress(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-colors"
                  style={{
                    border: "1px dashed var(--color-border)",
                    color: "var(--color-ink-muted)",
                  }}
                >
                  <Plus size={14} /> Add address
                </button>
              )}

              {(profile?.addresses?.length ?? 0) >= 5 && (
                <p
                  className="text-xs text-center"
                  style={{ color: "var(--color-ink-dim)" }}
                >
                  Maximum 5 addresses reached.
                </p>
              )}
            </div>
          </Section>

          {/* ── My Vehicles ── */}
          <Section title="My Vehicles">
            <div className="space-y-3">
              {loadingVehicles ? (
                <div
                  className="flex items-center gap-2 text-sm"
                  style={{ color: "var(--color-ink-dim)" }}
                >
                  <Loader2 size={14} className="animate-spin" /> Loading
                  vehicles...
                </div>
              ) : vehicles.length === 0 && !showAddVehicle ? (
                <p
                  className="text-sm"
                  style={{ color: "var(--color-ink-dim)" }}
                >
                  No vehicles added yet.
                </p>
              ) : null}

              {/* Vehicle list */}
              {vehicles.map((v) => (
                <motion.div
                  key={v._id}
                  className="rounded-xl p-4"
                  style={{
                    background: "var(--color-surface-2)",
                    border: `1px solid ${v.isDefault ? "var(--color-go)" : "var(--color-border)"}`,
                  }}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <Car
                        size={16}
                        style={{
                          color: v.isDefault
                            ? "var(--color-go)"
                            : "var(--color-ink-dim)",
                          flexShrink: 0,
                          marginTop: 2,
                        }}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p
                            className="font-semibold text-sm"
                            style={{ color: "var(--color-ink)" }}
                          >
                            {v.make} {v.model}
                          </p>
                          {v.isDefault && (
                            <span
                              className="text-xs font-semibold rounded-full px-2 py-0.5"
                              style={{
                                background: "var(--color-go-glow)",
                                color: "var(--color-go)",
                                border: "1px solid var(--color-go-glow)",
                              }}
                            >
                              Default
                            </span>
                          )}
                        </div>
                        <p
                          className="text-xs mt-0.5"
                          style={{ color: "var(--color-ink-muted)" }}
                        >
                          {v.color} · {v.licensePlate} · {v.seats} seats
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {!v.isDefault && (
                        <button
                          onClick={() => setDefaultVehicle(v._id)}
                          className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors"
                          style={{
                            background: "var(--color-surface)",
                            border: "1px solid var(--color-border)",
                            color: "var(--color-ink-muted)",
                          }}
                        >
                          <Star size={11} /> Set default
                        </button>
                      )}
                      <button
                        onClick={() => deleteVehicle(v._id)}
                        className="rounded-lg p-1.5 transition-colors hover:bg-red-500/10"
                      >
                        <Trash2
                          size={14}
                          style={{ color: "var(--color-ink-dim)" }}
                        />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Add vehicle form */}
              <AnimatePresence>
                {showAddVehicle && (
                  <motion.div
                    className="space-y-3 rounded-xl p-4"
                    style={{
                      background: "var(--color-surface-2)",
                      border: "1px solid var(--color-border)",
                    }}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    {/* Make dropdown */}
                    <div
                      className={inputClass}
                      style={{ ...inputStyle, padding: 0, overflow: "hidden" }}
                    >
                      <div className="flex items-center gap-3 px-4 py-3 w-full">
                        <Car
                          size={15}
                          style={{
                            color: "var(--color-ink-dim)",
                            flexShrink: 0,
                          }}
                        />
                        <select
                          className="flex-1 bg-transparent text-sm focus:outline-none"
                          style={{
                            color: vMake
                              ? "var(--color-ink)"
                              : "var(--color-ink-dim)",
                          }}
                          value={vMake}
                          onChange={(e) => {
                            setVMake(e.target.value);
                            setVModel("");
                            setVSeats(0);
                          }}
                        >
                          <option value="">Select make</option>
                          {makes.map((m) => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Model dropdown */}
                    <div
                      className={inputClass}
                      style={{
                        ...inputStyle,
                        padding: 0,
                        overflow: "hidden",
                        opacity: vMake ? 1 : 0.5,
                      }}
                    >
                      <div className="flex items-center gap-3 px-4 py-3 w-full">
                        <ChevronDown
                          size={15}
                          style={{
                            color: "var(--color-ink-dim)",
                            flexShrink: 0,
                          }}
                        />
                        <select
                          className="flex-1 bg-transparent text-sm focus:outline-none"
                          style={{
                            color: vModel
                              ? "var(--color-ink)"
                              : "var(--color-ink-dim)",
                          }}
                          value={vModel}
                          disabled={!vMake}
                          onChange={(e) => {
                            setVModel(e.target.value);
                            const car = carsData.find(
                              (c) =>
                                c.make === vMake && c.model === e.target.value,
                            );
                            if (car) setVSeats(car.seats);
                          }}
                        >
                          <option value="">Select model</option>
                          {models.map((m) => (
                            <option key={m.model} value={m.model}>
                              {m.model}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Seats — auto filled */}
                    {vSeats > 0 && (
                      <div
                        className="flex items-center gap-2 text-sm px-1"
                        style={{ color: "var(--color-ink-muted)" }}
                      >
                        <Check size={13} style={{ color: "var(--color-go)" }} />
                        {vSeats} seats (excluding driver) — auto-filled
                      </div>
                    )}

                    {/* Color dropdown */}
                    <div
                      className={inputClass}
                      style={{ ...inputStyle, padding: 0, overflow: "hidden" }}
                    >
                      <div className="flex items-center gap-3 px-4 py-3 w-full">
                        <span
                          style={{
                            width: 14,
                            height: 14,
                            borderRadius: "50%",
                            background: "var(--color-ink-dim)",
                            flexShrink: 0,
                          }}
                        />
                        <select
                          className="flex-1 bg-transparent text-sm focus:outline-none"
                          style={{
                            color: vColor
                              ? "var(--color-ink)"
                              : "var(--color-ink-dim)",
                          }}
                          value={vColor}
                          onChange={(e) => setVColor(e.target.value)}
                        >
                          <option value="">Select color</option>
                          {COLORS.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* License plate */}
                    <div className={inputClass} style={inputStyle}>
                      <span
                        className="text-xs font-bold"
                        style={{ color: "var(--color-ink-dim)", flexShrink: 0 }}
                      >
                        MH
                      </span>
                      <input
                        className="flex-1 bg-transparent text-sm focus:outline-none uppercase"
                        style={{ color: "var(--color-ink)" }}
                        placeholder="License plate (e.g. MH02AB1234)"
                        value={vPlate}
                        onChange={(e) =>
                          setVPlate(e.target.value.toUpperCase())
                        }
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={saveVehicle}
                        disabled={
                          savingVehicle ||
                          !vMake ||
                          !vModel ||
                          !vColor ||
                          !vPlate
                        }
                        className="btn-go flex-1 py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {savingVehicle ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <Check size={13} />
                        )}
                        Save vehicle
                      </button>
                      <button
                        onClick={() => {
                          setShowAddVehicle(false);
                          setVMake("");
                          setVModel("");
                          setVColor("");
                          setVPlate("");
                          setVSeats(0);
                        }}
                        className="rounded-xl px-4 py-2.5 text-sm transition-colors"
                        style={{
                          background: "var(--color-surface)",
                          border: "1px solid var(--color-border)",
                          color: "var(--color-ink-muted)",
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Add vehicle button */}
              {!showAddVehicle && (
                <button
                  onClick={() => setShowAddVehicle(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-colors"
                  style={{
                    border: "1px dashed var(--color-border)",
                    color: "var(--color-ink-muted)",
                  }}
                >
                  <Plus size={14} /> Add vehicle
                </button>
              )}
            </div>
          </Section>

          {/* ── Account ── */}
          <Section title="Account">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "var(--color-ink)" }}
                  >
                    {profile?.name}
                  </p>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: "var(--color-ink-muted)" }}
                  >
                    {profile?.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-colors"
                style={{
                  background: "rgba(255,107,53,0.08)",
                  border: "1px solid rgba(255,107,53,0.2)",
                  color: "var(--color-signal)",
                }}
              >
                <LogOut size={14} /> Sign out
              </button>
            </div>
          </Section>
        </motion.div>
      </main>
    </div>
  );
}
