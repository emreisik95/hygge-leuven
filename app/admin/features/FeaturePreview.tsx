"use client";

import { useRef, useState } from "react";

/**
 * Live preview of the public site inside the Features editor. Flags take effect
 * on the live site the moment they are saved, so this simply embeds the home
 * page and offers a reload — after saving, the admin reloads to see the result.
 * The iframe is keyed so reloading is a real navigation, not just a cache hit.
 */
export function FeaturePreview() {
  const [nonce, setNonce] = useState(0);
  const [device, setDevice] = useState<"phone" | "full">("phone");
  const frameRef = useRef<HTMLIFrameElement>(null);

  return (
    <section className="section feature-preview">
      <div className="feature-preview-head">
        <h2>Live preview</h2>
        <div className="feature-preview-controls">
          <div className="seg" role="group" aria-label="Preview width">
            <button
              type="button"
              className="seg-btn"
              data-active={device === "phone"}
              onClick={() => setDevice("phone")}
            >
              Phone
            </button>
            <button
              type="button"
              className="seg-btn"
              data-active={device === "full"}
              onClick={() => setDevice("full")}
            >
              Full
            </button>
          </div>
          <button
            type="button"
            className="btn-secondary-inline"
            onClick={() => setNonce((n) => n + 1)}
          >
            ↻ Reload
          </button>
          <a className="btn-secondary-inline" href="/" target="_blank" rel="noreferrer">
            Open ↗
          </a>
        </div>
      </div>
      <p className="hint">
        Shows the published home page. Save your changes, then reload to see them.
      </p>
      <div className="feature-preview-stage" data-device={device}>
        <iframe
          key={nonce}
          ref={frameRef}
          className="feature-preview-frame"
          src="/"
          title="Live site preview"
          loading="lazy"
        />
      </div>
    </section>
  );
}
