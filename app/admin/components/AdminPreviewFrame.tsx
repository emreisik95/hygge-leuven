"use client";

import { useRef, useState } from "react";

export function AdminPreviewFrame({ src }: { src: string }) {
  const [device, setDevice] = useState<"phone" | "desktop">("phone");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  return (
    <section className="admin-preview-frame" aria-label="Site preview">
      <div className="admin-preview-toolbar">
        <div className="admin-preview-device-switch" aria-label="Preview size">
          <button
            type="button"
            data-active={device === "phone"}
            aria-pressed={device === "phone"}
            onClick={() => setDevice("phone")}
          >
            Phone
          </button>
          <button
            type="button"
            data-active={device === "desktop"}
            aria-pressed={device === "desktop"}
            onClick={() => setDevice("desktop")}
          >
            Desktop
          </button>
        </div>
        <div className="admin-preview-actions">
          <button type="button" onClick={() => iframeRef.current?.contentWindow?.location.reload()}>
            Refresh
          </button>
          <a href="/" target="_blank" rel="noreferrer">
            Open live site ↗
          </a>
        </div>
      </div>
      <div className="admin-preview-stage">
        <div className="admin-preview-canvas" data-device={device}>
          <iframe
            ref={iframeRef}
            src={src}
            title="Current admin draft"
            loading="eager"
          />
        </div>
      </div>
    </section>
  );
}
