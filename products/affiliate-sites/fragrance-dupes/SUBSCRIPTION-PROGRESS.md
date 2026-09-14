# Subscriber work: what is done, what is next

**Written 2026-09-11.** A progress report for the founder, kept in the repo so it
arrives with a `git pull`. It covers the producer subscription programme only.
The plan it executes is in `HANDOFF.md`, section "The producer subscription
programme"; the rules it obeys are in `PRODUCER-PROGRAM.md`.

---

## The short version

Four of the nine build steps are done, and **the thing that was blocking three
more is now gone**: the database exists.

| # | Step | State |
|---|---|---|
| 1 | Producers stop scoring themselves | **Done** |
| 2 | Provision a database | **Done** 2026-09-14 |
| 3 | Schema catch-up | **Done** |
| 4 | Publish state, revisions, audit trail | **Done** |
| 5 | Auth on the producer origin | **Unblocked** — not started |
| 6 | Producer console | **Unblocked** — not started |
| 7 | Admin approval queue | **Unblocked** — not started |
| 8 | Export and publish path | **Safety layer done**; rest needs 6 |
| 9 | Billing | Deliberately last |

Plus one control that was not on the list and should have been.

Nothing here is visible on the live site. The producer pages still say the
programme is not open, because it is not.

---

## 1. Producers no longer score themselves

**What changed.** The submission form used to ask a producer to rate their own
fragrance on six sliders — freshness, sweetness, warmth, woody depth, longevity,
sillage. Those sliders are gone. We derive those numbers ourselves from what they
declare.

**Why this mattered more than it looks.** The site's copy detector flags a
producer who simply resubmits the original's own data. It does that by checking
two things at once: do the notes match, **and** do the six numbers match. Two
checks, so that passing both by accident is unlikely.

But the second check was only independent because *we* wrote those numbers. Once
the producer supplied them too, both halves of the test came from the same hand.
Copy the original's note list exactly, then move one slider a single step, and the
detector stays quiet.

The consequence is not subtle. Any producer could have reliably reached the
90-point ceiling and ranked first on their own original — while `/producers`
promises the public, in those words, that no plan buys a better score or a higher
rank. It would have been true in letter and false in substance.

**What a producer sees now**, in place of the sliders:

> **We score how it wears, you don't.** Freshness, sweetness, warmth, woody depth,
> longevity and sillage are rated by us from what you declare above. That is not a
> comment on your honesty — it is what keeps the comparison independent, and it is
> the same reason no plan at any price buys a better score.

The reasoning is written into the code where the sliders used to be, so the next
person to look at that file finds out why before re-adding them.

---

## 2. The database schema now matches what the site actually needs

`prisma/schema.prisma` describes the tables a producer console will run on. It
had drifted behind the site it mirrors, and it could not represent two of the four
things you asked for.

### It was missing fields the site requires

An export would have had nothing to put in them:

- **`family`** — the fragrance family. Required by the scoring code since the
  8 September reform, absent here entirely.
- **`brand`** — the producer's own brand name as it appears on the bottle.
- **`verdict`** — our assessment in our voice, distinct from the producer's own
  "what's different" prose. Approval had nowhere to record it.
- **`pairingBasis`** — who claims this matches that original, in their words, with
  a link a reader can check.

### Two of your four verbs could not be represented at all

You asked for four things: add a listing, remove a listing, send an edit request,
see the status. Only the first worked.

**"Remove" would have been a deletion.** The old schema had no way to say "this
listing is down" — only to erase the row. That destroys click history that may
still pay out for weeks, breaks any published article citing the listing, and
erases the record of anything pulled after a complaint. There is now a separate
`publishState`: draft, pending, live, withdrawn by the producer, removed by us.
A removal is a state change with the history intact.

It also makes one pattern visible that is otherwise invisible: **withdrawing a
listing after a bad score.** That is review suppression in a different coat. The
schema now records the score at the moment of removal, so you can ask whether
withdrawals cluster at the bottom of the catalogue — no single one ever looks
wrong, but the pattern does. And because each producer can hold only one listing
per original, withdrawing at 62% and resubmitting the same pairing with friendlier
data at 88% is automatically detectable rather than a thing you would have to
notice.

**"Send an edit request" did not exist.** There was one row per listing, so an
edit meant overwriting the row currently on the site. Both possible behaviours
were wrong: either the edit publishes without anyone reading it, or the listing
disappears from the site until someone does. There is now a `SubmissionRevision`
— a proposed change held *beside* the live listing. The listing keeps serving, the
request gets reviewed, the change applies on approval.

