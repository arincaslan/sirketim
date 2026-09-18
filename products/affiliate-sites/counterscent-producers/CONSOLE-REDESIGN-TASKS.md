# Producer console redesign: task breakdown, phase 1

**Written 2026-09-18 by the COO, against `CONSOLE-REDESIGN.md` (direction, same
day) and `CONSOLE-PLAN.md` (the existing build plan).**

This document assigns work. It does not do any. Nothing here has been built,
deployed, migrated or committed, and no subagent has been engaged yet.

Scope is phase 1 of the redesign doc's section 3: the producer/subscriber
panel, the `/` and `/console` split, progressive disclosure, and the editorial
merge that split forces. The owner/editor panel (`/review`) is phase 2 and is
deliberately not assigned here. Read section 6 below before touching it anyway.

---

## 0. Constraints every task inherits

Restated here so a subagent reading only this file still has them. These are
not negotiable and a task that violates one is wrong, not clever.

| | |
|---|---|
| **Platform** | A Cloudflare Worker rendering server-side HTML from tagged template literals. No React, no client framework, no build step beyond wrangler's bundling. Do not propose one. |
| **CSP** | `default-src 'none'; script-src 'self'; style-src 'self'; font-src 'self'; img-src 'self' data:`, with `form-action` granted per page. No inline event handlers, no inline `<script>`. Progressive disclosure is native `<details>`/`<summary>`. |
| **House style** | Zero em-dashes and zero en-dashes anywhere in `src/` and `public/`. Currently zero, verified by grep. `scripts/generate-constants.mjs` enforces it for generated files and will refuse to write rather than emit one. |
| **Visual language** | `public/assets/console.css` tokens, Cormorant Garamond + Public Sans, paper/green. **Not in scope. Do not re-skin.** This work is information architecture. Zero new tokens; if one is genuinely needed it goes into the catalogue's `app/globals.css` first, per `CONSOLE-PLAN.md` section 3. |
| **Imagery** | Real product images or the existing generated note-signature fallback mark. No stock photography, no AI-generated imagery. See task W8, which is blocked rather than buildable. |
| **Design gates** | `design-taste-frontend` is already satisfied for this work by `CONSOLE-REDESIGN.md`. `ui-ux-pro-max` is still owed and is task W12. Neither substitutes for the other. |
| **Hard stops** | Do not deploy. Do not run a migration. Do not commit. Do not touch `/review`. |

---

## 1. Ordering

Content leads, because web development cannot write the pages until it knows
what goes on them. Sales is a narrow review pass, not a rewrite.

```
  F1  founder: settle the two blockers (images, tier rename)
   |
  W0  web dev: tier rename, IF F1 says it rides this change
   |
  C1  content: inventory and merge map        (can start immediately)
   |
  C2  content: "/" copy       C3  content: "/standards" copy      C4  content: stale-claim sweep
   |                           |                                   |
  S1  sales: one review pass over C2 + C3 (commercial terms only)
   |
  W1 .. W10  web dev: build
   |
  W11 verification, then W12 ui-ux-pro-max
   |
  F2  founder: deploy
```

C1 does not depend on F1 and should start first regardless.

---

## 2. The task list

