# Counterscent Producer Terms — working draft

> **STATUS: DRAFT. NOT IN FORCE. NOT REVIEWED BY A LAWYER.**
>
> Nobody has agreed to this and nobody can yet — the producer programme is not
> open, there are no accounts, and every producer page on the site says so.
> This is the canonical text a qualified adviser should mark up before it binds
> anyone, not a published policy.
>
> Two things in particular need a professional eye, and an agent's opinion is
> not a substitute for one: **the governing-law clause** (§15 — a Türkiye-based
> A.Ş. contracting with businesses mostly in the United States) and **the data
> section** (§13 — KVKK on our side, whatever applies on theirs). Everything
> else describes mechanisms that are already built and can be checked against
> the code.
>
> Written 2026-09-14. Consistent as of that date with `lib/plans.ts`,
> `lib/producer-link.ts`, `lib/verification.ts`, `lib/facet-derivation.ts`,
> `lib/dupes-data.ts` and `PRODUCER-PROGRAM.md`. If one of those changes, this
> changes with it — a term we do not actually enforce is worse than no term.

---

## 1. Who this is between

These terms are between **Sirketim A.Ş.** ("we", "us"), a company established in
Türkiye and the operator of **counterscent.com** ("the Site"), and the business
that creates a producer account ("you"). They are a business-to-business
agreement. The programme is not open to consumers and an account may not be
opened by a private individual.

## 2. What the service is

A producer account lets you submit fragrances you make or sell to the Site's
comparison catalogue. A published submission ("a listing") appears in the Dupe
Finder and on the page of the original fragrance it is compared against,
**presented the same way as every other listing** — the same card, the same
ranking, the same formula. There is no separate, paid-looking area of the
catalogue and there will not be one.

The service is the account and the listing tool. It is not advertising, it is
not placement, and it does not include any undertaking about traffic, clicks,
sales, or where your listing will rank.

## 3. Who can hold an account

You may hold an account if you are a business that makes or sells the fragrance
you are listing and can be contacted at a real address. You must list under your
own trading identity. **You may not open an account under the name of a company
you do not control** — the Site already names a number of fragrance houses whose
products it links to and which have no relationship with us, and taking one of
those identities is a misrepresentation of a real business, not a naming
dispute. We enforce this technically as well as contractually.

## 4. What you provide, and what we write

**You provide:** which original fragrance your product is an alternative to,
chosen from our existing catalogue; your product's name, price, bottle size and
concentration; its note pyramid as top, heart and base; a plain statement of
what is genuinely different from the original; a link to the product on your own
store; and a photograph of the product (§6).

**You cannot add an original.** The comparison is computed against a note
pyramid we researched, so if the fragrance you are inspired by is not already in
our catalogue, your listing cannot be scored until we add it. Researching it is
our work and we do not commit to a date for it.

**We write everything else.** In particular:

- **The six profile scores** — freshness, sweetness, warmth, woody depth,
  longevity and sillage. We derive them from what you declare. You are not asked
  to rate your own fragrance on them and you cannot set them. This is not a
  comment on your honesty: our copy-detection check compares your declared notes
  *against* those scores, and it only works while we author one side of it.
- **The verdict** — the paragraph of prose describing how your fragrance
  compares. It is written in our voice, it will say where your product falls
  short as well as where it succeeds, and you do not have approval over it.
- **The match score.** It is computed by a published formula from the data
  above. It is not negotiable and it is not for sale.

## 5. Review, approval, and publication

Every submission is reviewed by a person before it is published. Nothing is
approved automatically. Automated checks may reject a submission or weaken a
claim on it at any time; no automated process may approve one or make a claim
about it stronger.

**"Approved" and "live" are different states.** The public catalogue is a static
site that is rebuilt to publish changes, so an approved listing goes live at the
next build rather than immediately. The console will show you both states
separately. We will publish a review time and a publication cadence when we have
real figures for them; until then we do not offer either, and you should not
read one into this document.