### There was no way to answer "who changed this, and when"

The old design kept one reviewer, one timestamp, one rejection reason, each
overwritten by the next. A request → changes → approval cycle collapsed into a
single row showing only the last step.

There is now an append-only `AuditEvent` table. Every change records who did it
(and whether it was a person or a script), the full before and after, the
subscriber's tier at that moment, and the score a visitor would have seen along
with the version of the code that produced it. That last part matters because
scores move when the formula moves — the September reform shifted 47 of our 79
listings — so without it there is no record of what was actually on the page on a
given day.

It matters most for the founder override, the one mechanism that can publish a
score above the site's own stated ceiling. `/about` discloses that it exists. An
override with no permanent record is exactly the unexplained backdoor that
disclosure says it is not.

### Two smaller corrections

- A listing's slug was globally unique, so **two producers could not both sell
  something called "Noir"** — a constraint on their naming, not on our data. It is
  now unique per producer.
- Deleting a producer would have **cascaded and deleted every listing they ever
  had**. It now refuses.

### Your no-commission decision is now in the data

A paid tier takes no commission, so a subscriber's listing links **directly to
their store** with no affiliate link. The schema separates the two: `storeUrl`
always, `affiliateLinkId` only when we actually earn.

One consequence worth knowing: a direct link has no tracking ID, so there is no
network report behind it. **Our own click log becomes the only source of a
subscriber's click data** — it turns from an accounting tool into a product
feature they are paying for.

---

## 3. A control that was not on the list

"No tier buys rank" is the claim the whole programme rests on. It is printed on
`/producers` and `/disclosure`, and nothing enforced it.

There is now `scripts/check-scoring-isolation.mjs`, which walks the code that
computes and orders scores and **fails the build** if any of it can reach the code
that knows what a producer pays. It runs before every build, including the
Cloudflare deploy.

It passes today — 44 modules reachable, none subscription-aware. I also verified
it actually catches a violation rather than just printing "clean", by adding a
forbidden import on purpose and confirming it failed, then reverting.

The reason to make it mechanical: the first time someone wants "featured producers
sorted first", that change is three lines, and a promise in a document does not
object. A failing build does.

---

## What I need from you, in order

1. ~~**A database.**~~ **DONE 2026-09-14**, with you, in this session. Steps 5,
   6 and 7 are unblocked. Details in the section at the end of this file.
2. **Send the Paddle email.** Ask whether they accept a marketplace, whether they
   self-bill Turkish tax residents, which legal entity contracts with us, and
   whether payouts can be batched quarterly. Free, blocks nothing today, slow to
   come back.
3. **Real prices.** 19 and 49 are placeholders. Nobody has researched what these
   houses currently spend on getting a customer.
4. **The `/disclosure` wording**, before the programme opens. It currently says we
   will never accept placement, and a subscription is placement in the ordinary
   meaning of the word. The rating and rank half stays true. Rewording a public
   promise about your own business model is your call, not mine.

---

## What is deliberately not built

Billing, any checkout, a producer directory, image upload, and anything that
publishes without a human deciding. The reasoning for each is in `HANDOFF.md`
under "What must NOT be built" — the short version is that every one of them
either needs the database, needs a decision you have not made, or would break the
thing that makes the site worth listing on.

---

## Verification

Typecheck clean, lint clean, `prisma validate` passes, build produces 247 pages,
the redirect table is still 620 entries, and the scoring-isolation check passes
and was proven to fail when it should.

---

# Update, 2026-09-14: the publish path's safety layer

Still no database, so steps 5, 6 and 7 have not moved. What has moved is the part
of **step 8** that never needed one — and it is the part with the sharpest edge.

## Why this, and why now

The board called the publish path the crux, not the login page. Here is the
specific danger, in plain terms:

`generate-redirects.mjs` builds the table of every outbound link on the site, and
it runs during the **public site's** build. It deliberately crashes rather than
quietly skip a link it cannot understand, because a buy button that silently
disappears is worse than a build that stops.

Put those two facts together and a single malformed link pasted by one producer
takes down the deploy of the whole catalogue — 620 working affiliate redirects and
243 pages — and the person who pasted it is not watching. So the export step has
to refuse to publish a link it cannot vouch for, and leave that one listing
unpublished, rather than hand the problem to a build step whose only move is to
abort everything.

That refusal logic is now written and checked.

## What a producer's link has to survive

`lib/producer-link.ts`. Both the console (at submit time, so they find out
immediately) and the export step (again, because rows get edited and imported)
will call it.

