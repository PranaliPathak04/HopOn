"use client";

import { useState, useRef } from "react";
import { Camera, Loader2, X, ImagePlus } from "lucide-react";

interface Props {
  label: string;
  folder: "profile" | "license" | "rc";
  currentUrl?: string | null;
  onUploaded: (url: string) => void;
  shape?: "circle" | "rounded"; // circle for profile photo, rounded for documents
}

export default function ImageUpload({
  label,
  folder,
  currentUrl,
  onUploaded,
  shape = "rounded",
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function handleFile(file: File) {
    setError(null);

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("Image must be under 8MB.");
      return;
    }

    setUploading(true);
    try {
      const base64 = await fileToBase64(file);
      // Show local preview immediately while upload happens
      setPreview(base64);

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64, folder }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Upload failed.");
        setPreview(currentUrl ?? null);
        return;
      }

      setPreview(data.url);
      onUploaded(data.url);
    } catch {
      setError("Upload failed. Try again.");
      setPreview(currentUrl ?? null);
    } finally {
      setUploading(false);
    }
  }

  function handleRemove() {
    setPreview(null);
    onUploaded("");
    if (inputRef.current) inputRef.current.value = "";
  }

  const isCircle = shape === "circle";

  return (
    <div>
      <p
        className="mb-2 text-xs font-semibold uppercase tracking-wide"
        style={{ color: "var(--color-ink-dim)" }}
      >
        {label}
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      <div className="flex items-center gap-4">
        {/* Preview / dropzone */}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="relative flex items-center justify-center overflow-hidden transition-colors flex-shrink-0"
          style={{
            width: isCircle ? 80 : 120,
            height: isCircle ? 80 : 80,
            borderRadius: isCircle ? "50%" : 12,
            background: "var(--color-surface-2)",
            border: preview
              ? "1px solid var(--color-border)"
              : "1px dashed var(--color-border)",
            cursor: uploading ? "not-allowed" : "pointer",
          }}
        >
          {uploading ? (
            <Loader2
              size={20}
              className="animate-spin"
              style={{ color: "var(--color-go)" }}
            />
          ) : preview ? (
            <img
              src={preview}
              alt={label}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-1">
              {isCircle ? (
                <Camera size={18} style={{ color: "var(--color-ink-dim)" }} />
              ) : (
                <ImagePlus
                  size={18}
                  style={{ color: "var(--color-ink-dim)" }}
                />
              )}
            </div>
          )}
        </button>

        {/* Actions */}
        <div className="flex-1">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="text-sm font-semibold transition-colors disabled:opacity-50"
            style={{ color: "var(--color-go)" }}
          >
            {preview ? "Change photo" : "Upload photo"}
          </button>

          {preview && !uploading && (
            <button
              type="button"
              onClick={handleRemove}
              className="ml-3 inline-flex items-center gap-1 text-sm transition-colors"
              style={{ color: "var(--color-ink-dim)" }}
            >
              <X size={12} /> Remove
            </button>
          )}

          <p className="mt-1 text-xs" style={{ color: "var(--color-ink-dim)" }}>
            JPG or PNG, max 8MB
          </p>

          {error && (
            <p
              className="mt-1 text-xs"
              style={{ color: "var(--color-signal)" }}
            >
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
