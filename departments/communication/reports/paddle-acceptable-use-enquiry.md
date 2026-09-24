# Paddle — acceptable-use enquiry for Counterscent

> ## UPDATE 2026-09-24 — READ THIS BEFORE SENDING THE DRAFT BELOW
>
> **A second acceptable-use risk was found, and the draft does not answer it.**
> Paddle's published AUP prohibits, as its own category separate from
> marketplaces, *"advertising and marketing services"* — and the examples given
> **name job boards explicitly**.
>
> That is the dangerous one, because a job board has the identical shape to the
> producer programme: the lister pays a subscription, a visitor clicks through,
> the transaction happens elsewhere, and **no buyer money ever passes through
> the platform**. The draft's strongest argument — point 1, "no buyer money
> passes through us, ever" — is equally true of a job board and Paddle
> prohibits those anyway. So that argument does not do the work it was written
> to do, and sending the draft unchanged invites a "no" that answers the wrong
> question.
>
> §"The second risk" below states the distinction that actually separates us,
> and the draft's point 3 has been rewritten around it. **The distinction is
> real but it is not obviously decisive — do not read this as confidence that
> the answer is yes.**
>
> **Two site blockers were closed the same day**, both of which would have
> failed Paddle's domain review before any of this was read:
> `counterscent.com/terms` and `producers.counterscent.com/refunds` are now
> published and linked from both footers, and the footer names the legal entity.

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

## The second risk: "advertising and marketing services", and why a job board is the comparison that matters

Paddle's AUP lists two categories that this programme sits near, not one:

| AUP category | What it prohibits | Why it is near us |
|---|---|---|
| Digital marketplaces | *"Any product or service that enables non-Paddle Sellers to sell products and services to customers"* | Counterscent is described as a marketplace in our own repo. |
| Advertising and marketing services | The examples name **job boards**, pyramid schemes, telemarketing, social-media automation | A paid listing that sends a visitor to the lister's own store is the job-board shape exactly. |

**The marketplace defence does not transfer.** "No buyer money passes through
us" distinguishes us from a marketplace and says nothing about the second
category: a job board takes no buyer money either. Whatever Paddle's reason for
prohibiting job boards is, it is not a payment-flow reason.

**What does distinguish us, stated honestly:**

1. **The subscription buys no visibility.** On a job board, the money buys the
   listing's existence and often its prominence — that IS the product. Here the
   ranking formula is published, applies identically to every listing, and the
   modules that compute and order scores are barred at build time from importing
   anything that knows what a producer pays. A producer who pays nothing and a
   producer who pays the top tier are ranked by the same arithmetic.
2. **What the subscription actually buys is allowance and tooling** — how many
   listings you may hold, and queue priority on review. Both are capacity, not
   placement.
3. **Every listing is editorially reviewed and written by us.** The verdict is
   in our voice and says where the product falls short; the producer has no
   approval over it. An advertising service does not let the publisher write
   copy criticising the advertiser.
4. **We take no commission at any tier, including the free one.** There is no
   revenue path from a producer's sales to us at all.

**The counter-argument, which should be expected:** a listing on a comparison
site does put a product in front of buyers, and the producer is paying for the
opportunity to be there. If Paddle's reviewer reads the value as "exposure",
the category fits regardless of how the ranking is computed. **That is a real
reading and there is no version of this email that argues it away.** The
purpose of asking is to find out which reading they take, before an adapter is
written against the answer we prefer.

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
> reviewed by a person before it is published; nothing is auto-approved. Two paid
> tiers, US$9.99 and US$17.99 per month, with annual equivalents at US$99 and
> US$179, billed to businesses in the United States, Europe and Türkiye. There is
> also a free tier. The prices are on counterscent.com/producers/pricing.
>
> **The specific thing I want to check.** I have read your acceptable use policy
> and I can see two categories my product sits near. I would rather raise both
> myself than have you find them.
>
> **On digital marketplaces.** No buyer money passes through me, ever. A
> subscriber pays me for access to a tool; their customers buy from the
> subscriber's own website through the subscriber's own checkout. Paddle would
> never be in the path of a consumer purchase, and I do not process any physical
> product sale, now or later.
>
> **On advertising and marketing services**, which your policy names job boards
> as an example of. I recognise the shape — someone pays a subscription, a
> visitor clicks through, the transaction happens elsewhere — and I do not think
> "no buyer money passes through me" answers it, because that is true of a job
> board too. So here is what I think actually separates them, and I would like
> your view on whether it does:
>
> 1. **The subscription buys no visibility of any kind.** On a job board the
>    money buys the listing's existence and its prominence; that is the product.
>    On my site the ranking formula is published, it applies identically to every
>    listing, and it is enforced in code rather than promised — the modules that
>    compute and order scores cannot import anything that knows what a producer
>    pays, and the build fails if that changes. A producer paying nothing and a
>    producer on the top tier are ranked by the same arithmetic.
> 2. **What the subscription buys is allowance and queue priority** — how many
>    listings you may hold, and how quickly I look at a submission. Capacity and
>    turnaround, not placement.
> 3. **I write the editorial, and it is not flattering by default.** Every
>    listing is reviewed by a person and the comparison text is written in my
>    voice. It says where the product falls short as well as where it succeeds,
>    and the producer has no approval over it. An advertiser would not accept
>    that arrangement, and I would not offer it to one.
> 4. **I take no commission from any producer, on any tier, including the free
>    one.** There is no revenue path from a producer's sales or traffic to me at
>    all. The site's own income is affiliate commission from retailers on the
>    public catalogue — a different counterparty, unrelated to what I would sell
>    through Paddle.
>
> If that reads as an ordinary B2B SaaS subscription to you, I will proceed. If
> it reads as a marketplace or as an advertising service, I would rather know at
> this stage than after an integration.
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
- **The price note here was stale and is corrected. The draft now quotes real
  numbers.** It used to say "do not quote $19/$49" and to use a "US$20–50 range"
  instead, on the grounds that `lib/plans.ts` called those a considered guess. Two
  things changed: the founder cut the prices to **$9.99 and $17.99** (2026-09-18,
  twice in one day), and those numbers are **live on
  counterscent.com/producers/pricing**, which is the page Paddle's domain review
  reads. A vague range in the email against precise numbers on the site is the
  mismatch a reviewer notices, so the email now says exactly what the page says.
- **The refund window is 14 days, and Paddle expects 30.** Their seller guidance
  says sellers are "expected to have at least a 30-day money-back guarantee".
  The founder chose 14 on 2026-09-24 after that was stated. It is not raised in
  the email — volunteering a shortfall invites an objection that might not come —
  but **if the reviewer raises it, the answer is that it was a deliberate choice
  and can be revisited**, not that it was an oversight. Changing it is one number
  in `counterscent-producers/src/routes/refunds.ts` and one in
  `PRODUCER-TERMS.md` §11.
- **The three documents Paddle's domain review requires now exist**, published
  2026-09-24 and linked from both footers: `counterscent.com/terms`,
  `counterscent.com/privacy`, and `producers.counterscent.com/refunds`. The
  refund policy is on the console because that is the only origin where a
  subscription can be bought. **None of them has been reviewed by a lawyer** —
  `PRODUCER-TERMS.md` flags governing law and the data section in particular.
- **Confirm the registered legal name before the domain is submitted.** The
  terms page and the footer now say "Sirketim A.Ş.", taken from
  `PRODUCER-TERMS.md` §1. Paddle's business-identification step checks the name
  on the site against the registration document, so if the ticaret sicil unvan
  is longer or differently spelled, fix the site first — a mismatch there is
  rework at the slowest stage of the process.
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