- Must be a real, complete **https** address.
- No username or password buried in it.
- **Must be on the store domain recorded on their account.** This is what stops
  the oldest trick in marketplaces: approved pointing at one product, quietly
  re-pointed at another — or at another site — once nobody is looking. A producer
  who genuinely moves domains asks us, which is a conversation rather than a
  silent redirect.
- **Must not be a tracking or shortened link.** This one matters more than it
  sounds. If a producer pastes their own affiliate link, we send our readers
  through somebody else's attribution, earn nothing, and publish a destination we
  do not control and that can be changed after approval. The shorteners are
  refused for exactly the same reason — a link whose destination can change after
  we approved it is not a link we can publish.
- Tracking parameters they pasted along with it (utm, fbclid and friends) get
  stripped, so we do not republish somebody else's campaign ids.

Checked against 18 cases by running the real module, not a copy of it. Two are
worth naming because a naive version fails them:

- `opulensi.com.evil.com` — the real domain sitting as a *prefix* of a hostile
  host. Anything doing a "contains the domain" check waves this through.
- An affiliate network host has to lose **even when it matches the store domain**,
  or the rule could be walked around by whoever owns that domain.

The check lives at `scripts/verify-producer-link.ts` and can be re-run any time;
the command is in its header.

## Your no-commission decision now exists in the link layer

A subscriber's listing links straight to their store, so there is no affiliate
network in the middle. That is now a real link type (`direct`) rather than a
special case someone has to remember:

- The destination is **the seller's URL, byte for byte**. We do not append our
  internal ids to another company's product page.
- It still goes through `/go/` even though there is nothing to track. The single
  chokepoint is the point: the day we can log a click, that is one change in one
  place instead of an edit to every listing.
- It is still marked as paid placement in the page markup. A subscription is
  payment, so the link is sponsored even though no commission moves. I checked all
  four places that build such a link by hand — all four are correct.

Proven end to end by putting a fake producer listing through the generator and
reading the rule it produced: the seller's URL, unmodified, nothing appended. Then
reverted.

## The fifth link source is wired while it is empty

`lib/data/producer-links.generated.ts` exists and is empty, and both the redirect
generator and the link checker already read it.

This is deliberate. The last time a link source was added and only one of those
two scripts learned about it, **368 live links shipped unchecked for two days**
while the checker reported a clean pass. Wiring it now — harmless while empty —
means the day a producer is approved, publishing is an export, not an export plus
remembering to teach two scripts about a new file.

## Still the same one thing standing in the way

**A database.** — RESOLVED the same day this was written. Kept here because the
reasoning still holds and explains the choice: Neon, free tier, real Postgres,
not Cloudflare D1, because the schema uses array columns D1 does not have.
See the final section.

Verification for this pass: 18/18 link cases pass against the shipped module,
typecheck clean, lint clean, build clean, redirect table still exactly 620, and
the scoring-isolation control still passes.

---

# Update, 2026-09-14 (later): the database exists

Step 2 is done. It was the only thing standing between us and steps 5, 6 and 7,
and it was the only step I could not do without you.

## What is actually there

A Neon Postgres project called **counterscent**, in **AWS US East (Ohio)**, on a
branch called `production`. Inside it: **10 tables and 8 enums**, created from
`prisma/migrations/`.

I did not report this on the strength of the migration command exiting quietly.
I queried the database's own catalogue afterwards and read back the table names,
the enum value counts, and the four array columns — the columns that were the
entire reason Cloudflare D1 was ruled out. They are there. That reason is no
longer an argument in a document; it is a fact about a running database.

The payment provider enum came back with three values, which is the small
confirmation that Stripe is really gone rather than gone from the parts we
looked at.

## The decisions inside the decision

**Ohio, not Virginia.** Region cannot be changed on a Neon project — a different
region means deleting and recreating. Two reasons for this one: our subscribers
will be US businesses, and Ohio is one of only two regions where Neon's object
storage works at all. That second one was luck rather than planning, but it
means that if producer image upload is ever wanted, the door is open. Virginia
would have closed it.

**Neon, not Supabase.** Supabase's free tier pauses a project after 7 days of
inactivity and needs a manual restore, and a project left paused long enough is
deleted. Our producer console will sit idle for weeks between sign-ups, so
"nobody touched it recently" is its normal state — it would have spent most of
its life paused, and the first producer to try signing in would have found it
dead. Neon suspends after five minutes and wakes on the next query.

