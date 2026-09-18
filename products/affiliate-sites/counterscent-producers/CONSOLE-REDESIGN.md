# Producer console redesign: direction

**Founder brief, 2026-09-18, verbatim:**

> there are 2 producer console one has main url the other has /console url we do
> have a dashboard and we can reach the console and etc from there also there are
> too much information at ones with minimal animation and illustration and images
> which i did not like at all. In dashboard user should locate the information of
> his choosing we shouldnt just show it to its face. Tidy up the interface user
> need to go bottom of the page for routing itself to console or reviews and other
> pages [...] i want to see a usefull end result for producers/subscribers panels.
> Then we will start to work on owners panel which listings will come and approved
> or not.

This is the **direction** document, written before markup, per the root
CLAUDE.md rule that every piece of UI goes through `design-taste-frontend` for
direction and `ui-ux-pro-max` for review.

---

## 0. Design read

> Reading this as: a **redesign-overhaul of the information architecture**, not
> of the brand, covering a signed-in producer panel plus two public explainer
> pages, for non-technical owners of small fragrance houses, keeping the
> existing paper/green + Cormorant Garamond/Public Sans language, leaning toward
> a real app shell with persistent navigation and progressive disclosure.

**The brand is not the problem and is not in scope.** `public/assets/console.css`
already carries a real token system mirrored from the catalogue's `DESIGN.md`,
with computed WCAG pairs (ink/paper 16.35:1, muted/paper 5.91:1) and a documented
shape rule (frames 2px, buttons 8px, pills full). It is a warm-paper and
deep-green palette with a serif display face. That is a coherent, specific
language and it is nothing like an AI default. **Do not re-skin it.** Every
finding below is structural.

### Dials

The console is two different products sharing one stylesheet, so it gets two
dial settings rather than one.

| Surface | VARIANCE | MOTION | DENSITY | Why |
|---|---|---|---|---|
| Public: `/`, `/sign-in` | 7 | 5 | 3 | Marketing pages. They are selling a programme to a stranger. |
| Panel: `/console`, `/console/*`, `/review` | 4 | 3 | 6 | Product UI for a returning user with a job to do. Predictable beats expressive. |

**`design-taste-frontend` Section 13 explicitly excludes dashboards, dense
product UI and admin panels**, and says to state that rather than apply the
skill anyway. So the skill governs the public pages. The panel is governed by
app-shell conventions and the house tokens. Its Section 2.A advice to install a
real design system (Fluent, Carbon, Radix) **does not apply here**: those are
React packages and this origin is a Cloudflare Worker rendering string-templated
HTML with no build step and no framework. The existing hand-written CSS stays.

---

## 1. Findings

### 1.1 There really are two consoles, and the router proves it

`src/index.ts` routes `/` to `overview()` and `/console` to `producerConsole()`.
Signed out, **both render a long explainer** with overlapping content: both have
a "what no plan buys" section, both describe the screens, both end in a
"write to us" block. A visitor who lands on `/` and then clicks through to
`/console` reads the same argument twice in different words.

Worse, the duplication is a correctness risk, not just a tidiness one. The two
copies had already drifted: the caps sentence the founder cut on 2026-09-18
existed on `/console` and never existed on `/`, and the commission claim had to
be fixed in both files separately today.

### 1.2 Navigation was deliberately removed, and the reason has expired

`src/ui/layout.ts` carries this comment in the header:

> No navigation items, on purpose. "Console" and "Review" in a persistent nav
> would present two areas as places you can go and work, which is the exact
> claim this origin must not make yet. [...] **This is where real navigation
> goes once there is a session to render it for.**

That was correct when nothing worked. **Sign-in, the console, submit and
withdraw all shipped on 2026-09-16.** There is now a session to render it for,
and the note says so itself. The founder's complaint that you have to scroll to
the footer to move between pages is the direct, predicted consequence of a
decision whose precondition has been met and not revisited.

### 1.3 The panel is prose where it should be state

The signed-in `/console` renders roughly 148,000 characters on the internal
dashboard and a comparable wall here: "What each column means" (4 long
paragraphs), "The two things this screen will never do" (2 cards), "Photograph
upload is not here either" (a paragraph), plus a full three-tier plan comparison
table. A producer signing in to check one listing reads all of it, every time.

The content is good and mostly true. It is in the wrong place and shown at the
wrong time. A returning user needs: what state are my listings in, and what can
I do next. Everything else is reference material they read once.

