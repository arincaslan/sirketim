# Paddle — acceptable-use enquiry for Counterscent

**Status: draft only. Nothing was sent.** Communication has no email-sending connector
(see `../CLAUDE.md`), and contacting a payment provider on the company's behalf is a
founder action regardless. The founder sends this manually from
`contact@counterscent.com` (live since 2026-08-27, `lib/site.ts`).

Written 2026-09-14 · Product: `products/affiliate-sites/fragrance-dupes/` (Counterscent)
Background: `departments/accounting/reports/payment-rails-investigation.md` §10,
`HANDOFF.md` → "The payment rail: Paddle, and NOT iyzico".

---

## Why this email is the top open item

Paddle is the recommended rail for producer subscriptions, and that recommendation
rests on one unverified assumption: **Paddle's acceptable-use policy is reportedly
restrictive toward marketplaces, and Counterscent is literally a marketplace.**

The subscription being sold is arguably plain SaaS — a producer pays for access to a
listing tool, no buyer money passes through us — which Paddle does support. But it is
close enough to the line that it has to be raised *before* an adapter is written. If
the answer is no, the whole rail decision changes and nothing built on it survives.

It costs nothing, blocks nothing today, and is slow to come back. Send it early.

**Three further questions ride along** because they are cheap to ask now and each one
moves a real number:

| Question | Why it matters |
|---|---|
| Do they self-bill Turkish tax residents? | Awin explicitly does **not**, which put the invoicing burden on us. If Paddle self-bills, the mali müşavir's "keep the records clean" condition gets materially easier. |
| Which legal entity contracts with a Turkish seller? | Decides which jurisdiction's terms apply and what the payout paperwork looks like. |
| Can payouts be batched quarterly? | The flat ~$15 payout fee is regressive and dominates at low volume. Quarterly batching takes all-in cost from **11.1% to 7.7% at six producers, at zero implementation cost** — the highest-leverage lever available. |

**Where to send it:** confirm the current route on `paddle.com` before sending — their
pre-sales contact form or sales address, not general support, because this needs a
policy answer rather than an account answer. The right address was not verified from
here.

---

## The draft

> **Subject:** Acceptable-use check before we build — subscription product, Türkiye-based seller
>
> Hello,
>
> I run Counterscent (counterscent.com), an independent fragrance comparison site, and
> I would like to confirm that what I plan to sell is within Paddle's acceptable use
> policy **before** I build anything against your API. I would rather hear no now than
> after an integration.
>
> **What the site is.** Counterscent publishes side-by-side comparisons between
> designer fragrances and the lower-cost fragrances inspired by them. It is a static
> catalogue — there is no checkout, no basket, and no payment of any kind on the site.
> Today all revenue is affiliate commission from five retailers; visitors click through
> and buy on the retailer's own site.
>
> **What I want to sell through Paddle.** A monthly subscription to fragrance
> producers. It gives them an account on a separate console where they can submit a
> listing, keep it up to date, withdraw it, and request edits. Every listing is
> reviewed by a person before it is published; nothing is auto-approved. Pricing is not
> final, but I expect it to sit in the US$20–50 per month range, billed to businesses,
> mostly in the United States.
>
> **The specific thing I want to check.** I am aware Paddle's policy treats
> marketplaces differently, and I can see how the site could be read as one. Three
> points that I think distinguish it, and I would like your view on whether they do:
>
> 1. **No buyer money passes through us, ever.** A subscriber pays me for access to a
>    tool. Their customers buy from the subscriber's own website through their own
>    checkout. Paddle would never be in the path of a consumer purchase.
> 2. **The subscription buys no commercial outcome, and I take no commission from
>    anyone.** No tier pays me a commission — not the paid ones and not the free one —
>    and no tier buys a ranking, score or placement advantage. I earn nothing from any
>    listed producer's sales or traffic, at any tier. It is access to software, priced
>    as software. The site's own revenue comes from retailer affiliate links on the
>    public catalogue, which is a different counterparty entirely and nothing to do
>    with what I would be selling through Paddle.
> 3. **No physical goods.** I do not intend to process any physical product sale
>    through Paddle, now or later.
>
> If that reads as an ordinary B2B SaaS subscription to you, I will proceed. If it
> reads as a marketplace, I would rather know at this stage.
>
> **Three practical questions while I have you**, all specific to a Türkiye-based
> seller:
>
> 1. Does Paddle self-bill Türkiye tax residents — that is, do you issue the
>    self-billing invoice for your payouts to me, or am I expected to invoice Paddle
>    for each payout?
> 2. Which Paddle legal entity would contract with a company established in Türkiye?
> 3. Can payouts be batched to a quarterly schedule rather than monthly? The flat
>    payout fee is a large share of the cost at low volume, and quarterly settlement
>    would materially change my economics.
>
> Thank you,
>
> [Founder name]
> Counterscent · counterscent.com
> contact@counterscent.com

---

## Notes for the founder before sending

- **Fill in your name and, if you want, the A.Ş. legal name.** I left the name as a
  placeholder rather than guessing it.
- **Do not quote $19/$49 as the price.** `lib/plans.ts` says plainly those are a
  considered guess, not researched prices, and the header there warns they must not be
  shown to a real producer as final. The draft says "US$20–50 range" and "not final"
  for exactly that reason — it is enough for Paddle to classify the product without
  committing us to a number.
- **Everything in the draft is true today.** No checkout on the site, five live
  retailers, human review with no auto-approval, no commission on any tier — each of
  those is a shipped decision, not an intention. If any of them changes before you
  send, the email has to change with it, because a policy answer given against a
  description we later break is worth nothing.
- **Point 2 got stronger on 2026-09-18 and the redraft is deliberate.** It used to say
  "paid tiers pay no commission", which invited the obvious follow-up — *what about the
  free tier?* — and the honest answer was that the free tier WAS commission-bearing.
  That is the single fact most likely to make Paddle read this as a marketplace, and it
  would have surfaced after their answer rather than before it. The founder removed
  commission from the free tier, so the claim is now unqualified and there is no
  follow-up hiding behind it. **This is exactly the "if any of them changes, the email
  changes with it" case, applied in the direction that helps.**
- **Log the reply somewhere durable when it arrives.** If the answer is yes, it
  closes the largest unverified risk on the subscription rail and
  `payment-rails-investigation.md` §10 should record it the way it recorded the
  country question. If the answer is no, the rail decision reopens and Payoneer plus a
  direct-invoice route becomes the fallback to research.
