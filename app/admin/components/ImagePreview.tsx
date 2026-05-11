"use client";

import { useEffect, useRef, useState } from "react";
import { MAX_IMAGE_BYTES } from "@/lib/validation";

type Props = {
  inputId: string;
  name: string;
  required?: boolean;
  accept?: string;
};

export function ImagePreview({ inputId, name, required, accept = "image/*" }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [meta, setMeta] = useState<{ size: string; type: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setMeta(null);
    }
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_IMAGE_BYTES) {
      setError(`File too large (${formatBytes(file.size)} > 8MB)`);
      e.target.value = "";
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError(`Unsupported type: ${file.type || "unknown"}`);
      e.target.value = "";
      return;
    }
    setPreviewUrl(URL.createObjectURL(file));
    setMeta({ size: formatBytes(file.size), type: file.type });
  }

  return (
    <>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        name={name}
        accept={accept}
        required={required}
        onChange={onChange}
      />
      {error ? (
        <p className="field-error" role="alert" id={`${inputId}-error`}>
          {error}
        </p>
      ) : null}
      {previewUrl ? (
        <div className="image-preview">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt="Preview" />
          {meta ? (
            <span className="image-preview-meta">
              {meta.type} · {meta.size}
            </span>
          ) : null}
        </div>
      ) : null}
    </>
  );
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}