| # | Task | Owner | Depends on |
|---|---|---|---|
| F1 | Settle the image route and the tier-rename question | **Founder** | Section 5 below |
| C1 | Copy inventory and merge map for the deleted signed-out `/console` | `content-strategist` | none |
| C2 | Write the `/` public programme page copy | `content-strategist` | C1 |
| C3 | Write the `/standards` page copy | `content-strategist` | C1 |
| C4 | Stale-claim sweep across the whole origin | `content-strategist` | none |
| S1 | Commercial-terms review over C2 and C3 | `sales-strategist` | C2, C3 |
| W0 | Tier rename `Featured` to `Unlimited` | `web-developer` | F1 |
| W1 | `layout()` learns about the session | `web-developer` | none |
| W2 | The persistent app shell nav | `web-developer` | W1 |
| W3 | The `/` and `/console` split | `web-developer` | C2, W2 |
| W4 | Remove the public `/review` link | `web-developer` | W3 (same change) |
| W5 | Progressive disclosure on the panel | `web-developer` | C1 |
| W6 | `/standards` as a real, routed page | `web-developer` | C3 |
| W7 | The zero-listing empty state | `web-developer` | C1 |
| W8 | Reference images on listing rows | **BLOCKED** | F1 |
| W9 | `console.css` additions | `web-developer` | W2, W5, W7 |
| W10 | Motion, per redesign 2.5 | `web-developer` | W9 |
| W11 | Verification, run by web dev and re-run at the top level | `web-developer` | W0 to W10 |
| W12 | `ui-ux-pro-max` review before any of this is called done | `web-developer` | W11 |
| F2 | Deploy | **Founder** | W12 |

W0 and W1 to W12 are **one `web-developer` engagement**, not fourteen. They are
itemised so a partial result is legible rather than reported as "the console".

---

## 3. Content tasks

Owner: `content-strategist`. Drafts go to
`departments/content/projects/counterscent-producers/`, per that department's
own convention that it hands off a reviewable draft rather than committing copy
into a site's repo. **Do not edit anything under
`products/affiliate-sites/counterscent-producers/src/`.** Web development
integrates.

Two house rules bind every line written here: no em-dashes or en-dashes,
because the copy lands in `src/`; and no time promise anywhere, including a
soft one ("shortly" is the same failure as a review-time promise).

### C1. Copy inventory and merge map

The signed-out `/console` explainer is being **deleted**, not moved. Before it
goes, every section needs a disposition. Read both routes and produce a table:
section, current location, disposition, reason.

Current signed-out `/console` sections (`src/routes/console.ts`):

| Line | Section |
|---|---|
| 138 | "Two ways in, and there are only two" |
| 174 | "What a listing buys, and what no plan buys" |
| 226 | "The plans" |
| 256 | "Approved and live are different states" |
| 288 | "Before you write to us" |

Current `/` sections (`src/routes/overview.ts`):

| Line | Section |
|---|---|
| 56 | "Account" |
| 61 | "What a producer will do here" |
| 117 | "Approved and live are different states" |
| 163 | "What no plan buys" |
| 195 | "The screens, as they stand" |
| 238 | "If you make fragrances" |

Signed-in `/console` sections that leave the panel (`src/routes/console.ts`):

| Line | Section | Goes to |
|---|---|---|
| 542 | "What each column means" | stays on the panel, inside `<details>` |
| 738 | the three-tier plan comparison table | `/` |
| 825 | "The two things this screen will never do" | `/standards` |
| (in 486 block) | the photograph-gap explanation | `/standards` |

Four dispositions are available: **merge into `/`**, **move to `/standards`**,
**collapse into `<details>` on the panel**, **delete as duplicate**. Every row
needs one, with the reason stated.

**Three things this task must get right, and they are the reason it is
content's and not web development's:**

1. **The honest "what is and is not built" disclosure must survive the
   deletion.** It currently lives only on signed-out `/console`. Losing it is a
   standing-convention violation, not a copy regression.
2. **"Two ways in, and there are only two" (console.ts:138) contains the only
   place on this origin that tells a stranger how to get an account**, which is
   writing to `contact@counterscent.com` because there is no self-serve signup.
   Once `/console` redirects to `/sign-in`, a producer without an account hits a
   sign-in form with no route in. That door must land on `/`. This is the one
   section whose loss is a dead end rather than a duplication.
3. **"Approved and live are different states" exists in both files already**
   and is the duplication that caused the drift the redesign doc records in its
   section 1.1. One copy survives, and the code should render it from the
   shared `listingStates()` helper that already exists in
   `src/ui/components.ts:215` rather than from two inline copies.

Return the map as text. No file edits into `src/`.

### C2. The `/` public programme page

