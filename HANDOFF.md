# Handoff - started 2026-09-05, last updated 2026-09-16 (second session, end)

**Perishable.** This is where a working session stopped, not a permanent document. When its open items are done, delete it rather than letting it rot into a false account of the project. Durable lessons belong in the relevant `CLAUDE.md`; the ordered roadmap belongs in `products/affiliate-sites/fragrance-dupes/FINALIZATION-GUIDE.md`.

Machine setup is `SETUP.md`. This file is only about *what state the work is in*.

---

# 2026-09-16 (third session) - STEP 5 IS DEPLOYED AND WORKS END TO END

**Auth is live on `producers.counterscent.com` and a real magic link has been
sent, received and used.** Everything below this block that says step 5 is
unshipped describes the state before this session; it is kept for the reasoning,
not the status. **Still uncommitted** - the deploy came from the working tree.

Version ID `9e5cd6a0-0f10-44c7-a9db-fa2df6b81fe9`. Migration
`20260916143000_add_rate_limit` applied to Neon `production` BEFORE the deploy,
in the order the 503-fails-closed design requires.

## What was proven, by observation rather than inference

| Check | Result |
|---|---|
| `POST /sign-in` (real address) | 302 -> `?sent=` |
| Email actually arrived | INBOX uid 4, 14:34:22Z, `From: Counterscent` |
| Magic link followed | 302 -> `/`, `__Host-session` set |
| Cookie attributes | `HttpOnly; Secure; SameSite=Lax; Path=/` |
| Cookie expiry | `Fri, 16 Oct 2026` - **30 days out, so the timezone fix is real** |
| Token replayed | **410 Gone** - single use holds |
| Garbage token | 410, identical - reveals nothing |
| DB after | `User` 1, `Session` 1, `VerificationToken` **0** (consumed) |

The cookie expiry deserves the emphasis: under the bug this fixed, every session
was born already expired. Thirty days is the observable proof it is gone.

**The global cap counts SENDS, not requests, and that is now measured rather than
designed:** four POSTs hit the IP bucket (`signin-ip:...` = 4) while
`signin-send:global` = 1, because only one of the four ever reached the mail call.

## ~~BUG FOUND IN PRODUCTION: unguarded `formData()` returns a generic 500~~ FIXED

`src/routes/sign-in.ts` did `await request.formData()` with no try/catch, so a
POST whose body was absent or unparseable threw and the Worker answered **500** -
reproduced twice on the live origin. Exactly the fake-failure shape the rest of
that file goes to great lengths to avoid.

**Fixed and redeployed the same session** (version
`51a74ba2-3502-4215-a4d2-3183a9bbc1e6`), and verified against the live origin:
the same malformed POST now answers `302 -> /sign-in?error=invalid-email`.

It is given the SAME answer as a malformed address rather than a distinct status,
on purpose - a request with no readable body carries no usable address either, and
two shapes would be two things to keep in step for no gain. The rate-limit slot is
spent either way, because the bump runs before the body is read.

## The limiter was exercised, not just reasoned about

With the IP bucket at 5 of 5, the sixth request in the window answered
**`429 Too Many Requests` with `Retry-After: 237`**. Both the refusal and the
countdown are real.

One trap for whoever reads the bucket table directly: `windowStart` is a zoneless
`TIMESTAMP(3)`, so pulling the raw value into JavaScript and calling
`toISOString()` on it prints a time three hours off the mailbox's own timestamps
(Turkey is UTC+3) and looks alarmingly like a clock bug. **It is not one.** Every
comparison the limiter makes happens in SQL, where the two coercions cancel - ask
Postgres for the remaining seconds rather than computing them in JS, and the
number agrees with `Retry-After` exactly.

## Practical notes for whoever tests next

- **The per-IP bucket for this office is at 4 of 5** for a ten-minute window from
  14:34Z. The next request from the same address is the last before a 429. The
  window is fixed, not sliding - it resets ten minutes after the FIRST request.
- The founder's mailbox now holds two "Sign in to Counterscent" messages that are
  tests (INBOX uid 3 = a pre-deploy smoke test sent directly via the API, uid 4 =
  the real Worker send). Neither is a real sign-in request.
- **A signed-in producer still lands in an empty room.** `/console` and `/review`
  hardcode "signed out" until step 6. Auth working does not mean the console works.

## OPEN ACTION carried forward, do not lose this

`HOSTINGER_MAIL_API_TOKEN` on the Worker currently holds **the founder's own
`HOSTINGER_MAIL_TOKEN` value**, by an explicit decision to get a test today and
rotate after. Until a separate hPanel token replaces it, revoking the Worker's
token on suspicion also kills the founder's `hostinger-email` MCP server
mid-incident. That is the entire reason the two were meant to be distinct.

---

# 2026-09-16 - step 5 is BUILT AND UNCOMMITTED; the mail rail question is settled

**Start here.** Two sessions ran on 2026-09-16. The first built step 5 (auth) and
left three open questions. The second answered all three and changed code to match.
Sections below that are struck through were open at the time and are now closed -
they are kept because they record *why*, which the resolution alone does not.

## What the second session changed, and what it did NOT do

**Changed, in the working tree only:** the Worker's mail rail (hand-rolled SMTP ->
Hostinger's HTTP Email API, `src/lib/smtp.ts` deleted), the `Session.expires`
timezone bug, the 100/day cap's stated basis, the secret names in `env.ts` and
`.dev.vars.example`, and every stale SMTP reference including one piece of
user-facing copy on `/sign-in`. Plus this file, `SUBSCRIPTION-PROGRESS.md` and the
root `CLAUDE.md`.

**Verified rather than asserted:** `npm run typecheck` exits 0 and
`wrangler deploy --dry-run` bundles clean (254 KiB) in `counterscent-producers/`;
the catalogue in `fragrance-dupes/` builds at exactly 620 affiliate redirects and
248 route outputs.

**NOT done, and deliberately:** nothing was committed, pushed or deployed. No
secret was set. No email has ever been sent by this Worker on any rail - the first
real send is still the first proof the mail path works.

## The shortest path to a working sign-in, in order

1. **Founder reviews the diff.** This was asked for before any commit and has still
   not happened. It is the only step with no technical prerequisite.
2. **Issue a separate Hostinger mail token** for the Worker (hPanel) -
   `HOSTINGER_MAIL_API_TOKEN`. Not the general `HOSTINGER_API_TOKEN` (that one fixes
   the MCP servers, see item 3 below) and not the founder's `HOSTINGER_MAIL_TOKEN`.
   Three distinct credentials on purpose; the reasoning is in `src/lib/env.ts`.
3. **Apply the migration BEFORE the Worker ships.** `POST /sign-in` fails closed
   with a 503 when its rate-limit table is missing, so shipping first means sign-in
   answers 503 to everyone until the migration runs. Needs `neon link` credentials.
4. **`wrangler secret put`** `DATABASE_URL`, `HOSTINGER_MAIL_API_TOKEN`,
   `HOSTINGER_MAILBOX_ID` (`AC9278a32f3d4ca8bd1119f31c2d1c` - an identifier, not a
   credential). Cloudflare auth does not travel between machines and the OAuth token
   lapses overnight; `CLOUDFLARE_API_TOKEN` is unset here.
5. **Deploy, then click "email me a sign-in link" once.** Confirm it by looking in
   the mailbox's `INBOX.Sent` - the API saves a copy of every message it sends,
   which SMTP-from-a-Worker would not have done.

## Still open, and only the founder can close them

- **The 1,680.00 TRY Hostinger invoice split**, and whether auto-renew is on for
  `counterscent.com`. Tested 2026-09-16 rather than assumed: the API token is scoped
  so `/renewal` and `/api/billing/...` both answer 401 while portfolio reads work.
  `departments/accounting/ledger.md` was right that this needs the invoice. It is
  what blocks the CFO, and therefore the dedicated-sending-mailbox decision.
- **Whether a dedicated sending mailbox is worth it.** The argument is
  deliverability, NOT security: automated mail from `contact@` means a spam
  complaint takes out sign-in and the address customers write to as one incident.
- **Whether a working login should sit on a public origin before step 6 gives it
  anything to do.** Step 5 is sign-in only; `/console` and `/review` still hardcode
  "signed out" for everyone by design, so a producer who signs in lands in an empty
  room.

## Nothing from step 5 is committed or deployed
## Nothing from step 5 is committed or deployed

The entire auth build sits in the **working tree only**. `git status` shows it:
new `counterscent-producers/src/lib/{auth,db,mailer,env,rate-limit}.ts` (the
sixth, `smtp.ts`, was written then deleted the same day and never committed), new
`src/routes/{verify,sign-out}.ts`, modified `src/index.ts`/`sign-in.ts`/`http.ts`,
moved `prisma/` and `neon.ts`, plus `HANDOFF.md`/`SUBSCRIPTION-PROGRESS.md`. The
founder asked to review the diff before any commit, and that review has not
happened. **Live production is still the pre-auth skeleton** — verified from
outside: `/verify` returns 404 and `POST /sign-in` returns 405. So none of the
auth code is exposed, and there is no rush created by a half-deployed state.

Unrelated and also uncommitted, from an earlier session: a modified
`milena-dranka/post-log.md` and seven untracked `.mp4` files under that
campaign's `assets/`. Not this work; leave them or ask.

## ~~The decision that should be taken BEFORE any secret is set~~ - TAKEN 2026-09-16

**Decided and implemented: the Worker sends over Hostinger's HTTP Email API, and
`src/lib/smtp.ts` is deleted.** What follows is kept because it records why, and
because the credential question it raises is still open in one respect (below).

The hand-rolled SMTP client had never touched a live mail server and rested on an
assumption nobody had confirmed: that outbound TCP on port 465 works on this
Workers plan (port 25 is blocked everywhere by policy; 465/587 by plan tier was
never verified). **That assumption could only ever be tested by deploying**, which
is what settled it - an HTTP call's failure modes can be exercised from a laptop
before a secret is set. The client was deleted rather than kept as a fallback:
two rails means both credentials live on the Worker, and keeps an untested path
alive for exactly the moment things are already going wrong.

Confirmed live this session by calling the API directly with the founder's token:

| | |
|---|---|
| Mailbox | `contact@counterscent.com`, `resourceId` `AC9278a32f3d4ca8bd1119f31c2d1c` |
| Order | `orderResourceId` `OR73daa96936ee6ec5f961040c38f7` (one mailbox on it) |
| Send endpoint | `POST /api/v1/mailboxes/{mailboxResourceId}/send` |
| API rate limit | `X-Ratelimit-Limit: 300` (window not established — that is an API call budget, NOT a proven mail-sending cap) |

Swapping to `fetch()` against that endpoint would delete the hand-written
protocol implementation and the port-465 question in one move — the single
largest unproven piece of step 5. **It also changes which secrets the Worker
needs**, which is why it should be decided before `wrangler secret put` is run,
not after.

**The objection, now established rather than suspected.** The full operation
list was enumerated: that token reaches message read/search/attachments, single,
bulk and **whole-folder delete**, folder CRUD and full webhook management.
**Hostinger's Email API publishes no send-only scope.** SMTP credentials are no
narrower - they are the mailbox's own password, so they imply IMAP and webmail
too. It is a wash on exposure, and the swap was decided on verifiability, not
security. Two things follow that are NOT yet done:

1. **The Worker's token must be issued separately from the founder's
   `HOSTINGER_MAIL_TOKEN`.** Not because it is narrower - it isn't - but because
   revoking a shared token breaks the founder's own tooling, so the revoke gets
   deferred, which is how a suspected compromise becomes a real one. Needs the
   founder in hPanel. *Unverified: whether Hostinger issues multiple tokens.*
