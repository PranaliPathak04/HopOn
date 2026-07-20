"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Check } from "lucide-react";

interface Props {
  options: string[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select...",
  disabled = false,
  icon,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = query.trim()
    ? options.filter((o) => o.toLowerCase().includes(query.toLowerCase()))
    : options;

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Focus input when dropdown opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  function handleSelect(option: string) {
    onChange(option);
    setOpen(false);
    setQuery("");
  }

  function handleOpen() {
    if (disabled) return;
    setOpen(true);
  }

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
      {/* Trigger */}
      <button
        type="button"
        onClick={handleOpen}
        disabled={disabled}
        className="flex items-center gap-3 rounded-xl px-4 py-3 w-full text-sm text-left transition-colors"
        style={{
          background: "var(--color-surface-2)",
          border: "1px solid var(--color-border)",
          color: value ? "var(--color-ink)" : "var(--color-ink-dim)",
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? "not-allowed" : "pointer",
        }}
      >
        {icon && (
          <span
            style={{ flexShrink: 0, display: "flex", alignItems: "center" }}
          >
            {icon}
          </span>
        )}
        <span className="flex-1 truncate">{value || placeholder}</span>
        <ChevronDown
          size={15}
          style={{
            color: "var(--color-ink-dim)",
            flexShrink: 0,
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
          }}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute z-30 mt-1 w-full rounded-xl overflow-hidden"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          }}
        >
          {/* Search input */}
          <div
            className="flex items-center gap-2 px-3 py-2.5"
            style={{ borderBottom: "1px solid var(--color-border)" }}
          >
            <Search
              size={13}
              style={{ color: "var(--color-ink-dim)", flexShrink: 0 }}
            />
            <input
              ref={inputRef}
              className="flex-1 bg-transparent text-sm focus:outline-none"
              style={{ color: "var(--color-ink)" }}
              placeholder="Type to search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {/* Options list */}
          <div style={{ maxHeight: 220, overflowY: "auto" }}>
            {filtered.length === 0 ? (
              <p
                className="px-4 py-3 text-sm"
                style={{ color: "var(--color-ink-dim)" }}
              >
                No results for "{query}"
              </p>
            ) : (
              filtered.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className="flex items-center justify-between w-full px-4 py-2.5 text-sm text-left transition-colors"
                  style={{
                    background:
                      value === option
                        ? "var(--color-surface-2)"
                        : "transparent",
                    color:
                      value === option
                        ? "var(--color-ink)"
                        : "var(--color-ink-muted)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background =
                      "var(--color-surface-2)";
                    (e.currentTarget as HTMLElement).style.color =
                      "var(--color-ink)";
                  }}
                  onMouseLeave={(e) => {
                    if (value !== option) {
                      (e.currentTarget as HTMLElement).style.background =
                        "transparent";
                      (e.currentTarget as HTMLElement).style.color =
                        "var(--color-ink-muted)";
                    }
                  }}
                >
                  <span>{option}</span>
                  {value === option && (
                    <Check
                      size={13}
                      style={{ color: "var(--color-go)", flexShrink: 0 }}
                    />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
