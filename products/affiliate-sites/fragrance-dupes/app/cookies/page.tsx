import { LegalPage, legalMetadata } from "@/components/legal/legal-page";
import { CONTACT_EMAIL, LEGAL_ENTITY } from "@/lib/site";

/**
 * Cookie policy - English. Turkish counterpart: app/tr/cerez-politikasi/page.tsx.
 * CHANGE BOTH IN ONE COMMIT and keep UPDATED equal.
 *
 * Created 2026-11-01 with the consent banner. Every row in the tables is a
 * real name in the code: `counterscent-theme` (components/site/theme-toggle.tsx),
 * `counterscent-consent` (lib/consent.ts), `__Host-session` and `__Host-oauth`
 * (counterscent-producers/src/lib/auth.ts and src/lib/oauth.ts). Add a row in
 * the same change that adds a cookie or storage key, or this page is false.
 */
export const metadata = legalMetadata({
  lang: "en",
  title: "Cookie Policy",
  description:
    "Every cookie and browser-storage entry Counterscent uses, why, for how long, and how to change your choice.",
  en: "/cookies/",
  tr: "/tr/cerez-politikasi/",
});

const UPDATED = "1 November 2026";

export default function CookiesPage() {
  return (
    <LegalPage lang="en" title="Cookie policy" updated={UPDATED} counterpart="/tr/cerez-politikasi/">
      <p>
        This policy covers counterscent.com and producers.counterscent.com, operated by {LEGAL_ENTITY}.
        It lists everything we store in your browser. How we handle personal data in general is in the{" "}
        <a href="/privacy/">privacy policy</a>.
      </p>

      <h2>1. The short version</h2>
      <p>
        The catalogue sets no cookies of its own. It keeps two small preferences in your browser&apos;s
        local storage. Analytics runs only if you allow it, and even then it writes no cookie. The
        producer console uses only the cookies needed to keep you signed in.
      </p>

      <h2>2. The catalogue (counterscent.com)</h2>
      <div className="not-prose overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 pr-4 font-semibold">Name</th>
              <th className="py-2 pr-4 font-semibold">Type</th>
              <th className="py-2 pr-4 font-semibold">Purpose</th>
              <th className="py-2 font-semibold">Kept</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border/60 align-top">
              <td className="py-2 pr-4 font-mono text-xs">counterscent-consent</td>
              <td className="py-2 pr-4">Local storage, strictly necessary</td>
              <td className="py-2 pr-4">Remembers whether you allowed or declined analytics, so we can honour it.</td>
              <td className="py-2">Until you clear it or change your choice</td>
            </tr>
            <tr className="border-b border-border/60 align-top">
              <td className="py-2 pr-4 font-mono text-xs">counterscent-theme</td>
              <td className="py-2 pr-4">Local storage, preference</td>
              <td className="py-2 pr-4">Remembers the light or dark theme you picked.</td>
              <td className="py-2">Until you clear it</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>Neither entry is ever sent to us or to anyone else.</p>
      <p>
        <strong>Google Analytics 4, only with your consent.</strong> If you choose &ldquo;Allow
        analytics&rdquo;, your browser loads Google&apos;s analytics script, configured so that it
        writes <em>no</em> cookie and keeps no identifier on your device. It still sends Google the page
        you viewed, the site you came from, your browser and device type and your approximate region.
        If you decline or do not choose, the script is never loaded. A browser that sends Global Privacy
        Control is treated as having declined.
      </p>
      <p>
        <strong>Our host&apos;s security cookies.</strong> Cloudflare, which serves the site, may set a
        strictly necessary security cookie (such as <code>__cf_bm</code>) when it needs to tell people
        from automated traffic. It does not track you across sites.
      </p>

      <h2>3. The producer console (producers.counterscent.com)</h2>
      <div className="not-prose overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 pr-4 font-semibold">Name</th>
              <th className="py-2 pr-4 font-semibold">Type</th>
              <th className="py-2 pr-4 font-semibold">Purpose</th>
              <th className="py-2 font-semibold">Kept</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border/60 align-top">
              <td className="py-2 pr-4 font-mono text-xs">__Host-session</td>
              <td className="py-2 pr-4">Cookie, strictly necessary</td>
              <td className="py-2 pr-4">Keeps you signed in. Secure, HttpOnly, sent only to this site.</td>
              <td className="py-2">Up to 30 days, or until you sign out</td>
            </tr>
            <tr className="border-b border-border/60 align-top">
              <td className="py-2 pr-4 font-mono text-xs">__Host-oauth</td>
              <td className="py-2 pr-4">Cookie, strictly necessary</td>
              <td className="py-2 pr-4">Protects a &ldquo;Continue with Google&rdquo; sign-in while it is in progress.</td>
              <td className="py-2">10 minutes</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        Strictly necessary cookies need no consent: without them you could not sign in. The console runs
        no analytics.
      </p>

      <h2>4. After you leave our site</h2>
      <p>
        When you follow a &ldquo;buy&rdquo; link, you pass through an affiliate network (Awin or CJ) to a
        retailer. They may set their own cookies on their own sites, for example to credit the referral,
        under their own cookie policies. We do not control or receive those cookies.
      </p>

      <h2>5. Changing your choice</h2>
      <p>
        Use <strong>&ldquo;Cookie settings&rdquo;</strong> at the bottom of any page to change your
        analytics choice at any time; a withdrawal stops measurement immediately. You can also clear
        local storage and cookies in your browser&apos;s settings. Questions:{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
      <p>
        This policy is also published in{" "}
        <a href="/tr/cerez-politikasi/" hrefLang="tr">
          Turkish
        </a>
        ; for people in Türkiye the Turkish text prevails.
      </p>
    </LegalPage>
  );
}