2. **Revoking a token does not remove a webhook created with it.** On any
   suspicion: revoke AND enumerate the mailbox's webhooks.

One mitigation the API's own docs make cheaper than feared: `403` is documented
as "token is not authorized to manage the requested mailbox", so tokens are
authorized per-mailbox - a mailbox added later is not automatically reachable by
an existing token. A dedicated send-only mailbox therefore remains a live option,
but the argument for it is **deliverability, not security**: automated mail from
`contact@` means a spam complaint takes out sign-in and the address customers
write to as one incident. Its cost is unknown because
`departments/accounting/ledger.md` still records the Hostinger row as "split
unknown / Annual (assumed - unconfirmed)".

**The 100/day global cap stays at 100, and its stated basis was rewritten.** The
`X-Ratelimit-Limit: 300` header is NOT a send cap and must not be mistaken for
one - measured 2026-09-16, the counter reset between two calls four minutes apart
while decrementing 299 -> 298 within four seconds, so it is a short-window budget
on API *calls*. It bounds 429s, not mailbox suspension, and does not constrain
100 sends/day at all. The cap is now argued from the demand side, which is
observable: zero enrolled producers, launch volume in single digits per day, so
100 is ~20x headroom. Review trigger recorded in the file: ~10 active producers,
or the first send Hostinger rejects.

## The deploy sequence, and the one ordering that breaks it

`POST /sign-in` **fails closed with a 503 when its rate-limit table is missing.**
So the migration has to be applied BEFORE the Worker ships, or sign-in answers
503 to everyone until it runs.

1. Apply `20260916143000_add_rate_limit` (`npx prisma migrate deploy` from
   `counterscent-producers/`) — needs `neon link` credentials.
2. `wrangler secret put DATABASE_URL`, plus whichever mail secrets the decision
   above lands on.
3. ~~**Re-run the catalogue build.**~~ **CONFIRMED 2026-09-16, independently.**
   After `@prisma/client`, `prisma`, `@neon/config` and `@neon/env` were removed
   from `fragrance-dupes/package.json`, `npm run build` exits 0 at exactly **620**
   affiliate redirects (`grep -c '^/go/' public/_redirects`) and **248** route
   outputs (244 HTML + `icon.svg`, `index.txt`, `robots.txt`, `sitemap.xml`). The
   earlier subagent figure was right; it is now measured rather than relayed.
   Note `wc -l` on `_redirects` reads 626 - six of those lines are the generated
   header's comments.
4. Founder reviews the diff, then commit.
5. Deploy. The first "email me a sign-in link" click is also the first real proof
   the mail path works at all, whichever rail it ends up on.

## Open, small, and still undecided

- ~~**`Session.expires` carries the same timezone bug.**~~ **FIXED 2026-09-16.**
  `createSession()` now computes the expiry in SQL with `now() + interval`, the
  same shape as the verification-token fix. The cookie deliberately keeps a
  Worker-computed `Date`, because a cookie's `Expires` is read by the *browser's*
  clock - feeding it a value read back out of a zoneless column would reintroduce
  the exact coercion the fix removes. Both mean "30 days from now"; they are said
  in two clocks' languages on purpose, and the code says so.
- **A signed-in producer lands in an empty room.** Step 5 is sign-in only —
  `/console` and `/review` still hardcode "signed out" for everyone by design.
  Whether a working login should sit on a public origin before step 6 gives it
  anything to do is a founder call, not a technical blocker.
- **Sessions are not bound to IP** (checked: the lookup keys on the cookie token
  and its expiry, nothing else), so a dynamic-IP reset does not sign anyone out.
  The rate limiter *is* IP-keyed, so a reset hands out a fresh allowance — which
  is precisely why the global send cap earns its place, and worth remembering
  that Turkish ISPs also put many subscribers behind one address.
- **CSRF is adequate now and will not be at step 6.** `SameSite=Lax` plus
  `form-action 'self'` and a POST-only sign-out covers today's two writes. Real
  state-changing actions (withdraw a listing) need actual CSRF tokens.

## ~~Hostinger Email MCP — configured, needs a VS Code restart~~ — WORKING 2026-09-16

Added as a 10th server in `.mcp.json` as `hostinger-email`, HTTP transport,
`Authorization: Bearer ${HOSTINGER_MAIL_TOKEN}`. The token is a **user-level env
var set with `setx`** and is not in the repo (verified: the literal appears in no
file).

It returned 401 on first use and **the token was not the problem** — a direct
probe with the same token returns HTTP 200 and a clean MCP handshake. The
variable simply was not in the running process's environment, so `${...}`
expanded to nothing. See the root `CLAUDE.md` for the durable version of this:
restarting the Claude session is NOT enough inside VS Code.

**The restart happened and both Hostinger credentials now work from inside the
MCP layer**, proven by real calls rather than `claude mcp list`:
`hostinger-email` `GET /api/v1/me` returns 200 with the one mailbox
(`contact@counterscent.com`, `AC9278a32f3d4ca8bd1119f31c2d1c`, order
`OR73daa96936ee6ec5f961040c38f7`), and `hostinger-domains` returns the two-domain
portfolio. Note the second one is a *change*: `HOSTINGER_API_TOKEN` was rejected
on this machine earlier the same day because the 2026-09-14 rotation had only been
applied on `win10`. It has since been applied here too. **This does not unblock
the invoice question** — that token is scoped, and `/renewal` and
`/api/billing/...` still answer 401.

## THE MAIL RAIL IS PROVEN — first email ever sent, 2026-09-16

**`POST /api/v1/mailboxes/AC9278a32f3d4ca8bd1119f31c2d1c/send` returned `204 No
Content`** — the exact status `src/lib/mailer.ts` treats as success — and the
message is in `INBOX.Sent` (uid 1, `From: Counterscent
<contact@counterscent.com>`, subject "Sign in to Counterscent"). Sent to the
sending mailbox itself, with the same endpoint, payload shape and display name
the Worker uses.

Three things this closes:

- **The port-465 question is moot forever.** It was the single largest unproven
  piece of step 5 and the reason the hand-rolled SMTP client was deleted. It can
  no longer be asked.
- **The "test it from a laptop before setting a secret" argument for choosing
  HTTP over SMTP is now demonstrated, not just asserted.** This is the payoff the
  rewrite was for; it is worth remembering next time a wire protocol looks
  tempting.
- **`INBOX.Sent` is confirmed as the place to look.** The API really does save a
  copy of everything it sends, which SMTP-from-a-Worker would not have done.

Note this proves the *rail*, not the *Worker*. The Worker has still never sent
anything.

## Secrets set on the Worker, 2026-09-16

Two of the three are set, verified with `npx wrangler secret list`:
`HOSTINGER_MAIL_API_TOKEN` and `HOSTINGER_MAILBOX_ID`. `DATABASE_URL` is NOT set
(blocked on Neon, below). Setting these did not change live behaviour — the
deployed code is still the pre-auth skeleton, which never reads them.

**`HOSTINGER_MAIL_API_TOKEN` currently holds the founder's own
`HOSTINGER_MAIL_TOKEN` value, by an explicit founder decision to get a working
end-to-end test today and rotate afterwards.** This is the thing `src/lib/env.ts`
and `.dev.vars.example` argue at length against, and the argument still stands —
it is not about exposure (the two tokens reach exactly the same operations) but
about revocation cost: **if this Worker is ever suspected of leaking, revoking its
token also kills the founder's `hostinger-email` MCP server mid-incident.**
**OPEN ACTION: issue a separate token in hPanel and `wrangler secret put` over
this value.** Until that happens the shared-token hazard is live.

## Two machine-specific gaps confirmed on `Semih`, 2026-09-16

Checked rather than assumed, because both decide whether the deploy sequence below
can even be started from this machine:

- **The `neon` MCP does not exist here.** It is a USER-level install that lives in
  `C:\Users\win10\.claude.json`; this machine's `C:\Users\Semih\.claude.json` has
  an empty `mcpServers`. There is also no `.dev.vars`, no `.env` and no
  `DATABASE_URL` in the environment. **Step 3 (apply the migration) has no
  credential on this machine** — it needs `neon link`, the MCP re-installed here,
  or to be run from `win10`.
- **Cloudflare auth, by contrast, is live here.** Proven with a real API call, not
  `wrangler whoami` (which reads from cache and has lied about exactly this):
  `npx wrangler secret list` in `counterscent-producers/` returns `[]` — the call
  succeeded, and the empty array independently confirms **no secret has been set on
  the Worker yet**, matching step 4 below being untouched.

---

# 2026-09-14/15 — the producer programme got its plumbing, and a second origin

Read the 2026-09-16 section above this one first, then this; everything below it
predates these two days and some of it is superseded here. The short version: **a listing submitted by a producer now
has a route onto the live site, four guards stop it arriving dishonestly, and
`producers.counterscent.com` exists.** No producer exists yet, nothing on the
public site changed for a reader except two new surfaces, and no score moved.

## SWITCHING MACHINES — read this before anything else

The founder is continuing on the other machine (`Semih`, not `win10`). Everything
in the repo travels. **Six things do not, and four of them will look like
breakage.** The older list further down this file is now incomplete; this one
supersedes it.

1. **`npm install` in TWO projects now, not one.**
   `products/affiliate-sites/fragrance-dupes/` as before, and the new
   `products/affiliate-sites/counterscent-producers/` (223 MB of node_modules,
   gitignored). The producer origin will not build or deploy without it.
