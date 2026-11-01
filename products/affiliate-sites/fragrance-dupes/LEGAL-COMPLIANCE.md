# Counterscent legal compliance register

Written 2026-11-01, in the change that made the site's policies bilingual and
added the consent banner, account deletion and the rest of the list below. It
covers both origins: the catalogue (`counterscent.com`, this project) and the
producer console (`producers.counterscent.com`,
`../counterscent-producers/`).

**NOT REVIEWED BY A LAWYER.** Every policy text here was written by an agent
from the code and from published law, and binds people the moment it is
deployed. Section 4 lists what a lawyer has to look at first.

**Every sentence in a policy is a claim about code.** The table in section 1
names the file that makes each claim true. Change the code and the policy in
the same commit, in BOTH languages, or one of them becomes false.

---

## 1. The sixteen items

| # | Item | State | Where |
|---|---|---|---|
| 1 | Privacy policy | Done, EN + TR. Rewritten: the old one said there were no accounts, that fonts came from Google and that analytics ran without asking - all three false. TR doubles as the KVKK aydınlatma metni (Art. 10). | `app/privacy/page.tsx`, `app/tr/gizlilik/page.tsx` |
| 2 | Terms of use | Done, EN + TR. Contracting party is now the registered company. Turkish prevails for people in Türkiye. | `app/terms/page.tsx`, `app/tr/kullanim-kosullari/page.tsx`, canonical `PRODUCER-TERMS.md` |
| 3 | Refund policy | Done, EN + TR on one page, on the console where the purchase will happen. States that no paid plan can be bought yet. | `counterscent-producers/src/routes/refunds.ts` (`/refunds`, Turkish at `/refunds#tr`) |
| 4 | Cookie policy | Done, EN + TR. Every row is a real name in the code. | `app/cookies/page.tsx`, `app/tr/cerez-politikasi/page.tsx` |
| 5 | Cookie consent banner | Done. GA4 is now **opt-in**: the script is not loaded until "Allow", Decline is equal weight, GPC counts as decline, "Cookie settings" in every footer reopens it. Verified in Chromium: zero Google requests before a choice, after Decline, and with GPC. | `components/kit/ConsentBanner.tsx`, `components/kit/Analytics.tsx`, `lib/consent.ts` |
| 6 | Collect only needed data | Done. IP addresses in the console's rate-limit table are now an HMAC, never the address (verified: no clear IP in `RateLimit` after hits). The account-deletion audit row carries no email. The sign-in email states why it was sent. | `counterscent-producers/src/lib/rate-limit.ts` `ipBucketKey()` |
| 7 | Audit third-party SDKs | Done - section 2. The built HTML loads no third-party resource at all; the only one is GA4, after consent. | - |
| 8 | Remove dark patterns | Done. (a) Free-tier producers can now withdraw their own listing - before, one click put a listing up and an email was needed to take it down. (b) Consent banner has no pre-ticked or nudged option. (c) Both new confirmation checkboxes are never pre-ticked. | `counterscent-producers/src/lib/producer.ts` `mayWithdrawSelf()`, `lib/plans.ts` |
| 9 | Remove hidden fees | Done. Pricing note and refund policy say: renews automatically, USD, tax/VAT added by the payment provider shown before paying, no setup/cancellation fee. Deleting an account is refused while a paid subscription is in force, so the delete button cannot leave something billing. | `components/producers/pricing-table.tsx`, `routes/refunds.ts`, `routes/delete-account.ts` |
| 10 | Remove fake reviews | Already clean, re-checked: `REVIEWS` is `[]`, no `AggregateRating` anywhere, the review form says nothing is saved. | `lib/reviews.ts`, `lib/jsonld.ts` |
| 11 | Remove unsupported claims | Done. "Most producers" badge -> "Our suggestion" (no producer has ever bought a plan). Five plan features that do not exist yet now say "(not built yet)": click counts, per-listing click data, edit requests, conversion data, queue priority. Console meta description no longer says "producers we have already spoken to". | `lib/plans.ts`, `components/producers/pricing-table.tsx`, `app/producers/page.tsx` |
| 12 | Alt text | Audited, nothing missing. Product photos: "`<name>` by `<brand>`". Mood images: descriptive alt. Decorative images and the hero video: `alt=""` + `aria-hidden`. Logo SVG aria-hidden beside a text wordmark; radar chart has `role="img"` + a summary label. | - |
| 13 | Age consent for kids' data | Done. Policies: producer accounts are 18+; the catalogue does not knowingly collect children's data; under-16s are asked not to allow analytics. Console: sign-in page says 18+; creating a company needs an unticked "I am 18 or over and authorised" box, recorded with the terms version in the audit row. Self-declaration, not ID checks - we should not hold identity documents. | `counterscent-producers/src/routes/company.ts`, `routes/sign-in.ts` |
| 14 | Unsubscribe link | Not applicable, and stated rather than faked. The only email is the sign-in link, a transactional message the recipient requested; Law 6563 and CAN-SPAM unsubscribe rules cover commercial messages. The email now says it is a service message, that we send no marketing, and why it arrived (EN + TR). If marketing is ever sent: prior opt-in, İYS registration, working unsubscribe in every message. | `counterscent-producers/src/lib/mailer.ts` |
| 15 | Licence of stock images | Done - see `IMAGE-LICENSES.md`. There are no stock photos. The 74 reference photos from the closed My Perfume Shop programme are no longer shown. | `lib/data/references.ts` `SHOW_CLOSED_PROGRAMME_IMAGES` |
| 16 | Data deletion option | Done. `producers.counterscent.com/console/delete`: deletes the user, sessions, linked Google sign-in and pending links immediately; withdraws listings and clears the company contact if it was the last account; keeps listing history and audit rows (disclosed, ≤10 years). Linked from the console footer, the accounts page and both privacy notices. Tested against a real Postgres (31/31 checks). | `counterscent-producers/src/routes/delete-account.ts` |

