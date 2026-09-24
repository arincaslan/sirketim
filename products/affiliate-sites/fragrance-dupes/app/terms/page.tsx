import type { Metadata } from "next";

import { PRODUCER_CONSOLE } from "@/lib/site";

/**
 * Terms of service. Published 2026-09-24.
 *
 * WHY THIS PAGE EXISTS AT ALL, AND WHY IT IS ON THIS DOMAIN
 *
 * Paddle's domain review requires "Terms and Conditions, Refund Policy, and
 * Privacy Policy ... clearly accessible via navigation on your website", and
 * separately requires the company name to appear IN the Terms & Conditions
 * ("legal name preferred"). Without these three in the footer the domain is
 * rejected, and a rejected domain is a 5-7 business day round trip. That is
 * the immediate reason; the durable reason is that we are about to take money
 * from businesses and had no published terms of any kind.
 *
 * It lives on counterscent.com rather than on the console because the pricing
 * page, the programme description and the public catalogue are all here, so
 * Paddle sees one domain that carries the whole story. Founder decision,
 * 2026-09-24.
 *
 * ---
 *
 * THIS IS DERIVED FROM PRODUCER-TERMS.md, WHICH IS THE CANONICAL TEXT.
 *
 * That file is longer and states the mechanisms in more detail. When the two
 * disagree, the repo file is the one that was written against the code, and
 * the fix is to change BOTH in the same commit. A published term we do not
 * actually enforce is worse than no term - which is PRODUCER-TERMS.md's own
 * warning, and it applies twice as hard once the text is live.
 *
 * NOT REVIEWED BY A LAWYER. PRODUCER-TERMS.md flags two clauses in particular
 * as needing a professional eye - governing law (a Türkiye-based A.Ş.
 * contracting with businesses mostly in the United States) and the data
 * section. Publishing this does not resolve either; it makes resolving them
 * more urgent, because the text now binds people.
 *
 * ---
 *
 * REFUNDS ARE ON THEIR OWN PAGE, ON THE CONSOLE, NOT A SECTION HERE.
 *
 * Paddle checks for a refund policy as a distinct, navigable item, and nobody
 * looking for a refund reads a terms page to find one. It was briefly at
 * /refunds on this site and the founder moved it the same day: the console is
 * the only origin where a subscription can be bought, so a refund policy here
 * would describe a transaction that does not happen on the site carrying it.
 * See counterscent-producers/src/routes/refunds.ts. The site footer still
 * links to it, so it is reachable by navigation from both origins.
 */
export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms that apply to using Counterscent and to holding a producer account.",
  alternates: { canonical: "/terms" },
};

const UPDATED = "24 September 2026";

