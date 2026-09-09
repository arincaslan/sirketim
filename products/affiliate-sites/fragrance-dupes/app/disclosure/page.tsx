import type { Metadata } from "next";
import { getLiveMerchants } from "@/lib/merchants";

export const metadata: Metadata = {
  title: "Affiliate Disclosure",
  description: "How Counterscent discloses affiliate relationships, in full, per FTC guidance.",
};

export default function DisclosurePage() {
  const merchants = getLiveMerchants();

  return (
    <div className="container max-w-2xl py-14 sm:py-16">
      <h1 className="font-display text-fluid-h1">Affiliate disclosure</h1>

      <div className="prose prose-lg mt-8 max-w-none">
        <p>
          Counterscent participates in affiliate marketing programs. This means
          that when you click certain links on this site and make a
          purchase, we may earn a commission from the retailer. This comes
          at no additional cost to you.
        </p>
        <p>
          In line with the U.S. Federal Trade Commission&apos;s guidance on
          endorsements and testimonials (16 CFR Part 255), we&apos;re
          disclosing this relationship clearly, both here and inline on any
          page that carries an affiliate link.
        </p>
        <h2>What this does not change</h2>
        <p>
          Commission rate is never a factor in our similarity formula (see{" "}
          <a href="/about#methodology">Our Standards</a>) or in which
          candidate we rank first. A lower-commission or non-affiliate
          product can and does outrank a higher-commission one when the data
          says so.
        </p>
        <h2>Product access</h2>
        <p>
          We do not accept free product, payment, or placement from brands in
          exchange for a rating or a rank, and we never will.
        </p>
        <p>
          We are also explicit about the limits of that. Where a fragrance
          house or a dupe producer supplies its own specification, that is
          what it is &mdash; a supplier&apos;s claim, restated by us and
          scored by our formula, not an independent measurement. Listings say
          which they are, and a producer that simply copies an
          original&apos;s specification back to us is not published at all.
        </p>
        <h2>Who we earn from</h2>
        <p>
          We are enrolled with the retailers below and may earn a commission on a
          purchase made through a link on this site. They are retailers, not
          partners or sponsors: none of them has reviewed, approved or endorsed
          anything here, and we do not act on their behalf.
        </p>
        <ul>
          {merchants.map((m) => (
            <li key={m.id}>
              <strong>{m.name}</strong> &mdash;{" "}
              {m.side === "dupe"
                ? "sells alternatives, linked from listings"
                : "sells the original designer bottles"}{" "}
              ({m.network === "cj" ? "CJ" : "Awin"} advertiser {m.id})
            </li>
          ))}
        </ul>
        <p>
          That list is generated from the links this build actually ships, not
          maintained by hand, so a programme we are enrolled with but cannot earn
          from does not appear on it. A buy button does not render at all unless
          its link resolves to a real, enrolled merchant &mdash; there are no
          placeholder affiliate links anywhere on this site.
        </p>
        <p>
          We link both sides of the same comparison and earn from both, which is
          the arrangement most likely to look like a conflict, so it is worth
          stating plainly: the retailer is chosen after the ranking, never before
          it. Nothing about who pays us enters the similarity formula.
        </p>
      </div>
    </div>
  );
}
