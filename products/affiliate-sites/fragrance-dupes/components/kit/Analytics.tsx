"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

import { CONSENT_CHANGE_EVENT, effectiveConsent, type ConsentChoice } from "@/lib/consent";
import { gaMeasurementId } from "@/lib/site";

/**
 * Shared affiliate-site-kit: GA4 wiring. Mount once in the site's root
 * app/layout.tsx. See the technical plan §4.
 *
 * The ID comes from lib/site.ts rather than being read from the environment
 * here, so there is exactly one place that decides whether analytics runs -
 * see `gaMeasurementId()` for why it is a constant with a production gate
 * rather than a deployment variable. Renders nothing when it returns null,
 * which is the case in development and in any build that overrides the ID
 * with an empty string.
 *
 * Search Console verification does NOT go through this component. It is done
 * with a DNS TXT record on a Search Console *Domain* property, which covers
 * apex, www, http and https at once and needs no rebuild.
 */
/**
 * OPT-IN SINCE 2026-11-01. NOTHING LOADS UNTIL THE VISITOR SAYS YES.
 *
 * Until that date this component loaded GA4 for every visitor and the site
 * carried no banner, on the argument that cookieless GA4 stores nothing on the
 * device. That covered the cookie rule but not the transfer: every hit still
 * sends page, device and network details to Google in the United States. The
 * founder asked for a consent banner (components/kit/ConsentBanner.tsx) and
 * this component now waits for it - see lib/consent.ts for the reasoning.
 *
 * STILL COOKIELESS AFTER CONSENT, deliberately. `client_storage: 'none'` stops
 * GA4 writing the `_ga` cookie and `anonymize_ip` truncates the address. The
 * cost is unchanged and still cuts the wrong way: without client storage GA4
 * mints a new client id per visit, so "Users" drifts toward "sessions" and is
 * INFLATED. Do not quote GA4's Users figure on an affiliate application; use
 * Cloudflare Web Analytics for any visitor number.
 *
 * ON WITHDRAWAL: a script already on the page cannot be unloaded, so a
 * mid-visit "decline" sets Google's own documented kill switch
 * (`window['ga-disable-<ID>'] = true`), which stops every further hit. On the
 * next page load nothing is loaded at all.
 */
export function GoogleAnalytics() {
  const id = gaMeasurementId();
  const [consent, setConsent] = useState<ConsentChoice | null>(null);

  useEffect(() => {
    setConsent(effectiveConsent());
    const onChange = (event: Event) => {
      const choice = (event as CustomEvent<ConsentChoice>).detail;
      setConsent(choice);
      if (id && choice === "denied") {
        (window as unknown as Record<string, unknown>)[`ga-disable-${id}`] = true;
      }
      if (id && choice === "granted") {
        (window as unknown as Record<string, unknown>)[`ga-disable-${id}`] = false;
      }
    };
    window.addEventListener(CONSENT_CHANGE_EVENT, onChange);
    return () => window.removeEventListener(CONSENT_CHANGE_EVENT, onChange);
  }, [id]);

  if (!id || consent !== "granted") return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${id}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${id}', {
            client_storage: 'none',
            anonymize_ip: true
          });`}
      </Script>
    </>
  );
}
