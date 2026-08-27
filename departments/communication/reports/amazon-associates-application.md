# Amazon Associates — application preparation for COUNTERSCENT

**Status: preparation report only.** Nothing was applied to, no account was created, no
personal or business information was submitted anywhere. Communication has no sending or
account-creation connector, and program enrollment is a founder-level decision regardless
(same posture as `departments/sales/affiliate-program-signup-checklist.md`).

Written 2026-08-26 · Site: `products/affiliate-sites/fragrance-dupes/` (COUNTERSCENT)
Companion docs: `MARKETPLACE-PLAN.md`, `PRODUCER-PROGRAM.md` §6/§8, Sales' signup checklist.

---

## 1. Headline recommendation (read this if you read nothing else)

**Do not make Amazon Associates the first affiliate program COUNTERSCENT applies to. Apply to the
direct dupe-house programs first, and treat Amazon as a later, narrow add-on for the
*original* fragrances only.**

Three reasons, in order of weight:

1. **The products COUNTERSCENT actually recommends are not sold on Amazon.** Dossier, ALT.
   Fragrances, Divain, Regency, Parfum Inspirations are direct-to-consumer houses. The dupe
   half of every comparison on the site — the half a visitor is there to buy — cannot be
   monetised through Amazon at all. Amazon only reaches the *original* (Baccarat Rouge,
   Bleu de Chanel), which is exactly the buy-link gap `MARKETPLACE-PLAN.md` §1 flags as
   missing from `ReferenceFragrance`. That is a real use case, but it is the smaller one.
2. **The rate is worse than it looks.** Amazon's *Luxury Beauty* rate is 10%, but Luxury
   Beauty is a curated catalog. Most designer fragrance on Amazon is sold by third-party
   grey-market sellers and sits in plain **Beauty at 3%**, with a **24-hour cookie**. ALT.
   Fragrances pays from 20%; Dossier up to 10%; both with 30-day cookies. See §4.
3. **Applying early is actively costly.** Amazon's approval is conditional and starts a
   **180-day / 3-qualifying-sales clock at application time**. A site with no deployment,
   no domain and no traffic would burn that clock and get the account closed. Every other
   program on the list merely rejects you; only Amazon penalises a premature application.

Sequencing: **direct programs (Awin/ShareASale-hosted dupe houses) → real traffic →
Amazon last**, which is the same conclusion Sales reached for niche 1 and this report does
not contradict.

---

## 2. Eligibility reality check

| Requirement | What it actually is | Confidence |
|---|---|---|
| Live, publicly reachable site | A real URL Amazon staff can load. "Under construction", localhost, or password-gated fails. | High — stated by Amazon, consistent across sources |
| Genuine original content | No published numeric minimum. Practitioner consensus lands around **10+ substantive pieces**; thin/placeholder sites are a top rejection reason. | Medium — rule of thumb, not an Amazon-published number |
| Site listed at application | Up to 50 sites/apps can be declared; each must be yours and must be described accurately. | Medium |
| **3 qualifying sales within 180 days** | Approval is *conditional*. Fail and the account is closed; you must re-apply. Clock starts at application, not at first traffic. | High — widely and consistently reported |
| Sale must complete within 180 days of click (Apr 2026 change) | An **April 2026 policy update** reportedly requires the customer to complete purchase *and receive/stream* the product within 180 days of click for commission to credit, and expands disqualified purchases to include traffic arriving via paid/boosted ads. | **Low–medium — VERIFY.** This is at/after my knowledge cutoff. Read the current Operating Agreement before relying on it. |
| Tax interview | Non-US: **W-8BEN** (individual) or **W-8BEN-E** (entity). Without a valid treaty claim Amazon withholds up to 30% of US-sourced commission. | High |
| Payout | $10 minimum direct deposit; $100 for cheque (+$15 fee). Direct deposit is the only sensible option. | Medium–high |
| Phone verification | Live call/SMS PIN during signup. | High |

**Marketplace note, specific to Sirketim:** the **Amazon.com.tr Associates programme is
invite-only** — you cannot self-apply. A Turkey-based founder applies to the **Amazon.com
(US)** programme, which is open internationally, and gets paid to a Turkish bank via
international transfer. Verify current status of both before applying.

