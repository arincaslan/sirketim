import Script from "next/script";

/**
 * Shared affiliate-site-kit: GA4 wiring, env-var-gated so it's inert
 * (renders nothing) with no real ID set. Mount once in the site's root
 * app/layout.tsx. See the technical plan §4.
 *
 * Search Console verification uses the HTML meta-tag method instead of a
 * component - set `verification: { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION }`
 * in the site's root `metadata` export (Next's Metadata type supports this
 * natively). Empty/undefined env var means Next omits the tag entirely.
 */
export function GoogleAnalytics() {
  const id = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (!id) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${id}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${id}');`}
      </Script>
    </>
  );
}