`/` becomes the one marketing surface: what the programme is, what it costs,
what no tier buys, how to apply, and the honest state disclosure from C1 item 1.
Signed in, the same page plus a "Go to your console" action in the nav.

Carries: the surviving "two doors" material, "what a listing buys and what no
plan buys", the plan comparison table's surrounding copy, and the state
disclosure.

Does not carry: "The screens, as they stand" (overview.ts:195), which presents
`/console` and `/review` as layout previews. That framing expired on 2026-09-16
and the section dies with this change. See C4.

The plan table renders `NEVER_INCLUDED` rows spanning all three columns below a
rule, so "no tier buys rank" is a structural fact of the table rather than a
claim printed underneath it. That structure is settled (`CONSOLE-PLAN.md` 2.4)
and is not being reopened. Prices are real figures now, generated from
`fragrance-dupes/lib/plans.ts`, and every surface rendering them must say at the
point of use that they are indicative and that no payment provider is connected.

### C3. The `/standards` page

A new page. It is where reference material a producer reads once goes, so the
panel can stop showing it on every sign-in.

Carries: `NEVER_INCLUDED` in full, "the two things this screen will never do",
the eight-state approved-versus-live reference, the photograph gap, and a
producer-readable account of how scoring and the caps work (nothing publishes
above 95; an unverified listing stops at 90; a copied pyramid is flagged and
does not publish at all).

**The point-of-use rule still binds and this is where it is easiest to break.**
Moving the photograph explanation off the panel is allowed only because
`/console/submit` itself says the field is not there yet. Do not move a
disclosure away from the place a user would otherwise be misled. If C3 proposes
moving something whose absence at the original location would mislead, say so
and leave it.

See section 5 item 8 for a duplication risk this page creates with the
catalogue's own `/producers/*` pages. Flag anything in C3's draft that restates
a claim already published at `counterscent.com/producers` or
`counterscent.com/producers/pricing`, so web development can link rather than
copy.

### C4. Stale-claim sweep

Independent of the redesign, and overdue. The origin still describes itself as
unbuilt in places where that became false on 2026-09-16. Every one of these is
the documented failure mode of a stated reason outliving its cause.

Known instances, found while writing this breakdown. Treat as a starting list,
not a complete one:

| File and line | What it says | Why it is wrong |
|---|---|---|
| `src/ui/layout.ts:89` | meta description: "The programme is not open and there are no accounts." | On **every page**. Accounts are real. |
| `src/ui/layout.ts:111` | the nav comment: "This is where real navigation goes once there is a session to render it for." | The precondition is met. The comment is the justification for the thing this redesign is undoing. |
| `src/ui/layout.ts:146` | footer: "This address is the console producers will work in." | Future tense. It is the console. |
| `src/routes/overview.ts:257` | status pill "Not open yet", note "there is still no way to submit anything" | `/console/submit` shipped 2026-09-16. |
| `src/routes/overview.ts:195` | "The screens, as they stand", labelling `/console` and `/review` as layout previews | `/console` is a working screen. |
| `src/routes/review.ts:26` | "When accounts exist, this route goes behind the session and stops being linked from a public page." | Accounts exist. The link is still there. See W4. |

Content rewrites the prose. Web development applies it and owns the code
comments. **A comment explaining a gap that has closed is in scope**, because
this repo has already paid twice for a stale stated reason nobody re-tested.

---

## 4. Sales task

### S1. Commercial-terms review over C2 and C3

Owner: `sales-strategist`. One pass, text return, no rewrite.

The plan positioning, the capability comparison, and the exhausted-allowance
copy are sales's existing work from 2026-09-16 (`CONSOLE-PLAN.md` task 1). This
redesign moves that material onto two new surfaces, and a move is exactly where
a claim quietly changes wording and stops being the claim that was approved.

Check only that the merged copy still says, without softening or overstating:

- No tier takes commission on a producer's sales, at any price. Founder
  decision, 2026-09-18.