The second reason is architectural: the producer console will be a Cloudflare
Worker, and a Worker cannot open an ordinary Postgres connection. Neon's driver
works over HTTP and has a first-party Prisma adapter. This was not a preference
between two equivalent products.

**No Neon Auth, no Functions, no AI Gateway, no Object Storage.** Only Postgres
is switched on, and `neon.ts` now says so in code rather than leaving it to a
default. Neon Auth matters most: our schema already carries the Auth.js tables,
so turning it on would put a second answer to "who is this producer" in the same
database with neither side aware of the other. That choice belongs to step 5,
made deliberately — not made by accident today. It can be switched on later.

## Two things I changed about how secrets are handled

**A gap in `.gitignore`.** It covered `.env`, `.env.local` and `.env*.local` —
but not `.env.production`, which is a real file name Next.js reads. This repo is
public, and we were about to put a database password in it. Both levels now
ignore `.env*` and keep only `.env.example` tracked. I checked six filename
variants one at a time rather than trusting the pattern.

**The connection strings never passed through our conversation.** I pulled them
with the Neon CLI straight into `.env` and printed only masked versions. You
never had to paste a password into a chat window, and there is no copy of it in
the session transcript.

Two further notes on where credentials ended up, both outside the repository:
your Neon login sits in `C:\Users\win10\.config\neon\credentials.json`, and the
MCP server's API key in `C:\Users\win10\.claude.json`. I scanned everything git
would commit for the real database host and for key-shaped strings before
committing. Nothing.

## Where I deviated from the setup steps Neon gave you

Three places, each for a reason:

**Not in the repo root.** `neon config init` installs two npm packages, and the
root `package.json` is a Cloudflare deploy shim that deliberately has zero
dependencies — Cloudflare runs `npm install` there on every deploy of the live
site. Running it at the root would have put Neon's tooling into the catalogue's
production build path for no benefit. Everything ran inside
`products/affiliate-sites/fragrance-dupes` instead, where the Prisma schema
already lives. I also moved the two packages to devDependencies afterwards,
because they are build tooling and not something the site runs on.

**The MCP server is scoped and read-only.** The default (`neon mcp -y`) mints an
account-wide API key with write tools on. Ours is pinned to this one project and
adds `?readonly=true`. The reason for read-only is not caution for its own sake:
everything that writes to this database should go through a Prisma migration,
which is versioned and reviewable. A write-capable MCP tool is an unversioned
side door into the same database — the same shape as every "two sources of
truth" failure this project has already paid for.

Be aware of the limit of that, though: `readonly` hides the write tools, it does
not weaken the key. Neon's own message said it plainly — the key "can still
change and delete everything inside that project." If it ever leaks, revoke it:
`neon api-keys revoke 3336116 --org-id org-blue-salad-00794114`.

**`neon.ts` says more than the snippet did.** The suggested file was an empty
`defineConfig({})`. Empty means "no opinion"; we have an opinion, so the file
declares `auth: false` and explains why, where the next person will see it.

## One thing worth your attention that is not about the database

`npm audit` in this project reports **7 vulnerabilities, 6 high and 1 critical**,
and the critical one is in `next` itself. None of them came from anything
installed today — I checked, and every one traces to `next`, `postcss`,
`eslint-config-next`, `next-mdx-remote`, `js-yaml` or `glob`. They were already
there.

I have not touched them, because `next` is pinned at 14.2.35 on purpose and
moving it is its own piece of work with its own risk to a live site. But a
critical advisory sitting unread on the framework of a public, indexed site is
not something to leave unmentioned in a report about something else.

## What I did not do

I installed the Neon skills as you asked, and three of the seven document
services we just deliberately switched off — Functions, AI Gateway, Object
Storage. `neon-functions` is the awkward one: it teaches an agent to put server
code inside Neon, which directly contradicts the recorded decision that server
code lives in a Cloudflare Worker. Nothing shadows a built-in skill, so I left
all seven in place rather than quietly deleting documentation you asked for.
Say the word and I will drop the three, or put the constraint in the project's
CLAUDE.md so it is read before the skill is.

## Verification for this pass

Tables and enums read back out of the live database; `prisma migrate status`
reports the schema in sync; typecheck clean with `neon.ts` inside the
TypeScript project; lint clean; build clean at **243 pages**; the redirect table
still exactly **620**; and `neon config plan` reports the project already
matching its policy, with Postgres as the only service in use.

## Next, and it is no longer blocked by you

Step 5, sign-in on the producer origin. The open question there is Auth.js
versus Neon Auth, which I deliberately did not decide today.
