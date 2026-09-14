# Subscriber work: what is done, what is next

**Written 2026-09-11.** A progress report for the founder, kept in the repo so it
arrives with a `git pull`. It covers the producer subscription programme only.
The plan it executes is in `HANDOFF.md`, section "The producer subscription
programme"; the rules it obeys are in `PRODUCER-PROGRAM.md`.

---

## The short version

Three of the nine build steps are done. They are the three that do not need a
database, which is the thing only you can provide.

| # | Step | State |
|---|---|---|
| 1 | Producers stop scoring themselves | **Done** |
| 2 | Provision a database | **Yours.** Blocks 5-8 |
| 3 | Schema catch-up | **Done** |
| 4 | Publish state, revisions, audit trail | **Done** |
| 5 | Auth on the producer origin | Blocked on 2 |
| 6 | Producer console | Blocked on 2 |
| 7 | Admin approval queue | Blocked on 2 |
| 8 | Export and publish path | **Safety layer done** (2026-09-14); rest blocked on 2 |
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

1. **A database.** Neon or Supabase, free tier. Nothing in steps 5-8 can start
   without it. Note the schema needs real Postgres, not Cloudflare D1 — it uses
   array columns D1 does not have.
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

**A database.** Steps 5, 6 and 7 — sign-in, the producer console, the approval
queue — cannot start without one. Neon or Supabase, free tier, real Postgres
(not Cloudflare D1; the schema uses array columns D1 does not have).

Verification for this pass: 18/18 link cases pass against the shipped module,
typecheck clean, lint clean, build clean, redirect table still exactly 620, and
the scoring-isolation control still passes.