- Free tier takes no money and allows exactly one active listing.
- A withdrawal frees the slot, and a withdrawal is never a row delete.
- There is no checkout, no payment provider is connected, and nobody can take
  money today.
- Prices are indicative and are not an offer.
- No time promise of any kind attached to review.
- No tier buys rank, and no tier buys a faster or a different decision.

Report deviations as a list. Do not rewrite the copy; that is C2 and C3.

---

## 5. Web development tasks

Owner: `web-developer`. Read the chain first: root `CLAUDE.md`,
`departments/web-development/CLAUDE.md`, `CONSOLE-PLAN.md`,
`CONSOLE-REDESIGN.md`, then this file.

### W0. Tier rename, `Featured` to `Unlimited`

Gated on F1. Decided 2026-09-18 (`CONSOLE-PLAN.md` decision 5), not yet built.

**A partial rename is worse than none.** `featured` is the tier **id** and
stays. Only the display label changes. Source of truth is
`fragrance-dupes/lib/plans.ts`; `src/generated/plans.ts` is generated from it,
so run `npm run generate` rather than hand-editing. Call sites:

- `scripts/generate-constants.mjs` hardcodes `["free","standard","featured"]`
- `src/lib/producer.ts` switches on the id
- `src/routes/console.ts:738` uses `"Featured"` as a literal column header
- `fragrance-dupes/app/producers/page.tsx` renders it
- `Producer.plan` stores it

Zero producers exist, so there is no data migration. That is why this is cheap
now and expensive later, and it is why it belongs in front of the copy work
rather than behind it.

### W1. `layout()` learns about the session

`layout(options: PageOptions)` in `src/ui/layout.ts` has **no session
parameter today**. "Render the nav only when a session exists" is therefore a
signature change touching every route that calls `layout()`, not a header edit.

Add an optional field to `PageOptions` carrying what the nav needs (signed-in
or not, and the current path for `aria-current`). Routes that already hold an
auth context pass it; routes that do not (`/`, `/sign-in`, `404`, `/health`)
pass nothing and render no nav, which is the correct behaviour for all of them.

Do not make `layout()` read the session itself. It is a pure renderer and
keeping it one is what stops a database call appearing inside a template.

### W2. The persistent app shell nav

Per redesign 2.2. One line, 64 to 72px, rendered only when a session exists so
the original objection stays honoured for signed-out visitors.

```
COUNTERSCENT            Listings   Submit   Account            Sign out
```

- `Review` is **absent**, not disabled and visible. It returns when a role
  model exists, which is phase 2. See section 6.
- Current page marked `aria-current="page"`.
- Mobile: same items wrap to a scrollable row. No hamburger for four items.
- The theme toggle and the `counterscent.com` link stay where they are.

### W3. The `/` and `/console` split

- `/console` signed out **redirects to `/sign-in`** instead of rendering a
  second explainer. Delete the signed-out branch (`src/routes/console.ts`
  roughly 138 to 305) once C1's map says where each section went.
- `/` becomes the single public programme page, built from C2.
- Signed in, `/` keeps its account strip and gains the nav.

**Do not add a `?next=` return parameter in phase 1.** An unvalidated one is an
open redirect, and a validated one is a whitelist to maintain for a benefit
nobody has asked for. A producer who signs in lands on `/console`, which
`/verify` already targets.

### W4. Remove the public `/review` link

`src/routes/overview.ts:219` links `/review` from a card on the public
overview. It dies with the "The screens, as they stand" section in W3, and this
task exists separately so it cannot be forgotten if that section survives in
some other form.

**This is not access control and must not be reported as such.** `/review`
still answers to anyone who types the URL. It is safe only because it is inert.
Removing a link reduces discovery and nothing else.

### W5. Progressive disclosure on the panel

Per redesign 2.3. Three tiers:

1. **Always visible**: account strip, quota line, listings table, primary
   actions. This is the job.
