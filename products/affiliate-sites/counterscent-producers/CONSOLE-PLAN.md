# STATUS: PHASE 2 IS BUILT AND DEPLOYED, 2026-09-16

Version `cbddcd45-02f4-4510-97b4-8d496ac1a2ec`. `/console/submit` and
`/console/withdraw` are live and answer **401** to an unauthenticated request,
verified from outside. Sections 4.x below are now a record of what was built
rather than a specification of what to build.

## Founder decisions taken 2026-09-16, which overruled parts of this plan

1. **The console SHOWS PRICES.** Section 2.4's ruling is overruled. The drift
   argument behind it was answered rather than ignored: `src/generated/plans.ts`
   is produced by `scripts/generate-constants.mjs` from `fragrance-dupes/lib/plans.ts`,
   so the figures are generated, not a third hand-typed copy.
2. **Free tier takes no money and allows exactly ONE active listing.**
3. **Free-tier producers MAY withdraw**, and withdrawing frees the slot. This
   closes the contradiction this plan flagged between `plans.ts` and
   `PRODUCER-TERMS` section 10.
4. **`/review` access control is deferred.** It stays inert - `notShipped()`,
   no database calls - and was not touched.
5. **The Featured-tier naming point is NOT decided** and nothing was renamed.
   The founder said they did not understand it; it is explained to them
   directly rather than acted on.
6. **How listings get checked is STILL NOT DECIDED** (section 5). A submission
   therefore lands as `PENDING` and waits for a person. No automated verdict of
   any kind was built.

## What was finished at the top level rather than by the department

The delegated run stalled - 600s with no progress, the signature the root
CLAUDE.md records for a `grep` walking `node_modules` - after writing most of
the code but **before wiring any of it up**. Finished directly:

- **Two defects in the written code.** A backtick inside a tagged template
  literal (a SQL comment containing `` `WHERE` ``) terminated the template and
  broke the parse; and `Record<string, string[]>` under `noUncheckedIndexedAccess`
  made three note-tier reads possibly-undefined. The second was fixed by
  narrowing the key type, not by casting.
- **The routes were not reachable.** `src/index.ts` had no entry for either
  path, so ~2,400 lines of route code could not be called.
- **`src/routes/withdraw.ts` did not exist.** `withdrawListing()` was written in
  the data layer with no route to call it.
- **The console still said the form was unbuilt**, with three `deadButton`s.
  Submit is now a real link, withdraw moved into the row it acts on, and the
  empty state stopped apologising for a form that now exists.
- **Three CSS classes were referenced and undefined** (`.cell-action`,
  `.visually-hidden`, `.btn-row`). Added with no new tokens.

## What the ui-ux-pro-max review changed

The form surface passed: `role="alert"` plus `tabindex="-1"` on the error
summary, each item linked to its field, `aria-invalid` and `aria-describedby`
on every control, inline errors retained alongside the summary.

Two things it caught:

- **Withdrawal was a SILENT SUCCESS.** `POST /console/withdraw` redirected to
  `/console?withdrew=<slug>` and the console ignored the parameter, so a
  producer performed an act they cannot undo and landed on a page that looked
  unchanged. There is now a `role="status"` confirmation naming the listing and
  the `/go/` id that stops resolving. **The slug is read back out of the
  producer's own listings**, so a crafted URL cannot make the page claim a
  withdrawal that did not happen.
- **Focus never moved to the error summary.** With no client JS the only way is
  `autofocus` on the `tabindex="-1"` container, which is now set.

---

# CONSOLE-PLAN.md

The plan for turning `/console` from a layout preview into a real surface.

**Written 2026-09-16, COO, against a founder brief the same day.** Phase 1 is to be
built. Phase 2 is specified here and deliberately not built. One decision inside
Phase 2's territory is deferred to the founder and is laid out in section 5 with
options and a recommendation, and nothing in this document quietly settles it.

Owning department: web development. Plan positioning and producer-facing copy
came from sales. Design direction came from `design-taste-frontend`, recorded in
section 3.

---

## 0. Where this starts, verified rather than assumed

Everything in this section was read off disk today before planning, not carried
over from a previous session's summary.