export default function TermsPage() {
  return (
    <div className="container max-w-2xl py-14 sm:py-16">
      <h1 className="font-display text-fluid-h1">Terms of service</h1>
      <p className="mt-3 text-sm text-muted-foreground">Last updated {UPDATED}</p>

      <div className="prose prose-lg mt-8 max-w-none">
        <p>
          Counterscent (&ldquo;the Site&rdquo;) is operated by{" "}
          <strong>Sirketim A.Ş.</strong>, a company established in Türkiye
          (&ldquo;we&rdquo;, &ldquo;us&rdquo;). These terms cover two different
          things: using the Site as a reader, and holding a producer account.
          Most of this page is about the second.
        </p>

        <h2>1. Reading the Site</h2>
        <p>
          The catalogue is free and needs no account. What it publishes is our
          own editorial comparison between designer fragrances and the
          lower-cost fragrances inspired by them, computed by a published
          formula that is set out on{" "}
          <a href="/about#methodology">our standards page</a>.
        </p>
        <p>
          <strong>It is opinion and analysis, not a guarantee.</strong> A match
          score describes how close two declared note pyramids are. It does not
          promise that you will find two fragrances alike, and it is not advice
          about what to buy. Prices, availability and formulations change
          without us being told.
        </p>
        <p>
          We are not connected with, endorsed by, or acting for any fragrance
          house named on the Site. Brand names are used to identify the
          products being compared. Some outbound links earn us a commission
          &mdash; see our <a href="/disclosure/">affiliate disclosure</a>. We do
          not take payment from any brand to appear in the catalogue or to rank
          anywhere in it.
        </p>

        <h2>2. Producer accounts &mdash; what the service is</h2>
        <p>
          A producer account lets a business submit fragrances it makes or
          sells to the catalogue, keep a listing up to date, and withdraw it. A
          published submission (&ldquo;a listing&rdquo;) appears in the Dupe
          Finder and on the page of the original it is compared against,
          presented exactly like every other listing &mdash; the same card, the
          same ranking, the same formula.
        </p>
        <p>
          <strong>
            The service is the account and the listing tool. It is not
            advertising and it is not placement.
          </strong>{" "}
          It carries no undertaking about traffic, clicks, sales, or where a
          listing will rank.
        </p>

        <h2>3. Who may hold an account</h2>
        <p>
          You may hold an account if you are a business that makes or sells the
          fragrance you are listing and can be contacted at a real address. The
          programme is business-to-business; it is not open to consumers and an
          account may not be opened by a private individual.
        </p>
        <p>
          You must list under your own trading identity.{" "}
          <strong>
            You may not open an account in the name of a company you do not
            control.
          </strong>{" "}
          The Site names a number of fragrance houses that have no relationship
          with us, and taking one of those identities is a misrepresentation of
          a real business. We enforce this technically as well as
          contractually.
        </p>

        <h2>4. What you provide, and what we write</h2>
        <p>
          <strong>You provide:</strong> which original your product is an
          alternative to, chosen from our existing catalogue; your product&apos;s
          name, price, bottle size and concentration; its note pyramid as top,
          heart and base; a plain statement of what is genuinely different from
          the original; a link to the product on your own store; and a
          photograph of the product.
        </p>
        <p>
          <strong>You cannot add an original.</strong> The comparison is
          computed against a note pyramid we researched. If the fragrance yours
          is inspired by is not already in our catalogue, your listing cannot be
          scored until we add it, and we do not commit to a date for that.
        </p>
        <p>
          <strong>We write everything else</strong> &mdash; the six profile
          scores, the verdict describing how your fragrance compares, and the
          match score. The verdict is written in our voice, it will say where
          your product falls short as well as where it succeeds, and you do not
          have approval over it. The match score is computed by the published
          formula. It is not negotiable and it is not for sale.
        </p>

        <h2>5. Review and publication</h2>
        <p>
          Every submission is reviewed by a person before it is published.
          Nothing is approved automatically. Automated checks may reject a
          submission or weaken a claim on it; no automated process may approve
          one or make a claim about it stronger.
        </p>
        <p>
          <strong>&ldquo;Approved&rdquo; and &ldquo;live&rdquo; are different
          states.</strong> The public catalogue is a static site rebuilt to
          publish changes, so an approved listing goes live at the next build
          rather than immediately. The console shows both states separately. We
          do not offer a review time or a publication cadence, and you should
          not read one into this page.
        </p>
        <p>
          We may reject a submission and we will give you the reason. The
          common reasons are: the original is not in our catalogue; the
          declared data cannot be reconciled with your own public product page;
          the link fails our checks; or the submission restates the
          original&apos;s own note pyramid.
        </p>

        <h2>6. The product photograph</h2>
        <p>
          A photograph is required and a listing cannot publish without one. By
          uploading it you confirm that you own it or hold the rights to
          license it, that it shows the actual product being listed, and that
          publishing it infringes nobody&apos;s rights. You grant us a
          non-exclusive, worldwide, royalty-free licence to display, resize and
          cache it in connection with your listing and with the Site&apos;s own
          promotion of the catalogue, for as long as the listing is published
          and for as long afterwards as copies remain in caches and archives
          outside our control.
        </p>
        <p>
          We will not alter your photograph beyond resizing and format
          conversion, and we will not generate or retouch a product image for
          anyone. If you tell us you no longer hold the rights to an image, we
          remove it and the listing with it.
        </p>

        <h2>7. Accuracy, and the pyramid rule</h2>
        <p>
          Everything you submit is your own statement about your own product
          and is published as such. You are responsible for it being true.
        </p>
        <p>
          <strong>A note pyramid counts as yours only if you publish it too.</strong>{" "}
          If the same top/heart/base split is published where your own buyers
          can see it, we record it as declared. If it appears nowhere but here,
          the listing is scored as though we had inferred the split, which
          carries a documented penalty. That is not a judgement about you: what
          you tell us and what you tell every buyer are different kinds of
          claim, and only one is checkable by a reader.
        </p>
        <p>
          A submission that simply restates the original&apos;s own pyramid will
          not be published &mdash; the formula would read it as a near-perfect
          match and it is not one. You may not describe your product in a way
          that suggests the original&apos;s house made it, endorsed it, or is
          connected with it.
        </p>

        <h2>8. Your link</h2>
        <p>
          Your listing links to the product on your own store domain, recorded
          on your account. It must be https, must not carry credentials, and{" "}
          <strong>
            must not be an affiliate, tracking or shortened link
          </strong>{" "}
          &mdash; not your own network&apos;s and not a third party&apos;s. A
          link whose destination can be changed after approval is not a link we
          can publish. Tell us before you move domains; we will update it, and
          we will not follow a redirect we were not told about.
        </p>

        <h2>9. What no plan buys</h2>
        <p>
          No plan, tier or payment buys a better match score, a higher rank,
          placement, or a more favourable verdict. This is enforced in the code
          and not only promised: the modules that compute and order scores are
          barred from importing anything that knows what you pay, and the build
          fails if that changes.
        </p>
        <p>
          <strong>
            We take no commission on your sales, on any tier, including the free
            one.
          </strong>{" "}
          Your listing links straight to your own store. We have no financial
          interest in where it ranks or how much traffic it gets, and that is
          deliberate &mdash; it is what makes the paragraph above worth
          anything. A subscription, where you have one, is the only thing you
          ever pay us. A paid tier may buy priority in the review queue, which
          affects how quickly we look at a submission and nothing about where it
          lands.
        </p>

        <h2>10. Taking a listing down, and what we keep</h2>
        <p>
          You may take a listing down at any time &mdash; from the console on a
          paid plan, or by writing to us on the free plan. We do not ask for a
          reason and we do not delay it. Withdrawal takes the listing out of
          the catalogue at the next build and stops its link resolving.
        </p>
        <p>
          <strong>Withdrawal is a change of state, not a deletion.</strong> We
          retain the listing&apos;s history &mdash; what was submitted, what was
          published, when, and the click record attached to it &mdash; because a
          dispute or a rights complaint can arrive weeks after a listing comes
          down, and a record that can be erased by the party it describes is not
          a record. We do not reuse a withdrawn listing&apos;s link identifier.
        </p>
        <p>
          We may also remove a listing ourselves, for a breach of these terms,
          a rights complaint, data we cannot reconcile, or a closed account. We
          will tell you which. You may resubmit a withdrawn product; where a
          product is withdrawn and resubmitted against the same original with
          different declared data we look at both side by side, and a pattern of
          withdrawing after a low score and resubmitting with a friendlier
          pyramid is a reason to refuse a listing.
        </p>

        <h2>11. Fees and billing</h2>
        <p>
          The free tier is open. <strong>Paid tiers are not open yet</strong>{" "}
          and no payment can currently be taken; prices shown on the Site are
          indicative and are not an offer until they are.
        </p>
        <p>
          When paid tiers open, subscriptions are sold through a{" "}
          <strong>merchant of record</strong>. That means your contract for the
          payment itself is with that company and your invoice comes from them,
          not from us, and they add whatever sales tax or VAT applies where you
          are. Fees are stated exclusive of it.
        </p>
        <p>
          Subscriptions renew automatically until cancelled. Cancellation,
          refunds and what happens when a payment fails are set out on our{" "}
          <a href={`${PRODUCER_CONSOLE}/refunds`}>
            refund and cancellation policy
          </a>
          , on the producer console.
        </p>
        <p>
          We may change prices. Existing subscribers are given notice before a
          change applies to them and may cancel instead.
        </p>

        <h2>12. Suspension and closing an account</h2>
        <p>
          You can close your account whenever you like; your listings come down
          at the next build. We may suspend or close an account for a serious or
          repeated breach of these terms &mdash; in particular for
          misrepresenting whose product a listing is, for supplying data that
          contradicts your own public product page, for rights complaints we
          cannot resolve, or for attempting to manipulate any ranking or
          counting mechanism on the Site. Where the breach is fixable we will
          say what would fix it first.
        </p>

        <h2>13. Data</h2>
        <p>
          We hold your account details, what you submit, and the record
          described in section 10. We use them to run the programme and for
          nothing else, and we do not sell them. We are established in Türkiye
          and process personal data under Turkish data protection law (KVKK).
          If you are established somewhere whose own law applies to this
          processing, the data-protection terms that law requires are added
          before your account is opened rather than assumed away here. See our{" "}
          <a href="/privacy/">privacy policy</a>.
        </p>
        <p>
          The public catalogue is deliberately cookieless and its analytics do
          not identify visitors. That is a property of the catalogue, not a
          promise about the producer console, which necessarily knows who is
          signed in.
        </p>

        <h2>14. Liability</h2>
        <p>
          We provide the Site and the producer programme as they are. We do not
          warrant that the Site will be uninterrupted, that a listing will be
          published by any particular date, or that it will produce any traffic
          or sales.
        </p>
        <p>
          Nothing here excludes liability that cannot lawfully be excluded.
          Subject to that, and because this is a business-to-business
          arrangement, we are not liable for loss of profit, revenue, business
          or data, and our total liability to you for any claim is limited to
          what you paid us in the twelve months before it arose. On the free
          tier that figure is zero, which is the honest consequence of the tier
          being free.
        </p>

        <h2>15. Changes, and which law applies</h2>
        <p>
          We may change these terms. Material changes are notified to account
          holders before they take effect, and continuing to use an account
          after that is acceptance. The date at the top of this page is the
          version in force.
        </p>
        <p>
          These terms are governed by Turkish law, and the courts of Istanbul
          have jurisdiction. If you are a business established elsewhere, any
          mandatory protection of your own country&apos;s law that cannot be
          contracted out of still applies to you.
        </p>

        <h2>16. Contact</h2>
        <p>
          Sirketim A.Ş., Türkiye. Questions about these terms go to{" "}
          <a href="/contact/">our contact page</a>.
        </p>
      </div>
    </div>
  );
}
