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
/**
 * RUNS COOKIELESS, DELIBERATELY (2026-08-27).
 *
 * `client_storage: 'none'` stops GA4 writing the `_ga` cookie, and
 * `anonymize_ip` truncates the address before storage. Together they take the
 * site out of the category that needs consent: Turkey's KVKK, like the EU's
 * ePrivacy rules, keys the consent requirement on *storing or accessing
 * information on the user's device*, not on analytics as such. No cookie
 * written means no consent banner, and `/privacy` can state that plainly
 * rather than resting on a "legitimate interest" claim that a regulator may
 * not accept for analytics cookies.
 *
 * THE COST, STATED PLAINLY BECAUSE IT CUTS THE WRONG WAY:
 * without client-side storage GA4 cannot recognise a returning visitor, so it
 * mints a new client id per visit. "Users" therefore drifts toward "sessions"
 * and the number is INFLATED, not deflated. That matters here specifically,
 * because the whole reason analytics was switched on is to answer "monthly
 * unique visitors" on an affiliate application - and this error runs in the
 * direction that flatters us.
 *
 * So do not quote GA4's Users figure to Awin. Cloudflare Web Analytics is
 * already available on this account, is cookieless by design, and derives
 * visitor counts server-side without the same inflation - use that for any
 * number that goes on an application, and treat GA4 here as what it is: a
 * shape-of-traffic tool (which pages, which sources, which trend).
 *
 * To revert to cookie-based GA4, remove the two flags AND add a consent
 * banner in the same change - the flags are what make the missing banner
 * lawful, so removing them alone silently creates the exposure.
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
          gtag('config', '${id}', {
            client_storage: 'none',
            anonymize_ip: true
          });`}
      </Script>
    </>
  );
}