2. **Collapsed, one click**: "What each column means" (console.ts:542), state
   vocabulary. Native `<details>`/`<summary>`. Open state is not persisted and
   that is acceptable for reference material.
3. **Off the panel**: plan table, "what no plan buys", "the two things this
   screen will never do", the photograph-gap prose. Destinations per C1.

The panel's job after this is: what state are my listings in, and what can I do
next.

### W6. `/standards` as a real, routed page

Build from C3. Three things that are easy to miss and have all bitten this repo:

- **Add it to the `ROUTES` table in `src/index.ts`.** A route file that exists
  and is not in the table cannot be called. This exact failure produced roughly
  2,400 unreachable lines on 2026-09-16.
- **`form-action` stays `'none'`.** The page has no form. The grant is per page
  and should keep matching what the page actually contains.
- **Add it to `src/routes/not-found.ts`'s "Where you might have meant to go"
  list**, which is the other place a route has to be registered by hand.

### W7. The zero-listing empty state

Today the zero-listing case is a sentence. It is also the state **every**
producer is in at launch, so it is the common path and not a fallback. Give it
the weight of a screen: what to do next, where the one real action is, and what
the free allowance is, using the existing `emptyState()` and `quotaLine()`
helpers.

Note that this is the only item in the redesign doc's imagery section that
renders for anyone today. See W8.

### W8. Reference images on listing rows: BLOCKED

**Do not build this as specified. It is blocked on F1 and the direction doc
understates it.** Detail in section 5 item 1 below. Listed here so the gap is
visible in the task table rather than silently dropped.

### W9. `console.css` additions

Nav, `<details>` styling, the empty state, and the disclosure affordances.
**Zero new tokens.** If phase 1 needs a token the catalogue's `globals.css`
lacks, add it to the catalogue first, or the two files stop being diffable and
the "copy with a named source" story breaks.

### W10. Motion

Per redesign 2.5, and read section 5 item 9 first, because the redesign doc and
`CONSOLE-PLAN.md` section 3 disagree about this and the disagreement is not
acknowledged in either.

CSS `transition` on hover and active for buttons and rows, `transform` and
`opacity` only. `<details>` open and close is native. Any entry animation is
gated behind `@media (prefers-reduced-motion: no-preference)`. Do not claim
more than is built.

### W11. Verification

Run every one of these and report the actual output, not a summary of intent.
The scripts that exist in `package.json` are `dev`, `deploy`, `typecheck`,
`generate`, `tail`. There is no test script. Do not invent one.

```
npm run typecheck
node scripts/generate-constants.mjs --check
npm run dev          # wrangler dev, then load every route by hand
```

Plus:

- **Grep `src/index.ts` for every route you added.** Existence is not
  reachability.
- **Grep `src/` and `public/` for em-dashes and en-dashes.** Expected: zero.
- Load `/`, `/standards`, `/sign-in`, `/console` signed out (expect the
  redirect), `/console` in states (b) and (c), `/console/submit`,
  `/console/withdraw`, a 404, in **both themes** and at a mobile width.
- Confirm `/console` signed out actually redirects rather than rendering.
- Confirm `/review` still answers and is still inert, and that nothing links to
  it.

`wrangler dev` is the only way to see this origin locally. Do not deploy.

### W12. `ui-ux-pro-max`

Over `/`, `/standards`, `/console` states (b) and (c), `/console/submit` and
`/console/withdraw`, both themes, mobile and desktop. Before any of this is
called done. Root `CLAUDE.md` rule, and it binds whoever holds the keyboard.

---

## 6. The `/review` sequencing risk, stated as a rule

`/review` is currently **inert and has no access control**. There is no `role`
or `isStaff` column on `User` to build one from. It is safe today only because
it reads nothing and writes nothing.

**The rule for phase 1: `/review` is not touched.** Not linked, not in the nav,
not given a session-aware shell, not made to look like a place you can work.
W4 removes its public link and that is the whole of phase 1's involvement.