## 2. Third-party audit (what runs, what it receives)

| Party | Where | What it receives | When | Basis |
|---|---|---|---|---|
| Google Analytics 4 | catalogue | page, referrer, browser/device, approximate region; IP truncated; **no cookie** (`client_storage: 'none'`) | only after "Allow" | consent |
| Cloudflare | both origins (hosting) | IP, user agent, requested URL; may set `__cf_bm` | every request | legitimate interest (delivery, security) |
| Neon (Postgres + object storage, US) | console | accounts, companies, listings, photos, audit rows, hashed rate-limit keys | when a producer uses the console | contract |
| Hostinger (Email API) | console | recipient address + sign-in link; a copy lands in our Sent folder | when a sign-in link is requested | contract |
| Google sign-in | console | Google's account id, verified email, name | only if the producer presses "Continue with Google" | contract |
| Awin, CJ | catalogue outbound links | nothing from us; the visitor's browser reaches them after clicking a buy link and they set their own cookies | after a click | their own policies |

Checked in the built output, not the source: no `<script>`, `<img>`, `<link>` or
font request in any `out/**/*.html` points at a third party. Fonts are
self-hosted by `next/font`. The `fonts.googleapis.com`/`typekit` strings in the
JS bundle are Next.js framework internals, not requests. Payment providers:
none connected. Deliberately NOT installed: CJ's `am.js` (impression tracking,
see `CLAUDE.md`), any ad or retargeting pixel.

## 3. What a person must do (not code)

1. **Deploy the console**: `cd products/affiliate-sites/counterscent-producers && npx wrangler@4 deploy`. Until then `/refunds#tr` lands on the English page and `/console/delete` 404s; the catalogue's links to both are already live.
2. **KVKK Art. 9 standard contracts** with Cloudflare, Google, Neon and Hostinger (and check Awin/CJ), and notify each signed one to the KVKK Authority within five business days. The privacy notices say this is in progress - make it true.
3. **VERBİS**: check whether the company must register (thresholds and exemptions depend on employee count, balance sheet and whether processing special-category data is the main activity). Not assessed here.
4. **Company identity on the policies**: full registered address, MERSİS number and KEP address. Today the policies say the address is "available on request". The CJ account and the policies now both say IGDIR İNŞAAT MADENCİLİK TUR. SAN. TİC. A.Ş.
5. **GA4 settings**: set data retention to 2 months (the policies promise "the shortest period Google Analytics offers") and confirm IP truncation/Google signals are off.
6. **Hostinger Sent folder**: the privacy notice says sign-in email copies are cleared regularly. Set up a recurring clean-up or retention rule, or change the sentence.
7. **OpenArt licence**: confirm the plan the six generated mood assets were made on grants commercial use (see `IMAGE-LICENSES.md`).
8. **Refund window**: 14 days is a founder decision; Paddle's guidance expects 30. Unchanged here.

## 4. What a lawyer should look at first

- Governing law and venue for producers outside Türkiye (`PRODUCER-TERMS.md` §15).
- Whether relying on standard contracts (section 3.2) covers every transfer, and the wording of both privacy notices on it.
- Whether the retention of listing history and audit rows after account deletion (≤10 years, legal-claims basis) is proportionate, and whether past audit rows containing an email should be pseudonymised on deletion.
- The consent banner's wording against the KVKK Board's cookie guidance (2022) and ePrivacy for EEA visitors.
- Consumer-law exposure: the site sells nothing to consumers today; producers are businesses. Revisit if that changes.
