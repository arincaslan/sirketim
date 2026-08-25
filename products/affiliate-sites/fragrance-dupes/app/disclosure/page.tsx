import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Affiliate Disclosure",
  description: "How Drydown discloses affiliate relationships, in full, per FTC guidance.",
};

export default function DisclosurePage() {
  return (
    <div className="container max-w-2xl py-14 sm:py-16">
      <h1 className="font-display text-fluid-h1">Affiliate disclosure</h1>

      <div className="prose prose-lg mt-8 max-w-none">
        <p>
          Drydown participates in affiliate marketing programs. This means
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
          Ratings are based on bottles purchased at retail. We do not accept
          free product from brands in exchange for a rating or placement.
        </p>
        <h2>No active program yet</h2>
        <p>
          As of this build, Drydown has not enrolled in any affiliate
          program. Every outbound link on this site currently points to a
          clearly marked placeholder destination, not a live merchant. This
          page describes the policy that will govern real links once a
          program exists.
        </p>
      </div>
    </div>
  );
}
