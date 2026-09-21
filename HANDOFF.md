# HANDOFF - 2026-09-21, on `win10`

**Rewritten from scratch this session.** The previous 1,542-line file was thirteen
sessions of notes stacked on top of each other, three days stale, and its whole
"machine switch" section described a move that never happened. It is in git history
if anything is ever needed from it (`git show f56bda8:HANDOFF.md`).

Everything below was **verified by calling it today**, not read off a document.
Where something is a claim I did not test, it says so.

---

## The one-line state

The producer programme is **built and open on the free tier**. A producer can sign
in, create a company, submit a listing, withdraw it, and a staff member can review
it. The only piece missing is **payment**, and that is deliberately last.

**Next session starts on payment.** See `FINALIZATION-GUIDE.md` Phase 5, task 5.4.

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

## Found and NOT fixed: there are two stale front doors, and only one was corrected

`counterscent.com/producers/` - the public catalogue's own producer page, and the more
widely read of the two - still opens with:

> "**The producer program has not launched.** There are no producer accounts, no billing
> connected to this site, and **nothing on this page can be signed up for today.**"

False on every clause except billing. It is the same class of stale claim as the six
fixed on the Worker this session, but it lives in the **Next.js catalogue**, a separate
project with its own house style, so it was not touched in the same pass. Fix it next,
before anything else on the redesign: a producer who lands here is told the programme
does not exist.

---

## Uncommitted right now

`src/routes/overview.ts` - the public overview page was describing a product that had
not been built yet. Six false claims corrected this session:

- "Not open yet" and "there is still no way to submit anything"
- "the pages below are what has been designed rather than what is running"
- "It will not put you anywhere useful yet"
- "there is nothing to submit with"
- "the review queue is still a layout preview" (it shipped 09-18)
- billing is "behind a question to the payment provider that has not been answered"
  (the provider was chosen 09-20)

Typecheck clean, rendered and read back locally, zero em-dashes per house style.
**Not committed and not deployed** - deploy is F2 in the task plan, a founder step.