2. **Cloudflare auth does not travel, and it expires overnight even in place.**
   `wrangler login` writes to
   `%APPDATA%\xdg.config\.wrangler\config\default.toml`, which is per-user, so
   the other machine has none. Worse, on this machine the OAuth token silently
   went stale between 14 and 15 Sep: `wrangler whoami` still printed a logged-in
   account and the full scope list from cache, while the actual API call failed
   with `Invalid access token [code: 9109]`. **`whoami` is not proof of auth —
   only a real call is.** If deploys are going to be run by an agent rather than
   by hand, create an API token (dashboard → My Profile → API Tokens → "Edit
   Cloudflare Workers") and set `CLOUDFLARE_API_TOKEN`; it needs no browser and
   does not lapse nightly.
3. **`HOSTINGER_API_TOKEN` was stale on this machine (`Semih`) and was
   REPLACED 2026-09-16.** The founder supplied the rotated value and it is now
   set as a user-level env var here, verified with a real call against
   `https://developers.hostinger.com/api/domains/v1/portfolio` (returns both
   domains). The value is NOT in the repo and must not be - this repo is
   public.

   **The four MCP servers that read it (`hosting`, `domains`, `dns`, `vps`)
   will keep failing until VS Code itself is relaunched**, because they read
   the environment at startup and a Claude session inside VS Code inherits VS
   Code's environment, not the freshly-written user environment. The fifth,
   `hostinger-email`, was unaffected throughout: it reads a separate
   credential (`HOSTINGER_MAIL_TOKEN`), which is exactly why the two are kept
   apart.

   **Worth recording, because it inverts the documented diagnosis.** The root
   CLAUDE.md says a 401 from a header-credential MCP server usually means the
   variable never expanded. Here it had expanded fine - present in both the
   user and process environment at the correct length - and the token itself
   was genuinely dead, because the 2026-09-14 rotation was applied on `win10`
   only. Both diagnoses look identical from the 401. The rule that actually
   discriminates is the one already in the root file: prove the credential
   with a direct call outside the MCP layer, then check the process
   environment - not one or the other.

   **This token is scoped, tested 2026-09-16:** domain portfolio reads
   succeed, while `/portfolio/{domain}/renewal` and `/api/billing/v1/...`
   both answer 401 with the same header. So `departments/accounting/
   ledger.md`'s standing claim that no agent can retrieve the 1,680.00 TRY
   invoice split **is confirmed rather than merely asserted** - it needs the
   invoice, and auto-renew status is not exposed either. The domain detail
   endpoint does return registration facts: both domains registered
   2026-08-27, both expiring 2027-08-27, both still delegated to Cloudflare
   nameservers - which corroborates the root CLAUDE.md's note that
   `parfumoza.com`'s NS delegation is a loose end rather than a live risk.

   **`CLOUDFLARE_API_TOKEN` is still unset here**, in both user and process
   env. That is the credential item 2 above recommends precisely so a deploy
   does not depend on an OAuth token that lapses overnight.
4. **`TWENTY_FIRST_API_KEY`**, `gh auth login`, and Claude Code's own login —
   per-machine as before.
5. **`.agents/` skills** — re-run the `npx skills@latest add` commands in
   `SETUP.md`. Two of them are now mandatory for UI work, see below.
6. **`scripts/feeds/`** is still empty on a fresh clone and the site still builds
   and deploys fine without it. Unchanged from the older list below.

**A machine-specific path that bit repeatedly on 14 Sep:** `npx esbuild` swallows
its own stderr through the npx wrapper, so a real compile error surfaces as an
opaque `Command failed` with `stderr: null`. Calling the binary directly prints
the actual error — but the path
(`%LOCALAPPDATA%\npm-cache\_npx\<hash>\node_modules\@esbuild\win32-x64\esbuild.exe`)
contains a per-install hash and a username, so do not copy it from here. Find it
from the failing npx message.

**One network fact to re-test rather than assume:** every `*.workers.dev` host
failed TLS from this machine while `cloudflare.com` and `counterscent.com` were
fine, and a Worker that was perfectly healthy read as broken because of it. It
opened first try on mobile data. If the other machine is on a different network
this may not apply — but never conclude a Worker is down from a `workers.dev`
check alone.

## ~~The one action still pending~~ — DONE 2026-09-16

The five-screen version of `producers.counterscent.com` **was deployed by the
founder on 2026-09-16** and verified from outside: HTTP 200, serving the console
shell (`<title>Producer console | Counterscent producers</title>`, `noindex`
meta) rather than the previous single-page placeholder. The robots.txt fix
(`Allow` rather than `Disallow` — see below for why that is deliberate) shipped
with it. Nothing about this item is outstanding; it is kept struck through
rather than deleted because the section below it still explains *why* the
deploy had failed the first time, which is a live lesson about `wrangler
whoami` lying from cache.

## What now runs end to end (empty, on purpose)

`lib/data/producer-listings.generated.ts` and
`lib/data/producer-registry.generated.ts` are both committed empty and both are
spread into the live data — listings into `DUPES`, producers into `PRODUCERS`.
That was the missing half: `producer-links.generated.ts` had wired the outbound
buy link the day before, but **a link is not a listing.** Approving a producer
would have produced a redirect that resolved and a comparison card that existed
nowhere.

Four build-failing guards sit on that path, each tested by writing a bad row and
watching the build refuse it:

| Guard | Refuses |
|---|---|
| Slug namespace | a producer listing whose slug is not `producer-<producer>-<listing>` |
| Duplicate slug | the same slug twice, across both sources |
| Pyramid evidence | `pyramidSource: "declared"` with no `pyramidBasis`, or a non-https citation |
| Enrolled producer | a listing filed under a company that has not signed up |

The identity guard is the one worth understanding. `lib/producers.ts` names
eighteen real fragrance companies we merely link to; **none of them signed up.**
Without the guard an exported row could claim `producerSlug: "dossier"` and
render under Dossier's name — a false statement about a real business on an
indexed page, arriving through a generated file nobody reads. Subscribers now
live in their own generated file, so "is this company a subscriber?" is
**derived, not typed**, the same rule `lib/merchants.ts` uses for the retailer
band.

## The pyramid penalty no longer favours whoever pays

`lib/types.ts` used to say a producer submission "should default to declared".
That would have let every self-service listing skip the 10-point penalty 47 of
our 79 merchant listings carry — a paying subscriber starting up to 10 points
ahead for a reason unrelated to the fragrance.

A producer now reaches "declared" only by carrying `pyramidBasis`: source,
quote, https url and the date a human checked it, recording that the **same
pyramid is published where their own buyers see it.** Same shape as
`pairingBasis`, which 59 of 79 listings already carry. A human records it, never
the exporter — lifting a penalty makes a claim *stronger*, and the control floor
for this programme is that automation may weaken a claim and never strengthen
one.

## Facet derivation exists, and it must not be published raw

`lib/facet-derivation.ts` turns a declared note list plus concentration into the
six profile scores. It had to exist: the self-rating sliders were removed on
2026-09-11 because `isVerbatimCopy()` cross-references notes *against* facets and
only works while we author one side — which left producer listings with no
facets at all, and facets are 30-35% of the score.

341 distinct notes map to 16 olfactive families (100% coverage). Only the 16
family vectors are editorial; note-to-family is largely settled classification.

**The finding that matters, measured in `scripts/calibrate-facets.ts` against the
real shipped function:**

| | mean facet gap, reference vs its listing |
|---|---|
| both sides hand-written (today) | 0.66 |
| both sides derived | 0.62 |
| listing derived, reference hand-written | 1.35 |

| published score across the 79 | mean | vs today |
|---|---|---|
| A. both hand-written | 62.23 | — |
| B. derived listing vs hand reference | 59.85 | **−2.38**, 69 of 79 fall |
| C. derived on both sides | 62.35 | +0.13, 31 up / 24 down |

The derivation reproduces the reference-to-listing *relationship* at least as
tightly as the hand-written pairs do. The 2.4 points are lost purely to mixing
two authoring methods across one subtraction — the hand-written pairs were
written by one person looking at both sides, so they sit artificially close.
**Regime B would hand every paying producer a systematic handicap.** So the
output is a proposal a human reviewer edits, not a published value.

**Regime C is the better answer at volume and costs nothing in aggregate, but it
recomputes all 216 references' radar profiles and moves 55 of 79 published
scores — a founder decision the size of the 2026-09-08 reform, not a refactor.**
Watch for the reviewer accepting every proposal unchanged; that is regime B
wearing a human's clothes, and the honest response is to adopt C.

Two things fell out of the calibration worth keeping:

- **A declared concentration is a seller's claim, not a fact.** An extrait
  longevity bonus of +1.5 overshot the hand-written listings by 1.36 points, and
  more to the point it would let a producer buy longevity by typing "Extrait de
  Parfum" into a form. Cut to +0.5. Note also that 51 of the 52 extraits in the
  catalogue are dupe listings, so "extrait" and "is a dupe" are almost perfectly
  confounded and the data cannot settle the magnitude either way.
- Two concentrations in the reference catalogue (`Elixir`, `Cologne`) were absent
  from the shift table and silently took a zero. Added.

`lib/facet-derivation.ts` is registered in `scripts/check-scoring-isolation.mjs`,
which runs in `prebuild`. Honest limit of that guard: it walks module *imports*,
and `lib/producers.ts` is already imported by scoring code for `isHouseProducer`,
so it cannot catch a scoring module reading `isSubscriberProducer`. That one is
on review.

## producers.counterscent.com is live

A second, self-contained application at
`products/affiliate-sites/counterscent-producers/` — own `package.json`, own
`wrangler.jsonc`, a hand-written Worker, no shared dependencies with the
catalogue. Deployed, valid TLS, serving `/`, `/health`, `/robots.txt` and 404 for
everything else, with `X-Robots-Tag: noindex, nofollow` on every response. The
page says the programme is not open, because it is not.

Four things learned getting it there, all of which will come up again:

1. **The dashboard's "Add Custom Domain" refused with "No zones match".** Don't
   fight it — the domain is declared in the app's own `wrangler.jsonc` with
   `custom_domain: true` and `wrangler deploy` creates the DNS record and
   certificate. Same philosophy as the root config: depend on no dashboard
   setting.
2. **`custom_domain: true` is load-bearing.** A *route* covering
   `counterscent.com` would put this Worker in front of the catalogue, and
   `_redirects` rules are not applied to requests served by Worker code — every
   one of the 620 affiliate links would die.
3. **`workers.dev` is blocked wholesale on the founder's network.** Every
   `*.workers.dev` host fails TLS with "wrong version number" while
   `cloudflare.com` and `counterscent.com` are fine. This produced a false "the
   Worker is broken" reading; it opened first try on mobile data. Verify this
   origin at `producers.counterscent.com` or a local `wrangler dev`, never the
   preview URL.
4. **This zone has Cloudflare's managed robots.txt on**, which prepends its own
   `User-agent: * / Allow: /` to whatever the origin returns — on
   `counterscent.com` too. The Worker therefore serves `Allow: /` rather than
   `Disallow: /`: a Disallow would both contradict the injected block and stop a
   crawler ever reading the `noindex` header that actually removes the page.

## Two new public surfaces

`/new` — the complete changelog, whole days only. A flat "most recent 24" cuts
through the middle of a day and then reports a false count for it.

A **newest-arrivals slider on the home page**. The founder's reason is that a
subscriber should see value for the subscription, and they will: a new listing
is new whoever filed it. **The rule stays recency, capped at two per producer.**
Both halves matter — without the cap, today's newest five are five AromaPassions
listings, which reads as a brand feature on the home page no matter what the
heading says, and once producers submit individually one subscriber filing ten
fragrances would own the strip. If this is ever re-sorted to put paying
producers first, that is bought placement and `/disclosure` plus the home page's
"No paid placement" panel have to be rewritten in the same change. The rule is
now stated in the section's own standfirst, so it is visible to a reader rather
than buried in a sort.

**It took three passes and the third is the one to keep.** Worth recording,
because the middle one was a reasonable-sounding mistake:

- **v1 (14 Sep)** — five cards on a scroll-snap track, auto-advancing. Written
  straight from the brief with neither design skill. The founder's verdict: it
  should look better.
- **v2 (15 Sep)** — run through both skills, which diagnosed the problem as
  structural rather than cosmetic: the section was wearing `retailer-band`'s
  costume, the bordered card band with a tracked eyebrow that belongs to the
  page's quietest footer-adjacent *disclosure* element, used mid-narrative. And
  five licensed photographs were rendering at 44px. It became a chapter with a
  lead entry and an index, and **the carousel was removed** on the argument that
  five items do not need to be made reachable.
- **v3 (15 Sep), live** — the founder asked for a slider twice. **The form is
  settled; do not reopen it.** What kept the second pass's gains is that it is
  still a chapter and the photographs are now 224–448px; what makes an
  auto-advancing slider defensible is that the navigation is the section's
  *contents list* — five named tabs with hairlines that fill as the dwell
  elapses — so every item is visible and one press away and rotation hides
  nothing. Controls are prev / pause / next: pause alone satisfies WCAG 2.2 SC
  2.2.2, but prev/next carry *direction*, which named tabs do not, and they are
  the single-pointer equivalent of the swipe (SC 2.5.7).

Two things found in v3's review that generalise. **A `visibility: hidden` set
through Motion's `transitionEnd` is cancelled by an interrupting transition** —
after 40 rapid tab presses all five panels were left visible, and nothing leaked
only because `aria-hidden` and `tabIndex` were React-driven and doing the
primary job by accident. Never put required state on an animation-end callback.
And **Cormorant Garamond defaults to old-style figures**, so `51%` rendered with
a descending 5; anywhere a number matters, `lining-nums`.

**Listing dates are derived from git**, not a field on `DupeCandidate` — 79
back-filled guesses avoided, and the party being measured cannot nudge it. An
undated listing ranks and sells normally, it is only absent from the new list.

**The gap that follows, and it lands on the exporter:** a producer listing is
undated until it is *in a commit*, so the sequence is commit the listing → run
`scripts/generate-listing-dates.mjs` → commit again. Between those two commits the
subscriber's fragrance is live but missing from the slider — exactly the
visibility they are paying for. Step 8 has to make the export and the date
regeneration one operation.

## Decided today, so nobody re-opens it

**No click-based "most popular" top 5.** It would be a second ranking beside one
we promise cannot be bought, and this one is purchasable by a producer clicking
their own listing or buying $20 of traffic. Beyond that it cannot work yet: a
no-commission subscriber's link carries no sub-ID so it is invisible to every
affiliate network by construction, GA4 captures zero affiliate clicks, and there
is no per-listing URL for page analytics to attribute to. At current volume the
numbers separate nothing — 59 of the 65 covered references are tied at exactly
one listing. What shipped instead ranks originals by *number of listings*, which
is a fact about our own catalogue and cannot be clicked into existence.

**The `/go/` Worker migration: yes, but between build steps 6 and 8.** Today it
would risk 620 live buy links to fill a table nobody reads. The moment a paid
listing is live we owe that producer click data, because no network report
exists behind a direct link. Two things to carry into it: `generate-redirects.mjs`
must emit `_redirects` and the Worker's link map from **one** computation, and
**do not write to Neon synchronously from the Worker** — spread-thin clicks cost
more than clustered ones, and roughly 4,800 isolated clicks a month exhausts the
free compute budget and suspends it until the next billing period. Buffer at the
edge, reconcile from the console. The rehearsal is cheap and already proven:
`npm run preview`, fetch all 620 ids with `redirect: "manual"`, assert 302 and a
byte-identical `Location`. Zero affiliate clicks fired.

## Open, and needing the founder

- **`PRODUCER-TERMS.md` — 16 clauses, drafted today, not reviewed by a lawyer and
  not in force.** Two clauses need a professional and an agent's opinion is not a
  substitute: **§15 governing law** (a Türkiye-based A.Ş. contracting with mostly
  US businesses — Turkish law and Istanbul courts is assumed, and a US business
  may reasonably decline it) and **§13 data protection**. Three clauses describe
  mechanisms that do not exist yet and are written in the future tense; before
  this is published anywhere a producer can accept it, either the mechanism
  exists or the clause comes out.
- **The Paddle acceptable-use email is drafted and unsent** —
  `departments/communication/reports/paddle-acceptable-use-enquiry.md`. Still the
  only thing that could invalidate the whole rail recommendation.
- **A mandatory product photograph is now the decision** (founder, today), which
  needs storage, a rights declaration in the terms (§6, written) and a commit
  path — plus a human looking at every image before it publishes, because a
  required upload is a moderation surface.
- **Four pre-existing defects on the live site, none of them mine to fix inside
  the briefs they were found under.** In rough order of who they hurt:

  1. **Hydration mismatch for every reduced-motion visitor, site-wide.** Under
     forced reduced motion the page throws `Hydration failed` five times and
     falls back to full client rendering. `components/site/reveal.tsx` returns a
     different element tree and `components/site/preloader.tsx` returns `null`,
     while the server rendered the non-reduced branch. Every chapter uses both.
     Fix: render the motion branch and disable it in an effect, or gate with CSS
     rather than a JS branch.
  2. **No `scroll-padding-top` anywhere**, so a control focused from off-screen
     lands under the 65px sticky header — WCAG 2.2 SC 2.4.11. One line on `html`
     in `app/globals.css` fixes every page. The slider works around it locally
     with `scroll-mt-24`, which is not the real fix.
  3. **`--series-dupe` measures 4.03:1 in dark mode** while the comment above it
     in `app/globals.css` claims it clears 4.5:1, and four shipped components use
     it as small text (`pros-cons.tsx`, `value-bar.tsx`, `data-table-fallback.tsx`,
     `spec-panel.tsx`). Fix is a dark-mode `--series-dupe-text` step mirroring
     the `--series-reference-text` pattern that same comment block established.
     Also `<html>` carries `color-scheme: normal` even in dark mode, so
     scrollbars and form controls stay light.
  4. **`components/fragrance/fragrance-image.tsx`** serves a 1250–2000px source
     into boxes as small as 44px with no `srcset`, and its `alt` repeats a name
     the surrounding link text already says.

- **Process, now binding rather than advisory:** every piece of UI goes through
  `design-taste-frontend` (direction, before any markup) and `ui-ux-pro-max`
  (review, before it is called done). Recorded in the repo root `CLAUDE.md` and
  `departments/web-development/CLAUDE.md` on 15 Sep, **and it binds the top level
  working directly, not only the web-development department** — which is how it
  was broken in the first place. A single component counts as UI. Running one of
  the two is not running both.

---

## Where things stand

`counterscent.com` is live and **everything below is shipped, pushed and verified in production**. Deploys on 2026-09-07, each confirmed against the live site rather than assumed: the originals side (`6002fdd`, landed 145s), and the AromaPassions photographs (`7fb29b5`, landed 167s — all 38 images return 200, `/originals/` and `/fragrance/noir-extreme/` still 200, both redirect kinds still 302). Then on 2026-09-08 the **score reform** (`0873b20`, landed 14:45:11, ~3 min) and the docs/dashboard pass (`967ce0b`). Working tree clean, nothing unpushed.

**Live-verified after `0873b20`, not assumed:** `/fragrance/chance-eau-tendre/` renders **75** for AromaPassions Admire (was 85), Aventus reads **80 / 79 / 79**, and `/about` carries every new number (40%, 30%, 15%, 90%, 95%, "Ingredient overlap", "Founder's personal assessment"). One process note worth keeping: **the first two live checks after a push will show the old content and that is not a deploy failure** — Cloudflare has taken 145–167s on every deploy here and I twice read "not deployed" from a check made too early. Wait ~3 minutes before concluding anything, and force-resolve rather than trusting the local resolver.

**You are picking this up on the other machine.** Everything in the repo travels; four things do not, and three of them will look like breakage:

1. **`scripts/feeds/` is empty on a fresh clone** — licensed merchant data, gitignored on purpose. Every ingest script fails with "feed not found" until you re-download. **The site still builds and deploys fine without any of them**, because the generated `lib/data/*.generated.ts` files and all 407 images are committed. You only need a feed to ingest *new* products or fetch *new* images. See the table below.
   **New on 2026-09-09:** that directory now also holds `perfumania-storefront.json`, a crawl cache rather than a download. Same rule — gitignored, does not travel, regenerate with `node scripts/ingest-perfumania.mjs --refresh`. The site still builds and deploys without it, because `pm-*.generated.ts` and all 198 new images are committed.
2. **`.agents/` skills** — re-run the `npx skills@latest add` commands in `SETUP.md`. Their installer writes Windows directory junctions holding this machine's absolute profile path, which is why they cannot be committed.
3. **`HOSTINGER_API_TOKEN` and `TWENTY_FIRST_API_KEY`** env vars, plus `gh auth login` and Claude Code's own login — all per-machine.
4. `node_modules`/`.next`/`out` — `npm install` inside whichever project you are working on.

Run `git fetch origin` before trusting local state or briefing the board: two scheduled routines push to `main` directly, and one (the CFO weekly report) landed mid-session on 2026-09-07. `origin/claude/department-collaboration-view-iqy07o` exists and is **empty relative to `main`** — checked 2026-09-07, nothing to merge, safe to ignore or delete.

| | |
|---|---|
| Dupe listings | **79** across **65** originals |
| Reference catalog | **216** originals |
| `/go/` ids that resolve | **252** — 116 `original-*`, 59 `shop-*`, 77 `dupe-*` |
| Merchants we can earn from | **4** — Opulensi (Awin 123248), Clone of Perfume (117395), AromaPassions (34989), FragranceShop.com (CJ 16941446) |
| Images | **407 committed**, all of them. Dupes 77/79, references 190/216, shop originals 102/103 — the gaps are licence-bound, not TODOs. See "image coverage is finished" below |

Three merchants were approved and wired in two days, taking listings 25 → 55; A2 on 2026-09-05 took it to **79 listings on 65 originals**. Two more approvals exist and are **not wired**: **The Fragrance Shop** and **Perfumania**, both on CJ. **Perfumania's feed arrived 2026-09-08 and is the wrong catalogue** — see below; it is still not wired and should not be.

**Coverage is now inside the estimated 50–70 ceiling, so treat AromaPassions as spent.** Its remaining unlisted products all need a *new researched original* first — the cheap matches are gone.

## What A2 changed, and the one decision behind it

- **One offer per listing, the 50ml price, one link** (founder's call). A1's second 100ml offer pointed at the *same* affiliate link, so it rendered a duplicate buy button and made `buy-actions.tsx` call one retailer's two bottles "2 retailers". A1 was collapsed too; no price moved.
- **SPICY (Spicebomb) withheld** — its declared notes are Spicebomb's set exactly (overlap 1.000), so `notesAreVerbatim()` fires. Same call as ILLUMINATE. **Three flankers refused**: Acqua di Gio *Profondo*, Armani Code *Profumo*, Delina *Exclusif*.
- **The scoring problem got sharper, and was addressed on 2026-09-08 — see the scoring-pipeline section of `products/affiliate-sites/fragrance-dupes/CLAUDE.md`.** AromaPassions publishes **one flat note list and no pyramid at all**, but our formula weights tiers 20/35/45 — so *we* choose the split and the split moves the score **70–82% on identical merchant data**. Aligning the split to the original's pyramid (what A1 and A2 both do) maximises overlap by construction. Splitting by perfumery convention instead was tried and is worse: it disagrees with **17.1% of our own reference notes**. The founder's call was to keep the tiered formula and **price the uncertainty**: a flat −10 on any listing whose split is ours, a 95 structural ceiling on everything, `familyBonus` fixed, and a 15% ingredient component that stays inert until both sides have a list. Tier-agnostic comparison remains unbuilt and is no longer the plan.

## Do this first on the other machine — the feeds do not travel

`scripts/feeds/` is gitignored on purpose (licensed merchant data, large, not ours to redistribute in a public repo). A clone gets the README and nothing else, so **every ingest/matching script will fail with "feed not found" until you re-download**. That is expected, not breakage.

Re-download from Awin (Toolbox → Create-a-Feed), publisher **3064149**, and save as:

| Save as | Awin advertiser | Notes |
|---|---|---|
| `opulensi.csv` | 123248 | 610 rows. Exhausted — two full hand-scans found nothing further. |
| `clone-of-perfume.csv` | 117395 | 11 rows, 10 fragrances. All mined. |
| `aromapassions.csv` | 34989 | 230 rows, 103 distinct products. **Mined out as of A2** — what is left needs a new researched original first. |
| `FragranceShop_com_-CJ_Product_Feed-shopping.txt` | CJ 16941446, not Awin | **Delivered 7 Sep and fully ingested.** 5,802 rows, **87 columns, TAB-delimited**, no quoting — a different network with a different schema, so do not expect the Awin columns. Re-download only to refresh prices or pick up new stock; nothing currently needs it. Schema table in `scripts/feeds/README.md`. |
| `my-perfume-shop.csv` | 106089 | Originals-side, programme closed for tracking. Kept for reference imagery only. |
| `perfumania-storefront.json` | **not a feed** — CJ 17335854 | **Not downloaded, crawled.** `node scripts/ingest-perfumania.mjs --refresh` rebuilds it from the live shop (18 pages, ~1 min). Perfumania's actual CJ feed is its in-house dupe line and is useless to us; the storefront is the source. Nothing needs this unless you are re-ingesting or fetching new images. |

Take **all** columns, not the default preset — the default is ~11 columns and drops `description`, which is where every "Inspired by" citation and note pyramid lives. The Opulensi export is 86 columns; match that.

Also per-machine and not in the repo: `.agents/` skills (re-run the `npx skills@latest add` commands in `SETUP.md`), `HOSTINGER_API_TOKEN` and `TWENTY_FIRST_API_KEY` env vars, and `node_modules`/`.next`/`out`.


## Image coverage is finished — the three remaining gaps are licence-bound, not TODOs

**407 images committed, and every one that can lawfully exist does.** Do not "fix" what is left; each
was checked on 2026-09-07 and each has a reason:

- **2 dupes** (Armaf Club de Nuit Sillage, Urban Man) — carried only by the **closed** My Perfume
  Shop programme. The licence rides on the affiliate relationship, so no live relationship means no
  photograph. Correct as-is.
- **26 references** — searched against the full 5,802-row CJ feed and **not one is genuinely
  stocked**. Every apparent hit is the merchant's own dupe oil (`Armani Code Profumo - Type Perfume
  Oil`), a flanker (`The Most Wanted Intense`), or a brand collision — `Al-Rehab` matching Initio
  Rehab, `Kim Kardashian True Reflection` matching Amouage Reflection Man. The houses are the ones
  FragranceShop does not carry at all: Chanel, Parfums de Marly, By Kilian, Xerjoff, Initio, Roja,
  Amouage, Jo Malone.
- **1 shop product** (Marc Jacobs Oh Lola Sunsheer) — the merchant offered only a shared stock
  photograph, recorded as `remoteImageUrl: null`. **Null means "no image", never "use a placeholder".**

**A second originals merchant is the only route to those 26, and Perfumania is a real but partial
one** — worth being precise, because judging it by its CJ feed gets the answer backwards.

The feed delivered 2026-09-08 is Perfumania's in-house dupe line: 66 rows, nine house brands, no
designer stock. **The storefront is 4,380 products across 480 vendors** (enumerated in full
2026-09-09 — the feed is 1.5% of the store), and it does stock Giorgio Armani, YSL, Paco Rabanne,
Azzaro, Jo Malone, Parfums de Marly, Xerjoff, Kilian, Amouage and MFK.

**Against the 26 it covers 6**: `armani-code-profumo` ($98.95), `percival` ($229.95), `angels-share`
($244.95), `naxos` ($219.95), `wood-sage-sea-salt` ($126.99), `interlude-man` ($299.95). **Chanel,
Initio and Roja are carried at zero SKUs**, so 9 of the 26 are permanently out of reach there. A 7th
apparent hit, `the-most-wanted`, is a **flanker trap** — only *Intense* and *Parfum*, never the base
EDP. Detail and the two ingest traps: `scripts/feeds/README.md`.

**FragranceX** (CJ advertiser 1024283) therefore stays the top-priority application in
`FINALIZATION-GUIDE.md` §3.3 — it is the better fit for the niche houses — but Perfumania is no
longer a dead end for this gap, provided we get the right feed.

## The decision that gated everything else — taken 2026-09-08

**The match score can be gamed by a merchant's copywriter, and it was happening at scale.**

Five of the last fourteen listings scored 83–87 because the merchant restated the original's note pyramid in their own product description. Our formula read that as a near-perfect composition match. It is not — it is marketing copy. Two different merchants did this within two days, so it was a pattern.

`isVerbatimCopy()` exists for exactly this but needs notes *and* facets to match; merchants supply only notes and we author the facets, so it rarely fires. One listing (ILLUMINATE / Versace Crystal Noir) was deliberately **not** shipped for this reason, and one (GLAMOROUS / Bright Crystal) ships only because the merchant writes "Ice"/"Lotus" where our catalogue records "Ice Accord"/"Lotus Flower" — there is a comment in `lib/dupes-data.ts` warning that tidying those two strings makes the listing disappear.

**What shipped**, as one atomic change, ahead of the producer-subscription program that would have made outside producers a second source of the same self-reported data (decision record: `PRODUCER-PROGRAM.md` §7; mechanics: that project's `CLAUDE.md`):

- **`familyBonus` fixed** — real family check, no longer hardcoded to `1`. A no-op for all 79 current listings by construction.
- **Ingredient overlap, 15%** — new 4th component, flat untiered list, **inert until both sides have one** (none do yet), with the other three keeping their original weights meanwhile.
- **95 structural ceiling on everything**, `verified` listings included: identical declared notes never means identical proportions.
- **−10 on any listing whose tier split is ours**, not the seller's (47 of 79).
- **A founder override** as the only way past 95 — human, justified in writing, never on a house product, cannot rescue a flagged copy. Unused so far.

**Measured:** the 32 declared listings moved by exactly zero, 41 of 47 imputed fell exactly 10, six fell less because they were already at the 90 cap. One ranking changed site-wide — the Clone of Perfume listing this file called suspiciously #1 on Aventus is now #3.

**Still open, and worth being precise about:** the penalty prices a *missing pyramid*, not copying. A merchant who copies the reference's pyramid and publishes it as three proper tiers is still scored at face value, and `isVerbatimCopy()` — which needs facets to match too — remains the only defence against that.

## Two published artifacts live outside the repo — one is a pass behind

These are account-scoped, not machine-scoped: they travel with the founder's Claude login, so **nothing needs re-publishing just because you switched machines.** Both URLs are here because a republish must target the existing URL — publishing without one silently creates a *duplicate* artifact and the founder's bookmark keeps pointing at the stale one.

| Artifact | URL | State |
|---|---|---|
| **Counterscent Finalization** | `https://claude.ai/code/artifact/379722bc-cf4f-431f-a2ac-3c9acd6ead96` | **Current** — republished 2026-09-08 as the eighth pass, completed tasks ticked, real counts in, Perfumania recorded as waiting-on-feed. Mirrors `products/affiliate-sites/fragrance-dupes/FINALIZATION-GUIDE.md`. |
| **Perfumania Coverage** | `https://claude.ai/code/artifact/6f979f92-1253-46ca-87f8-1f6ccc46566b` | **Current** — published 2026-09-09. The 123 references Perfumania stocks, which 32 are new coverage, the 6 image gaps closed, the 6 concentration disagreements, and the 20 it cannot reach. |
| **Sirketim Dashboard** | `https://claude.ai/code/artifact/e2e47262-d56d-4ca9-8e6f-cdb07955e025` | **One pass behind.** `internal/dashboard/design/sirketim-dashboard.html` and `Main.dc.html` both carry task 185 and the "Sep 8" labels in the repo, but the *published* page still shows the previous snapshot. Not urgent: the dashboard's Finalization Guide link URL did not change, so clicking it from the stale dashboard still opens the current report. |

**The reason it is a pass behind, which will bite the next session too:** republishing an artifact this conversation did not itself publish is refused until you have `Read` **every line** of the live copy the tool hands you. The dashboard is ~786 lines and ~140 KB, most of it very long task-note strings, so that read is a real context cost for a file the repo already holds a newer copy of. Budget for it deliberately — do the read early in a session, or accept the artifact lagging until a session has room. Do not work around it by publishing without the `url`.

## Work queue, in the order it makes sense

1. ~~**Commit and deploy A2.**~~ — **DONE, shipped as `e106c89`.** It is live: 77 links traced with attribution intact, 84 redirect rules generated, all 38 AromaPassions listings visible via `getRankedDupesFor()`, 0 flagged verbatim.
2. ~~**Images for the 24 new listings.**~~ — **DONE 2026-09-07, and the diagnosis that used to sit here was wrong.** This item claimed the script "regenerates the whole manifest, so it needs `opulensi.csv` and `clone-of-perfume.csv` present too". It does not. It needed exactly one feed — `aromapassions.csv` — and that file was on disk the whole time, which is why the gap sat for two days behind a wrong explanation.

   The real blocker was ordering inside `scripts/fetch-dupe-images.mjs`: the loop read a merchant's feed *before* checking whether the image was already downloaded, so the expired Opulensi export made `loadFeed()` throw on the very first entry and killed the run — even though all 53 of those images were already present and every one of those entries would have been skipped a line later. The loop now checks the filesystem first and treats an unreadable feed as **that merchant's** failure, reported per-slug, rather than the run's. **A script serving several merchants must degrade to the ones it can still serve**, because feeds are gitignored and expire.

   All 24 images came from the **live-page fallback**, not the feed — every `merchant_image_url` in that export 404s, exactly as the first 14 did on 2026-09-04. That rescue path is doing the primary work for this merchant, not covering an edge case.
3. ~~**The scoring decision.**~~ — **DONE 2026-09-08.** See the section above for what shipped and what it measured. The follow-on that is *not* done: **ingredient/INCI data for the 65 referenced originals and 79 dupes** (~144 lookups with overlap), which is what activates the new 15% component. Source it from each merchant's own product page under the standing rule — attribute or verify against something the seller cannot spin, never invent. AromaPassions already publishes ingredient lists on some products and is the natural first pass.
4. ~~**Brand-alias mapping**~~ — **done in A2.** The alias cases (`MFK`, `CH`, `DG`, `D.`, `INTIO`, `MRLY`, `GIVNCHY`, `ROJA`) were resolved by matching on the reference *name* with word boundaries and requiring brand confirmation only for short names; `fahrenheit`, `elysium`, `light-blue`, `delina`, `l-homme`, `y`, `poison` and `la-vie-est-belle` all shipped from it.
5. **~32 missing originals.** Real, famous fragrances with publicly documented pyramids (Noir Extreme, 1 Million, A*Men, Musc Ravageur, Portrait of a Lady, Luna Rossa Ocean, Jubilation XXV, Philosykos, Do Son, Acqua di Gioia, Black Afgano, Grand Soir, MFK 724…). Each unlocks exactly one AromaPassions listing. **Chanel No 5, Coco Mademoiselle and Delina were on this list and should not have been — we hold all three**, and No 5 and Delina now carry listings; Coco Mademoiselle is held, uncovered, and blocked only by the split problem in item 3 (see the project CLAUDE.md on SEDUCTIVE). Re-check the catalogue before adding a name here. **Research them properly — do not create placeholder references.** A reference carries the note pyramid and facets the score is computed from, so a dummy publishes a meaningless percentage about a real company's product on a live, indexed page. Note also that a CJ feed cannot fill this gap: feeds supply names, prices and images, never note pyramids.
   Two claims in that list must never become references: `Designer Brands` (a category label, not a fragrance) and `LAKESIDE MORNING by BBW`.
6. ~~**Wire the CJ merchants for the originals side**~~ — **DONE 2026-09-07, FragranceShop.com.** The feed arrived and the whole originals side is live. Before this, all 200 references declared `affiliateLinkId: "original-<slug>"` and **not one resolved**; `/go/` now resolves **252** ids (116 `original-*`, 59 `shop-*`, 77 `dupe-*`).

   **What shipped:** the founder's buy-link scope — **EDP or Parfum, over $100, never EDT or EDC** — is 103 products and **all 103 are linked**. A new `/originals` page lists them with price, photograph and buy link and nothing else, because the feed carries nothing else. **17 references were added with researched pyramids** (200 → 216), and the "Nx cheaper" comparison now runs on **the retailer's own price** rather than our approximate-retail figure. Reference imagery went 156 → **190**, with 116 re-sourced off the dead My Perfume Shop programme onto a live one. Full write-up in `products/affiliate-sites/fragrance-dupes/CLAUDE.md`.

   **Three silent mis-links were found and fixed**, all the same shape: the merchant's `<Name> <Gender tag> - <Format> <Size>` grammar puts the word "Cologne" in the gender tag, so `cologne` is a noise word — and it was being absorbed when it was part of a product NAME. We were linking **Viking Cologne as Viking**, **Aventus Cologne as Aventus**, **Eternity Cologne as Eternity**, and **Le Male Le Parfum as Le Male** (that last via `le` + `parfum`; FragranceShop stocks no plain Le Male at all).

   **What is left:**

   - **Confirm `sid` once in CJ's click report.** CJ obfuscates the forwarded query, so only the `cjevent` token is checkable from here. Same one-off founder check already done for Awin 117395.
   - **Perfumania** — the second CJ approval. **Feed delivered 2026-09-08 and NOT the catalogue we need**, so this item did not advance: the export is Perfumania's own house dupe line (66 rows, no third-party brand), not its designer stock, and it covers none of the ~100 references FragranceShop does not stock (no Chanel, Parfums de Marly, Byredo, Le Labo, Xerjoff, Initio, By Kilian, Amouage, Roja, Jo Malone or Louis Vuitton anywhere). Full analysis and four ingest traps in `scripts/feeds/README.md`. **Nothing is wired from it and nothing should be** — no row declares an inspiration, so its products cannot become dupe listings without inventing the mapping.
   - **59 shop-only products have no comparison page.** Adding one means hand-authoring a note pyramid; the feed cannot supply it. `node scripts/ingest-cj-feed.mjs --candidates` prints the shortlist.

7. ~~**Root `CLAUDE.md` edits**~~ — **done 2026-09-07.** The stale line 58 was fixed, and eight cross-department lessons were promoted into the root file's bullet list (repo root not gitignored; identify a vendor by domain not name; CRLF diffs and the `package-lock` side effect; assert against shipped code via esbuild; marketing copy is not product fact; attribution can live in the click cookie; feed image URLs decay; a subagent refusing a brief is a success mode). Kept to one line each — task 179 records that this file is a real per-session context cost.

## Two retailers per bottle, shipped 2026-09-09

`getOriginalOffers()` in `lib/catalog.ts` replaces the old single-retailer
`getOriginalOffer()` on the buy surfaces. **91 references now show both
FragranceShop.com and Perfumania.com with their own prices**, 67 of them with both
retailers quoting the exact bottle our reference records. 57 show one retailer, 68
none. `/go/` resolves **375** ids, up from 252.

Three things that are easy to undo by accident:

- **The key prefixes must stay different.** FragranceShop owns `original-<slug>`,
  Perfumania owns `pm-<slug>`. They were briefly both `original-<slug>`, which
  collided on **91 of 123 keys** - `affiliateLinks` is one flat map, so the spread
  order silently decided which retailer survived and the other's links vanished with
  no error anywhere. Two retailers per bottle is the whole point; one key cannot hold
  both.
- **`scripts/generate-redirects.mjs` now reads THREE files.** A fourth link source
  must be added there too or its buttons resolve in the UI and 404 at the edge.
- **Retailers are deliberately NOT ranked and nothing says "cheapest".** A price is
  only comparable when both retailers quote the same bottle, and 24 of the 91 pairs
  do not. The page says so in words rather than sorting on a figure that is sometimes
  null and sometimes a different size.

Verified live, not assumed: `/go/pm-sauvage` lands on Perfumania's Dior Sauvage page
carrying `SID=pm__sauvage`, `AID`, `PID` and a `cjevent` token.

**What did NOT happen, and why - the "90 pyramids" is a false lead.** Perfumania's
storefront tags carry a full three-tier pyramid on 90 of the 123 matched references,
which reads like 90 fragrances to add. **All 90 already have our own researched
pyramid** - the merchant data is redundant there, not new. The genuinely new pool is
the **1,707** pyramid-bearing storefront products that are not in our catalogue, and
that pool should not be bulk-imported: **59% of this merchant's own duplicate SKUs
disagree with themselves about the pyramid.** Paco Rabanne 1 Million has four SKUs
carrying four different pyramids, three of which are wrong. Importing them would
publish false note data about real products on indexed pages - the exact failure the
placeholder-reference rule exists to prevent. Use them as a research starting point a
human verifies, never as a source.

## The Perfumania shop surface, shipped 2026-09-09

`/originals` is now a TWO-MERCHANT page: **348 products across 50 houses**, 103 from
FragranceShop.com and **245 from Perfumania.com**, every card naming its own shop.
96 of them link to a full comparison here; the rest are price-and-availability only,
which the page says in words. `/go/` resolves **620** ids.

Verified live: `/go/pmshop-creed-aventus-cologne-mens-eau-de-parfum` lands on
Perfumania's Creed Aventus page carrying `SID=pmshop__...`, `AID`, `PID` and a
`cjevent` token.

**Perfumania's scope is narrower than FragranceShop's, on purpose.** Same founder
rule (EDP or Parfum, over $100, no testers/sets), plus two exclusions that merchant
needs and the other did not:

- **Its own private-label brands**, the nine names in its "Like product feed" - that
  feed IS the house dupe line, so each is proven in-house by the merchant's own data
  rather than by our guess.
- **Houses our reference catalogue does not already cover.** 413 products clear price
  and concentration; **193 come from a house we have researched**. The remainder
  include names we cannot tell from a retailer's private label without research we
  have not done - Michael Malul, Daniel Josier, Camille Rochelle, NOTEZ, Patek
  Maison, Thauy, 93 Mil - and the page calls its contents "genuine designer
  fragrances". Widening this later is a decision with evidence behind it; taking it
  by default is not.

One thing worth knowing about the price rule: the scope test is the **cheapest**
variant, not the cheapest one above $100. A bottle sold at $80 and $120 passes the
looser test and would then be shown at $120 - quoting a higher price than the shop's
own entry price for the same fragrance.

A pre-existing defect surfaced and was fixed: FragranceShop files two products under
"Maison Francis **Kurkdijan**" and one under the correct spelling, so the brand index
grew two headings for one perfumer. `BRAND_TYPOS` in `lib/catalog.ts` normalises it.
That map is for provable typos only - merging two brands that are actually different
companies is the `fragranceshop.com` / `thefragranceshop.com` mistake in a new
costume.

**The merchant's note tags stay unused, and this is now measured rather than
suspected.** Against the 90 fragrances where we hold a researched pyramid AND
Perfumania publishes one, the two agree on only **0.57** of the materials named -
before asking which tier they sit in. Only 5 of 90 match exactly; 19 fall below 0.4;
one shares nothing at all. Separately, **59% of the merchant's own duplicate SKUs
contradict themselves** (Paco Rabanne 1 Million carries four different pyramids
across four SKUs). Neither number supports publishing their notes as fact about a
real product.

## The retailer band, and the disclosure page that was lying, 2026-09-09

The home page now carries a slow band naming the five retailers we earn from:
Opulensi, Clone of Perfume, AromaPassions, FragranceShop.com, Perfumania.com. Three
things about it are load-bearing and none of them is cosmetic.

**It is a disclosure, not a logo wall.** The heading reads "We earn a commission from
these retailers", and each retailer's name carries its own mark below it. It must
never become "Partners", "Sponsors" or "As featured in": none of these companies has
reviewed anything here, and several of them sell products this site rates against
each other. `shared/clients.md` records that Sirketim has no third-party clients at
all, so there is nobody whose logo could legitimately appear under a partner heading.
Framed honestly the band strengthens the independence claim; reframed as a partner
strip it would assert an association we do not have.

**The marks arrived 2026-09-10 and three rules keep them defensible.** The NAME stays
above the mark, because a mark alone discloses nothing - AromaPassions' is a bare
lowercase "a". No mark is restyled beyond being painted one colour through a CSS
mask, which is also how they stay legible on the dark theme without being inverted or
plated. And they are self-hosted, not hot-linked: the networks' creative URLs
(`cshow.php`, `image-<pid>-<aid>`) are impression trackers, and embedding one would
put a third-party request carrying every visitor's IP on the home page of a site that
is deliberately cookieless. We are paid on sales, not impressions.

Provenance per mark is in `lib/merchants.ts`. Two things worth knowing before
touching them: a network "creative" is often a promo banner rather than a logo
(Opulensi's Awin creative is product photos), and `fragranceshop.com` is behind a bot
challenge that 403s every path including `robots.txt` - its mark came from the CJ
creative and there is no other route that does not involve working around that
challenge, which we do not do. **Never AI-generate or retouch a mark**: an altered
logo misrepresents a real company and an invented one is worse.

**The list is derived, never typed.** `lib/merchants.ts` reads the shipped link map
and a merchant appears only while at least one of its links actually resolves. My
Perfume Shop (Awin 106089) is the reason that matters: still enrolled, still feeding
data, every link dead. A hand-typed list would keep advertising it, which is the
direction that flatters us. An id in the link map with no registry entry throws at
build time rather than quietly under-reporting who pays us.

**`/disclosure` was asserting the opposite of the truth, live.** It said Counterscent
had joined no affiliate programme and that there were no affiliate links on the site
at all, while 5 retailers and 620 redirects were shipping. It now renders the same
derived list, so the two cannot drift apart again. Worth auditing any other page that
states a fact about the BUSINESS rather than about a fragrance - that was the only
one checked.

**Reduced motion needed its own rule, and a screenshot caught the second bug.**
`app/globals.css` sets `animation-iteration-count: 1` globally under
`prefers-reduced-motion`, which for a looping marquee means it completes instantly
and parks the track at -50%: half the names shoved off-screen with no motion to
explain why. `.marquee-track` therefore kills the animation AND resets the transform,
and the track wraps instead. That fix exposed a second one visible only in a rendered
screenshot: the duplicate run that makes the loop seamless was still painting once
wrapped, printing every retailer twice. Hence `.marquee-dup { display: none }` under
the same query. Verified on the live site at 1280, 390 and under reducedMotion:
10 visible names while animating, 5 when not.

## The producer subscription programme: decided 2026-09-10, not yet built

The founder asked the board what to do about subscriptions, gave the brief
"producers add and remove their own listings, send us edit requests, we respond
and publish," and then made the decisions. All three board members reported.
This section is the plan; read it before touching anything under
`app/producers/`, `lib/plans.ts` or `prisma/schema.prisma`.

### What was decided

- **Revenue model: free tier of ONE listing, paid upgrade, NO COMMISSION on any
  paid tier.** Shipped in `lib/plans.ts` (`takesCommission` per tier, prices
  19/49). This closed `PRODUCER-PROGRAM.md` section 8 item 1, which had gated
  everything else in that list.
- **The no-commission part was the founder's own change** to the board's
  "commission on all tiers", and it is the stronger position. It is section 2's
  third option - subscription *instead of* commission - applied to paid tiers
  only, and it buys what that option was credited with: **we have no financial
  interest in a subscriber's rank or traffic.** Do not quietly reintroduce
  commission on a paid tier to lift revenue; it costs the one claim that makes
  the rest of section 7 believable.
- **"Listeners" means automated checks plus a HUMAN approval decision**, the
  founder confirmed. The control floor: **automation may always take something
  down or make a claim weaker; it may never put something up or make a claim
  stronger.** Auto-approval is the single change that could publish a copied
  answer key about a real named company on an indexed page.

### The architecture answer: do not touch the static site

Everything the founder described needs a server and a database. This project
has neither and is committed to not having them - `output: "export"`, zero route
handlers, `/go/` as a generated `_redirects` file.

**Build a second application on its own origin: `producers.counterscent.com`,
its own Cloudflare Workers project, its own deploy.** The public catalogue stays
static, stays free, stays fast, and its build stays hermetic.

Two options were rejected with reasons worth keeping:

- **A `main` Worker on the root `wrangler.jsonc`** would risk 620 live affiliate
  redirects to ship a login page with no users - `_redirects` rules are not
  applied to requests served by Worker code, so that whole mapping would have to
  migrate first. Keep it in the drawer for the day per-request click logging or
  same-minute takedown is a real requirement.
- **Converting the site off `output: "export"`** costs a Next upgrade or a paid
  host (`next` is pinned at 14.2.35 and `@opennextjs/cloudflare` dropped Next
  14) and buys nothing the second origin cannot have. It also turns ~240
  edge-cached pages into server renders.

Inside that: the producer app can be a static React UI plus a hand-written
Worker for auth and API, or a fresh Next app on a current version with an
adapter. **The board leans the first** - the Next-14 pin stops mattering
entirely if auth lives in the Worker. Neither adapter's current state was
verifiable from disk; check before committing.

`/producers` and `/producers/pricing` stay on the marketing site; `login` and
`submit` move to the new origin, which gets `noindex` plus a robots disallow.

### The publish path is the crux, not auth

With the catalogue static, **an approved listing is not a live listing until a
rebuild.** Chain: approve in the producer app, an export script writes generated
TypeScript into `lib/data/`, commit, push, Cloudflare builds, live. That is the
existing shape - six ingest scripts already write there.

**Run the export as a commit, not inside CI.** If the public build read
`DATABASE_URL`, a paused free-tier database would fail the whole site's deploy
and a DB credential would live in Cloudflare's build environment. Committing
keeps the build reading only repo files, puts every published listing in a
reviewable diff, and makes `git revert` a working takedown.

**The UI must say "approved" and "live" are different states** ("approved -
publishes at the next site build"). Anything else is the class of lie the
existing shells were written to avoid. Same for the SLA: publish a review number
AND a separate publish cadence, or the first producer catches us in a promise we
did not mean to make.

Hazards on that path: a producer's pasted link can fail the whole public build
(`generate-redirects.mjs` throws on a missing `deepLink`/`subId` or an unknown
network) - validate at submit time AND have the exporter refuse to emit what it
cannot classify. And namespace producer link keys (`producer-<slug>-<listing>`);
this repo already lost 91 links to a shared key prefix.

### Build order
**Progress report for the founder: `products/affiliate-sites/fragrance-dupes/SUBSCRIPTION-PROGRESS.md`.**
Steps 1-5 below are DONE. 1, 3 and 4 landed 2026-09-11 (the three that needed
no database); step 2, the database, landed 2026-09-14 - a Neon Postgres
project in aws-us-east-2, ten tables and eight enums applied from
prisma/migrations/ and read back out of information_schema to confirm.
**Step 5, auth on the producer origin, landed 2026-09-16.** Real, not a
layout preview: `POST /sign-in` stores an expiring single-use token and
emails a magic link (Hostinger's HTTP Email API via `fetch()` - see
`products/affiliate-sites/counterscent-producers/src/lib/mailer.ts`; the
hand-rolled SMTP client this originally shipped with was deleted 2026-09-16),
`GET /verify` consumes it once and starts a 30-day session (`__Host-`
cookie, this origin only), and `POST /sign-out` ends it. Two architecture
calls were made and written down where each was decided: hand-rolled
sessions on the existing User/Account/Session/VerificationToken tables
rather than `@auth/core` (`src/lib/auth.ts`), and raw SQL over
`@neondatabase/serverless` rather than Prisma Client (`src/lib/db.ts`,
Prisma itself stays as the migration tool only). `prisma/schema.prisma` and
`neon.ts` moved from `fragrance-dupes/` into that project alongside this
work - both files' own headers explain why and fragrance-dupes/ carries no
Prisma tooling any more (nothing there ever imported `@prisma/client`).
**What is real vs. what still needs the founder:** the flow above is built,
typechecked, and exercised end to end against a local Worker (every route,
every gated/degraded state) - what was NOT verified is a real email actually
landing in an inbox, because that needs the `HOSTINGER_MAIL_API_TOKEN` /
`HOSTINGER_MAILBOX_ID` secrets, which are still unset. The outbound-TCP
question that used to sit here - whether Workers permit SMTP's port 465 -
is gone along with the SMTP client, deleted 2026-09-16; see the step-5 entry
in SUBSCRIPTION-PROGRESS.md, which records the false vendor claim that
justified writing it in the first place.
"signed out" for everyone, including a request with a valid session cookie -
wiring the session-check helper (`getAuthContext`, also in auth.ts) into
those two pages is step 6/7's job, not step 5's; `src/routes/verify.ts`
explains why it redirects to `/` instead of `/console` in the meantime.
**Rate limiting was added the same day, before anything deployed.** Step 5
first shipped `POST /sign-in` with no limit of any kind, which on an
unauthenticated endpoint that emails whatever address is typed into it makes
`contact@counterscent.com` a spam relay and puts the mailbox customers write
to inside Hostinger's own volume and abuse limits - the same risk, twice.
Three limits now sit in front of the send: one live token per address (15
minutes, no new storage - it asks about the `VerificationToken` row the flow
already writes), **five POSTs per ten minutes per `CF-Connecting-IP`** (a 429
with `Retry-After`; a request with no such header shares one bucket rather
than skipping the check), and **100 sends a day across the whole origin** (an
honest 503 that says nothing was sent, never a fake "check your inbox"). The
counters live in **Postgres** - no new binding, and an eventually-consistent
store like KV under-counts during exactly the burst it exists to stop;
reasoning in `counterscent-producers/src/lib/rate-limit.ts`. Expired
verification tokens are now purged on the same path, so that table cannot
grow off refused attempts either. **This adds one migration,
`20260916143000_add_rate_limit`, which is NOT applied** - run `npx prisma
migrate deploy` from that project BEFORE deploying the Worker, because
sign-in fails closed (503, saying so) when it cannot reach its limit table.
That work also found and fixed a real bug in the step-5 code: token expiry
was written from the Worker's clock into a `TIMESTAMP` column with no zone
and then compared against Postgres `now()`, so with the database session's
TimeZone anywhere east of UTC every magic link is born expired and `/verify`
answers 410 for everyone. Reproduced against a real Postgres at
`Europe/Istanbul`; Neon defaulting to UTC is the only reason it worked. Both
sides use `now()` now.
**Steps 6 and 7 are therefore unblocked and not started.** Step 8's safety
layer is done; the rest of it needs step 6.


1. **Remove the six facet sliders from `components/producers/submission-form.tsx`.**
   Not cosmetic. `isVerbatimCopy()` in `lib/verification.ts` requires notes AND
   facets to match (`FACET_EPSILON = 0.5`), and that gate only works because
   facets are ours. Hand the same party both inputs and it is defeated by
   construction: copy the reference's notes, nudge one facet by 0.6, no flag
   fires. Every producer could then reliably reach the 90 cap and rank first on
   their reference - rank purchasable in substance while unpurchasable in
   letter, with `/producers` promising the public the opposite. Facets get
   derived by us from declared notes, concentration and the difference prose,
   exactly as they were for the three merchants already listed.
2. ~~**Provision a database.**~~ **DONE 2026-09-14.** Neon, free plan,
   `aws-us-east-2` (Ohio), branch `production`. The schema's `String[]` columns
   ruled out D1, as noted - they exist in the live database now and were read
   back to prove it. Neon over Supabase for two reasons: Supabase's free tier
   pauses a project after 7 days idle and needs a manual restore, and a console
   that sits idle between sign-ups would live paused; and the console will be a
   Cloudflare Worker, which cannot open an ordinary Postgres connection, while
   Neon's driver is HTTP with a first-party Prisma adapter.
   **Connection strings come from `neon link`, never typed by hand** - see
   `.env.example`. Only Postgres is switched on; `neon.ts` declares
   `auth: false` so step 5 is a decision rather than an accident.
   **Do NOT add a keepalive that pings to prevent sleeping.** Neon wakes on the
   next query by itself, and a timer frequent enough to stop the 5-minute sleep
   burns 182%% of the 100 CU-hour monthly budget - compute then suspends until
   the next billing month, manufacturing the outage it was meant to prevent.
   Full arithmetic in SUBSCRIPTION-PROGRESS.md.
3. **Schema catch-up in one pass, before any migration runs.** It has drifted
   behind the TypeScript it mirrors: `family` (required since the 2026-09-08
   score reform), `verdict` (our voice, distinct from `declaredDifferences`),
   `offers`/`MerchantOffer` (currently a single `affiliateUrl` scalar - the
   shape the site abandoned on 2026-09-01), `pairingBasis`, `brand`. Plus
   `Submission.slug` is globally `@unique`, so two producers cannot both sell a
   "Noir" - make it `@@unique([producerId, slug])` - and add
   `@@unique([producerId, referenceSlug])`, currently only a prose rule in
   section 6a.
4. **Add the three missing concepts** in the same pass: a `publishState` separate
   from `approvalStatus` (`DRAFT | PENDING | LIVE | WITHDRAWN_BY_PRODUCER |
   REMOVED_BY_EDITOR`), a **revision model** (verb 3 is entirely unmodelled -
   `CHANGES_REQUESTED` points the wrong way, it is us asking them), and an
   **append-only audit event table**. Change `Submission.producer` from
   `onDelete: Cascade` to `Restrict`, and give `ClickEvent` a denormalised
   listing key so click history survives a removal.
5. ~~Auth on the new origin (magic link, per the commitment in `login-form.tsx`).~~
   **DONE 2026-09-16.** See the paragraph above this list for what is real
   and what still needs a live SMTP test.
6. Producer console v1: submit, list, unpublish, request an edit, see status.
7. Admin queue v1: review, approve, reject with reason, author the verdict.
8. Export + publish path, including the exporter's refuse-to-emit guard.
9. **Then** billing.

### What must NOT be built

Billing or any checkout. A `main` Worker on the root config. Converting the site
off `output: "export"`. **Implementing `auth()` inside `lib/producer-session.ts`**
- its `TODO(auth)` invites exactly this and doing it breaks the export at deploy
time, not review time; narrow that file's copy to "there is never a session on
this origin" instead. Producer image upload (needs object storage, a rights
declaration and a commit path). **A public producer directory** -
`lib/producers.ts` is fixture data naming eighteen real operating companies,
none of which signed up, so a browse-by-producer surface would assert a
commercial relationship that does not exist. Any auto-approval or auto-publish.

### Removal is not a delete

A removal is a state transition with the prior record retained. The `/go/` id
stops resolving automatically (`generate-redirects.mjs` only emits ids in the
map) and there is no orphaned indexed page, because listings render inside
`/fragrance/<reference>/` - there is no per-listing URL and no `noindex`
mechanism anywhere in the project, so the only lever is whether it enters the
build. **Never recycle a removed id** - reassigning it misattributes old clicks
still inside a network cookie window. And a producer removal can invalidate a
published `comparison`/`review` piece, because `affiliateLinkId` is mandatory in
`content/schema.ts` - make that a build-time assertion.

**The pattern worth being able to see: removal after a bad score.** It is review
suppression wearing a different hat. Track score at removal against the
catalogue average, time from publication to removal, and resubmission against a
reference the producer previously withdrew from - withdraw at 62%, resubmit with
a friendlier pyramid, publish at 88%. With unique `(producer, reference)` pairs
and retained history that last one can be flagged automatically with the prior
data shown side by side.

### The payment rail: Paddle, and NOT iyzico

The founder named iyzico. `departments/accounting/reports/payment-rails-investigation.md`
had already settled this, and the founder's later clarification - **the market
is mostly America** - strengthens it rather than changing it.

iyzico is excellent at collecting from Turkish cardholders in TRY and does
support recurring billing ("Abonelik"). It is the wrong shape here because the
subscriber is a US business: foreign-card acceptance prices on a separate higher
schedule, a TRY charge means the producer's own issuer takes the conversion (a
49 dollar subscription costs them 50-52, we collect none of it, and the figure
moves every month), and **we remain the seller of record** - Turkish KDV, US
state sales tax, EU VAT the moment one EU producer signs, and one e-fatura per
subscriber per period. Under Paddle, a merchant of record, all of that is
Paddle's and our counterparty is one company with **one document per payout**.

**Keep iyzico for Turkish direct-invoice clients.** That onboarding is real,
useful and unstarted.

Arithmetic worth not re-deriving: Paddle is ~5% plus 0.50 per transaction, plus
a flat ~15 payout fee, so all-in is **~11% at six producers**, floor 6%, and
sub-7% needs roughly 32 producers. **Batching payouts quarterly takes 11.1% to
7.7% at zero implementation cost** - the highest-leverage lever available.
Annual billing is NOT justified by fees: it saves ~1% while the placeholder
annual prices give away 16.7%. The single highest-leverage unverified number is
whether Paddle's payout fee and the bank's confirmed 10-30 inbound SWIFT charge
**stack**; if they do, the sub-7% crossover moves from ~32 producers to ~63.

### The faaliyet konusu question: ANSWERED 2026-09-11, and it moves the work rather than removing it

The founder put this to the mali musavir. The answer: **carry out the
transactions, issue and record the invoices, keep the tracking clean. If the
activity code becomes an issue the tax office will raise it, and the code they
ask for gets added then. As long as everything is recorded, there is no
problem.**

That closes the item. It had been open since 2026-08-29 and was recorded in
three places as the largest gate in front of the producer programme; it is not
one. **Do not reopen it or re-derive it** - a qualified professional was asked
the question directly and answered it, and this repo has no standing to
second-guess Turkish tax practice.

**What it does do is move the load onto bookkeeping, which was the weaker half
all along.** The answer is conditional on records being clean, and as of the
day it was given the ledger held **no income row of any type**, there was **no
income category for subscription revenue**, and the payout table still said
Awin was "not enrolled" eleven days after approval while two live CJ
advertisers had no row at all. Those were closed the same day in
`departments/accounting/CLAUDE.md`:

- A fifth income category, `Subscription revenue — <Product name>`, with the
  hazard spelled out next to it: the `Type` column already uses `Subscription`
  to mean **an expense we pay**, so revenue filed that way lands in the cost
  table and the weekly report **subtracts it from the balance** while looking
  correct to a skim-read.
- The Awin row corrected to enrolled and live with its three shipping
  advertisers, a **CJ row added** (publisher 101873278, advertisers 16941446
  and 17335854, 543 of the 620 live ids), and a producer-subscription row
  carrying the Paddle position.

**The practical rule that follows: the first real affiliate commission needs a
ledger row when it arrives, not retroactively.** That is the nearer revenue -
five retailers are already live - and it is now the first test of whether the
mali musavir's condition is actually being met.

### Before the first producer pays: /disclosure becomes untrue

`app/disclosure/page.tsx:40` says "We do not accept free product, payment, or
placement from brands in exchange for a rating or a rank, and we never will."
The home page carries the same claim in a panel titled **"No paid placement"**
(`components/home/chapter-standards.tsx`). The rating and rank half survives if
the controls above hold. **"Placement" does not** - a subscription buys presence
in the catalogue - and "we never will" is a forward commitment.
`app/about/page.tsx` also answers "how does Counterscent make money?" with
affiliate commissions alone, which is incomplete on day one.

**Not urgent today** - every producer page now says the programme is not open,
so nothing is currently false. It is a hard blocker on opening. The wording is a
founder decision, not an agent's.

What disclosure has to look like when it does open: a **"Subscriber listing"**
badge at the point of use (the precedent is `HouseBadge`, which discloses "our
own product" right where the product appears); a `/disclosure` section derived
the way `lib/merchants.ts` derives the retailer list, so it cannot go stale in
the flattering direction; a separate home-page line, **not** folded into the
retailer band, whose heading is load-bearing and describes a different
relationship; and one added sentence on `/about#methodology`, whose existing
copy about producers declaring their own data survives intact.

### Two more controls worth building as controls, not intentions

- **Make "no tier is an input to scoring" mechanically true**: assert that
  `lib/similarity.ts` and `lib/catalog.ts` import nothing from `lib/plans.ts` or
  any subscription state, and fail the build if they do. An import-graph
  assertion is a control; a promise in a doc is not.
- **Bar the founder override on a paying producer's listing**, the same way it
  is already barred on house products, and for the same reason - a direct
  financial interest. And it must never be created *in response to* a producer's
  request: the queue says no, the producer escalates, the override says yes, and
  within a year the override is the routine remedy for a paying complaint.
  Answer a score complaint with re-verification (which legitimately lifts 90 to
  95) or with rejection.

### Also flagged, not yet done

The -10 imputed-pyramid penalty systematically favours paying producers:
`schema.prisma` says `DECLARED` is the correct default for a producer
submission, so every self-service listing escapes a penalty that 47 of our 79
current merchant listings carry. A paying producer's listing would start up to
10 points ahead for reasons that have nothing to do with the fragrance. The
suggested fix is to accept a producer pyramid as `declared` **only if the same
pyramid is publicly published on their own product page**, fetched and
snapshotted - which turns "what they told us" into "what they tell every buyer".

~~`departments/accounting/CLAUDE.md` has no income category for subscription revenue~~ -
**CLOSED 2026-09-11**, because the mali musavir's answer made clean records the
condition rather than the activity code. A fifth category,
`Subscription revenue - <Product name>`, now exists with the collision spelled out
beside it: the `Type` column already uses `Subscription` for an expense we PAY, so
revenue filed there lands in the cost table and the weekly report subtracts it from
the balance while looking correct to a skim-read. The payout table was corrected in
the same pass - Awin marked enrolled and live (it had said "not enrolled" for eleven
days after approval), a CJ row added for the two live advertisers, and a
producer-subscription row added carrying the Paddle position.

**Still open there:** the ledger holds no income row of any type, and the first real
affiliate commission needs one when it arrives rather than retroactively. That is now
the first test of whether the condition the answer rested on is actually being met.

## Founder actions still open

No agent can do any of these. The numbered list in `FINALIZATION-GUIDE.md` is the canonical copy; this is the short form.

- ~~**Settle the company's faaliyet konusu**~~ — **ANSWERED 2026-09-11.** The mali musavir's position: do the transactions, record the invoices, keep the tracking clean; if the activity code becomes an issue the tax office raises it and the code gets added then. Not a blocker. It shifts the weight onto bookkeeping instead — see the subscription section, and note that the accounting gaps that condition depended on were closed the same day.
- **Send the Paddle acceptable-use email.** Free, blocks nothing today, slow to answer, and it is the only thing that could invalidate the whole rail recommendation - Counterscent is literally a marketplace and Paddle is reportedly restrictive toward marketplaces. Ask three things while you are there: whether they self-bill Turkish tax residents (Awin explicitly does not), which legal entity contracts with a Turkish seller, and whether payouts can be batched quarterly.
- **Provision a Postgres database** (Neon or Supabase) when you want the producer console built. Founder-side account work; nothing in build steps 3-8 of the subscription section moves without it.
- **Ask the mali musavir two more questions** while the first is open: does the answer cover subscription income specifically and not just affiliate, and what is the KDV / hizmet ihracati treatment of a subscription sold to a US business. The second decides whether a listed price is inclusive or exclusive, so it precedes setting real prices.
- **Deep linking on Perfumania is SETTLED - only a real sale is still outstanding.** Resolved 2026-09-09 from CJ's own artifact rather than by reasoning: the `anrdoezrs.net/am/101873278/include/joined/impressions/page/am.js` include CJ generates for our publisher id is scoped `domains=['perfumania.com','www.perfumania.com']`, and the `joined` path segment means CJ built it for an advertiser we are enrolled with that supports deep link automation. So **17335854 permits deep linking.** Our URL shape is also not an invention - `dpbolvw.net/click-101873278-17335854?url=...` is the exact format CJ delivered in that merchant's own feed. **Clicks show in CJ's dashboard graphs** (founder confirmed 2026-09-09); the SID *breakdown* appears against transactions, so the last unknown - does a purchase through one of these links actually pay - **cannot be answered without a sale**, and no amount of further checking will change that. Stop spending sessions on it. Asking Perfumania for a full designer feed remains optional, not blocking.
- **Apply to FragranceX (CJ 1024283).** Still the better fit for the niche houses Perfumania carries at zero SKUs — Chanel, Initio and Roja account for 9 of the 20 references still without a photograph.
- **Confirm the CJ `sid` for 16941446 on the first real transaction, not in a click report.** The click report shows clicks but the SID breakdown lands against transactions, so this is not a check that can be done ahead of a sale - the earlier wording here implied it could be, and that sent a session looking for a report that does not exist. `cjevent` is already verified end to end for both advertisers.
- ~~**`parfumoza.com` removal**~~ — **DONE 2026-09-10.** Removed from Cloudflare by the founder and verified from outside: no A/AAAA record, nothing answers on http or https, so the trademark-collision surface is gone. One loose end, not a live risk: the domain's NS delegation at the registrar still points at Cloudflare's nameservers, which still return an SOA for the zone. Worth tidying at the registrar when convenient.
- **9 affiliate applications were pending** and are not tracked anywhere in the repo. Worth recording which, so the next session does not re-apply or re-research them.
- **Supply the Hostinger receipt** (amount, currency, auto-renew state). `hostinger-billing` is deliberately not configured, so the ledger records nothing about this project until you provide it.

## Two traps this session paid for

**I asserted a product format from marketing copy and nearly published it 15 times.** Every AromaPassions title contains "Essential Oil Fragrance", so I briefed them as oil concentrates and asked for the score to reflect the weaker format. Their own product pages list `alcohol` and never say alcohol-free, roll-on or oil-based; they are ordinary 50/100 ml sprays. A subagent refused the brief rather than writing fifteen invented format claims about a real company — the correct call. The same trap caught the other direction the same day: these are marketed as "Pheromone Perfume", which we correctly refuse to repeat. Both are seller claims. Attribute them or verify them against something the seller cannot spin.

**A wrangler preview left orphaned `workerd.exe` processes holding a lock on `out/`,** so `rm -rf out` failed with "Device or resource busy" and the deploy rehearsal could not run. Kill `workerd.exe` and stray `serve`/`wrangler` node processes before rebuilding. Documented in the project CLAUDE.md, hit anyway.
