"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { searchAddress, type GeoResult } from "@/lib/geocode";
import { MapPin } from "lucide-react";

interface Props {
  placeholder: string;
  onSelect: (result: GeoResult) => void;
  icon?: ReactNode;
  value?: GeoResult | null; // external value — e.g. set via a quick-pick button
}

export default function LocationSearch({
  placeholder,
  onSelect,
  icon,
  value,
}: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeoResult[]>([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync displayed text when the value is set externally (e.g. quick-pick address)
  useEffect(() => {
    if (value) setQuery(value.label);
    else setQuery("");
  }, [value?.latitude, value?.longitude, value?.label]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }

    // Debounce — respects Nominatim's ~1 req/sec fair-use guidance
    debounceRef.current = setTimeout(async () => {
      const r = await searchAddress(query);
      setResults(r);
      setOpen(r.length > 0);
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(result: GeoResult) {
    setQuery(result.label);
    setOpen(false);
    onSelect(result);
  }

  return (
    <div className="relative" ref={containerRef}>
      {/* Input row */}
      <div
        className="flex items-center gap-2 rounded-xl px-3 py-3"
        style={{
          background: "var(--color-surface-2)",
          border: "1px solid var(--color-border)",
          transition: "border-color 0.15s",
        }}
      >
        <span style={{ flexShrink: 0, display: "flex", alignItems: "center" }}>
          {icon ?? (
            <MapPin size={15} style={{ color: "var(--color-ink-dim)" }} />
          )}
        </span>

        <input
          className="flex-1 bg-transparent text-sm focus:outline-none"
          style={{ color: "var(--color-ink)" }}
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
        />
      </div>

      {/* Dropdown */}
      {open && (
        <ul
          className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl py-1"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          }}
        >
          {results.map((r, i) => (
            <li
              key={i}
              className="flex cursor-pointer items-start gap-2 px-3 py-2.5 text-sm transition-colors"
              style={{ color: "var(--color-ink-muted)" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "var(--color-surface-2)";
                (e.currentTarget as HTMLElement).style.color =
                  "var(--color-ink)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "transparent";
                (e.currentTarget as HTMLElement).style.color =
                  "var(--color-ink-muted)";
              }}
              onClick={() => handleSelect(r)}
            >
              <MapPin
                size={13}
                style={{
                  color: "var(--color-ink-dim)",
                  flexShrink: 0,
                  marginTop: 2,
                }}
              />
              <span className="leading-snug">{r.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
