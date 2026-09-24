import { html } from "../lib/html";
import { layout } from "../ui/layout";
import { section } from "../ui/components";

/**
 * The refund and cancellation policy, on the origin where the subscription is
 * actually bought.
 *
 * WHY IT IS HERE AND NOT ON THE CATALOGUE. It was written on the catalogue
 * first (app/refunds/page.tsx, 2026-09-24) and the founder moved it the same
 * day: "refunds kısmı bence consoleda olmalı". That is the right call. Nothing
 * on counterscent.com can be bought, so a refund policy there is a document
 * about a transaction that does not happen on the page carrying it. The person
 * who needs this is signed in here, looking at a plan.
 *
 * THE CATALOGUE STILL LINKS TO IT, from the site footer, pointing at this URL.
 * That is not redundancy - a merchant-of-record domain review requires the
 * refund policy to be "clearly accessible via navigation" on the domain
 * submitted, and both origins may be submitted. One canonical page, linked
 * from both navigations, satisfies that without two copies to drift.
 *
 * UNAUTHENTICATED ON PURPOSE. A reviewer at the payment provider has no
 * account here, and a policy you must sign in to read is not published. It
 * takes no session, reads no database, and is in the plain ROUTES table rather
 * than behind any gate.
 *
 * NOTE THE ORIGIN IS `noindex` (see src/ui/layout.ts and the X-Robots-Tag in
 * src/lib/http.ts). That is correct for a console and harmless here - the
 * people who need this arrive by link, not by search - but it does mean this
 * page will not appear in a search for "counterscent refund policy". If that
 * ever matters, the fix is a canonical copy on the catalogue, not removing
 * noindex from a console.
 *
 * ---
 *
 * THE WINDOW IS 14 DAYS AND THAT IS SHORTER THAN PADDLE EXPECTS.
 *
 * Paddle's seller guidance is that sellers are "expected to have at least a
 * 30-day money-back guarantee as part of their refund policy". The founder
 * chose 14 on 2026-09-24 after that was stated, so it is a decision and not an
 * oversight - recorded here because it is the single most likely thing for a
 * reviewer to come back on, and whoever fields that reply needs to know. The
 * change, if it is ever made, is one number here and one in
 * ../../fragrance-dupes/PRODUCER-TERMS.md §11.
 *
 * Paddle, as merchant of record, runs its own buyer refund process and can
 * approve a refund on its own assessment. This page states what WE undertake.
 * It cannot bind the merchant of record to refuse one.
 *
 * ---
 *
 * PRODUCER-TERMS.md §11 IS THE CANONICAL TEXT. Change both in the same commit
 * or they drift, and the published one is what a producer relies on.
 */
export function refunds() {
  return layout({
    title: "Refund and cancellation policy",
    heading: "Refund and cancellation policy",
    showBackLink: false,
    standfirst: html`Last updated 24 September 2026. This applies to producer
      subscriptions on Counterscent, operated by <strong>Sirketim A.Ş.</strong>,
      a company established in Türkiye. It sits alongside the
      <a href="https://counterscent.com/terms/">terms of service</a>.`,
    body: html`
      ${section({
        heading: "The short version",
        body: html`
          <p class="muted">
            <strong>The free tier is free.</strong> There is nothing to cancel
            and nothing to refund. Everything below is about the paid tiers.
          </p>
          <ul class="plain-list">
            <li>
              <strong>14 days to change your mind</strong> on a new
              subscription, for any reason or none.
            </li>
            <li>
              <strong>Cancel whenever you like</strong>, from inside your
              account, with no notice period and nobody to talk to first.
            </li>
            <li>
              <strong>Cancelling is not deleting.</strong> Your listings and
              their history are kept, and republish if you come back.
            </li>
          </ul>
        `,
      })}
      ${section({
        heading: "The 14-day guarantee",
        body: html`
          <p>
            If you are unhappy with a producer subscription, tell us within
            <strong>14 days of the first payment</strong> and we refund it in
            full. You do not have to give a reason, and we will not ask you to
            sit through one being talked out of.
          </p>
          <p>
            The same 14-day window applies to an
            <strong>annual renewal charge</strong>. An annual renewal is a large
            single payment and it is reasonable to have a moment to reconsider
            it.
          </p>
        `,
      })}
      ${section({
        heading: "Renewals",
        body: html`
          <p>
            Subscriptions renew automatically until you cancel. Cancellation
            takes effect at the end of the period you have already paid for —
            you keep everything the plan gives you until then, and you are not
            charged again.
          </p>
          <p>
            <strong>Outside the windows above we do not refund part-periods.</strong>
            On a monthly plan, cancelling in the middle of a month ends the
            subscription at the end of that month rather than refunding the
            remainder. If you know you do not want the next month, cancel before
            it renews and nothing is taken.
          </p>
          <p class="muted">
            This does not affect any right you have under the law where your
            business is established that cannot be contracted out of.
          </p>
        `,
      })}
      ${section({
        heading: "How to cancel",
        body: html`
          <p>
            Cancel from the billing section of this console. It takes effect
            immediately as an instruction; the subscription itself ends at the
            end of the paid period, and the console shows you that date.
          </p>
          <p>
            If you cannot reach the console for any reason, write to
            <a href="mailto:contact@counterscent.com">contact@counterscent.com</a>
            from the address on your account and a person will do it for you.
          </p>
        `,
      })}
      ${section({
        heading: "How to ask for a refund",
        body: html`
          <p>
            Write to
            <a href="mailto:contact@counterscent.com">contact@counterscent.com</a>
            from the email address on the account and say which payment you
            mean. We answer refund requests within
            <strong>five business days</strong>.
          </p>
          <p>
            Subscriptions are sold through a <strong>merchant of record</strong>,
            which means the company that took the payment and issued your
            invoice is the one that returns the money. Approved refunds go back
            to the original payment method. That company's own processing time
            applies once we have approved it, and your bank may take a few days
            more to show it. Their name is on your invoice, and you can raise a
            refund request with them directly as well.
          </p>
        `,
      })}
      ${section({
        heading: "What happens to your listings",
        body: html`
          <p>
            When a paid subscription ends, listings above the free allowance
            stop being published at the next rebuild of the catalogue. Nothing
            is deleted — the submissions and their history are retained, and
            they republish if you subscribe again.
          </p>
          <p>
            The same applies if a payment fails. We do not close an account over
            a failed card.
          </p>
        `,
      })}
      ${section({
        heading: "When we will not refund",
        body: html`
          <p>
            We do not refund where an account is closed by us for a serious or
            repeated breach of the
            <a href="https://counterscent.com/terms/">terms of service</a> — in
            particular misrepresenting whose product a listing is, or attempting
            to manipulate a ranking or counting mechanism on the Site.
          </p>
          <p>
            A low match score, a verdict you disagree with, or a listing that
            brings less traffic than you hoped are not refund grounds. The
            subscription buys access to the listing tool and nothing about where
            a listing lands. That is stated on the
            <a href="https://counterscent.com/producers/pricing">pricing page</a>,
            in the <a href="https://counterscent.com/terms/">terms</a>, and in
            the
            <a href="https://counterscent.com/about#methodology">published formula</a>
            — we would rather say it three times before you pay than once
            afterwards.
          </p>
        `,
      })}
    `,
  });
}
