"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Live preview of the public site inside the Features editor.
 *
 * The landing page is a full-viewport, scroll-snapping experience, so embedding
 * it at 1:1 in a small box only shows a cropped hero. Instead we render the page
 * at its true device size in an off-screen iframe and CSS-scale the whole thing
 * down to fit the panel — a real, proportional thumbnail of the site. A
 * ResizeObserver keeps the scale correct as the admin column resizes.
 *
 * Flags apply to the live site on save, so the flow is: toggle → Save → Reload.
 */
const DEVICES = {
  phone: { w: 390, h: 844, label: "Phone" },
  desktop: { w: 1280, h: 900, label: "Desktop" },
} as const;

type DeviceKey = keyof typeof DEVICES;

export function FeaturePreview() {
  const [device, setDevice] = useState<DeviceKey>("phone");
  const [nonce, setNonce] = useState(0);
  const [scale, setScale] = useState(0.4);
  const stageRef = useRef<HTMLDivElement>(null);

  const { w, h } = DEVICES[device];

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const fit = () => {
      // Available content width inside the stage padding.
      const avail = el.clientWidth - 32;
      setScale(Math.min(1, Math.max(0.2, avail / w)));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [w]);

  return (
    <section className="section feature-preview">
      <div className="feature-preview-head">
        <h2>Live preview</h2>
        <div className="feature-preview-controls">
          <div className="seg" role="group" aria-label="Preview device">
            {(Object.keys(DEVICES) as DeviceKey[]).map((key) => (
              <button
                key={key}
                type="button"
                className="seg-btn"
                data-active={device === key}
                onClick={() => setDevice(key)}
              >
                {DEVICES[key].label}
              </button>
            ))}
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
        A proportional thumbnail of the published home page. Save your changes, then reload.
      </p>

      <div className="feature-preview-stage" ref={stageRef}>
        {/* holder takes the SCALED dimensions so it occupies real layout space;
            the iframe inside is full-size and scaled down from its top-left. */}
        <div
          className="feature-preview-holder"
          style={{ width: w * scale, height: h * scale }}
        >
          <iframe
            key={`${device}-${nonce}`}
            className="feature-preview-frame"
            src="/"
            title="Live site preview"
            width={w}
            height={h}
            style={{ transform: `scale(${scale})` }}
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}