### 1.4 There are no images anywhere

Zero `<img>` on this origin. The product is **fragrance listings that will carry
mandatory product photographs**, compared against reference bottles the
catalogue already holds images for. A panel about photographs that contains no
photographs is the founder's "minimal illustration and images" complaint
precisely.

---

## 2. Direction

### 2.0 Four corrections from the COO review, 2026-09-18

Recorded here rather than silently edited in, because three of them are things
this document asserted without checking.

1. **Deleting the signed-out `/console` can strand a producer who has no
   account.** That page is the only place on the origin saying the way in is to
   email us, and there is no self-serve signup. A bare redirect to `/sign-in`
   leaves that person at a form with no route in. **The "how do I get an
   account" door must survive the deletion, exactly like the "what is not built
   yet" disclosure.**
2. **Removing `Review` from the nav does not remove the public `/review`
   link.** That link is a card on the public `/` (`src/routes/overview.ts`,
   the "The review queue" card), reachable by anyone, and no nav rule touches
   it. Removing it is its own task.
3. **The `Featured` to `Unlimited` rename is not in this document and should
   be.** It was decided the same day and is still unbuilt
   (`src/generated/plans.ts`, and a hardcoded column header in
   `src/routes/console.ts`). This redesign rewrites copy on exactly the surfaces
   that render tier names, so **the rename rides this change or the new copy
   bakes in a name we have already retired.**
4. **`/standards` fixes one duplication and risks creating another**, restating
   material already on `counterscent.com/producers` and `/producers/pricing`:
   two copies in two projects with nothing able to compare them. Keep it for
   phase 1, but **link rather than copy**, and revisit if the overlap turns out
   to be most of the page.

### 2.1 Split the two consoles by audience, not by URL accident

| Route | Becomes | Signed out | Signed in |
|---|---|---|---|
| `/` | The public programme page. What it is, what it costs, what no tier buys, how to apply. The one marketing surface. | Full page | Same page plus a "Go to your console" action in the nav |
| `/console` | The panel. Nothing else. | **Redirect to `/sign-in`** rather than rendering a second explainer | The app |

The signed-out `/console` explainer is deleted, not moved. Its unique content
merges into `/`.

**One thing must survive that deletion.** The signed-out `/console` currently
carries the honest "this is what is and is not built" disclosure. That is a
standing repo convention (a feature whose backing service does not exist must
say so at the point of use) and it moves to `/`, it does not disappear.

### 2.2 Give the panel a real app shell — SHIPPED 2026-09-18

**Built at the top level the same day, ahead of the task breakdown, because it
is the founder's most-cited complaint and it does not depend on any content
decision.** What landed:

- `NavContext` and `navBar()` in `src/ui/layout.ts`, rendered only when a caller
  passes `nav`, so a signed-out visitor still gets no nav and the original
  objection stays honoured.
- Wired into `/console` (1 screen), `/console/submit` (5 screens),
  `/console/withdraw` (4 screens) and `/review`.
- `/review` became `async` and reads the session **purely to decide whether to
  render the nav**. That is a navigation affordance and **not** access control;
  the route is still inert and still unprotected.
- `.site-nav` styles in `console.css`, current item marked by weight plus a 2px
  primary underline plus `aria-current="page"`, never by colour alone.
- Under 48rem the nav drops to its own scrollable row and `scroll-padding-top`
  rises from 5rem to 6rem to match the measured 82px two-row header.

Verified: 3 links signed in, 0 signed out, on all four routes; correct
`aria-current` per page; no horizontal overflow at 1536px or at narrow width;
zero em-dashes still.

The description below is what was built.

### 2.2a The shape

A persistent header nav, one line, height 64-72px, rendered **only when a
session exists** so the original objection stays honoured for signed-out
visitors:

```
COUNTERSCENT            Listings   Submit   Account            [Review]   Sign out
```

- `Review` appears only for staff, once the role model exists. Until then it is
  absent, not disabled-and-visible.
- Current page marked with `aria-current="page"`.
- Mobile: the same items wrap to a scrollable row. No hamburger, there are only
  three to four items.

### 2.3 Progressive disclosure: three tiers

The founder's "user should locate the information of his choosing" translates
into a concrete rule for this panel.

1. **Always visible**: account strip, quota line, the listings table, the
   primary actions. This is the job.