| Thing | State |
|---|---|
| Magic-link sign-in, `/verify`, `/sign-out`, 30-day `__Host-session` | **Shipped and working.** A real link was sent, received, followed, and refused on replay. |
| `/console` and `/review` | **Routes exist, both hardcode "signed out" for everyone**, including a request carrying a valid session cookie. This is the gap. |
| `getAuthContext(request, env)` in `src/lib/auth.ts` | Exists, works, is called by exactly one page (`/`). It is the primitive Phase 1 wires in. |
| `prisma/schema.prisma` | 703 lines. `Producer`, `Subscription`, `Submission`, `SubmissionRevision`, `AuditEvent`, `ClickEvent`, `RateLimit`, plus the Auth.js four. **This is a wiring job against an existing schema. No new table is proposed anywhere in this document.** |
| Producers in the database | **Zero.** |
| Payment provider | **None wired.** Paddle is the board's recommendation and is not integrated. Stripe, PayPal and Gumroad do not serve Turkey. |
| Prices | Free (1 listing), Standard ($19/mo, $190/yr, 25), Featured ($49/mo, $490/yr, unlimited). `lib/plans.ts` says in its own header these are **"a considered guess, not a price."** |

Two facts about the platform that constrain every proposal below: this is a
hand-written Cloudflare Worker with a routing table in `src/index.ts`, no
framework, no React, no build step beyond wrangler's bundling, HTML built from
tagged template literals in `src/ui/`. And the CSP is
`default-src 'none'; script-src 'self'; style-src 'self'; font-src 'self'; img-src 'self' data:`,
with `form-action` granted per page rather than origin-wide.

### A deploy prerequisite that is not part of this work but blocks it

Migration `prisma/migrations/20260916143000_add_rate_limit/` exists on disk and,
per the schema's own header, **has not been applied to the database.** The
sign-in route refuses to send mail when it cannot reach `RateLimit`, on purpose.
So a deploy that carries Phase 1 without that migration having run leaves
sign-in answering 503, and Phase 1's entire signed-in half becomes unreachable.
Apply it before deploying, not after.

---

## 1. Scope, and what is deliberately out of it

**Phase 1, built now:**

- `/console` signed out: a surface that sells the programme, offers sign-in, and
  explains what a visitor can do against what a subscriber can do.
- `/console` signed in: the hardcoded "signed out" state replaced with real
  session state, in the three forms it actually takes.

**Phase 2, specified in section 4 and not built:** the dashboard itself. Add a
fragrance, pick notes from selectors, withdraw a listing.

**Deferred to the founder, section 5:** how listings get checked. Human approval
queue against automated rule-checking. The founder said this is discussed after
the rest is finished, and section 5 lays out options and stops.

**Not in scope at all, and not to be drifted into:** billing or any checkout;
the `/review` editor queue (that is step 7); the export and publish path (step
8); producer image upload; a public producer directory; any auto-approval or
auto-publish. The last one is a standing prohibition, not a phase boundary.

### The three states, because there are three and not two

This is the single most important structural fact in the plan and it is easy to
miss. `findOrCreateUser()` deliberately never creates a `Producer` row, and
`User.producerId` is nullable. Attaching an inbox to a real company is an
editorial act we perform by hand. So:

| State | Who is in it |
|---|---|
| **(a) Signed out** | Anyone who has not clicked a link in an email. |
| **(b) Signed in, no producer attached** | **Every account, at the moment it is created.** This is the normal first state, not an edge case. |
| **(c) Signed in, producer attached** | Nobody today. Zero producers exist. |

A design that treats (b) as an error state will be showing an error to every
real producer who ever signs in. It is a waypoint and it has to read as one.

---

## 2. Phase 1: what gets built

### 2.1 Wire the session in

`/console` calls `getAuthContext()` and branches on the result plus
`auth.producerId`. Mechanically small. Two knock-on edits:

- `src/index.ts`'s route table currently calls `producerConsole()` with no
  arguments. It becomes `(req, env) => producerConsole(req, env)` and the route
  becomes async, matching how `/` is already wired.
- `src/routes/verify.ts` redirects to `/` on success with a comment saying it
  does so **because** `/console` would lie to a freshly authenticated producer.
  That reason expires with this work. Retarget it to `/console` and rewrite the
  comment. Leaving a stale explanation of a gap that no longer exists is the
  documented failure mode this repo keeps paying for.

### 2.2 State (a), signed out

Heading is **not** "Your listings", which is false to someone who has none.
Status pill reads `Sign-in required`, not "Signed out", which implies a session
that ended.

Band order, from the design direction:

1. **The two doors.** Two cards: "I have an account" carrying the live link to
   `/sign-in`, and "I do not", carrying the real action, which is writing to
   `contact@counterscent.com`. There is no self-serve signup, so a button
   implying one is banned by the house rule. This answers the founder's
   "visitor vs subscriber" requirement structurally and at the top, rather than
   as a paragraph at the bottom.
2. **What a listing buys, and what no plan buys.** Above the plans, because the
   objection this audience arrives with is "is this pay-to-rank", not "how
   much".
3. **The plans.** Section 2.4.
4. **Approved and live are different states**, as the existing `gap-callout`
   diagram only, linking to `/` for the full eight-row reference.