We may reject a submission, and we will give you the reason. Common reasons will
be: the original is not in our catalogue, the declared data cannot be reconciled
with your own public product page, the link fails our checks (§8), or the
submission restates the original's own note pyramid (§7).

## 6. The product photograph

**A photograph is required.** You may not publish a listing without one.

By uploading it you confirm that you own the photograph or hold the rights to
license it, that it shows the actual product being listed, and that publishing
it on the Site infringes nobody's rights. You grant us a non-exclusive,
worldwide, royalty-free licence to display, resize and cache it in connection
with your listing and with the Site's own promotion of the catalogue. The
licence lasts while the listing is published and for as long afterwards as
copies remain in caches and archives outside our control.

We will not alter your photograph beyond resizing and format conversion. We will
not generate or retouch a product image, for you or for anyone.

If you tell us you no longer hold the rights to an image, we will remove it and
the listing with it.

## 7. Accuracy, and the pyramid rule

Everything you submit is your own statement about your own product, and it is
published as such. You are responsible for it being true.

**A note pyramid counts as yours only if you publish it too.** If you give us a
top/heart/base split and the same split is published where your own buyers can
see it, we record that and treat the split as declared. If it is not published
anywhere but here, the listing is scored as though we had inferred the split
ourselves, which carries a documented penalty. This is not a judgement about
you — it is that "what you told us" and "what you tell every buyer" are
different kinds of claim, and only one of them is checkable by a reader.

A submission that simply restates the original's own note pyramid will not be
published. Our formula would read it as a near-perfect match, and it is not one.

You may not describe your product in a way that suggests the original's house
made it, endorsed it, or is connected with it.

## 8. Your link

Your listing links to the product on **your own store domain**, recorded on your
account. It must be https, must not carry credentials, and **must not be an
affiliate, tracking, or shortened link** — not your own network's and certainly
not a third party's. A link whose destination can be changed after we have
approved it is not a link we can publish.

Tell us before you move domains. We will update it; we will not follow a
redirect we were not told about.

## 9. What no plan buys

No plan, tier, or payment buys a better match score, a higher rank, placement,
or a more favourable verdict. This is enforced in the code and not only
promised: the modules that compute and order scores are barred from importing
anything that knows what you pay, and the build fails if that changes.

We take no commission on sales from a paid tier's listings. We have no financial
interest in where your listing ranks or how much traffic it gets, and that is
deliberate — it is what makes the sentence above worth anything.

A paid tier may buy priority in the review queue, which affects how quickly we
look at your submission and nothing about where it lands.

## 10. Removing a listing, and what we keep

You may withdraw a listing at any time from the console. Withdrawal takes it out
of the catalogue at the next build and stops its link resolving.

**Withdrawal is a change of state, not a deletion.** We retain the listing's
history — what was submitted, what was published, when, and the click record
attached to it. We keep it because a commission or a dispute can arrive weeks
after a listing comes down, and because a record that can be erased by the party
it describes is not a record.

**We do not reuse a withdrawn listing's link identifier.** Reassigning it would
misattribute clicks still inside an affiliate network's cookie window to a
different product.

We may also remove a listing ourselves — for a breach of these terms, for a
rights complaint, for data we cannot reconcile, or because your account has
closed. We will tell you which.

**On resubmission.** You may resubmit a withdrawn product. We keep the earlier
submission's data, and where a product is withdrawn and resubmitted against the
same original with different declared data, we look at both side by side. A
pattern of withdrawing after a low score and resubmitting with a friendlier
pyramid is a reason to refuse a listing.

## 11. Fees

**No paid tier is open and no payment can currently be taken.** Prices shown
anywhere on the Site today are indicative and not an offer. This section
describes what will apply when the paid tiers open; until then only the free
tier exists, and it is free.

When paid tiers open: subscriptions will be sold through a merchant of record,
which means your contract for the payment is with that company and your invoice
comes from them, not from us. Fees are stated exclusive of any tax the merchant
of record is required to add. Subscriptions renew until cancelled, cancellation
takes effect at the end of the paid period, and we do not refund part-periods
unless the law where you are requires it.