2. **Collapsed by default, one click away**: "What each column means", state
   vocabulary. Native `<details>`/`<summary>`, which needs no JavaScript and
   therefore survives the strict CSP. Open state is not persisted; that is
   acceptable for reference material.
3. **Moved off the panel entirely**: the plan comparison table, "what no plan
   buys", "the two things this screen will never do", and the photograph-gap
   explanation. These belong on `/` and on a `/standards` page, linked from
   nav. A producer reads them when deciding, not every time they sign in.

**The promise-at-point-of-use rule still binds.** Moving the photograph
explanation off the panel is allowed only because the submit form itself says
the field is not there yet. Do not move a disclosure away from the place the
user would otherwise be misled.

### 2.4 Images: cut from phase 1, except the empty state

**This section originally claimed reference bottle images were "a data plumbing
job, not an asset-sourcing one" because "the console already generates from that
source". That was wrong on three counts, found by `board-coo` reading the source
instead of trusting this document, and verified at the top level before being
accepted:**

- `src/generated/catalogue.ts` emits `GeneratedReference` as
  `{ slug, name, brand }`. **No image data.** The generator reads house files,
  plans and network hosts, and none of those carry images.
- The catalogue's images live in six separate generated maps keyed differently
  per source, roughly 605 entries. Merging them is precisely the key-prefix
  collision that already destroyed one merchant's links once
  (`original-<slug>` colliding across two merchants, 91 of 123 ids).
- **The CSP forbids it anyway.** `src/lib/http.ts:39` sets
  `img-src 'self' data:`, and the binaries are served from `counterscent.com`,
  a different origin. Showing them means either widening the CSP or hand-copying
  binaries plus `_headers` entries into a project with no build step.

Underneath all three, the decisive point: **there are zero producers and zero
submissions**, so listing-row images would render for nobody. The only image
surface a real person can reach today is the empty state.

**So phase 1 does one thing: make the zero-listing empty state worth looking
at.** The rest waits for the photograph upload work, which is where a real
image on this origin first comes from.

**No stock photography and no generated illustration, ever.** This origin shows
real products or an honest placeholder. Picsum seeds and AI imagery would be
fabricated product data on a site whose entire argument is that its data is
real, and this project has already correctly refused that twice.

This is the founder's "minimal illustration and images" complaint answered
honestly rather than quickly: the complaint is real, and the truthful reply is
that there is almost nothing real to show yet.

### 2.5 Motion: MOTION 2, and this document was wrong to raise it

**`CONSOLE-PLAN.md` section 3 already set `MOTION_INTENSITY` to 2 and
explicitly ruled out the staggered table entry this section originally
proposed.** Its argument is better than the one it replaced:

> Add no scroll reveals: these are `no-store` documents read once, and a
> staggered entry on a state table has no answer to "what does this
> communicate".

That is the `design-taste-frontend` "motion must be motivated" test applied
correctly, and a console screen fails it. **Two live direction documents
contradicting each other is worse than either being wrong**, so this one defers.

What stays, all of it already in `public/assets/console.css`:

- CSS `transition` on hover and active for buttons, rows and nav links,
  `transform` and `opacity` only, on the existing `--ease-out` token.
- `<details>` open and close, which is native and needs no script.
- The global `prefers-reduced-motion: reduce` block that already neutralises
  all of it.

**Nothing new.** The founder asked for animation, and the honest answer is that
the thing making these screens feel dead is the wall of text and the missing
navigation, not the absence of movement. Fix those first and re-ask.

### 2.6 House constraints that bind every one of the above

- **Zero em-dashes and zero en-dashes** in `src/` and `public/`. Verified by
  grep, and three of them were introduced and removed again today.
- **No inline event handlers**, strict CSP. `<details>` and CSS only.
- **`form-action 'self'`** is granted per page; any new page with a form must
  declare it.
- **No client JS framework.** Not a preference, an architecture fact.

---

## 3. Sequencing

The founder's own order, kept:

1. **Producer/subscriber panel** (this document). Nav, the `/` and `/console`
   split, progressive disclosure, images.
2. **Owner/editor panel** afterwards: `/review`, where submitted listings are
   approved or rejected. It is inert and **has no access control**, which is
   safe only while it stays inert. Access control lands in the same change as
   its first real query, never after.

---

## 4. Review gate

Nothing here ships without a `ui-ux-pro-max` pass, per the root CLAUDE.md rule
that binds the top level as well as the department.
