# DRYDOWN Producer Program: B2B explainer video

**Campaign folder:** `departments/advertising/campaigns/drydown-producer-program/`
**Status:** brief and script only. **No video has been produced.** Nothing has been
generated, recorded, edited, or posted. This document is the thing you hand to
whoever (or whatever) actually cuts it.
**Written:** 2026-08-26 by `ad-strategist`.
**Product:** `products/affiliate-sites/fragrance-dupes/` (DRYDOWN). Internal
Sirketim product, not client work.

This file doubles as the campaign brief for this folder (the `campaign-brief`
skill's `brief.md`), rather than splitting the same content across two
overlapping documents. Assets, copy drafts, and a post log go in this same
folder when they exist.

**Source documents this is grounded in.** Everything below traces to one of
these. Where a claim is not in them, it is flagged as unverified rather than
written into the script.

- `products/affiliate-sites/fragrance-dupes/PRODUCER-PROGRAM.md` (the substance)
- `products/affiliate-sites/fragrance-dupes/MARKETPLACE-PLAN.md` (the model)
- `products/affiliate-sites/fragrance-dupes/DESIGN.md` (the look, the voice, the motion)
- `products/affiliate-sites/fragrance-dupes/README.md` (what is actually built)
- `lib/similarity.ts`, `lib/catalog.ts`, `lib/producers.ts`,
  `components/dupe-finder/reference-picker.tsx` (read directly, so the UI
  described below is the UI that exists)

---

## 1. Audience, and the single job of the video

**Audience.** Growth, partnerships, or founder-level decision makers at
"inspired by" fragrance houses. The real names already sitting in
`lib/producers.ts` as fixtures are the target list: Dossier, ALT. Fragrances,
Divain, MicroPerfumes, Regency Fragrances, Parfum Inspirations, hkPerfumes.
These are performance-marketing businesses. They buy traffic daily, they
already know their blended CAC, and they are fluent in affiliate mechanics.
They do not need "what is a dupe" explained to them.

Two things follow from that, and they shape every line of the script:

- **Do not sell them the category.** Sell them the *placement*. They already
  believe in dupes. What they do not have is a way to reach a buyer who has
  already named the bottle they want.
- **They are skeptical of directory sites**, because most of them are
  pay-to-rank in disguise. Section 4 is the answer to that skepticism, and it
  is the second-strongest thing in the video.

**Length:** 60 to 90 seconds. The script below runs to roughly 88 seconds.

**The single job.** By the end, a producer must believe one sentence:

> DRYDOWN puts my product in front of someone who has already decided to buy a
> specific expensive fragrance and is actively looking for an alternative, and
> the rank it gives me is one I actually earned, so a good match here converts
> better than paid traffic does.

Everything else (tiers, submission flow, approval SLA, analytics) is
supporting detail. If the video lands the placement argument and the integrity
argument and nothing else, it worked.

**What the video must not do:** promise a price, promise a tier, promise a
launch date, or claim producers are already on the platform. None of those are
true or decided yet. See Section 6.

---

## 2. The core argument, and why it leads

Straight from `PRODUCER-PROGRAM.md` §1:

> A dupe producer's problem is discovery. They make a competent alternative to
> Baccarat Rouge 540, and the customer searching for it has never heard of
> them. What DRYDOWN offers is placement at the exact moment of comparison, in
> front of someone who has already named the expensive fragrance they want and
> is actively looking for an alternative. That is far later in the funnel than
> an Instagram ad reaches.

This is the whole pitch, and it is worth being precise about *why* it is
strong, because the precision is what makes it credible to a performance
marketer rather than sounding like positioning copy:

- **An Instagram ad interrupts.** It reaches someone who was not thinking
  about fragrance, and has to manufacture the entire intent from zero:
  awareness, desire, trust, and purchase, all inside one scroll. That is why
  the funnel leaks.
- **A DRYDOWN comparison intercepts.** The buyer arrived having already named
  the original. Awareness of the category is done. Desire is done. Budget
  objection is done, because the fact that they are looking for a dupe *is*
  the budget objection resolving in the producer's favour. The only question
  left on the screen is "which of these alternatives is closest," and that is
  the one question a good producer wins.

The producer is not buying impressions. They are buying **the last question**.

Two supporting facts that make the argument concrete rather than abstract, and
both belong in the video:

1. **The catalog has open slots.** The site carries 68 reference originals and
   only about 15 of them have any listing at all (`PRODUCER-PROGRAM.md` §2).
   The picker shows this honestly: every fragrance in the Step 2 dropdown is
   labelled either "N listed" or "none listed yet"
   (`components/dupe-finder/reference-picker.tsx`). An original that people
   search for with nothing listed against it is a slot with a buyer already
   standing in it. `lib/catalog.ts` says so in its own comment: "A zero here is
   the marketplace's own inventory gap."
2. **Every outbound click is measured.** `/go/[slug]` is already the single
   chokepoint every outbound click passes through, so per-listing click data
   is a real deliverable, not a roadmap item (`PRODUCER-PROGRAM.md` §1 and §6).
   Caveat: the logging itself is still a TODO in the route handler. See
   Section 6.

**Order matters.** Lead with placement. Integrity comes second, as the reason
the placement is worth more here than elsewhere. Reversing them turns the
video into a trust lecture from a site with no producers on it yet.

---

## 3. Scene-by-scene script

**Format:** 16:9, 1920x1080. This is B2B, watched on a desktop, embedded in an
email or a partnerships page. Not vertical.

**Read the on-screen text literally.** It is final copy, not a description of
copy. Note that DRYDOWN's voice bans the em-dash everywhere, including
on-screen strings (`DESIGN.md` §1), and bans blanket "identical" claims about
any dupe (`DESIGN.md` §8). Both are honoured below.

**Subtitles are mandatory**, burned in or as a track. A meaningful share of the
audience will watch this muted in an inbox. The video must work with the sound
off, which is also the reason every load-bearing claim appears as on-screen
text and not only as narration.

### Visual system (applies to every scene)

Taken from `DESIGN.md` §3, §4, §5. Do not invent a different look. This video
has to be recognizable as the same thing as the site.

| | |
|---|---|
| Paper / background | `#F1F1EB` |
| Ink / body | `#12140F` |
| Accent (the only one) | Drydown Green `#1B5E44` |
| Border / rules | `#D8D7CB` |
| Chart: Reference series | Gold `#B8863A` |
| Chart: Dupe series | Green `#1E7A52` |
| Display type | Cormorant Garamond, light weight, generous line height. Wordmark all-caps and tracked out |
| UI / labels / subtitles | Public Sans |
| Shapes | 2px corners on frames and cards, 8px on buttons, full pill only on chips |
| Motion | "Settle." Entrances `cubic-bezier(0.23, 1, 0.32, 1)`, on-screen movement `cubic-bezier(0.77, 0, 0.175, 1)`. Never `ease-in`. Text and cards settle in over 400 to 600ms. **No bounce, no spring, anywhere in the edit.** The one bounce in this whole product is the Match Reveal, and it is already inside the screen recording |
| Transitions | The Atomizer. Sections dissolve through a soft mist bloom in Drydown Green, never a hard cut, wipe, slide, or crossfade. Nothing enters from `scale(0)`; minimum start scale 0.94 |
| Lower thirds | Public Sans, small, uppercase, tracked, ink on paper with a single green rule. Never a filled coloured box |

Light mode throughout. Dark mode exists on the site but light is primary.

---

### Scene 1. Cold open: their problem, in their words (0:00 to 0:07)

**Shown.** Black to paper. The DRYDOWN preloader plays for real: the wordmark
in Cormorant Garamond, the 0-to-100 counter, the green progress rule, then the
blur-dissolve and mist burst as it clears. This is captured from the running
site, not recreated. It is 1.35 seconds of genuinely on-brand cold open that
already exists, so use it.

**Voiceover.** "You make a good alternative to a two hundred dollar bottle. The
person shopping for that bottle has never heard of you."

**On-screen text.** (Cormorant Garamond, mist-resolves in, left aligned, lower
third of frame)

> Your problem was never the formula.

**Note.** Open on their problem, not on our brand. The wordmark is already on
screen doing the branding work, so the words do not have to.

---

### Scene 2. The funnel argument (0:07 to 0:20)

**Shown.** A single horizontal rule across the frame in `#D8D7CB`, drawn left
to right at a constant rate over about 900ms. Four small labels settle onto it
in sequence, Public Sans, uppercase, tracked: `AWARENESS`, `INTEREST`,
`COMPARISON`, `PURCHASE`. A gold dot lands on `INTEREST` and stops there. Then
a green dot lands on `COMPARISON`, and a small green rule underlines that
label.

Deliberately austere. No funnel cone graphic, no icons, no stock footage of a
phone. This audience reads charts for a living and a decorative funnel would
read as a pitch deck template.

**Voiceover.** "An ad on Instagram reaches someone who was not thinking about
fragrance at all. You pay to build the whole decision from nothing. DRYDOWN
reaches them one step from checkout, after they have already named the
fragrance they want and started looking for something cheaper that smells like
it. You are not buying attention. You are buying the last question they ask."

**On-screen text.** (settles in under the green dot, held for the rest of the
scene)

> Where an ad reaches them.
> Where DRYDOWN reaches them.

**Note.** The gold-versus-green pairing is not arbitrary. Those are literally
the site's Reference and Dupe chart series colours (`DESIGN.md` §3), so the
same two hues carry the same two meanings from this abstract scene straight
into the real radar chart in Scene 4. The viewer learns the colour code before
they need it.

---

### Scene 3. The moment itself: the two-step picker (0:20 to 0:33)

**Shown.** Real screen recording of `/dupe-finder`. Full-bleed browser
viewport, no browser chrome, no URL bar (see Section 6, the site is not
deployed). The canvas mist cursor is visible and moving, because it is a real
part of the product and it looks like nothing else in this category.

The recorded interaction, exactly as the component behaves:

1. The search field sits at the top: "Search all originals by name, brand, or
   note." Skip past it.
2. **Step 1, Pick a house.** A row of eight pill buttons, one per fragrance
   house, each with its count. Click one. The green pill slides across on a
   shared layout transition.
3. **Step 2, Pick the fragrance.** The dropdown opens under it, showing only
   that house's fragrances. Each row carries the olfactive family and, in
   muted text, either "3 listed" or "none listed yet". Hold on the dropdown for
   a beat so the "none listed yet" rows are legible. Select one.
4. The selected reference resolves beside it: name in the display serif, price
   and bottle size and concentration beneath.

**Voiceover.** "This is the whole front end. Two steps. Pick the house, pick the
bottle. Sixty eight originals in the catalog right now, and fewer than a
quarter of them have a single alternative listed against them."

**On-screen text.** (lower third, settles in as the dropdown is held)

> 68 originals listed.
> Most of them have nothing listed against them yet.

**Note.** Say "fewer than a quarter" rather than a precise count. The precise
number moves every time a listing is added, and a stale hard number in a video
is a small credibility leak. Also: do not zoom or add motion graphics over this
recording. The tool is the product and it can carry thirteen seconds unaided.

---

### Scene 4. The comparison, and the radar chart (0:33 to 0:48)

**Shown.** The recording continues without a cut. Ranked result cards stagger
in at 40ms intervals down the left pane, each showing brand, product name, a
similarity percentage, the price-per-ml value framing, and its one-line "why it
matches" note. Click the top card. The right pane loads and the **Match
Reveal** plays: the gold Reference polygon stroke-draws in over about 550ms at
a constant rate, then roughly 150ms later the green Dupe polygon fades and
scales in, then the overlap fill settles last.

Hold on the finished chart for a full two seconds. This is the payoff frame of
the entire product and the edit should let it breathe. Then scroll down through
the grouped spec panel: **Composition**, then **Wear**, then **Value**.

**Voiceover.** "Every alternative is scored against the original and ranked.
The chart is six axes: freshness, sweetness, warmth, woody depth, longevity,
sillage. Gold is the original. Green is the alternative. Underneath it, the
full spec: the note pyramid, the wear, and the price per millilitre against
the bottle it is standing in for."

**On-screen text.** (small, upper right, appearing as each polygon draws)

> Reference
> Alternative

**Note.** Capture this in light mode. The gold series carries a documented
contrast warning at 2.85:1 on paper (`DESIGN.md` §3), which the site handles
with direct value labels and a data-table fallback. In video, at 1080p and
compressed, that gold is going to be the first thing to degrade. Frame the shot
so the direct labels are legible, and if the gold reads muddy in the encode,
cut to the "View as table" disclosure for a second rather than pushing the
saturation and breaking colour consistency with the live site.

---

### Scene 5. Your listing, in that comparison (0:48 to 0:58)

**Shown.** Same recording. Scroll back up to the ranked list and hold on a
single result card, framed so it fills a good part of the screen: the producer
name badge, the similarity score, the "why it matches" line, the price per ml,
and the "Check current price" button. Hover the button. The mist cursor
intensifies over it (the component raises its particle emission rate on
`data-cursor` targets). Do not click through; the affiliate destination is a
`REPLACE_ME` placeholder today.

Then, as the VO names it, a small green-ruled callout settles in beside the
button reading `/go/[slug]`, with a thin line connecting it to the button.

**Voiceover.** "This is what you are buying. Your product, in that comparison,
with your own affiliate link behind the button. Every outbound click routes
through one place, which means the click data comes back to you: how many, from
which original, on which listing."

**On-screen text.**

> Your listing. Your link. Your click data.

**Note.** See Section 6 on fixture data. The card on screen must not be a real
competitor's product shown with numbers we invented. Record this shot against
DRYDOWN's own house listing (Drydown Atelier), or against a clearly generic
placeholder listing created for the recording.

---

### Scene 6. The integrity stance (0:58 to 1:14)

This is the section that separates DRYDOWN from every pay-to-rank directory
this audience has already been burned by. It is a selling point, not a
disclaimer, and the script treats it that way.

**Shown.** Cut away from the recording, through a mist transition, to a plain
paper frame. Three lines settle in one at a time, Cormorant Garamond, left
aligned, each with a short green rule above it. Then cut to a recording of
`/about#methodology`, scrolling slowly through the published formula.

**Voiceover.** "Here is what a subscription does not buy. It does not buy a
better score. It does not buy a higher rank. There is no premium slot. The
formula that ranks you is published on the site: note overlap counts for half
of it, how closely the accords line up counts for thirty five percent, family
match for the rest. When two listings tie, the cheaper bottle wins, not the
bigger account. Our own line is in there, ranked by the same formula as
everyone else, and it does not get floated to the top. That restraint is the
product. It is why a buyer believes the ranking, and a buyer who believes the
ranking is a buyer who actually converts when you come out on top."

**On-screen text.** (three lines, staggered)

> A subscription buys placement.
> It does not buy rank.
> The formula is published.

**Note.** The claims here are all structurally true today, which is why they
are safe to put in a video: `getRankedDupesFor()` in `lib/catalog.ts` breaks
ties toward the cheaper price per ml, the house producer is explicitly not
floated (its own doc comment says "a site that sells its own bottle inside a
comparison it calls independent cannot also quietly weight itself first"), and
`lib/similarity.ts` takes no subscription input of any kind. §3's tier table is
deliberately free of anything touching rank. Keep it that way, or this scene
becomes a lie retroactively.

**One thing this scene must not overclaim.** Facet scores are producer
declared. `PRODUCER-PROGRAM.md` §7 is blunt that this is the sharper integrity
problem, and that it has already happened to us by accident. The video should
not imply the inputs are independently measured. The VO above deliberately says
the *formula* is published, never that the inputs are verified. If the final
cut wants to go further, the honest line is "producer declared, editorially
checked, and corrected by customer reviews," and that line cannot ship until
editorial verification and customer reviews actually exist.

---

### Scene 7. What a subscription includes (1:14 to 1:24)

**Shown.** Back to paper. A short divided list, four rows, each row a label in
Public Sans with a thin `#D8D7CB` rule between them. Not four cards in a grid;
`DESIGN.md` retired that pattern from the site itself for reading as generic.
Rows settle in at 60ms intervals.

**Voiceover.** "Listings against the originals you want to be found under. Your
own producer page, everything you make in one place. Per-listing click data,
broken out by the original that drove it. And the ability to reply to reviews
on your own products."

**On-screen text.** (the four rows)

> Listings against the originals that matter to you
> A producer page of your own
> Per listing, per reference click data
> The right to reply on your own listings

**Note.** Deliberately no prices, no tier names, no "starting at." Pricing is an
open founder decision (`PRODUCER-PROGRAM.md` §2, `MARKETPLACE-PLAN.md` §5) and
the tier table in §3 is labelled "illustrative, not priced." Do not let a
number get improvised into the edit. Section 6 covers this.

---

### Scene 8. Close (1:24 to 1:28)

**Shown.** The mist clears to plain paper. The DRYDOWN wordmark settles in,
Cormorant Garamond, all caps, tracked out, with the lockup subline beneath it:
"Independent Fragrance Comparisons." Then one green rule and the CTA line.

**Voiceover.** "DRYDOWN. Independent fragrance comparisons. If you make
something that holds up next to the original, there is a slot waiting for it."

**On-screen text.**

> There is a slot waiting for what you make.
>
> `[CTA DESTINATION TBD]`

**Note.** The CTA is genuinely unresolved. There is no signup page, no
submission form, and no deployed domain. See Section 6. Until one exists, the
closing card should carry a plain email address the founder actually monitors,
which is the only honest call to action available.

---

## 4. Why the integrity stance sells, expanded

Worth stating separately from the script, because whoever cuts this needs to
understand the argument well enough not to soften it.

The instinct with a paid marketplace is to bury the "you cannot buy rank" line
in a trust page and lead with benefits. That is backwards here, for a reason
specific to this audience:

**A producer who is good at their job wants a ranking they cannot buy.** If
rank were purchasable, the biggest budget takes the top slot on Baccarat Rouge
540 permanently, and every smaller house pays a subscription to sit
underneath them forever. The producers most likely to subscribe early are
exactly the ones who would lose that auction. An unbuyable ranking is the only
condition under which subscribing is rational for them.

**And the buyer side is what makes the placement worth anything at all.**
A directory that sells its top slot trains its readers, fast, to ignore the top
slot. The clicks keep arriving and stop converting. DRYDOWN's ranking is only
valuable to a producer for exactly as long as buyers believe it, and buyers
only believe it while it stays unbuyable. So the integrity stance is not
principle at the expense of revenue. It is the mechanism that keeps the
inventory worth selling.

**The structural version, which is the credible version.** Anyone can promise
independence. What DRYDOWN can show is that the promise is enforced by
construction and is publicly checkable:

- The formula lives in `lib/similarity.ts` and is published on `/about`.
- It takes no subscription input. There is no tier parameter to pass it.
- Ties break toward the cheaper price per ml (`lib/catalog.ts`).
- The house's own line is ranked by the identical formula, not floated.
- The tier table contains nothing that touches rank. The only paid advantage in
  it is priority in the approval queue, which affects how fast a submission is
  looked at, never where it lands.

That last bullet is the sharpest one for this audience, because it shows the
line was drawn deliberately, on the inside, where it costs us something.

**The honest limit, stated once so nobody oversells it.** Facet scores are
producer declared. §7 documents this failing on us already: our own No. 01
Ember ranked first against Baccarat Rouge 540 at 79%, twenty two points clear
of the field, purely because its note list had been written to sit almost on
top of the reference's. Nothing in the code favoured it. A producer whose
revenue depends on rank will do deliberately what we did by accident. The
defences (editorial verification, customer reviews as correction, flagging
divergence) are all recommendations in §7, not shipped features. So: sell the
published formula, sell the unbuyable rank, and do not sell verified inputs
until inputs are verified.

---

## 5. Production plan

### 5.1 Tooling actually available, checked not assumed

**`openart` MCP: genuinely available in this session, verified by a real tool
call, not by `claude mcp list`.** `mcp__openart__openart_account_get` returned
a live account: plan Plus, 11,704 credits. `mcp__openart__openart_model_list`
returned the full 17-model catalog. Both calls succeeded here, in this agent.

What that actually buys for this video, stated precisely, because the gap
between "an image generator is available" and "a product explainer can be
produced" is the whole problem:

**OpenArt can do:**

- Atmosphere B-roll, 5 to 8 second clips, if the edit wants texture behind the
  abstract scenes. There is direct precedent in this exact product: PixVerse V6
  text2video produced `home-hero-loop.mp4` and `chapter-try-it-loop.mp4` at
  720p, 6s, and both ship on the live homepage today (`DESIGN.md` addendum v2).
- Title and end cards with real, legible in-image text. Nano Banana Pro is the
  catalog's text specialist and would render a Cormorant Garamond style card
  more reliably than the other models.
- Mist and particle textures for the Atomizer transitions, as overlay plates.

**OpenArt cannot do, and this is the important part:**

- **It cannot show the product.** Asking a generative video model for "a
  fragrance comparison website with a radar chart" produces a plausible looking
  fake interface with invented labels and garbled text. For a consumer mood
  piece that is survivable. For a B2B video whose entire job is to make a
  skeptical partnerships lead believe this tool is real, a synthetic UI is
  worse than no video, because it is the exact thing that makes a viewer assume
  the product does not exist. Every product shot in Section 3 must be a real
  screen recording.
- **It cannot edit.** There is no timeline, no sequencing, no lower thirds, no
  subtitle burn-in, no audio mixing. It returns individual clips.
- **It cannot generate the narration.** No text-to-speech model in the catalog.
  The Seedance models accept an audio *element* to give an on-screen subject a
  voice, but that requires supplying an existing 2 to 30 second voice recording.
  It is a lip-sync feature, not a TTS service.
- **Clip length is short.** Most models generate 5 to 8 seconds per job.
  Seedance 2.5 reaches 30 seconds single-shot. An 88 second cut is an edit, not
  a generation.

**Real, current OpenArt pricing** (quoted with the account's actual discount
formula, `round(unitCredits x 0.9)`, not a mental ten percent):

| Job | Config | List | Actually charged |
|---|---|---|---|
| PixVerse V6 text2video | 540p, 5s, 16:9, no audio | 50 | 45 credits |
| PixVerse V6 text2video | 1080p, 8s, 16:9, no audio | 240 | 216 credits |
| Nano Banana Pro text2image | 1K, 1:1 | 40 | 36 credits |

Against 11,704 credits, generated B-roll is not the constraint on this video.
Everything else is.

**`chrome-devtools` MCP: not available in this session.** No
`mcp__chrome-devtools__*` tool is in this agent's tool set at all, which per
root `CLAUDE.md` is the reliable signal rather than a list command's output.
This matches the three consecutive DRYDOWN build passes that each recorded the
same absence (`README.md` honesty notes). Worth noting it would not have solved
this anyway: it screenshots, it does not record video.

**No shell access in this agent.** This subagent's tool set has no Bash. I
cannot start `npm run dev`, cannot drive a browser, and cannot capture a single
frame. The recording step is founder-side or `web-developer`-side work, not
something Advertising can execute from here.

**No video editor is configured anywhere in this repo.** No NLE, no ffmpeg
pipeline, no Remotion, no Playwright.

### 5.2 Raw material: screen recordings of the running site

The site runs locally today (`npm run dev`, `http://localhost:3000`) and that
is the best raw material available by a wide margin. Roughly 45 of the 88
seconds are real product footage.

**Capture spec:**

- 1920x1080 at 60fps minimum. 60fps matters: the Match Reveal, the brand pill's
  layout transition, and the canvas mist cursor all read badly at 30.
- Browser at 1440px viewport width or wider, so the Dupe Finder renders its
  two-pane desktop layout rather than the stacked mobile one.
- Browser chrome hidden entirely. Kiosk or full-screen presentation mode. See
  Section 6 on why the URL bar cannot appear.
- Light mode. Confirm the theme toggle before recording.
- **`prefers-reduced-motion` must be OFF on the capture machine.** This is the
  single most likely way to waste a recording session. With it on, the site
  renders `null` for the preloader (no wordmark, no counter, no mist
  dissolve), never mounts the custom cursor at all, and skips the Match Reveal
  straight to both polygons at final position. Scenes 1, 3, 4, and 5 would all
  come back dead and it would not be obvious why.
- Move the pointer deliberately and slowly. The mist trail is a real asset and
  a jittery pointer wastes it.

**Shot list to capture, in one session:**

1. A cold page load of `/`, for the preloader (Scene 1). Capture several takes;
   it is 1.35 seconds and the counter timing varies.
2. `/dupe-finder`: search field, Step 1 house pills, Step 2 dropdown held open
   long enough for "none listed yet" to read, selection resolving (Scene 3).
3. Ranked cards staggering in, top card clicked, full Match Reveal, two second
   hold, scroll through Composition / Wear / Value (Scene 4).
4. Scroll back to one result card, hover the "Check current price" button so
   the cursor emission intensifies. Do not click (Scene 5).
5. `/about#methodology`, slow scroll through the published formula (Scene 6).

**Two project-specific gotchas for whoever records this**, both already
documented in `README.md`: never run `npm run build` or `npm run start` in this
project directory while `npm run dev` is live (it corrupted `.next/` badly
enough to 404 every route last time), and note the affiliate buttons resolve to
`example.com/aff/...?tag=REPLACE_ME` placeholders, so nothing outbound should be
clicked on camera.

### 5.3 Assembling it, two options

**Option A, lowest cost, recommended to start.** Founder records the shot list
with OBS Studio (free), cuts it in DaVinci Resolve or CapCut (both free). The
abstract scenes (2, 6, 7, 8) are simple type on a flat paper background, which
either editor does natively with no generated assets at all. OpenArt
contributes nothing mandatory. Total cash cost: zero. Total credit cost: zero.
Realistic effort: a few hours, most of it on the type animation timing.

**Option B, if this needs to be reproducible.** `web-developer` builds it as
code: Playwright to drive the site through the scripted interactions and record
deterministic video, Remotion to compose type, transitions, and subtitles in
React using the site's own tokens and fonts imported directly. This is
genuinely attractive here, because the brand's type and motion system already
exist as CSS custom properties and easing tokens in this repo, so the video
would inherit the real design system instead of an editor's approximation of
it, and re-rendering after a UI change would be one command. Neither Playwright
nor Remotion is installed. This is a real build task, not an afternoon.

**Where OpenArt fits either way:** optional atmosphere plates behind Scenes 2,
6, and 8, and nothing else. Prompts should follow the same discipline as the
existing site assets (`DESIGN.md` §10): abstract, no recognizable bottle
silhouette, no branded packaging, no readable label. The two existing homepage
loops (amber liquid swirling; gold and green streams meeting without mixing)
are already on brand and already paid for, and reusing them costs nothing and
guarantees the video matches the site.

### 5.4 Distribution, and why there is no paid line item

This is B2B acquisition against a target list of maybe eight to fifteen named
companies. That is a direct outreach problem, not a media buying problem.

- **Primary:** `communication-strategist` drafts partnership outreach to each
  producer's partnerships or affiliate contact, with the video embedded or
  linked. One video, a handful of recipients, each worth a recurring
  subscription. See `departments/communication/CLAUDE.md`. No sending connector
  is configured, so those go out manually.
- **Secondary:** the video sits on a producer-program page on the site itself,
  once such a page exists and the site is deployed.
- **Paid spend: no.** Per this department's cost discipline and
  `departments/sales/CLAUDE.md`, DRYDOWN has zero revenue and no budget. Paid
  promotion would also be the wrong instrument even with money available, since
  the entire addressable audience is a list you could write on a napkin. Reach
  them by name.

---

## 6. What is blocked, and why

Ordered by how much each one constrains the video specifically.

**1. No deployed site, so nothing on screen can show a URL.** `NEXT_PUBLIC_SITE_URL`
still falls back to `https://example-placeholder.com`, and there is no host and
no domain (`README.md`). Recording happens against `localhost:3000`, so the
browser chrome must be hidden for the whole runtime. A frame that shows
`localhost` in a video whose job is convincing a company this platform is real
would undo the video. Full-screen presentation mode throughout is a hard
requirement, not a preference.

**2. Pricing is undecided, so no tier can be named.** `PRODUCER-PROGRAM.md` §2
presents three live options (commission-only first, free tier plus paid
upgrade, subscription instead of commission) with a recommendation but an
explicit note that it is a founder decision. §3's tier table is labelled
"illustrative, not priced." The script therefore names capabilities and never a
number, a tier name, or a "free to start." **If the founder settles §2 before
the shoot, Scene 7 gets materially stronger**, because "list your first two
products free and see the click data before you pay us anything" is a far
better close than a feature list. Until then, do not improvise it into the
edit.

**3. Half of what the video promises is not built.** The producer page, the
click analytics, the review reply capability, and the submission flow are all
designed and none are shipped. `PRODUCER-PROGRAM.md` §8 lists nine blockers:
no Postgres, no Auth.js accounts, no payment processor, no submission form, no
approval queue, and critically no click logging (the "TODO once a real program
exists: log the click event here" comment is still sitting in
`app/go/[slug]/route.ts`). Scene 7 therefore has to be spoken and typeset,
never demonstrated. Two consequences: first, capping Scene 7 at ten seconds of
type is the honest treatment, and second, **this video should not be sent to a
real producer until a producer who says yes has something to sign up for.**
Generating demand you cannot service burns the exact eight relationships this
is aimed at, and there are only eight.

**4. No voiceover, and no way to make one here.** No talent, no TTS tool, no
recording setup. OpenArt has no text-to-speech model. Options, cheapest first:
founder records it himself into a phone (fine for B2B, arguably better, an
actual person speaking reads as less produced and more credible in a
partnerships email); ship it fully silent with type carrying every claim, which
this script is already written to survive since subtitles are mandatory anyway;
or pay for a TTS or voice service, which is a new subscription and therefore a
founder decision with a ledger row attached.

**5. No CTA destination.** Nothing to link to. No producer signup route, no
partnerships page, no domain. The close currently ends on a placeholder. A
monitored email address is the minimum viable answer.

**6. Fixture data cannot be shown as if it were real.** `lib/producers.ts` and
`lib/dupes-data.ts` carry real, currently operating companies (Dossier, ALT.
Fragrances, Divain and the rest) alongside product names, prices, and facet
scores that `README.md` states plainly are "illustrative constructions for this
build, not confirmed against live catalogs." Sending a video to Dossier that
shows a Dossier product with a price we invented and a facet profile we made up
is a bad first contact, and arguably a misrepresentation of their product.
**Mitigation:** record Scene 5's held card against DRYDOWN's own house listing
(Drydown Atelier) or a deliberately generic placeholder. Reference originals
are fine to show by name throughout; that is ordinary nominative use and every
competitor in the category does it.

**7. No editor and no audio assets configured.** Section 5.3 names two paths.
Neither exists in this repo today. Any licensed music is a cost and a ledger
row; the alternative is no music, which suits an austere type-led piece and is
what this brief assumes.

**8. Not verified in a browser, at all.** Every description of the site's
appearance and motion in Section 3 is read from source (`reference-picker.tsx`,
`similarity.ts`, `catalog.ts`) and from `DESIGN.md`, not watched running. Three
consecutive DRYDOWN build passes recorded the same `chrome-devtools` gap and
flagged the same unknowns: whether the Match Reveal's timing actually reads
well, whether the mist cursor's density feels right, whether the radar chart's
gold holds up visually. Those unknowns land directly on this video, because
they are its main subject. The first recording session is also the first time
anyone will have seen these animations move. **Budget for the possibility that
something looks wrong on camera and needs a UI fix before the shoot, rather
than assuming the footage will be usable on the first take.**

---

## 7. Honest summary of what this is

A brief and a finished 88 second script. Not a video. Nothing has been
generated, recorded, edited, voiced, or posted, and no OpenArt job was
submitted for this campaign.

**To move from here to a finished cut, in order:**

1. Founder settles the revenue model (`PRODUCER-PROGRAM.md` §2), so Scene 7 and
   the close can be written to their strongest form.
2. Someone with shell access records the Section 5.2 shot list against the
   local dev server, with reduced-motion off.
3. Founder or `web-developer` assembles it via Option A or Option B.
4. Voiceover recorded, or the piece ships silent with subtitles.
5. Hold distribution until there is a real destination for a producer who says
   yes.