**The rule for phase 2, and it is a condition rather than a preference: the
change that gives `/review` its first real database query is the same change
that gives it access control.** Not the commit after. Not "before launch". The
same change. A `/review` that queries the submission queue without an
authorisation check publishes every producer's pending submission, their
declared differences and their store URLs to anyone who types the path, on an
origin whose whole argument is that its data is handled honestly.

`CONSOLE-PLAN.md` 4.7 item 6 records the options and a recommendation: an
env-held allowlist of editor addresses (no migration, correct for the one
editor who exists) against a `role` column on `User` (a migration, correct once
there is a second). That decision is the founder's and can be taken now, ahead
of phase 2, because taking it early costs nothing and taking it late is what
turns it into a rush.

One tightening of the redesign doc's wording. Its section 3 says access control
lands with `/review`'s "first real query". I would widen that to its first
**authenticated-looking surface**. A `/review` that stays inert but starts
rendering a signed-in nav, or that appears as a nav item for anyone, is already
making the claim that it is a place you can go and work. The nav item arrives
with the role model, not before it.

---

## 7. Where I disagree with the direction doc

The direction is settled and I am not routing around any of it. These are
places where a task built literally from the doc would produce something wrong,
and they need answers before or during the work rather than after.

### 1. Section 2.4's image claim is wrong on the facts, in three separate ways

The doc says reference bottle images are "a data plumbing job, not an
asset-sourcing one" because "the console already generates from that source".
Checked against disk, it is none of those things:

- **The generator does not read image data at all.**
  `scripts/generate-constants.mjs` reads `lib/data/houses/*.ts`, `lib/plans.ts`
  and `lib/producer-link.ts`. Nothing else. `GeneratedReference` in
  `src/generated/catalogue.ts` is `{ slug, name, brand }` and carries no image
  field.
- **The image data is not in the house files.** It lives in six separate
  generated maps in the catalogue (`feed-images`, `cj-images`, `cj-shop-images`,
  `pm-images`, `pm-shop-images`, `dupe-images`), 605 entries across them, keyed
  differently per source. Merging them into one map keyed by reference slug is
  precisely the "two sources feeding one flat keyed map must not share a key
  prefix" trap the root `CLAUDE.md` records, which already silently destroyed
  one merchant's links.
- **The CSP blocks the result even once the data exists.** `img-src 'self'
  data:` and the image binaries are served from `counterscent.com`, a different
  origin from `producers.counterscent.com`. Two ways out, both real decisions:
  widen `img-src` to include `https://counterscent.com`, which weakens a policy
  deliberately written to match what each page actually contains and couples
  this origin's rendering to the catalogue's deploy; or copy the binaries into
  this Worker's `public/`, which means hand-added binaries with hand-written
  `public/_headers` entries in a project with no build step and no responsive
  image tooling.

**There is also a sequencing problem underneath all three.** Priorities 1 and 2
in that section render on **listing rows**, and there are zero producers and
zero submissions. They render for nobody. Only priority 3, the empty state,
is reachable today, and that is W7, which needs no images at all.

**My recommendation:** cut images from phase 1 except W7. The founder's
complaint about "minimal illustration and images" is real and I am not
dismissing it, but the honest answer on this origin today is that there is
almost nothing real to show, and the alternatives are a CSP change taken to
solve a cosmetic problem or generated imagery that this project has correctly
refused twice. If the founder wants this in phase 1 anyway, the CSP question is
F1 and it is a founder call, not a department one.

### 2. The tier rename is not mentioned in the direction doc at all

`Featured` to `Unlimited` was decided on 2026-09-18, the same day the direction
doc was written, and the doc does not reference it. It is still unbuilt:
`src/generated/plans.ts:72` says `"Featured"` and
`src/routes/console.ts:738` hardcodes it as a column header.

This matters here specifically because the redesign writes new copy on exactly
the two surfaces that render tier names. Written before the rename, that copy
either hardcodes the old name or says `Unlimited` while the generated constants
say `Featured`. Hence W0 and F1.

