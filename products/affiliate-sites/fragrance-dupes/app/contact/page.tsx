import type { Metadata } from "next";
import { CONTACT_EMAIL } from "@/lib/site";

/**
 * Affiliate managers reply to whatever address is on this page. A contact
 * page that goes nowhere reads as a dead site and is a common silent reason
 * for a merchant application to be declined, so this must resolve to an inbox
 * somebody actually watches before any application is filed.
 *
 * The address is contact@counterscent.com, live since 2026-08-27 and defined in
 * lib/site.ts. It is a constant rather than an env var precisely because a
 * forgotten deployment setting would make this page say "contact is not open
 * yet" in production, which is worse than any of the alternatives.
 *
 * There is no contact FORM here on purpose: a form needs a backend to receive
 * it, and none exists. A form that silently discards what someone typed is
 * the failure this project explicitly refuses to ship.
 */
export const metadata: Metadata = {
  title: "Contact",
  description: "How to reach the team behind Counterscent.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="container max-w-2xl py-14 sm:py-16">
      <h1 className="font-display text-fluid-h1">Contact</h1>

      <div className="prose prose-lg mt-8 max-w-none">
        <p>
          Counterscent is published by Sirketim, a company registered in Türkiye.
        </p>

        <p>
          The fastest way to reach us is email:{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. We read
          everything and reply to most things within a few working days.
        </p>

        <h2>Corrections</h2>
        <p>
          If a price, a note list, or a product detail on this site is wrong,
          tell us and we will fix it. Accuracy is the entire value of a
          comparison site, and an outdated price quietly turns a genuine
          &ldquo;cheaper per ml&rdquo; claim into a misleading one. Corrections
          get priority over everything else.
        </p>

        <h2>Fragrance houses and dupe producers</h2>
        <p>
          If you make fragrances and want your products listed, start at{" "}
          <a href="/producers">the producer programme</a>. Listings are scored
          by the same published formula as everyone else, and no plan buys
          rank, score, or placement &mdash; see{" "}
          <a href="/about#methodology">our standards</a>.
        </p>
        <p>
          If something we have published about your product is inaccurate,
          contact us and we will correct or remove it.
        </p>

        <h2>Press and partnerships</h2>
        <p>
          Same address, and please say which it is in the subject line. Our{" "}
          <a href="/disclosure">affiliate disclosure</a> and{" "}
          <a href="/privacy">privacy policy</a> answer most commercial
          questions before you have to ask them.
        </p>
      </div>
    </div>
  );
}