**Two compliance rules that hit this site's architecture directly:**

- **Displayed prices must be refreshed at least every 24 hours and carry a "last updated"
  timestamp**, sourced via the Product Advertising API. COUNTERSCENT currently renders static
  fixture prices and computes price-per-ml from them. For any Amazon-sourced product that
  is non-compliant as built. Worse, **PA-API access is itself gated behind the same 3
  qualifying sales** — a genuine chicken-and-egg. Practical answer: for Amazon links,
  **show no price at all**, just "Check current price".
- **Redirecting/cloaking links.** The agreement bars obscuring the source site "including
  by use of Redirecting Links" such that Amazon cannot determine which site the click came
  from. COUNTERSCENT routes every outbound click through `/go/[slug]`. This is *probably* fine
  if the redirect preserves attribution and the destination is obviously Amazon — but it
  is exactly the pattern the clause names, and it is load-bearing for `PRODUCER-PROGRAM.md`
  §6. **Get this checked against the live agreement text before the first Amazon link
  ships**; do not assume the shared kit's pattern is safe here.

---

## 3. Gap analysis — what blocks an application today

| Gap | Current state | Blocking? |
|---|---|---|
| Public URL | Not deployed. `NEXT_PUBLIC_SITE_URL` falls back to `example-placeholder.com` | **Hard blocker** |
| Domain | None registered | **Hard blocker** |
| Content volume | 4 MDX pieces (1 guide, 2 comparisons, 1 review) vs ~10 practical minimum | **Hard blocker** |
| Data credibility | 68 references / ~37 listings, all fixture. Prices, facets, "bottles purchased at retail" claim are illustrative | **Hard blocker** — an Amazon reviewer landing on invented prices is a rejection, and the retail-purchase claim in `/disclosure` is currently untrue |
| Traffic | Zero. No audience, no social presence for this site | Not an application blocker; **is** the 180-day-clock blocker |
| Analytics | GA4 / GSC env vars unset | Not blocking, but you cannot judge readiness without it |
| Privacy policy | **No `/privacy` route exists** (app/ has about, disclosure, library, etc. — no privacy) | Practical blocker |
| Affiliate disclosure | `/disclosure` exists and is good — but lacks Amazon's required wording | Fix, not a blocker |
| Licence file | None | Housekeeping |

---

## 4. Amazon vs. the direct programs

