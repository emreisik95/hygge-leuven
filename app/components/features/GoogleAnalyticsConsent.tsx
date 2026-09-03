"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

const CONSENT_KEY = "hygge.analytics-consent.v1";
const SAFE_GA4_ID = /^G-[A-Z0-9]{4,32}$/;

type ConsentChoice = "granted" | "denied" | null;

export function GoogleAnalyticsConsent({ measurementId }: { measurementId: string }) {
  const [choice, setChoice] = useState<ConsentChoice | "loading">("loading");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CONSENT_KEY);
      setChoice(saved === "granted" || saved === "denied" ? saved : null);
    } catch {
      setChoice(null);
    }
  }, []);

  if (!SAFE_GA4_ID.test(measurementId)) return null;

  const allowAnalytics = () => {
    try {
      localStorage.setItem(CONSENT_KEY, "granted");
    } catch {
      /* Keep the visitor's choice for this page load. */
    }
    setChoice("granted");
  };

  const denyAnalytics = () => {
    try {
      localStorage.setItem(CONSENT_KEY, "denied");
    } catch {
      /* Keep analytics disabled for this page load. */
    }
    setChoice("denied");
  };

  return (
    <>
      {choice === "granted" ? <GoogleAnalyticsScripts measurementId={measurementId} /> : null}
      {choice === null ? (
        <div className="consent" role="dialog" aria-live="polite" aria-label="Analytics choices">
          <p className="consent-text">
            We use Google Analytics to understand visits and improve the website. Analytics stays
            off unless you allow it.
          </p>
          <div className="consent-actions">
            <button type="button" className="btn btn-primary consent-accept" onClick={allowAnalytics}>
              Allow analytics
            </button>
            <button type="button" className="btn btn-secondary" onClick={denyAnalytics}>
              No thanks
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}

function GoogleAnalyticsScripts({ measurementId }: { measurementId: string }) {
  const defaultConsent = {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  };
  const grantedConsent = {
    analytics_storage: "granted",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  };
  const initialization = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){window.dataLayer.push(arguments);}
    gtag('consent', 'default', ${JSON.stringify(defaultConsent)});
    gtag('consent', 'update', ${JSON.stringify(grantedConsent)});
    gtag('js', new Date());
    gtag('config', ${JSON.stringify(measurementId)});
  `;

  return (
    <>
      <Script id={`ga4-init-${measurementId}`} strategy="afterInteractive">
        {initialization}
      </Script>
      <Script
        id={`ga4-loader-${measurementId}`}
        src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`}
        strategy="afterInteractive"
      />
    </>
  );
}
