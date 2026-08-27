import type { Metadata } from "next";

/**
 * Required before any affiliate-network application (they check for it) and
 * before GA4 is switched on at all - Turkish KVKK and EU GDPR both require a
 * published notice before analytics collection begins, not after.
 *
 * Everything below describes what this site ACTUALLY does today. There is no
 * database, no accounts, no newsletter, no ad network, and no cookie banner,
 * because there is nothing yet that would need one. Update this page in the
 * same change that adds any of them - a privacy policy describing a site you
 * no longer run is worse than none.
 */
export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "What Counterscent collects, what it does not, and who processes data on our behalf.",
};

const UPDATED = "27 August 2026";

export default function PrivacyPage() {
  return (
    <div className="container max-w-2xl py-14 sm:py-16">
      <h1 className="font-display text-fluid-h1">Privacy policy</h1>
      <p className="mt-3 text-sm text-muted-foreground">Last updated {UPDATED}</p>

      <div className="prose prose-lg mt-8 max-w-none">
        <p>
          Counterscent is operated by Sirketim, a company registered in Türkiye.
          This page explains what happens to information when you visit this
          site. It describes what the site does today, not what it might do
          later; if that changes, this page changes in the same update.
        </p>

        <h2>The short version</h2>
        <p>
          We do not ask you for your name, your email address, or your
          payment details, because there is nothing on this site that needs
          them. There are no user accounts, no newsletter, and no shopping
          cart. We do not sell or share personal data with anyone.
        </p>

        <h2>What we collect</h2>
        <p>
          <strong>Analytics.</strong> We use Google
          Analytics 4 to count visits and see which pages people read. It
          records things like the page you viewed, your approximate region,
          your browser and device type, and the site you arrived from. IP
          addresses are anonymised by Google before they reach us. We use this
          only to understand what is worth writing more of. Our lawful basis
          is legitimate interest in understanding site usage, and you can opt
          out at any time using Google&apos;s own{" "}
          <a
            href="https://tools.google.com/dlpage/gaoptout"
            rel="noopener noreferrer"
            target="_blank"
          >
            opt-out browser add-on
          </a>{" "}
          or your browser&apos;s &ldquo;do not track&rdquo; setting.
        </p>
        <p>
          <strong>Server logs.</strong> Our hosting provider records standard
          request logs, including IP address and user agent, for security and
          reliability. We do not use these for tracking.
        </p>
        <p>
          <strong>Preferences stored on your own device.</strong> Some pages
          remember small things locally in your browser, such as a chosen
          filter. That information stays on your device and is never sent to
          us.
        </p>

        <h2>What we do not collect</h2>
        <p>
          No accounts, no passwords, no payment information, no newsletter
          list, no advertising or retargeting pixels, no profiling, and no
          automated decision-making about you. We do not knowingly collect
          anything from children under 16.
        </p>

        <h2>Affiliate links</h2>
        <p>
          Some outbound links are affiliate links, and we may earn a
          commission if you buy through them &mdash; see our{" "}
          <a href="/disclosure">affiliate disclosure</a>. When you follow one,
          the retailer may set its own cookie to credit the referral. That
          cookie is set by them, under their privacy policy, not ours. We
          never receive your order details, your payment information, or your
          identity from a retailer; at most we see that an anonymous referral
          converted.
        </p>

        <h2>Who processes data for us</h2>
        <ul>
          <li>
            <strong>Our hosting provider</strong> &mdash; serves the site and
            keeps request logs.
          </li>
          <li>
            <strong>Google Analytics 4</strong> &mdash; usage measurement,
            active since 27 August 2026.
          </li>
          <li>
            <strong>Google Fonts</strong> &mdash; typefaces are served from
            Google&apos;s font hosts, which means your browser makes a request
            to them when loading a page.
          </li>
        </ul>
        <p>
          Some of these providers are based outside Türkiye and the European
          Economic Area, so data may be processed abroad under those
          providers&apos; own safeguards and standard contractual clauses.
        </p>

        <h2>How long we keep things</h2>
        <p>
          Analytics data is retained according to our Google Analytics
          configuration, which is set to the shortest practical period. Server
          logs are kept only as long as our hosting provider retains them.
          Because we hold no accounts, there is no stored profile to delete.
        </p>

        <h2>Your rights</h2>
        <p>
          Under Türkiye&apos;s KVKK (Law No. 6698) and, where it applies, the
          EU GDPR, you may request access to any personal data we hold about
          you, ask for it to be corrected or erased, object to processing, or
          lodge a complaint with your data protection authority. In practice
          we hold no information that identifies you personally, so most
          requests will be answered by telling you exactly that.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about this policy, or a request about your data, can go to{" "}
          <a href="/contact">our contact page</a>.
        </p>
      </div>
    </div>
  );
}