| Programme | Network | Commission | Cookie | Sells the dupes? | Sells the originals? |
|---|---|---|---|---|---|
| **ALT. Fragrances** | Awin | **from 20%** | ~30d | **Yes** | No |
| **Dossier** | ShareASale | up to 10% (5/15/20% figures conflict — see Sales' doc) | 30d | **Yes** | No |
| **Divain** | Not confirmed | Not confirmed | — | **Yes** | No |
| MicroPerfumes | Rakuten | ~15% | 30d | Partly | Some |
| FragranceX | CJ | 10% | 45d | No | **Yes** (discount originals) |
| Scentbird | Impact | up to 14% /sub | 45d | No | Sampling |
| **Amazon Associates** | In-house | **3% Beauty / 10% Luxury Beauty** | **24h** | **No** | Yes, often grey-market 3P |

**Correcting a common assumption:** Amazon's *Luxury Beauty* rate is 10%, the highest
standard rate on the card — so "the fragrance category rate is low" is not quite right. The
problem is that (a) most fragrance listings are not in the Luxury Beauty catalog and pay
3%, (b) the 24-hour cookie is the shortest of any programme on this list by an order of
magnitude, and (c) Amazon simply does not carry the products COUNTERSCENT's whole comparison
mechanic points people toward.

**Where Amazon genuinely earns its place:** as the buy link for the **original** side of a
comparison, plus atomisers, discovery sets and adjacent accessories. `MARKETPLACE-PLAN.md`
already establishes that originals need their own link and that COUNTERSCENT should earn
whichever side the buyer picks. Amazon is the most practical way to fill that specific
slot — it is just not the revenue engine.

**Recommended order:**

1. Deploy + build the content base (§5).
2. **ALT. Fragrances (Awin)** and **Dossier (ShareASale)** — highest rate, and they sell
   what the site recommends. Also the natural first real `/go/[slug]` targets.
3. **FragranceX (CJ)** — covers originals at 10%/45d, a *better* deal than Amazon for the
   same slot. Test this before assuming Amazon is needed for originals at all.
4. **Amazon Associates last**, once there is enough traffic to make 3 sales in 180 days a
   near-certainty rather than a hope.

---

## 5. Preparation checklist, in order

**Phase A — make the site real (all hard blockers)**

- [ ] Register a domain (custom domain, not a `*.vercel.app` subdomain — ShareASale
      explicitly rejects subdomains, and Amazon reviewers treat them poorly).
- [ ] Deploy to Vercel; set `NEXT_PUBLIC_SITE_URL` so metadata/sitemap/robots stop
      emitting `example-placeholder.com`.
- [ ] Add a **`/privacy` page** — does not exist today. Must cover cookies, analytics, and
      affiliate tracking. Link it in the footer.
- [ ] Update **`/disclosure`**: keep the existing FTC framing, drop or qualify the "bottles
      purchased at retail" claim until it is true, and delete the "no active program yet"
      section only when that stops being accurate.
- [ ] Add a real contact route (page or address). Reviewers look for one.
- [ ] Add the licence file the README already flags as missing.

**Phase B — content and data credibility**

- [ ] Get to **10+ substantive editorial pieces** (currently 4). `content-strategist` owns
      this via the `affiliate-content` skill.
- [ ] Replace fixture prices/facets with verified figures for at least the fragrances that
      carry a live link. An Amazon reviewer hitting invented prices is a rejection; under
      FTC it is worse than a rejection.
- [ ] Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` and `NEXT_PUBLIC_GSC_VERIFICATION`. You need
      real traffic numbers to answer the application honestly and to judge the 180-day risk.

**Phase C — traffic before applying**

- [ ] Index in Search Console; get some organic impressions.
- [ ] Coordinate with `ad-strategist` for launch content/assets — outreach and social
      pointing at the live site (Communication drafts, founder sends; no connector exists).
- [ ] Enrol the direct programmes and confirm the `/go/[slug]` flow converts at all.
- [ ] **Only then** apply to Amazon — ideally with enough weekly sessions that 3 sales in
      180 days is arithmetic, not optimism.

---

## 6. Application walkthrough

Applied at `affiliate-program.amazon.com`, signed in with an Amazon customer account.

| The form asks | How to answer for COUNTERSCENT |
|---|---|
| Account holder name, address, phone | **Founder only.** Must match the tax details. |
| Payee — "who is paid?" | **Founder decision:** personally, or as a registered business entity. This picks W-8BEN vs. W-8BEN-E and cannot be casually changed later. Same open item Sales already flagged. |
| Website / app list | The live COUNTERSCENT domain. Do not list localhost, a preview URL, or anything not deployed. |
| Preferred Associates Store ID | Something like `drydown-20`. This becomes the default tracking ID — see §7 on why you will want more than one. |
| What are your sites about? | Independent fragrance comparison — designer/niche originals vs. lower-cost alternatives, with a disclosed similarity methodology. |
| Which topics best describe them? | Beauty → Fragrance/Perfume. |
| What Amazon items do you list? | Designer and niche fragrances, discovery sets, atomisers and fragrance accessories. |
| How do you drive traffic? | Search/SEO plus editorial content. Say so plainly — do not claim social or paid channels that do not exist. |
| How do you build links? | Manually / SiteStripe. |
| Monthly unique visitors | Answer honestly from GA4. If the honest answer is "0", **you are applying too early.** |
| How do you monetise? | Affiliate commissions; disclosed at `/disclosure`. |
| Phone verification | Live PIN. Founder must be at the phone. |
| Tax interview (W-8BEN/-E) | **Founder only** — name, country, TIN/foreign TIN, treaty claim. |
| Payment method | Direct deposit to a Turkish bank ($10 minimum). **Founder only.** |

Realistic timeline: form ~30 minutes, initial conditional acceptance within ~1–3 days,
then the 180-day evaluation.

---

## 7. After approval

**The clock.** Conditional approval → 3 qualifying sales within 180 days → Amazon reviews
and either fully approves or closes the account. Self-purchases do not count. Per the
reported April 2026 change, purchases from traffic arriving via paid/boosted ads may be
disqualified — **verify before running any paid launch push through Amazon links.**

**Link format.** Standard: `https://www.amazon.com/dp/<ASIN>/?tag=<trackingID>`. Fine to
build by hand; SiteStripe generates them. PA-API is not available until after the 3 sales,
which is why §2 recommends showing no Amazon-sourced price until then.

**Sub-ID tracking — set this up on day one.** `PRODUCER-PROGRAM.md` §6 is right that
retrofitting attribution is impossible. Amazon gives two mechanisms:

- **Tracking IDs** — multiple IDs per account (commonly cited limit: 100). Coarse: use them
  per content type or per major section, not per listing. They appear natively in reports.
- **`ascsubtag`** — a sub-tag appended to the link, surfaced in the Orders report. This is
  the per-listing granularity you actually need.

Practical scheme: `?tag=drydown-20&ascsubtag=<listingId>__<referenceSlug>__<surface>`.
`/go/[slug]` is already the single chokepoint, so this is one composition step in a route
handler that exists — but it must be built **before** the first real click, and it must be
paired with the click log that `app/go/[slug]/route.ts` still has as a TODO. Verify both
the tracking-ID limit and `ascsubtag`'s exact behaviour in Associates Central; neither is
confirmed here from a primary source.

**Also required on approval:** Amazon's Operating Agreement mandates a specific disclosure
statement — the standard form is *"As an Amazon Associate I earn from qualifying
purchases."* It must appear where the links are, not only on `/disclosure`. Add it to the
inline `DisclosureBlock` component, not just the policy page. Confirm the exact current
wording in the agreement.

---

## 8. Founder-only items (nothing here can be done by a subagent)

- Individual vs. registered business entity → W-8BEN vs. W-8BEN-E.
- Tax identity: TIN/foreign TIN, Turkey–US treaty claim (affects up to 30% withholding).
- Bank account for direct deposit.
- Domain registration and its billing.
- Phone verification call.
- The application submission itself, and every programme enrollment.
- Each of these is also a ledger event once money moves — domain, hosting, and any first
  commission all need a row in `departments/accounting/ledger.md` when they happen.

---

## 9. What needs verifying before acting

| Item | Why |
|---|---|
| April 2026 Operating Agreement changes | At/after knowledge cutoff. Read the current agreement directly. |
| Current Beauty / Luxury Beauty rates | The official rate card requires a logged-in Associates account; figures here are secondary-source. |
| Amazon.com.tr invite-only status | Reported, not primary-confirmed. |
| `/go/[slug]` redirect vs. the cloaking clause | Load-bearing for the whole site architecture and for `PRODUCER-PROGRAM.md` §6. |
| Tracking-ID limit and `ascsubtag` semantics | Reported figures; confirm in Associates Central. |
| Dossier's real rate (5% / 15% / 20% conflict) | Already open in Sales' checklist — unresolved. |
| Divain's programme and network | Not confirmed by any pass so far. |

Sources consulted for this report: [Amazon Associates operating policies](https://affiliate-program.amazon.com/help/operating/policies), [Associates participation requirements](https://affiliate-program.amazon.com/help/operating/participation/), [Operating Agreement change log](https://affiliate-program.amazon.com/help/operating/compare), [Luxury Beauty rate analysis](https://milesinsights.com/amazon-luxury-beauty-commission-rate-2026/), [category rate summary](https://azonpress.com/amazon-affiliate-commission-rates/), [affiliate requirements overview](https://getaawp.com/blog/amazon-affiliate-program-requirements/), [April 2026 policy changes](https://affiliyo.com/blog/amazon-associates-april-2026-policy-changes), [reasons affiliates get banned](https://geniuslink.com/blog/amazon-associates-guide-to-getting-account-banned), [Amazon Turkey/UAE programme notes](https://geniuslink.com/blog/amazon-uae-amazon-turkey-affiliate-programs/), [ALT. Fragrances on Awin](https://ui.awin.com/merchant-profile/103251), [perfume affiliate programme roundup](https://uppromote.com/affiliate-programs/perfume/), [fragrance programme rates](https://getlasso.co/niche/fragrance/).