If a payment fails, your listings above the free allowance stop being published
at the next build. Your data is retained (§10) and republishes if you resume.

We may change prices. Existing subscribers get notice before a change applies to
them, and may cancel instead.

## 12. Suspension and closing an account

You can close your account whenever you like; your listings come down at the
next build.

We may suspend or close an account for a serious or repeated breach of these
terms — in particular for misrepresenting whose product a listing is, for
supplying data that contradicts your own public product page, for rights
complaints we cannot resolve, or for attempting to manipulate any ranking or
counting mechanism on the Site. Where the breach is fixable we will say what
would fix it first.

## 13. Data

We hold your account details, what you submit, and the record described in §10.
We use them to run the programme and for nothing else; we do not sell them.

We are established in Türkiye and process personal data under Turkish data
protection law (KVKK). If you are established somewhere whose own law applies to
this processing, the data-protection terms that law requires will be added
before your account is opened rather than assumed away here.

The Site itself is deliberately cookieless and its analytics do not identify
visitors. That is a property of the public catalogue, not a promise about the
producer console, which necessarily knows who is signed in.

## 14. What we do not promise

The Site is provided as it is. We do not promise that it will be available
without interruption, that any listing will attract traffic or sales, or that a
comparison will be read the way you would like.

The match score and every profile number are **editorial estimates, not
measurements**. The Site says so publicly and so do we here. Nothing in the
catalogue is a laboratory finding.

To the extent the law allows, we are not liable for indirect or consequential
loss, or for lost profits or revenue. Nothing here excludes liability that
cannot lawfully be excluded — including for death or personal injury caused by
negligence, or for fraud.

You remain responsible for your own product: what is in it, how it is labelled,
and whether selling it where you sell it is lawful. Nothing we publish is an
assessment of that, and a comparison on this Site is not a safety, ingredient,
or regulatory opinion.

## 15. Law and disputes

**[TO BE SETTLED WITH AN ADVISER — see the header.]** The working assumption is
Turkish law and the courts of Istanbul, which is the straightforward choice for
a Türkiye-based company. It is recorded here as an assumption rather than a term
because it is a real commercial decision: a US business may reasonably decline
to litigate in Istanbul, and how much that matters depends on how the programme
is sold and to whom.

## 16. Changes

We may change these terms. Material changes are notified to account holders
before they take effect, and continuing to use the account after that is
acceptance. If you do not accept a change, close the account; your listings come
down at the next build and §10 applies to the record.

---

## Cross-references for whoever maintains this

| Clause | Enforced by |
|---|---|
| §3 identity | `lib/producers.ts` collision guard; `lib/dupes-data.ts` enrolled-producer guard |
| §4 we author the facets | `lib/facet-derivation.ts`; sliders removed from `components/producers/submission-form.tsx` |
| §5 no auto-approval | Not yet built — admin queue is step 7 |
| §6 photograph required | Not yet built — needs storage, upload path and review surface |
| §7 pyramid rule | `DupeCandidate.pyramidBasis` + guard in `lib/dupes-data.ts` |
| §7 restating the original | `isVerbatimCopy()` in `lib/verification.ts` |
| §8 link rules | `validateProducerLink()` in `lib/producer-link.ts` |
| §9 no tier buys rank | `scripts/check-scoring-isolation.mjs`, run in `prebuild` |
| §10 id never reused | Convention today; needs a guard in the exporter |
| §11 merchant of record | Undecided. Paddle is the recommendation and its acceptable-use answer is outstanding — see `departments/communication/reports/paddle-acceptable-use-enquiry.md` |

**Three clauses describe things that are not built yet** (§5 review queue, §6
photograph handling, §10's id guard). They are written in the future tense on
purpose. Before this document is published anywhere a producer can accept it,
either the mechanism exists or the clause comes out — publishing a term we
cannot honour is the same failure as shipping a feature whose backing service
does not exist.
