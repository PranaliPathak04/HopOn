"use client";

import { useEffect, useRef, useState } from "react";
import { searchAddress, type GeoResult } from "@/lib/geocode";

interface Props {
  placeholder: string;
  onSelect: (result: GeoResult) => void;
}

export default function LocationSearch({ placeholder, onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeoResult[]>([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    // Debounce so we don't hammer Nominatim on every keystroke —
    // respects their ~1 req/sec fair-use guidance.
    debounceRef.current = setTimeout(async () => {
      const r = await searchAddress(query);
      setResults(r);
      setOpen(r.length > 0);
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  function handleSelect(result: GeoResult) {
    setQuery(result.label);
    setOpen(false);
    onSelect(result);
  }

  return (
    <div className="relative">
      <input
        className="w-full rounded border border-gray-300 p-2"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
      />
      {open && (
        <ul className="absolute z-10 mt-1 w-full rounded border border-gray-200 bg-white shadow-lg">
          {results.map((r, i) => (
            <li
              key={i}
              className="cursor-pointer p-2 text-sm hover:bg-gray-100"
              onClick={() => handleSelect(r)}
            >
              {r.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
