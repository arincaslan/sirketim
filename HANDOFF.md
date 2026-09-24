# HANDOFF - 2026-09-24, on `win10`

## 2026-09-24: the payment rail — Paddle groundwork

The founder asked to apply to Paddle ("paddle vergi işini de çözüyormuş gibi adım
adım birlikte ilerleyip başvuralım"). No account was created — that is a founder
action — but everything that would have blocked the application was closed, and
one finding changed the risk picture.

**Two corrections worth carrying before anything else:**

1. **Paddle solves the BUYER's tax, not ours.** As merchant of record it owes and
   remits US sales tax, EU VAT and UK VAT on every subscription. It does not touch
   Sirketim's corporate tax, does not settle whether we must issue a *fatura* for
   each payout (unverified — Awin does not self-bill, which is why this matters),
   and does not answer 32 Sayılı Karar for Turkish producers or what a foreign MoR
   does to the services-export exemption. The last two are *mali müşavir*
   questions and always were.
2. **A SECOND acceptable-use risk was found, and it is the more dangerous one.**
   Paddle's AUP prohibits "advertising and marketing services" as a category
   separate from marketplaces, and **names job boards explicitly**. A job board has
   our exact shape: pay a subscription, visitor clicks through, transaction happens
   elsewhere, no buyer money through the platform. **That last clause was our
   strongest argument and it is worthless against this category** — it is equally
   true of a job board. The prepared enquiry email defended only the marketplace
   reading; it has been rewritten to defend both. See
   `departments/communication/reports/paddle-acceptable-use-enquiry.md`.

**What was blocking the application, now fixed.** Paddle's domain review requires
Terms, Refund Policy and Privacy Policy "clearly accessible via navigation", plus
the company's legal name in the Terms. We had privacy only.

| | |
|---|---|
| `counterscent.com/terms` | NEW. Derived from `PRODUCER-TERMS.md`, names **Sirketim A.Ş.** |
| `producers.counterscent.com/refunds` | NEW. Public, unauthenticated, **called and verified** — 200, correct content, footer link renders on other pages, POST answers 405 |
| Footers | both origins now link all three documents; the catalogue's bottom line names the legal entity |
| Refund window | **14 days**, founder decision — Paddle's guidance expects **30**. Deliberate, recorded in three places so a reviewer's objection is answered as a choice and not an oversight |

**The refund policy is on the CONSOLE, not the catalogue** — the founder moved it
there the same day, correctly: nothing on counterscent.com can be bought, so a
refund policy there describes a transaction that does not happen on the page
carrying it. The catalogue footer still links to it, so both origins satisfy the
"accessible via navigation" check with one canonical copy.

### Deployed 2026-09-24 — and ONE THING IS BROKEN ON PURPOSE UNTIL YOU ACT

**The console Worker is deployed** (version `e3169bd9`), verified from outside:
`producers.counterscent.com/refunds` answers 200 with the right content and the
footer link renders on `/sign-in`. This deploy also shipped the 09-21 front-door
fix and everything from 09-23 — the photograph upload and the mandatory photo.

> ## ⚠ A PRODUCER CANNOT SUBMIT A LISTING RIGHT NOW
>
> The three `MEDIA_*` secrets are **not set on the production Worker** —
> `wrangler secret list` shows only `ADMIN_EMAILS`, `DATABASE_URL`, the two
> `GOOGLE_*` and the two `HOSTINGER_*`. A photograph is mandatory to submit, so:
> attach one and the form says "Photograph storage is not configured on this
> deployment, so nothing was saved. This is ours to fix." Attach none and it
> refuses for the missing photo. Both roads are closed.
>
> **This was deployed knowingly, and here is the arithmetic.** Production holds
> **1 account, 1 producer (`ZELİHAHA`, gmail, created 09-18), and 0 submissions
> ever** — checked against the production database, not assumed. So the blocked
> form affects one almost-certainly-internal account with no history of using it.
> The alternative was to hold the console back, which would have left the
> catalogue's footer linking to a `/refunds` that 404s on every page of a public
> site. One honest dead end behind a login beat one broken link in front of
> everybody.
>
> **Note this also corrects a CLAUDE.md claim that had gone stale**: "every
> account on production today has no producer attached" was true when written and
> is not true now. The comment in `src/index.ts` was fixed to past tense.
>
> **THE FIX, ~2 minutes.** The credential `counterscent-worker-media` already
> exists on the production branch (`br-holy-hall-aykldsdj`, scopes
> `storage:read`+`storage:write`, created 09-23) but Neon shows a secret only at
> creation, so if it was not saved, mint a new one in the Neon console on that
> branch. Then, from `counterscent-producers/`:
>
> ```
> npx wrangler@4 secret put MEDIA_S3_ENDPOINT
> npx wrangler@4 secret put MEDIA_ACCESS_KEY_ID
> npx wrangler@4 secret put MEDIA_SECRET_ACCESS_KEY
> ```
>
> The endpoint is the **production** branch host, not the local-dev one in
> `.dev.vars` — that file points at `br-dry-glade-aybccqyo` and must stay that
> way. **Then prove it by submitting a listing with a photograph**, not by
> re-reading this. Secrets take effect without a redeploy.

**The catalogue is deployed by the push** — Cloudflare Workers Builds runs
`wrangler deploy` from the repo root on `main`. What it ships: `/terms`, the two
new footer links, the legal entity in the footer line.

---

### Picking this up on `Semih` (the other machine)

Everything in this section is state that does NOT travel with a clone or a pull.

| What | Why it is missing on the other machine | How to get it |
|---|---|---|
| **`MEDIA_*` in `.dev.vars`** | `.dev.vars` is gitignored by design | Mint a `storage:read`+`storage:write` credential on the **`local-dev`** branch in the Neon console and paste the three values. Do NOT copy the production pair into local dev. |
| **The `neon` MCP** | USER-level install, lives in `C:\Users\win10\.claude.json`, exists only on `win10` | `npx neon auth` + `npx neon link --project-id holy-sunset-91521586 --branch production -y`. Note the CLI writes **`.env.local`**, not the `.env` that `.dev.vars.example` describes, and Prisma auto-loads `.env`. |
| **Cloudflare auth** | `wrangler login` writes to `%APPDATA%\xdg.config\.wrangler\`, per-user | `wrangler login`, or set `CLOUDFLARE_API_TOKEN` — an API token does not lapse nightly, the OAuth one does, and `wrangler whoami` will still print your account after it has. |
| **`npm install`** | two self-contained projects | Run it in `fragrance-dupes` AND `counterscent-producers`. |

**Verifying the two new pages on the other machine.** The catalogue's `/terms` shows
up in `npm run build` output. The console's `/refunds` needs `npx wrangler@4 dev
--port 8791 --local` and then an actual `curl` — it was proved here by calling it
(200, content present, footer link rendering on `/sign-in`, `POST` answering 405),
and that is the standard this repo holds itself to. It touches no database and no
secret, so it works even with an empty `.dev.vars`.

---

**Not done, and each one is a founder action:**

- **Create the Paddle account.** Four phases follow it: account verification →
  domain review (5-7 business days if it goes manual) → business identification →
  identity verification.
- **Ask the AUP question.** Better from inside the account than by pre-sales email.
- **Confirm the registered unvan.** The site now says "Sirketim A.Ş." from
  `PRODUCER-TERMS.md` §1. Business identification checks the site's name against
  the registration document; a mismatch is rework at the slowest stage.
- **Get a lawyer over the published terms.** They bind people now. Governing law
  and the data section were flagged as needing it while they were still a draft.

---

## 2026-09-23 and earlier


**The 09-21 body is kept below from "Verified live" onward.** Everything above that
line was rewritten today. Where a 09-21 statement is now false, it is corrected
here rather than left to be discovered.

Everything claimed as done today was **verified by calling it**, not read off a
document. Where something is a claim I did not test, it says so.

---

## The one-line state

The producer programme is **built and open on the free tier**, a producer can now
**attach a photograph**, and the route from an approved listing into the public Dupe
Finder **exists for the first time**. Both were built and proved end to end today.

**Neither is switched on.** The export step refuses to run until two founder
decisions are made, and nothing is deployed. See START HERE.

---

## 2026-09-23: photographs, and the export step

### Photograph upload - DONE and proved

A producer must now attach a photo to submit a listing. Proved with a real
multipart upload against `wrangler dev`, not by reading the code.

| | |
|---|---|
| Store | **Neon Object Storage**, bucket `producer-media` on BOTH branches |
| Credentials | one scoped pair per branch, `storage:read`+`storage:write`, **no database access** |
| Served from | `producers.counterscent.com/media/<key>`, private bucket, Worker-proxied |
| Proved | upload, byte-identical read-back, retention across a failed submit, real preview, foreign-key rejection, encoded path traversal refused, POST refused |

**Cloudflare R2 was the founder's first choice and was set aside on one fact:** R2
is not enabled on the account and enabling it is a dashboard step, while Neon
storage was already enabled. R2's advantages (no credential at all, no egress
charge) are unchanged and it stays the likely endgame. Swapping is `src/lib/media.ts`
plus three secrets, **not a migration**, because the database stores the path
`/media/<key>` and never a provider hostname.

Two things worth carrying:

- **`UNSIGNED-PAYLOAD` is not an optimisation here, it is the only version that
  fits.** Measured against the real bucket: signing a 2 MB body costs **58ms**,
  unsigned costs **3.8ms**, and the Workers free plan gives **10ms of CPU per
  request**. Same shape as the PBKDF2 measurement that killed password sign-in.
- **A bucket does NOT appear on a branch created before the bucket.** `local-dev`
  branched 09-18, the bucket was made 09-23, and local-dev needed its own
  `CreateBucket` call.

### The export step - WRITTEN and proved, but gated

`counterscent-producers/scripts/export-listings.mjs`. This is the thing a producer
actually pays for and **it did not exist**: `producer-listings.generated.ts` had sat
empty since the programme was designed, its own header saying it is "written by the
export step of the producer console", and nothing wrote it.

It writes three files and read-only on the database by default:

```
node scripts/export-listings.mjs               write the three files
node scripts/export-listings.mjs --mark-live   AFTER the catalogue deploy
node scripts/export-listings.mjs --check       fail if output would change
```

**Proved end to end** against `local-dev` with a real approved row: export ->
`npm run build` in the catalogue succeeds -> `/go/producer-<slug>-<listing>` lands
in `_redirects` (620 -> 622). All test data was reverted afterwards; the three
generated files are back to empty and the fixtures back to PENDING.

---

## THE TWO DECISIONS THAT GATE IT (founder, tomorrow)

The script **refuses to run** until each is set. Both are in the file's header with
the full reasoning next to the value.

### 1. `pyramidSource` for a producer-declared pyramid

**The build already answered half of this, and that changes the question.** Running
a real export through `npm run build` produced:

> Producer listing "..." claims pyramidSource "declared" with no pyramidBasis.
> Either record where the producer publishes that pyramid (source, quote, url,
> checkedOn) or set pyramidSource to "imputed".

So `declared` is **earned**, by citing where the producer publishes the pyramid -
and the submit form collects no such citation. **The only shippable value today is
`imputed`**, which drops the whole "-10 penalty advantage for subscribers" worry:
a producer sits in the same bucket as the 47 merchant listings we had to guess at.

The real question left is narrower: **is it worth adding a "where do you publish
this pyramid" field to the form** so a producer can earn `declared`?

### 2. May a producer's photograph be published?

Technically ready - the catalogue sends **no CSP at all**, checked, so embedding
`producers.counterscent.com/media/...` works. What is missing is not technical:
**nothing in the form asks the producer to warrant they hold the rights to the
image.** The catalogue's own rule for bottle photography is "supplied by an
affiliate programme we are enrolled in, or a bottle we own"; a producer's own photo
is a legitimate third case, but we would be republishing it on an assumption.

Closing it is small: a required checkbox on `/console/submit`, stored on the row,
read by the exporter. Schema change plus a form field.

Until it is set, listings export **without** photographs and render the generated
note-signature mark. A missing checkbox withholds the picture, never the listing.

---

## Still open from today, not blocking

- **`Submission.imageUrl` is still nullable in the database.** The mandatory-ness is
  enforced in application code only, which this repo's own lesson says is enforced
  only between requests. Making it `NOT NULL` is a schema decision and one existing
  local-dev fixture row would need backfilling first.
- **EXIF is not stripped.** The 10ms CPU budget does not allow decoding an image. The
  submit form warns the producer in plain words instead. Real fixes: Cloudflare
  Images ($5/mo) or client-side.
- **Session tokens are stored RAW in the database.** Unrelated to today's work, found
  while testing. `VerificationToken` is hashed and `lib/auth.ts` explains why -
  "a read of this table should not by itself hand someone a working sign-in link" -
  and that argument is *stronger* for sessions, which live 30 days rather than
  minutes. Not changed: it would invalidate every live session.
- **Production storage secrets are not set.** `MEDIA_S3_ENDPOINT`,
  `MEDIA_ACCESS_KEY_ID`, `MEDIA_SECRET_ACCESS_KEY` exist in `.dev.vars` (local-dev
  branch) only. The production-branch credential was created and must be loaded with
  `wrangler secret put` before the photo field works on the live origin.
- **The 09-21 deploy is still not done**, so `producers.counterscent.com` still says
  the payment provider question "has not been answered". It was answered on 09-20.

---

## START HERE TOMORROW

1. **Make the two decisions above.** Both are one line in
   `counterscent-producers/scripts/export-listings.mjs`. Everything else is blocked
   behind them.
2. **Set the three production storage secrets** with `wrangler secret put`.
3. **Deploy the Worker** (this also ships the 09-21 front-door fix).
4. **Then payment**, `FINALIZATION-GUIDE.md` Phase 5 task 5.4. Paddle, already
   decided; the Paddle marketplace-policy question still needs asking in writing.

---

## Verified live, 2026-09-21

### Catalogue, `counterscent.com`

| | |
|---|---|
| Sitemap | 241 URLs |
| Fragrance pages | **218** (was 216; Phase 4 closed 09-20) |
| Phase 4 spot check | `/fragrance/alien/` 200, `/fragrance/a-men/` 404 - Alien in, A*Men out, as intended |
| Other surfaces | `/new`, `/originals`, `/library`, `/producers`, `/disclosure` all 200 |
| Buy buttons | bottle sizes render (10/30/70/100ml seen) |

### Producer console, `producers.counterscent.com`

Signed in **end to end as a real user** to check this: requested a magic link from
production, read the mail out of the `contact@counterscent.com` mailbox over the
Hostinger mail API, spent the token once, got a `__Host-session` cookie.

| Route | Anonymous | Signed in |
|---|---|---|
| `/`, `/health`, `/sign-in`, `/robots.txt` | 200 | 200 |
| `/console` | 200 | 200 |
| `/console/company`, `/plan`, `/submit`, `/withdraw` | 401 | **200** |
| `/console/accounts` | 302 | 200 |
| `/auth/google/start` | 302 to Google | - |
| `/verify` (no token) | 400 | - |
| `/admin`, `/admin/queue`, `/admin/people`, `/review` | 404 | 404 for a non-admin |
| `/standards` | 404 | not built (redesign task W6) |

The mail rail also proved its replay guard: a token requested twice answered **410**
on the second use.

### Database (Neon, project `holy-sunset-91521586`)

Two branches, both now on **all 5 migrations**: `production` (default) and
`local-dev` (branched 09-18, was 2 migrations behind until this session).

Production holds **3 users, 1 producer, 0 submissions, 0 listings**. The programme
has never had a real producer through it.

---

## This machine (`win10`) is fully set up

`npm install` was incomplete here - `@neon/config`, `@neon/env`, `@neondatabase/serverless`
and `prisma` were all missing, which is what made `neon env pull` fail. Fixed.

| | |
|---|---|
| `node_modules` | both projects complete |
| `.neon` | linked to `local-dev` |
| `.env.local` | pulled from Neon (3 vars) |
| `.env` | the 2 Prisma vars, copied from `.env.local` |
| `.dev.vars` | **all 6 values filled** |
| Cloudflare auth | works - proven with a real `wrangler secret list`, not `whoami` |

All five of those files are gitignored, re-checked this session because this repo is
public.

**Worker secrets in production (6):** `ADMIN_EMAILS`, `DATABASE_URL`,
`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `HOSTINGER_MAIL_API_TOKEN`,
`HOSTINGER_MAILBOX_ID`.

---

## Four things that will waste your time if you do not know them

1. **`npm run dev` cannot complete a Google sign-in.** `wrangler dev` rewrites the
   request host to the custom domain, so `redirectUriFor()` emits
   `https://producers.counterscent.com/auth/google/callback` and the callback lands on
   production. `--host 127.0.0.1` drops the port and gives a port-80 URI, which is no
   better. The only form that works is
   **`npx wrangler dev --port 8788 --host 127.0.0.1:8788`**, which emits
   `http://127.0.0.1:8788/auth/google/callback`. That URI is **not yet registered** in
   the Google console. All three were tested this session.

2. **The mail API can read the inbox, not just send.** Useful for testing sign-in
   without a browser:
   `GET /api/v1/mailboxes/{id}/folders/INBOX/messages` lists, and `/messages/{uid}/source`
   returns the raw RFC822 message. There is no `/body` or `/content` route; the single
   message endpoint returns headers only. Decode quoted-printable before regexing for
   the link, or the token comes out starting with `3D`.

3. **`UID` is a readonly variable in bash.** A `UID=$(...)` assignment silently fails
   and leaves the shell's own uid in place. Cost one wasted magic link here.

4. **`wrangler dev` leaves orphan `workerd.exe` processes** that respawn when killed
   individually. Kill the parent node processes whose command line contains `wrangler`,
   then `workerd`, or they accumulate.

---

## Open, and every one needs the founder

1. **Payment integration (5.4).** The decision is made and is not in question: **Paddle,
   paid out to the company Payoneer account, annual billing preferred.** ~7.3% effective
   on annual, ~10.6% on monthly. Paddle cannot bill in TRY, so a Turkish producer is
   served by invoice and bank transfer for now, which needs no PSP. Full working in
   `departments/accounting/reports/payment-rails-investigation.md`.

2. **All credentials get reset at the end of the project** - founder decision 09-21,
   taken deliberately rather than by omission. A Neon role password and a Google client
   secret both reached this session's transcript; neither reached the repo, git history,
   or anything public, which was measured rather than assumed. **The one thing that
   would change this: session narratives get copied into dashboard task notes, and those
   are committed to a public repo.** Do not paste transcript content into a task note.

3. **`ADMIN_EMAILS` is now `mavihawk@gmail.com` only** (set this session on founder
   instruction). `contact@counterscent.com` is no longer an admin. Say so if that was
   not intended.

4. **Console redesign phase 1 is planned and mostly unbuilt.** `CONSOLE-REDESIGN-TASKS.md`
   has the 12 tasks, but **its F1 section is now stale in both halves** - see the image
   decisions below, and note the tier rename is already done (next item).

5. **The `Featured` to `Unlimited` rename is DONE, and the task doc is wrong about it.**
   Checked this session: `src/generated/plans.ts:72` reads `name: "Unlimited"`.
   `CONSOLE-REDESIGN-TASKS.md` still claims it says `"Featured"`, written 09-18 before
   the rename shipped. The word `featured` does survive on the public
   `counterscent.com/producers/` page, but only inside the promise wording - "a premium
   or **featured** slot in results" is in the list of things a paid tier never buys -
   which is exactly what the 09-18 decision said to keep. Nothing to do here.

6. **IMAGE DECISIONS, founder 2026-09-21.** These supersede the redesign doc's F1 item 1
   and the COO's "cut images from phase 1" recommendation.

   - **Images are IN, and the CSP gets relaxed** to allow them.
   - **A producer MUST attach at least one photo when submitting a listing.** Reason
     given: these listings appear in the dupe finder and must not be image-less. This is
     a new mandatory field, so it touches the submit form, its validation, and the
     schema. **The open question nobody has answered: where does an uploaded photo
     live.** This Worker has no R2 bucket and no object storage configured. Neon Object
     Storage is one candidate and branches with the database; R2 is the other. Decide
     this before building the field, not during.
   - **Every original fragrance should carry an image.** Measured this session:
     **198 of 217 originals have one, 19 do not** - `the-most-wanted`, `sycomore`,
     `antaeus`, `oud-for-greatness`, `side-effect`, `psychedelic-love`, `rehab`,
     `love-dont-be-shy`, `straight-to-heaven`, `aqua-universalis`, `elysium`,
     `roja-enigma`, `reflection-man`, `pure-xs`, `althair` and four more. **These are not
     a TODO anyone can just do.** The catalogue deliberately ships no photographs of its
     own of designer bottles, because that reproduces protected trade dress; every image
     it carries comes from a merchant feed we are licensed to use. So closing these 19
     means finding a merchant that stocks them, not taking or generating a picture.

7. **Google consent screen** - confirm it reads *In production*, not *Testing*. Not
   checked this session.

8. **The Hostinger invoice split** (1,680.00 TRY), which still blocks the CFO. No agent
   can retrieve it; the API token is scoped away from billing.

9. **`origin/claude/department-collaboration-view-iqy07o`** is an orphan branch with no
   merge base against `main` - the 2026-08-19 scaffold. Almost certainly safe to delete,
   but that is the founder's call.

---

## ~~START HERE TOMORROW~~ - the 09-21 list, all three items now DONE or MOVED

Kept as the record of what the plan was, not as a task list. The live one is at the
top of this file.

1. ~~Decide where an uploaded producer photo lives.~~ **Neon Object Storage**, 09-23.
   R2 was chosen first and set aside because it is not enabled on the account.
2. ~~Build the mandatory photo field.~~ **Done and proved 09-23.**
3. Payment - still last, still Paddle, now behind the export step as well.

Everything in the "two stale front doors" section below was **fixed and committed**
on 2026-09-21 (`e611d65`). It is kept as the record of what was wrong, not as a task.
**It is still not deployed**, so the live origin still carries the old copy.

---

## FIXED 2026-09-21: there were two stale front doors, and both are now corrected

`counterscent.com/producers/` - the public catalogue's own producer page, and the more
widely read of the two - opened with:

> "**The producer program has not launched.** There are no producer accounts, no billing
> connected to this site, and **nothing on this page can be signed up for today.**"

False on every clause except billing. It is the same class of stale claim as the six
fixed on the Worker this session, and it lived in the **Next.js catalogue**, a separate
project with its own house style. Five places carried it in the end: `/producers`,
`/producers/pricing`, `/producers/login`, `/producers/submit` and the submission form's
own fallback. All eleven claims across both projects are corrected, lint and build are
clean, and the built HTML in `out/` was checked to carry the new copy.

---

## ~~Uncommitted right now~~ - COMMITTED 2026-09-21 in `e611d65`, still NOT DEPLOYED

This section said "not committed" and was already wrong when the next session read
it. The file was committed the same day. What is still true is the second half: it
has never been deployed, so every sentence below is **still live on
`producers.counterscent.com` right now** - checked by fetching the page on 09-23.

`src/routes/overview.ts` - the public overview page was describing a product that had
not been built yet. Six false claims corrected:

- "Not open yet" and "there is still no way to submit anything"
- "the pages below are what has been designed rather than what is running"
- "It will not put you anywhere useful yet"
- "there is nothing to submit with"
- "the review queue is still a layout preview" (it shipped 09-18)
- billing is "behind a question to the payment provider that has not been answered"
  (the provider was chosen 09-20)

Typecheck clean, rendered and read back locally, zero em-dashes per house style.
**Committed, not deployed** - deploy is F2 in the task plan, a founder step.