5. **The two things this screen will never do.** Keep today's block; it is the
   ethical core and it is already good.
6. **Contact, and one pointer at `/about#methodology`.**

**No listing table and no disabled action buttons in state (a).** A disabled
"Submit a fragrance" shown to someone with no account is a dead end that no
`reason` string rescues.

### 2.3 State (b) and state (c)

**(b) Signed in, no producer attached.** Pill: `No producer attached`. Heading:
"Your account is set up." The account card comes first, carrying the real email
and the sign-out form, because the reader just clicked a link in an email and
their only question is whether it worked. Then what happens next, with real
actors and no queue-position claim, because there is no queue. Then the listings
section rendered as `notShipped()` **and not as an empty table**: a table
belonging to a producer record you are not attached to is a table of nothing
about nobody, and rendering one is what would make (b) and (c) look identical.

**(c) Signed in, producer attached.** Pill: `Console live`. Heading: "Your
listings", finally true. An identity bar carrying producer name, email, plan and
quota. Then the real five-column table with a genuine empty state. Then the
actions, still disabled because Phase 2 is not built.

Three details in (c) that are correctness, not polish:

- **The empty state's reason has to change.** It currently reads "This page does
  not read the database." That becomes false the moment this work ships. It
  becomes "you have not submitted anything, and you cannot yet", with the reason.
- **Plan display when there is no `Subscription` row.** `Producer.subscription`
  is optional and `Subscription.tier` defaults to `"free"` with `status`
  defaulting to `INCOMPLETE`, so a free producer is representable two ways and
  nothing in the repo picks one. **The rule for this build: absence of a row
  renders "No plan on file", not "Free plan."** Rendering "Free" asserts a
  record exists. This will be every producer's state at launch, so it is the
  common path, not the fallback.
- **The three action buttons have three different reasons.** Today one
  `actions-note` covers all of them. *Submit* is disabled because the form is
  not built; *Request an edit* and *Withdraw* are disabled because there is
  nothing to act on, and they would still be disabled for a zero-listing
  producer after Phase 2 ships. One note cannot carry two reasons.

### 2.4 The plans, with no checkout behind them

**Structure:** a comparison table, not three cards. The reason is not taste. The
`NEVER_INCLUDED` rows can be rendered inside the same table spanning all three
columns, below a rule, which makes "no plan buys rank" a structural fact of the
table rather than a claim printed underneath it. Three cards cannot do that, the
catalogue already owns the card version at `/producers/pricing`, and
`.data-table` already exists with its keyboard-reachable scroll region.

No monthly/yearly toggle. It is client state and there is no JS budget, and a
toggle belongs at a point of purchase, which this is not.

**Prices: the console shows tier shape and no currency figures.** This is my
call, resolving a genuine disagreement between the two departments, and the
deciding argument is drift rather than caution.

`counterscent-producers` is a separate project with no dependency on
`fragrance-dupes` and no import path to `lib/plans.ts`. Any number rendered here
is a hand-typed third copy of 19/49, sitting after the `plans.ts` constants and,
eventually, the payment provider's own price objects, with no build step
anywhere that could catch a mismatch. `plans.ts` already carries an instruction
that these must be kept in step with the provider. A third uncheckable copy is
the same shape as the link checker that fell two source files behind its
generator and reported a clean pass. A producer seeing $19 here and $24 on the
pricing page is worse than one seeing no figure here.

The secondary argument: quoting a number to a signed-in, identified business is
closer to a quote than publishing it on a marketing page, and it anchors the
conversation that the pricing research is supposed to inform.

So the table carries what is a **capability fact** rather than a guess:
allowance (1 / 25 / no cap), commission or no commission, and the shared
`NEVER_INCLUDED` rows. The price cell says the price is not set here, in one
sentence with its reason, and links to `/producers/pricing`, which already shows
the figures with its own "indicative rather than final" disclaimer. Saying the
absence out loud is a different act from silently omitting it: omission reads as
evasion, a stated reason and a link reads as the same posture as every other
notice on this origin.

**If the founder overrules this and wants figures in the console**, the only
mechanism I would accept is generating them from `lib/plans.ts` into a committed
constants file in this project, never retyped by hand, rendered with the same
"indicative, not an offer" sentence. The design direction's visual treatment is
ready for that case and should be used: the figure is never the largest thing in
its cell, and it carries an inline `Indicative` chip in the existing `.tag-off`
idiom, the dashed uppercase marker this origin already uses for "this looks like
a real control and is not". A placeholder price is the same category of object.

**Directly under the table:** `notShipped({ what: "Nothing here can be paid for", reason: ... })`,
naming the real constraint including the unanswered provider question. Then the
one real action, the email. No "Subscribe", no "Choose Standard", no "Start
free" anywhere on the origin.