### 3. Removing `Review` from the nav does not remove the public `/review` link

The doc's section 2.2 says `Review` appears in the nav only for staff and is
otherwise absent. Correct, but `/review` is not currently reached from a nav.
It is reached from a card on the public `/` (`src/routes/overview.ts:219`).
A nav rule changes nothing about that link. W4 exists for this.

### 4. `layout()` has no session parameter, so the nav is not a header edit

The doc presents "rendered only when a session exists" as a change to the
header block. `layout(PageOptions)` takes no auth context, so this is a
signature change and a touch of every calling route. Not hard, but not one
line, and a subagent working from the doc alone will scope it wrong. Hence W1.

### 5. Deleting signed-out `/console` can strand a producer who has no account

The doc says the explainer's unique content merges into `/` and specifically
protects the "what is and is not built" disclosure. It does not name the other
piece whose loss is worse: the "I do not have an account" door, which is the
only place on the origin that says the way in is writing to
`contact@counterscent.com`. There is no self-serve signup. Once `/console`
redirects, that stranger lands on a sign-in form with no route in. C1 item 2.

### 6. `/standards` fixes one duplication and creates another

The whole redesign is motivated by two copies of the same argument drifting
apart on `/` and `/console`. `/standards` then restates material that already
exists at `counterscent.com/producers` and
`counterscent.com/producers/pricing`, which are two separate copies in two
separate projects with no build step able to compare them, which is the same
failure one layer out.

Worth noting too that this origin is `noindex, nofollow` by design, so a
marketing-shaped page here does no acquisition work and is read only by someone
already inside.

**My recommendation:** keep `/standards` on this origin for phase 1, because it
has to match what the panel says and the panel is here. But C3 flags every
claim that restates a published catalogue page, and W6 links rather than
copies wherever a link will do. If the overlap turns out to be most of the
page, the right answer is `counterscent.com/producers/standards` and a link,
and that is worth revisiting rather than settling now.

### 7. The two direction documents disagree about motion, silently

`CONSOLE-PLAN.md` section 3 set `MOTION_INTENSITY` to **2** and explicitly
ruled out staggered entry: "a staggered entry on a state table has no answer to
'what does this communicate'". `CONSOLE-REDESIGN.md` 2.5 sets MOTION **3** and
proposes exactly that, an entry animation on the listings table via an
`animation-delay` cascade.

I am not blocking it. The founder asked for more motion and this is the
cheapest honest version of it. But the newer doc does not acknowledge that it
is overruling the older one, and the older one is what a subagent reading
`CONSOLE-PLAN.md` will find. **Mark `CONSOLE-PLAN.md` section 3's motion dial
as superseded in the same change**, rather than leaving two live direction
documents that contradict each other, which is the same disease as the two
consoles.

### 8. One thing the doc gets right that is worth repeating

Section 1.2's reading is correct and it is the strongest argument in the
document: the nav was removed for a stated reason, the reason's precondition
was met on 2026-09-16, and nobody revisited it. The founder's complaint about
scrolling to the footer to navigate is the predicted consequence of a decision
whose justification expired. That pattern, a stated reason outliving its cause,
is what C4 exists to sweep for across the rest of the origin.

---

## 8. Not assigned, deliberately

- **The owner/editor panel.** Phase 2. Section 6 is its precondition, not its
  plan.
- **`/review` access control model.** Founder call. Options and a
  recommendation are in `CONSOLE-PLAN.md` 4.7 item 6.
- **The image route.** F1. Founder call, per section 7 item 1.
- **Whether the tier rename rides this change.** F1.
- **Deploy and any migration.** Founder only. No agent holds the credentials,
  and `wrangler whoami` reports from cache and will say you are logged in when
  you are not.
- **Billing, checkout, payment provider.** Out of scope and not to be drifted
  into.
- **Producer image upload.** Out of scope. The submit form says the field is
  not there yet and must keep saying so.
