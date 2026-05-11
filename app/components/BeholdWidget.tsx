"use client";

import { createElement, useEffect } from "react";

let scriptInjected = false;

export function BeholdWidget({ feedId }: { feedId: string }) {
  useEffect(() => {
    if (scriptInjected) return;
    if (document.querySelector('script[src="https://w.behold.so/widget.js"]')) {
      scriptInjected = true;
      return;
    }
    const s = document.createElement("script");
    s.src = "https://w.behold.so/widget.js";
    s.type = "module";
    s.async = true;
    document.head.appendChild(s);
    scriptInjected = true;
  }, []);

  return createElement("behold-widget", {
    "feed-id": feedId,
    className: "behold-feed",
  });
}