**Which states show the table:** (a) in full. (b) one line naming the tier the
account would land on, plus the link. (c) not at all. The plan is a fact in the
identity bar, not an offer. Showing three tiers to an attached producer is
upsell, and this programme has structurally decided it does not upsell.

### 2.5 The free-listing-exhausted screen

Unreachable in Phase 1, because nobody can submit anything. **Built now anyway**,
because it is the single most likely place this product fakes success, and
because Phase 2 will otherwise ship it in a hurry. Copy from sales, condensed:

> **Your free listing is in use.** The free tier covers one listing and you have
> it. A second listing needs a paid tier, and no paid tier is open. There is no
> checkout on this site, no payment provider connected to it, and no way for
> anyone to take money from you today. We are not showing you a Subscribe button
> that does nothing, because a button that cannot work is a slower way of saying
> this.
>
> **What actually moves this:** write to contact@counterscent.com and tell us
> how many fragrances you would list and which originals they go against. A
> person reads it. What the paid tiers cost and contain is waiting on exactly
> that, because nobody has listed here yet and we would rather price against real
> catalogues than a guess. We cannot give you a date and we will not invent one.

No time promise anywhere on this screen, including a soft one. "We will write
back" describes a person and is safe; "shortly" is the same failure as a
review-time promise.

That copy commits to one rule the counting code must then honour: **a withdrawn
listing frees the slot.** Allowance counts submissions whose `publishState` is
neither `WITHDRAWN_BY_PRODUCER` nor `REMOVED_BY_EDITOR`. If the founder would
rather it did not free the slot, the second half of that screen comes out,
because then there is no action other than the email.

### 2.6 Component work Phase 1 requires

All in `src/ui/components.ts` unless noted.

1. **`deadButton` must require a `reason`.** `notShipped` requires `reason`,
   `deadField` requires `hint`, `emptyState` requires `because`, and
   `deadButton(label, variant)` requires nothing, which leaves the most
   clickable-looking dead object on the page as the only one exempt from the
   house rule. Signature becomes `deadButton(label, { variant, reason })`.
   Worth doing on its own merits, independent of this redesign.
2. **`tableBlock` cannot render a body row at all.** Generalise it rather than
   adding a sibling `planTable()`. Two table functions will drift, and step 6
   needs body rows in the listing table regardless.
3. **`identityBar()`** for state (c). Nothing in the vocabulary carries several
   short facts on one row; `card()` is the only container and it stacks.
4. **`quotaLine()`**, because "0 of 1 listing used" has three honest cases (no
   subscription record, within quota, at quota) and branching that inline in a
   route is how (c) and the future submit page end up phrasing it differently.
5. **A `tone` field on `layout()`'s `status` option.** Every status strip today
   renders `pill-alert`, so (a) and (c) look identical. (a) and (b) keep an
   outline pill, (c) gets a solid fill, reusing the mark's own solid-means-
   published geometry. The console's status language becomes the same language
   as the listings'.
6. **A shared `listingStates()` block.** The eight-state reference is currently
   eight inline `stateRow()` calls in `overview.ts`, and copying them into
   `console.ts` is exactly the two-copies-that-must-agree failure this repo has
   already paid for more than once.

**Refuse if proposed:** any new badge, any card variant, any icon system. The
correct number of icons on this origin stays at one, the mark.

### 2.7 What Phase 1 must not do

