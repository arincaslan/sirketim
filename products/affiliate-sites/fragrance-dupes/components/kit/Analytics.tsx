import Script from "next/script";
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
 * apex, www, http and https at once and needs no rebuild. The
 * `NEXT_PUBLIC_GSC_VERIFICATION` meta-tag path in app/layout.tsx is the
 * fallback for hosts where DNS is not ours to edit; it is unused here.
 */
export function GoogleAnalytics() {
  const id = gaMeasurementId();
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