No submit form. No queue. No billing. No CSRF tokens (see 4.6 for why they are
Phase 2's problem and not a Phase 1 omission). No new database table. No change
to how a score is computed or capped. No auto-anything.

---

## 3. The Phase 1 design direction, as recorded

Produced by `design-taste-frontend`, invoked through the Skill tool by the
`web-developer` subagent (base directory
`.claude/skills/design-taste-frontend`; it is registered despite not being
visible to a plain glob of `.claude/skills/`, which does not traverse the
symlink). Its stack directives were deliberately not applied: its Section 3.A
assumes React/Next/Tailwind/Motion, 3.C assumes npm icon packages, 5.A/5.B are
GSAP skeletons, and none of that exists here. Its design reasoning was applied.
Its own Section 13 scopes consoles out, so only state (a), which doubles as this
programme's sales page, was treated as a landing page.

**Design read:** a trade-side account console whose signed-out state has to
double as the programme's only sales page, for fragrance producers who have
specifically been burned by pay-to-rank directories, with a printed-record
language, leaning on the catalogue's own token system rendered in hand-written
CSS.

**Dials:**

| Dial | Value | Reasoning |
|---|---|---|
| `DESIGN_VARIANCE` | **4** | The skill's "trust-first / regulated" row says 3-4, and this is trust-first in the strongest available sense: the product argument *is* that rank is not purchasable, so the page has to read as a record rather than a pitch. Not 3, because three states must be structurally distinguishable and that consumes real variance. Variance is spent on state difference, not decoration. |
| `MOTION_INTENSITY` | **2** | No animation library, no build step, one blocking script that only does themes. The skill's own escape clause applies: drop the dial rather than half-build motion. Keep the existing `--ease-out`, `:active { scale(.98) }` and theme-switch suppression. Add no scroll reveals: these are `no-store` documents read once, and a staggered entry on a state table has no answer to "what does this communicate". |
| `VISUAL_DENSITY` | **5** | Eight listing states, five table columns, three plans, a quota figure. Not landing-page airiness. But not 8-10, which bans card containers and mandates mono numerals, and no mono family is loaded. Density rises locally in exactly one place, state (c)'s identity bar. |

**Governing structural decision: three documents, not one document with a
swapped account card.** The temptation in the build is to keep today's skeleton
and vary the top strip. That is wrong for the same reason `notShipped` requires
a reason: a visitor and an attached producer have different first questions, and
sharing everything below the strip means the signed-out page leads with an empty
listing table belonging to an account that does not exist. What stays identical
across all three: the shell, the status and standfirst slots, the band rhythm,
the state vocabulary. That is enough continuity.

**Telling the three states apart, in four layered channels** so no single one
carries it, mirroring how the badges never rely on hue alone: the status pill
(`Sign-in required` / `No producer attached` / `Console live`, outline against
solid); the H1, which is the largest thing on the page; the shape of the first
block (two doors / one account card / a dense identity bar); and the presence of
the table, which is the visual signature of "this is your workspace". **Do not
differentiate by colour alone, do not add a second accent for signed-in, and do
not change the theme per state.** Moving from (b) to (c) should feel like the
page filling in, not changing identity.

**Imagery: none, as a deliberate deviation from the skill's Section 4.8 rather
than an omission.** Correcting the premise first: the CSP is not the blocker,
`img-src 'self' data:` permits a self-hosted raster. What is true is that there
is no build step, so an image is a hand-added binary plus a hand-written
`_headers` entry; there is no responsive-image tooling; and the origin is
`noindex, nofollow`, reached only from an email or a link, so a hero image
performs no acquisition work. Beyond that: a generated fragrance-bottle hero
would be a picture of a product Counterscent does not make, on a page whose
entire argument is that it does not assert what it cannot back, shown to the one
audience most sensitised to exactly that. `mcp__openart` is available and the
generation is being declined, not unavailable. Visual weight is carried instead
by the plan comparison table, the existing `gap-callout` diagram, a state-badge
specimen row rendering the eight badges as actual badges rather than describing
them in prose, and the type scale.

**Flagged for when it arrives:** the request for "a preview of the dashboard"
after Phase 1 ships. The only two acceptable answers are a screenshot of
software that runs, or nothing. A div-based fake console mock built from this
origin's own `card` and `table` vocabulary would be unusually convincing and
therefore unusually bad.

**CSS:** roughly 90 to 120 new lines in `public/assets/console.css`, taking it to
about 920-950, one existing rule modified, **zero tokens added and zero
changed.** All additions compose from existing tokens. The file's 15 light and 11
dark declarations were diffed against the stated source of truth
(`fragrance-dupes/app/globals.css`) and are currently in step, carrying a
deliberate strict subset. **The standing rule to hold: never add a token to
`console.css` that does not exist in the catalogue's `globals.css.`** The moment
it has one the source lacks, the "copy with a named source" story breaks and the
two files stop being diffable at all. If Phase 2 needs a token the catalogue
lacks, add it to the catalogue first.

**House style to preserve:** the Worker currently contains zero em-dashes and
zero en-dashes across all of `src/` and `public/`, verified by grep. The
catalogue next door does not, so any copy lifted from `app/producers/*` needs
converting.

---

## 4. Phase 2: the dashboard, specified and not built

The founder's words were "add a fragrance, pick notes from selectors, delete
listings." This section specifies that and stops.

### 4.1 One correction to carry forward: "delete" is withdraw

A removal is never a row delete, and this is decided, not open. Deleting the row
destroys `ClickEvent` history that may still pay out inside a network cookie
window, destroys the record of a listing pulled after a complaint, and can break
published comparison or review content, where `affiliateLinkId` is mandatory in
`content/schema.ts`. It also hides the one pattern most worth being able to see,
withdrawal after a bad score.

So the producer-facing verb is **Withdraw**, it sets
`publishState = WITHDRAWN_BY_PRODUCER`, the record and click history are
retained, and the `/go/` identifier stops resolving at the next build and is
never reissued. The UI should say that plainly rather than quietly doing
something other than what the button implies.

### 4.2 Route shape

**`/console/submit`, a separate route.** Not an expansion of `/console` and not
a modal. Three reasons: there is no client JS to open a modal under this CSP
posture; a note-selector form is a multi-field document that wants its own URL
for the POST-then-redirect pattern this origin already uses everywhere; and
`form-action 'self'` is granted per page, so a dedicated route keeps that grant
scoped to a page that actually has a form, exactly as `/sign-in` does today.

Band 3's *Submit* `deadButton` becomes an `<a class="btn btn-primary">` and
nothing else in the Phase 1 layout moves.

**Per-listing actions belong in the table, not in the page-level button row.**
Withdraw and request-an-edit act on one listing. Build the five-column table now
knowing a sixth column is coming. If those stay page-level buttons, Phase 2 has
to answer "which listing" somewhere, and the answer becomes a `<select>` that
should never exist.

### 4.3 What the producer supplies, and what they must never supply

Straight off `Submission` in the schema.

**Producer-declared:** `referenceSlug` (chosen from our catalogue, never
created), `name`, `brand`, `slug`, `concentration`, `priceUsd`, `bottleMl`,
`notesTop` / `notesHeart` / `notesBase`, `ingredients` (optional; empty is
meaningful and safe, the formula falls back to its three-component weighting),
`declaredDifferences` (required prose), `storeUrl` (always recorded, it is what a
buyer and a reviewer check the claims against), and optionally
`pairingSource` / `pairingQuote` / `pairingUrl`.

**Never on the form, and this is load-bearing rather than cautious:** the six
facet fields, `family`, `verdict`, the match score, `verificationStatus`,
`pyramidSource`, `affiliateLinkId`, and all three `founderOverride*` fields.

The reason is structural. `isVerbatimCopy()` flags a copy only when the notes
**and** the facets both match the reference, and that test has a second
independent input precisely because the facets are ours. Hand the same party both
and it is defeated by construction: copy the reference's notes verbatim, nudge
one facet past `FACET_EPSILON`, and nothing fires while the note score sits at
1.0. Every producer could then reliably reach the 90 cap and rank first on their
own reference, which is rank purchasable in substance while remaining
unpurchasable in letter. The six sliders were already removed from
`components/producers/submission-form.tsx` for exactly this, and the console must
not reintroduce them.

`longevityHoursMin` / `longevityHoursMax` / `sillageLabel` are producer-declared
and feed no scoring component (the facet longevity and sillage fields are
separate and editorial). They should render on the page labelled as the
producer's claim.

### 4.4 The note selectors

The founder asked for selectors rather than free text, and there is a real
argument for it beyond convenience: `fragrance-dupes/CLAUDE.md` records that the
catalogue's own spelling inconsistency is currently costing real matches, and
that GLAMOROUS cleared the copy gate only because the merchant writes "Ice" and
"Lotus" where the catalogue records "Ice Accord" and "Lotus Flower". Free-text
notes mean a producer's spelling silently moves their score.

**Two dependencies that must be solved before this is built:**

1. **The note vocabulary is not reachable from this Worker.** The researched
   pyramids live in `fragrance-dupes/lib/data/houses/*.ts`, a separate project
   with no import path and no shared build step. The vocabulary has to be
   generated into this project as a committed constants file by a script, which
   is the same anti-drift pattern as the prices in 2.4. Hand-typing it is the one
   version to refuse outright.
2. **A multi-select with typeahead normally needs JavaScript.** Options, in
   ascending cost: three `<input>` elements backed by a `<datalist>`, which gives
   native browser typeahead at zero JS and degrades to plain text; a
   `<select multiple>` per tier, zero JS but poor at several hundred options; or a
   small self-hosted progressive-enhancement script, which `script-src 'self'`
   permits (an external file, never inline). **Start with `<datalist>`** and
   only reach further if a real producer finds it insufficient.

**Free text must remain possible**, because a producer may legitimately declare
a material our catalogue has never recorded. An off-vocabulary note is accepted
and flagged for review rather than rejected. Constraining a producer to our
vocabulary entirely would be constraining what they are allowed to honestly
declare.

### 4.5 Quota enforcement

Server-side, on the submit route, never in the UI alone. Count submissions whose
`publishState` is neither `WITHDRAWN_BY_PRODUCER` nor `REMOVED_BY_EDITOR`, per
2.5. The database already enforces the two rules that matter underneath:
`@@unique([producerId, slug])` and `@@unique([producerId, referenceSlug])`, the
second of which is what makes withdraw-and-resubmit detectable rather than
merely disapproved of.

### 4.6 Security work Phase 2 owns

- **Real CSRF tokens.** `SameSite=Lax` plus `form-action 'self'` plus a POST-only
  sign-out is adequate for today's two writes and will not be for a withdraw.
  This is a Phase 2 requirement, not a Phase 1 omission.
- **A rate-limit bucket for authenticated writes.** `RateLimit.key` is an opaque
  prefixed string by design, so this is a new prefix rather than a new table.
- **Every state change writes an `AuditEvent`** with `actorType`, `actorId`,
  `channel`, before and after, and `tierAtEvent` / `statusAtEvent`. That last
  pair is the only thing that will ever allow the question "do we approve payers
  differently" to be answered, which is the whole of the conflict this programme
  creates.

### 4.7 Open questions inside Phase 2 that are not mine to close

Surfaced here rather than decided:

1. **`plans.ts` and `PRODUCER-TERMS` contradict each other on the free tier.**
   `plans.ts` lists "request an edit" and "withdraw a listing yourself" under
   Standard; `PRODUCER-TERMS` §10 grants withdrawal unconditionally. Both cannot
   ship. Sales recommends both move to every tier, on the grounds that a
   free-tier producer with no way to correct a stale price is our problem rather
   than theirs, since a stale price is a false "Nx cheaper" claim on our page.
   If it stays a paid feature, the terms clause changes first.
2. **"Conversion data, not just clicks" (Featured) is not merely unbuilt, it is
   contradicted by the design.** Paid tiers take no commission, so the listing
   links directly to the producer's store with no network and no sub-ID.
   Conversion data for a subscriber could only come from the producer's own store
   reporting back to us, which is a pixel or postback nobody has designed. Sales
   recommends removing it from `plans.ts`.
3. **Click data is not built for anyone**, and the current mechanism structurally
   cannot supply it: `/go/<id>` is served by `public/_redirects`, a static
   Cloudflare file, and the route handler was deleted in the static-export
   migration. Note the asymmetry this creates: a free listing carries an
   affiliate link with a sub-ID the network reports on, while a paid listing has
   no network in the middle, so `ClickEvent` is its only possible source. The
   paying tier gets less measurement than the free one until we build our own
   logging.
4. **The top tier is named after the one thing we promise it does not buy.**
   `NEVER_INCLUDED` reads "A premium or featured slot in results" while the tier
   is called Featured. Every honest explanation of that tier has to begin by
   disowning its own name. Worth renaming before the console starts repeating it
   on a screen whose whole job is explaining what tiers do and do not do.
5. **How much `AuditEvent` history a producer may see is undecided** anywhere in
   the repo. The console's "Last change" column reads from it.
6. **`/review` has no access control and no role model to build one from.**
   There is no `role` or `isStaff` column on `User`, and `/review` is currently
   linked from a public page. Options: an env-held allowlist of editor addresses
   (no migration, correct for the one editor who exists), or a column on `User`
   (a migration, correct once there is a second). **Recommendation: the env
   allowlist**, revisited when a second editor exists. Flagging rather than
   deciding because it touches who can approve listings.

---

## 5. The deferred decision: how listings get checked

**The founder deferred this explicitly and this section does not settle it.**
Options, real trade-offs, a recommendation, and then a stop.

### 5.1 First, narrowing what is actually being decided

Two things are already decided and are not in play, and reading the question
without them produces a false choice:

- **Auto-approval and auto-publish are prohibited.** `HANDOFF.md`'s "What must
  NOT be built" list names them, and `/review` states the control floor: a person
  approves, always.
- **The direction of travel is asymmetric.** Automation may flag, weaken, cap a
  score, and take a listing down. It may never put something up or make a claim
  on it stronger.

So "automated rule-checking" cannot mean a machine approving anything. What is
genuinely open is narrower: **when a deterministic check fails, does the
submission bounce back to the producer without a person seeing it, or does it
land in a human queue carrying the failure as an annotation?**
`ActorType.AUTOMATION` exists in the schema, which anticipates that automation
acts and is recorded, but settles nothing about which of these it does.

### 5.2 The options

**Option 1: human-only queue.** Everything lands as `PENDING`. A person reads
every submission and writes every rejection reason.

- *For:* no false positives, ever. Every "no" a real company receives was
  written by a person. Nothing to build beyond step 7.
- *Against:* does not scale past one reviewer, and the reviewer is the founder.
  A producer who forgot a required field waits days to be told so.

**Option 2: automated pre-check as a gate that bounces.** Rules run on submit;
failures never enter the queue; the producer gets structured feedback
immediately, recorded against `ActorType.AUTOMATION`.

- *For:* fastest feedback, and the reviewer's attention is spent only on
  judgement calls.
- *Against:* a machine is now telling a real, operating company no, with no
  person in the loop and no appeal path unless one is also built. The check most
  people would want in this slot, `isVerbatimCopy()`, has **documented boundary
  sensitivity**: ILLUMINATE was withheld and GLAMOROUS shipped on the strength of
  two orthographic differences between near-identical cases. A check that lands
  differently on two near-identical inputs must not be the thing that issues a
  refusal.

**Option 3: automated pre-check as an advisory annotation.** Rules run, results
attach to the submission, everything still reaches the human queue, and the
reviewer sees the flags. `/review`'s table already carries an "Automated checks"
column, which is evidence this was the anticipated shape.

- *For:* keeps the person in the loop while making their reading fast. Flags are
  evidence, not verdicts. Matches the existing control floor exactly.
- *Against:* does not reduce reviewer volume, only reviewer effort per item. A
  reviewer who starts trusting the flags has re-invented option 2 informally,
  which is worse because it is unrecorded.

### 5.3 Recommendation

**Option 3, plus a narrow slice of option 2 that is not actually rejection.**

The slice: checks that are purely mechanical and unambiguous, meaning a missing
required field, a `storeUrl` that is not https or is a shortener or a tracking
link, an original that is not in our catalogue, and a duplicate
`(producerId, referenceSlug)` pair, should be **form validation at submission
time, not a rejection after it.** The producer is stopped before the submission
exists and can fix it in the same sitting. That removes the false-positive
problem entirely, because there is no wrong verdict to appeal, only an
incomplete form.

Everything requiring judgement, above all `isVerbatimCopy()` and "does the
declared pyramid restate the original's", runs as a **flag into the human queue
and never as an automatic refusal.** The precedent for this is already in the
repo and it is the strongest evidence available: the copy gate landed at
different points on two near-identical merchant listings, and that was correctly
recorded as the gate working at its boundary rather than as an inconsistency to
tidy. A check with a known boundary is exactly the wrong instrument for telling a
real company no without a person reading it.

The honest cost of this recommendation: it does not reduce how many submissions
the founder reads. At zero producers that cost is zero, and the volume at which
it becomes real is also the volume at which hiring a reviewer is affordable. If
that trade stops holding, the thing to revisit is option 2 for a *named, small*
list of checks with an explicit appeal path, not a general grant.

**This is a recommendation and nothing in Phase 1 implements any of it.** The
decision is the founder's.

---

## 6. Task breakdown

Phase 1 only. Phase 2 tasks are specified in section 4 and are not assigned.

| # | Task | Owner | Depends on |
|---|---|---|---|
| 1 | Plan positioning, capability comparison, exhausted-allowance copy, price-placeholder recommendation | `sales-strategist` | **Done 2026-09-16.** Returned as text, folded into sections 2.4, 2.5 and 4.7. |
| 2 | Phase 1 design direction via `design-taste-frontend` | `web-developer` | **Done 2026-09-16.** Recorded in section 3. |
| 3 | This plan document | COO | 1, 2 |
| 4 | Component work: `deadButton` reason, `tableBlock` body rows, `identityBar`, `quotaLine`, `layout()` status tone, shared `listingStates()` | `web-developer` | 3 |
| 5 | Wire `getAuthContext()` into `/console`; branch three states; retarget `/verify` and rewrite its stale comment | `web-developer` | 4 |
| 6 | Build states (a), (b), (c) against the direction in section 3 | `web-developer` | 4, 5 |
| 7 | Plan comparison table, tier shape without figures, `notShipped` under it | `web-developer` | 4 |
| 8 | Exhausted-allowance screen | `web-developer` | 4 |
| 9 | `console.css` additions, zero new tokens | `web-developer` | 6, 7 |
| 10 | `ui-ux-pro-max` review over all three states, both themes, before any of this is called done | `web-developer` | 6, 7, 8, 9 |
| 11 | Apply migration `20260916143000_add_rate_limit`, then deploy | **Founder** (needs credentials no agent holds) | 10 |

Tasks 4 to 10 are one `web-developer` engagement, not ten. They are itemised so
that a partial result is legible rather than reported as "the console".

**Not assigned to anyone, and deliberately so:** section 5's decision, and the
six open questions in 4.7. Those are founder calls.

---

## 7. What this plan does not claim

- Nothing here has been built, deployed, committed, or tested at the time of
  writing. Sections 1 to 6 are a plan.
- No agent involved in producing this document has Bash or git access at the top
  level, and no build, lint, typecheck or deploy was run to produce it.
- The listing-check decision in section 5 is open. If a later session finds this
  document and treats section 5.3 as settled policy, that is a misreading:
  it is a recommendation awaiting a founder decision.
