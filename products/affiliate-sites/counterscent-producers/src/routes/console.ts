import { html, type Html } from "../lib/html";
import { page } from "../lib/http";
import { CATALOGUE, layout } from "../ui/layout";
import {
  button,
  card,
  deadButton,
  disclosure,
  disclosureGroup,
  emptyState,
  identityBar,
  linkButton,
  listingStateFor,
  listingStates,
  listingThumb,
  notShipped,
  section,
  stateBadge,
  tableBlock,
  type ListingState,
  type TableRow,
} from "../ui/components";
import { NEVER_INCLUDED, PLANS } from "../generated/plans";
import type { Env } from "../lib/env";
import { db } from "../lib/db";
import { getAuthContext, type AuthUser } from "../lib/auth";
import { isAdminEmail } from "../lib/admin";
import {
  countsAgainstAllowance,
  enforcedAllowance,
  loadProducerConsole,
  planFor,
  mayWithdrawSelf,
  quotaGate,
  type ListingRow,
  type ProducerConsoleData,
} from "../lib/producer";

/**
 * "/console" - the producer's own screen, wired to the session on 2026-09-16.
 *
 * ============================================================================
 * THREE DOCUMENTS, NOT ONE DOCUMENT WITH A SWAPPED ACCOUNT CARD.
 * ============================================================================
 *
 * The obvious build is one page with a strip at the top that changes. It is
 * wrong for the same reason notShipped() requires a reason: a visitor and an
 * attached producer arrive with different first questions, and sharing
 * everything below the strip means a signed-out visitor leads with an empty
 * listing table belonging to an account that does not exist.
 *
 *   (a) SIGNED OUT. Doubles as this programme's only sales page, because the
 *       origin is noindex and reached from an email or a link. It sells, it
 *       offers the two real ways in, and it carries NO listing table and NO
 *       disabled action buttons. A disabled "Submit a fragrance" shown to
 *       someone with no account is a dead end no reason string rescues.
 *
 *   (b) SIGNED IN, NO PRODUCER ATTACHED. **This is the common case, not an
 *       edge case.** findOrCreateUser() never creates a Producer row, so every
 *       real account is in this state at the moment it is created. A design
 *       that treats it as an error would be showing an error to every producer
 *       who ever signs in. It is a waypoint and it reads as one: no error
 *       colour, no empty table.
 *
 *       IT IS NOW ONE STEP RATHER THAN A WAIT. Until 2026-09-19 this screen
 *       said a person would attach the account by hand, and no code path
 *       existed to do it - so the state was permanent for everyone. It now
 *       carries a single primary action to /console/company.
 *
 *   (c) SIGNED IN AND ATTACHED. The workspace. Nobody is in it today; zero
 *       producers exist.
 *
 * What stays identical across all three: the shell, the status and standfirst
 * slots, the band rhythm, the state vocabulary. That is enough continuity, and
 * moving from (b) to (c) should feel like the page filling in rather than
 * changing identity. The four channels that tell them apart are layered on
 * purpose, so no single one carries it: the status pill (outline against
 * solid), the h1, the shape of the first block, and whether a table is there
 * at all. Not colour alone, no second accent, no per-state theme.
 *
 * WHAT THIS PAGE STILL CANNOT DO, and says so at every point of use: submit,
 * edit, withdraw, or take a payment. There is no submit form, no queue, no
 * billing and no Subscribe button anywhere on this origin.
 */
export async function producerConsole(request: Request, env: Env): Promise<Response> {
  const auth = await getAuthContext(request, env);

  if (!auth) return page(signedOut());

  if (!auth.producerId) {
    // allowForms, for the sign-out <form>. Granted per page rather than
    // origin-wide (src/lib/http.ts), so the grant tracks what the page
    // actually contains.
    return page(noProducerAttached(auth, isAdminEmail(auth.email, env)), 200, {
      allowForms: true,
    });
  }

  const sql = db(env);
  let data: ProducerConsoleData | null = null;
  try {
    // `sql` cannot be null here in practice - getAuthContext() returns null
    // without a database - but the type admits it and a thrown TypeError would
    // render as a blank 500 to the one person able to report it.
    if (!sql) throw new Error("no database connection");
    data = await loadProducerConsole(sql, auth.producerId);
  } catch {
    return page(listingsUnreadable(auth), 503, { allowForms: true });
  }

  if (!data) return page(producerRecordMissing(auth), 200, { allowForms: true });

  // A WITHDRAWAL THAT SAYS NOTHING IS A SILENT SUCCESS. POST /console/withdraw
  // redirects here with the slug it withdrew, and without this the producer
  // performs an act they cannot undo and is returned to a page that looks
  // exactly as it did before. The slug is read back out of their OWN listings
  // rather than trusted from the query string, so a crafted URL cannot make
  // this page assert that something was withdrawn when nothing was.
  const withdrewSlug = new URL(request.url).searchParams.get("withdrew");
  const withdrew =
    withdrewSlug && data.listings.find((l) => l.slug === withdrewSlug && !countsAgainstAllowance(l.publishState))
      ? data.listings.find((l) => l.slug === withdrewSlug) ?? null
      : null;

  return page(attached(auth, data, withdrew, isAdminEmail(auth.email, env)), 200, {
    allowForms: true,
  });
}

/* ======================================================================== *
 * (a) Signed out
 * ======================================================================== */

/**
 * "Before you write to us", the closing section of the signed-out console.
 *
 * THE TWO CAPS USED TO BE SPELLED OUT IN IT and the founder cut them on
 * 2026-09-18. The sentence read "...published in full, including the cap that
 * stops any producer-declared listing reaching 90 per cent and the ceiling that
 * stops anything at all publishing above 95." Both numbers are real and both
 * are published - but reciting them on the way to a "write to us" link
 * front-loads a stranger with two limits before they have any idea what the
 * scale means or what it is computed from. The link says the formula is
 * published in full; a producer who cares reads it there, next to the working.
 * The same sentence on the signed-out overview never carried them, so this also
 * settles a difference between two pages saying the same thing.
 */
function signedOut(): Html {
  const body = html`
    ${
      // ONE WAY IN, AND IT USED TO BE TWO. This section read "Two ways in, and
      // there are only two" - a sign-in link for people who had an account, and
      // an email address for people who did not, under a lede insisting "there
      // is no signup form on this origin. That is a decision, not a missing
      // page." The decision was real and the reasoning was good. It was also
      // describing a door that opened onto nothing: no code path could create a
      // producer, so the email was the only route and nobody had ever walked
      // it. /console/company opened that door on 2026-09-19, so the honest
      // shape of this section is now one path with three steps, and the email
      // is what it always should have been - the way to reach a person, not the
      // way to get an account.
      section({
        heading: "How to list a fragrance here",
        lede: html`Three steps. The first two are yours and take a few minutes; the third is
          ours and is a person reading what you wrote.`,
        body: html`
          <ol class="plain-list">
            <li>
              <strong>Sign in.</strong> We email you a link that works once, for fifteen
              minutes. No password to lose, or to be stolen from us.
            </li>
            <li><strong>Name your company.</strong> One field. Nothing is billed.</li>
            <li>
              <strong>Submit a fragrance</strong> against an original we have researched. It
              joins the review queue, and nothing reaches
              <a href="${CATALOGUE}">counterscent.com</a> until a person approves it.
            </li>
          </ol>
          <p class="door-action">
            <a class="btn btn-primary" href="/sign-in">Request a sign-in link</a>
          </p>
          <p class="muted">
            The free tier covers one listing, with no card and no trial clock. Questions before
            you start go to
            <a href="mailto:contact@counterscent.com">contact@counterscent.com</a>, where a
            person answers them.
          </p>
        `,
      })
    }

    ${
      // THE "WHAT NO PLAN BUYS" HALF OF THIS SECTION WAS DELETED ON 2026-09-18,
      // and it is the one deletion in this pass that is not progressive
      // disclosure. Everything else long and honest on this origin was folded
      // into a <details>; this was cut, because it was not long and honest, it
      // was the same three claims printed twice on one screen.
      //
      // Measured rather than felt. Its first bullet restated NEVER_INCLUDED
      // rows 1 to 3, which planTable() renders forty lines below spanning the
      // tier columns - and carried the import-graph sentence VERBATIM, the
      // same words in the same order, twice in one document. Its second
      // restated the table's own "Commission we take on your sales" row, which
      // answers the question in the column a producer actually scans. Its
      // third ("nothing is approved automatically") is said again in
      // neverDoBand() further down the same page, under "Publish anything by
      // itself".
      //
      // The surviving copy is the better one in every case, and deliberately
      // so: a promise rendered as a row spanning every tier column cannot be
      // read as applying to only one of them, which is the whole argument
      // CONSOLE-PLAN 2.4 made for a table over three cards. A bulleted
      // paragraph above it is that same promise in a weaker form, and two
      // copies of a promise is how one of them ends up edited alone.
      section({
        heading: "What a listing buys",
        lede: html`The question this audience arrives with, answered above the plans rather
          than underneath them. What no tier buys is in the table itself, on the row that
          spans every column.`,
        body: html`
          <ul class="plain-list">
            <li>
              A place in a ranked comparison against an original we have already
              researched, with a match score computed by a published formula rather than
              negotiated.
            </li>
            <li>
              A page that says what is genuinely different about your fragrance, in your
              words, beside what we say about it in ours.
            </li>
            <li>
              A link a reader can check your claims against: your own product page, with
              the price we last verified and the date we verified it.
            </li>
          </ul>
        `,
      })
    }

    ${section({
      heading: "The plans",
      // THE OLD LEDE SAID THE COSTS WERE NOT PRINTED HERE. They have been since
      // 2026-09-16, when the founder overruled CONSOLE-PLAN 2.4 and the figures
      // started being generated from the catalogue's own plans.ts rather than
      // typed. The sentence describing their absence outlived them by two days,
      // directly above a table with a cost row in it.
      lede: html`What each tier covers and what it costs. The figures are generated from
        the same file the public pricing page reads, and they are indicative rather than
        an offer.`,
      body: html`
        <div class="stack">
          ${planTable()}
          ${notShipped({
            what: "Nothing on this screen can be paid for",
            reason: html`There is no checkout on this origin, no payment provider
              connected to it, and no way for anyone to take money from you today.`,
          })}
          ${
            // THE THREE NESTED REASONS CAME OUT OF THE NOTICE ABOVE, where they
            // ran to a paragraph a reader had to finish before reaching the one
            // sentence that mattered. One of them had also become false: it said
            // who may withdraw without paying was "a contradiction between our
            // own plan list and our producer terms that we have not settled",
            // and the founder settled it on 2026-09-18, in the same change that
            // put a "Withdraw a listing yourself" row into the table directly
            // above this notice. The page was describing a contradiction it had
            // already resolved, forty lines under the resolution.
            disclosure({
              summary: "Why no provider is connected, and what the table leaves out",
              body: html`
                <p>
                  Which provider it will eventually be is genuinely open. The usual ones
                  do not serve a Turkey-based business, so the shortlist is short and the
                  question has not been answered.
                </p>
                <p>
                  Three capabilities our plan list mentions are missing from the table
                  above, and they are missing for one reason rather than three: click
                  reporting, conversion reporting and edit requests are not built for
                  anyone, at any tier. We would rather leave a row out than print a
                  capability nobody has as a fact about a tier.
                </p>
              `,
            })
          }
          <p>
            The one thing that moves any of this is an email:
            <a href="mailto:contact@counterscent.com">contact@counterscent.com</a>. Tell
            us how many fragrances you would list and which originals they go against.
            We would rather price this against real catalogues than against a guess.
          </p>
        </div>
      `,
    })}

    ${section({
      heading: "Approved and live are different states",
      lede: html`The distinction the whole console is organised around, and the reason
        the database carries two state columns rather than one.`,
      body: html`
        <div class="stack">
          <div class="gap-callout">
            <p><span class="pill state state-approved">Approved, not yet live</span></p>
            <p class="gap-step">then the next site build</p>
            <p><span class="pill state state-live">Live</span></p>
            <p class="muted">
              Approval is a decision recorded in a database. Publication is a build that
              writes the listing into the catalogue's own files.
            </p>
          </div>
          <div>
            <h3>The eight states a listing can be in</h3>
            <p class="muted">
              Named as the database names them, so what you read, what an editor reads,
              and what is stored are the same eight words.
            </p>
            ${listingStates({ detail: "specimen" })}
            <p class="muted">
              Each one is explained in full on <a href="/">the overview</a>.
            </p>
          </div>
        </div>
      `,
    })}

    ${neverDoBand()}

    ${section({
      heading: "Before you write to us",
      body: html`
        <p>
          The part most likely to decide whether this is a fit is
          <a href="${CATALOGUE}/about#methodology">how we score</a>, not the price. It is
          published in full.
        </p>
        <p>
          Then:
          <a href="mailto:contact@counterscent.com">contact@counterscent.com</a>.
        </p>
      `,
    })}
  `;

  return layout({
    title: "Producer console",
    heading: "Listing on Counterscent",
    status: {
      label: "Sign-in required",
      // Not "Signed out", which implies a session that ended. Most readers of
      // this page have never had one.
      tone: "outline",
      note: html`This screen is the same for everyone who is not signed in. Nothing below
        is personalised and nothing is hidden from you.`,
    },
    standfirst: html`What listing a fragrance here involves and what each tier covers. You can
      set an account up yourself in a few minutes; what a person decides is whether a listing
      publishes, not whether you get an account.`,
    body,
  });
}

/* ======================================================================== *
 * (b) Signed in, no producer attached
 * ======================================================================== */

/**
 * THIS PAGE CARRIES A NAV ONLY FOR AN ADMINISTRATOR, and the asymmetry is the
 * point rather than an oversight.
 *
 * For a producer it still renders bare. Every producer item leads somewhere
 * that would immediately refuse them for the reason this page is already
 * explaining, so a nav here would be four ways to be told the same thing
 * twice.
 *
 * For an admin it is the opposite. Administrative access does not depend on a
 * Producer row at all - it is an address on a deployment secret - so an
 * administrator in this state is not waiting on anything, they are simply
 * someone whose inbox has never been attached to a company. Every account on
 * production is in exactly this state today, including the founder's, which
 * means without this the admin group was unreachable from /console for the
 * only person who has it: the nav fix one commit earlier lives on the attached
 * path and never ran. Found by checking the live database rather than by
 * reading the code, after the deploy and before the founder hit it.
 */
/**
 * Signed in, no company record yet.
 *
 * REWRITTEN 2026-09-19, FROM A WAITING ROOM INTO A STEP. This screen used to
 * run to four sections explaining that a person would attach the account by
 * hand, that there was no queue and no timeframe, and that "nobody can create
 * a producer here by filling in a form". All of that was accurate and all of
 * it was a dead end: nothing in the Worker could create a Producer row, so
 * every account ever created sat here permanently, the founder's included.
 *
 * It is now one sentence and one button. The reasoning the old copy gave for
 * the manual step has not been thrown away - it moved to where the check
 * already happens, which is the listing queue. See routes/company.ts.
 */
function noProducerAttached(auth: AuthUser, isAdmin = false): Html {
  return layout({
    title: "Producer console",
    heading: "One step first: your company",
    // Rendered for an admin, omitted for a producer: the nav's two producer
    // items both lead back to this same screen until a company exists, and a
    // bar of links that bounce you is worse than no bar.
    nav: isAdmin ? { current: "listings", showAdmin: true } : undefined,
    // BUT THIS READER IS SIGNED IN, nav or no nav, so the lockup must take
    // them to their console rather than out to the signed-out explainer.
    // This is the case that stops `signedIn` being derivable from `nav`.
    signedIn: true,
    // AND NO BACK-LINK, because this screen IS /console and the back-link
    // defaults on wherever there is no nav - which would render a link to the
    // page you are standing on. There is genuinely nowhere back to from here:
    // that is what makes this a step rather than a waiting room.
    showBackLink: false,
    status: {
      label: "Almost there",
      tone: "outline",
      note: html`Nothing is billed, and this takes a minute.`,
    },
    standfirst: html`A listing belongs to a company rather than to an inbox, and this account
      does not have one yet.`,
    body: html`
      <p>${linkButton("/console/company", "Set up your company")}</p>
      <p class="muted">
        Signed in as <span class="wrap-anywhere">${auth.email}</span>. The free tier covers
        one listing, with no card and no trial clock; what the paid tiers add is on
        <a href="${CATALOGUE}/producers/pricing">plans and pricing</a>. Everything you submit
        is read by a person before it reaches the catalogue, whichever tier you are on.
        You can also change <a href="/console/accounts">how you sign in</a>.
      </p>
      <form method="post" action="/sign-out" class="actions">
        ${button("Sign out", { variant: "ghost" })}
      </form>
    `,
  });
}

/* ======================================================================== *
 * (c) Signed in and attached
 * ======================================================================== */

function attached(
  auth: AuthUser,
  data: ProducerConsoleData,
  withdrew: ListingRow | null = null,
  isAdmin = false,
): Html {
  const { producer, listings, inUse } = data;
  const hasListings = listings.length > 0;

  // THIS SCREEN AND /console/submit MUST AGREE ABOUT BEING FULL, so both ask
  // quotaGate rather than each deciding for themselves. They did not, and it
  // showed: a producer with no Subscription row is enforced at the free
  // allowance of one, but the old test here was `typeof allowance === "number"`,
  // which is false when tier is null - so this page said there was nothing to be
  // full of while the form said "1 of 1". That is every producer's state at
  // launch, not an edge case, because there are zero Subscription rows.
  const verdict = quotaGate({ tier: producer.tier, inUse, uncapped: isAdmin });
  const atAllowance = verdict.kind === "at-allowance";

  const body = html`
    ${
      // role="status" rather than role="alert": this is a completed action
      // being reported, not a problem interrupting one. tabindex="-1" plus
      // autofocus moves a keyboard reader here on arrival, which is the only
      // way to do it on an origin with no client JavaScript.
      withdrew
        ? html`<div class="notice-done" role="status" tabindex="-1" autofocus>
            <p class="notice-done-title">
              Withdrawn: ${withdrew.brand} ${withdrew.name}
            </p>
            <p class="field-hint">
              It is no longer published and <code>/go/${withdrew.slug}</code> stops resolving at
              our next build. The record and its click history are kept, and the slot it was
              using is free again.
            </p>
          </div>`
        : ""
    }
    ${section({
      heading: "Account",
      body: html`
        ${identityBar({
            // PLAN AND LISTINGS ARE NOT IN THIS LIST ANY MORE. They moved into
            // the aside panel on 2026-09-18, because four facts pinned to the
            // left of a wide card left a third of the strip empty and the two
            // that a producer actually scans for were the two being squeezed.
            // Repeating them on both sides would have been the easy version
            // and the wrong one: the same fact rendered twice is a fact that
            // can disagree with itself.
            facts: [
              { label: "Producer", value: html`${producer.name}` },
              { label: "Signed in as", value: html`<span class="wrap-anywhere">${auth.email}</span>` },
              // THE LINK LIVES HERE RATHER THAN IN THE NAV. The nav carries
              // repeated task items and already ran out of room at 1440px
              // once, which is how one label had to be shortened on
              // 2026-09-18. A page visited twice in an account's lifetime
              // belongs beside the address it is about, which is where a
              // reader looks when the question is about their account rather
              // than their listings. The value is a link rather than a list of
              // connected providers on purpose: rendering that here would mean
              // a second query for a fact the destination page already states,
              // and two places that can disagree about it.
              { label: "Sign-in", value: html`<a href="/console/accounts">How you sign in</a>` },
            ],
            aside: isAdmin ? adminPanel(inUse) : planPanel(producer, inUse),
            action: html`<form method="post" action="/sign-out" class="actions">
              ${button("Sign out", { variant: "ghost" })}
            </form>`,
        })}
      `,
    })}

    ${section({
      heading: "Everything you have submitted",
      lede: html`One row per fragrance, whatever state it is in.`,
      body: html`
        <div class="stack">
          <div>
            ${tableBlock({
              label: "Your listings",
              columns: ["Your fragrance", "Compared against", "Match", "State", "Last change", "Action"],
              rows: listingRows(listings),
              empty: emptyState({
                headline: "You have not submitted anything yet",
                because: html`Nothing has been submitted against this producer record yet.
                  <a href="/console/submit">Submit a fragrance</a> when you are ready. It goes
                  to a person to read, not straight onto the site.`,
              }),
            })}
          </div>

          <div class="actions">
            ${
              // AT THE ALLOWANCE, THE LINK IS NOT RENDERED AS A LINK. Sending a
              // producer to a form that will refuse them is a worse answer than
              // saying so here - and the submit route re-checks the quota anyway,
              // because enforcement that lives in a page is enforcement the server
              // does not do.
              atAllowance
                ? deadButton("Submit a fragrance", {
                    reason: html`You are using every listing your tier allows. Withdraw one
                      from the table above and its slot comes back, or move up a tier.`,
                  })
                : html`<a class="btn btn-primary" href="/console/submit">Submit a fragrance</a>`
            }
            ${deadButton("Request an edit", {
              variant: "ghost",
              reason: hasListings
                ? html`Not built yet. An edit request goes to the same person who reads a
                    submission, and until that route exists, write to us instead.`
                : html`Nothing to act on. An edit request is made against one published
                    listing and you have none.`,
            })}
          </div>
          ${
            // WITHDRAW IS DELIBERATELY NOT HERE. It acts on one listing, so it
            // lives in that listing's row: a page-level withdraw would have to ask
            // "which one", and the answer would be a <select> that should not exist.
            ""
          }
        </div>
      `,
    })}

    ${verdict.kind === "at-allowance" ? exhaustedAllowance(verdict.allowance, producer.tier) : ""}

    ${
      // ============================================================================
      // THE WORKSPACE'S STANDING PROSE, FOLDED AWAY. 2026-09-18.
      // ============================================================================
      //
      // Founder: these pages are "too much crowded". This band is where that was
      // most true and most expensive. Below the listings table sat three blocks
      // of permanent explanation - a four-item column glossary, a two-card band
      // on what this screen will never do, and a paragraph about photograph
      // upload - roughly a screen and a half of prose under a table, with
      // nothing actionable anywhere in it. A producer signing in to check one
      // listing scrolled past all of it, every time, forever.
      //
      // NOT DELETED. Every word is still true and two of the three are things we
      // want a producer to be able to find. The test applied was whether a
      // RETURNING reader would act differently for having read it again, and all
      // three fail it while remaining worth keeping: they are looked up, not
      // read. That is the definition of reference material and <details> is what
      // reference material goes in.
      //
      // THE PHOTOGRAPH GAP IS THE INTERESTING ONE, because collapsing it looks
      // like exactly the thing this repo's point-of-use rule forbids. It is
      // allowed HERE and would not be allowed on /console/submit, and the
      // difference is where the reader is standing: this screen shows listings
      // that already exist, the form is where somebody is about to create one
      // believing it can be published. The same words stay expanded and
      // unmissable there. Moving a disclosure away from the point of use is the
      // violation; folding a second copy of it on a screen that is not the point
      // of use is housekeeping.
      section({
        heading: "Reference",
        lede: html`Worth being able to look up, not worth reading twice.`,
        body: disclosureGroup([
          {
            summary: "What each column in the table means",
            body: html`
              <ul class="plain-list">
                <li>
                  <strong>Compared against</strong> is an original already in our
                  catalogue. You choose it; you cannot add one. The comparison runs
                  against a note pyramid we researched, so a fragrance we have not written
                  up yet cannot be scored against, and we do not commit to a date for
                  researching one.
                </li>
                <li>
                  <strong>Match</strong> is computed, not negotiated. It is capped at 90
                  per cent while a listing is producer-declared and at 95 once we have
                  verified it independently; nothing publishes above 95. This console does
                  not hold a copy of the figure: it is computed by the catalogue's own
                  build, so the number on your public listing is the only one there is.
                  The one score stored here is the score a listing had at the moment it
                  came down, frozen.
                </li>
                <li>
                  <strong>State</strong> is the pair of database columns, shown as one
                  label per row. The one to read carefully is ${stateBadge("approved")},
                  which means we have said yes and the catalogue has not been rebuilt yet.
                </li>
                <li>
                  <strong>Last change</strong> is read from an append-only event log, not
                  from a timestamp somebody can overwrite. Every state change is
                  attributed to a person, to us, or to an automated check, so months later
                  it is still possible to say who moved a listing and when.
                </li>
              </ul>
            `,
          },
          {
            summary: "The two things this screen will never do",
            body: html`
              <ul class="plain-list">
                <li>
                  <strong>Let you write your own scores.</strong> The six profile numbers
                  are derived by us from your declared notes and concentration. They were
                  once six sliders on a form and were taken out on purpose: our
                  copy-detection check compares your notes against those numbers, and
                  handing the same party both inputs defeats it by construction.
                </li>
                <li>
                  <strong>Publish anything by itself.</strong> No automated step may
                  approve a listing or make a claim on it stronger. Automation can flag,
                  weaken and take down; a person has to put something up. Even then,
                  publication waits for the next site build.
                </li>
              </ul>
            `,
          },
          {
            summary: "Photograph upload is not built",
            body: html`
              <p>
                A listing will require a product photograph and a statement that you hold
                the rights to it. That needs file storage, a rights declaration recorded
                against the image, and a path for getting the file into a static build.
                None of those exist, so the field is not on the form pretending to. Send
                the photograph to
                <a href="mailto:contact@counterscent.com">contact@counterscent.com</a>
                with the product name.
              </p>
              <p class="muted">
                The submit form says this too, where it cannot be missed. It is repeated
                here because it is the answer to "why has nothing of mine gone live", and
                that question is asked from this screen.
              </p>
            `,
          },
        ]),
      })
    }
  `;

  return layout({
    title: "Producer console",
    heading: "Your listings",
    // The main signed-in screen, so this is where the nav first appears.
    //
    // showAdmin IS PASSED FROM THE PRODUCER SIDE, and that is new on
    // 2026-09-18. It used to be set only by the three /admin routes, which
    // made the administrative group reachable only by typing the URL: from
    // /console there was no link to it at all, and once on an admin page
    // there was no way back into the console except the footer. That is the
    // same complaint the founder made about this origin earlier the same day,
    // in a smaller shape. It is a display flag and nothing else - what
    // protects those routes is requireAdmin() inside each one.
    nav: { current: "listings", showAdmin: isAdmin },
    status: {
      label: "Console live",
      // The one solid pill on the origin. Solid means published on a listing
      // badge and it means the same thing here: the surface in front of you is
      // real and reading your own data.
      tone: "solid",
      // Phase 1 copy said nothing here could be submitted, edited or withdrawn.
      // Two of those three shipped on 16 Sep and this line did not move with
      // them, so the page spent two days telling a producer they could not do
      // the thing the button above does. Say what is true per verb.
      note: html`Reading your producer record. Nothing here publishes to the catalogue.`,
    },
    standfirst: html`Everything ${producer.name} has submitted, what state each listing is
      in, and what can be done about it today.`,
    body,
  });
}

/**
 * The plan panel on the right of the account strip.
 *
 * FOUNDER INSTRUCTION 2026-09-18: the white strip was too wide, and the space
 * should carry the plan - which tier, how many listed, how many more they can
 * list. It answers the question a producer actually arrives with, and it takes
 * the Plan and Listings facts OUT of the left-hand list rather than repeating
 * them, which is what made the strip sparse in the first place.
 *
 * THE REMAINING COUNT READS enforcedAllowance(), THE SAME FUNCTION quotaGate
 * USES. "Can list 3 more" and a live Submit button are two renderings of one
 * fact, and a panel that computed its own subtraction would eventually offer
 * a slot the form refuses. There are four honest answers here and each gets
 * its own words, for the same reason quotaLine has four branches.
 *
 * NO Subscription ROW STILL SAYS SO. The heading reads the tier we enforce, so
 * a producer is not left staring at "No plan on file" with no idea what they
 * are allowed; the line underneath says the record does not exist. Both facts
 * fit, and dropping either one would either confuse them or overstate what we
 * hold.
 */
function planPanel(producer: ProducerConsoleData["producer"], inUse: number): Html {
  const plan = planFor(producer.tier);
  const allowance = enforcedAllowance(producer.tier);
  const noRecord = producer.tier === null;

  const heading = plan ? plan.name : noRecord ? "Free" : "Not recognised";

  // EXACTLY ONE NOTE, and which one is a priority order rather than a
  // preference. The first draft printed every caveat that applied, which ran
  // to three small-type lines and made the panel taller than the whole left
  // half of the strip - trading the founder's "too wide" for an equally odd
  // "too tall". A panel whose job is to answer two questions at a glance
  // cannot also be the place every rule is restated; the rules are on
  // /console/plan, which is one click away and linked from the bottom of it.
  let room: Html;
  let note: Html | null = null;

  if (allowance === "uncapped") {
    room = html`No cap on this plan`;
  } else if (allowance === "unknown") {
    room = html`Allowance not known here`;
    note = html`Your record says <code>${producer.tier ?? ""}</code>, which this console has
      no allowance for. We will not guess one.`;
  } else {
    const left = Math.max(0, allowance - inUse);
    room = left === 0 ? html`No room for another` : html`Can list ${String(left)} more`;
    if (left === 0)
      note = mayWithdrawSelf(producer.tier)
        ? html`Withdrawing one frees its slot, or move up a tier.`
        : html`Ask us to withdraw one and the slot frees, or move up a tier.`;
  }

  // The missing-record fact outranks the allowance notes: it is the only one
  // that says something about the account rather than about the count, and a
  // producer who does not know a record is absent cannot make sense of why
  // the number is what it is.
  if (noRecord) note = html`No subscription record exists yet. This is what we enforce.`;

  return html`<div class="summary-panel">
    <p class="summary-panel-label">Your plan</p>
    <p class="summary-panel-name">${heading}</p>
    <p class="summary-panel-count">
      <span class="summary-panel-listed"
        >${inUse === 1 ? "1 listed" : `${String(inUse)} listed`}</span
      >
      <span class="summary-panel-room">${room}</span>
    </p>
    ${note ? html`<p class="summary-panel-note">${note}</p>` : ""}
    <p class="summary-panel-link"><a href="/console/plan">See plans and move tier</a></p>
  </div>`;
}

/**
 * What stands where the plan panel stands, for an administrator.
 *
 * FOUNDER INSTRUCTION 2026-09-18: "as admin we shouldn't see your plan... but
 * as admin again we should have every ability. I can list my own fragrance
 * from here too." So this is not a smaller plan panel - it answers a different
 * question. A producer's panel answers "how much room is left"; an admin has
 * no room to run out of, so the only honest count is how many listings the
 * house currently holds.
 *
 * IT SAYS THE LISTING STILL ENTERS THE QUEUE, and that sentence is the point
 * of the panel rather than a disclaimer on it. Removing the cap removes a
 * commercial limit, not the editorial one: a submission made from here is
 * created PENDING exactly like anybody else's, because nothing on this origin
 * may publish without a person putting it up. If that sentence ever stops
 * being true, this panel is lying on the one screen where the house is
 * looking at its own work.
 */
function adminPanel(inUse: number): Html {
  return html`<div class="summary-panel">
    <p class="summary-panel-label">Your access</p>
    <p class="summary-panel-name">Administrator</p>
    <p class="summary-panel-count">
      <span class="summary-panel-listed"
        >${inUse === 1 ? "1 listed" : `${String(inUse)} listed`}</span
      >
      <span class="summary-panel-room">No listing cap</span>
    </p>
    <p class="summary-panel-note">
      Anything you submit still joins the queue and waits for a decision, the same as a
      producer's.
    </p>
    <p class="summary-panel-link"><a href="/admin">Open the admin panel</a></p>
  </div>`;
}

/**
 * How a stored tier is named to the producer who is on it.
 *
 * Three outcomes and they are deliberately distinct: no record at all, a
 * recognised plan (named as the rest of the origin names it), and a recorded
 * string this build has no plan for. The third prints the raw value, because
 * the only useful thing to do with an unrecognised tier is show the producer
 * exactly what we are storing so they can quote it back at us.
 */
function planLabel(tier: string | null): Html {
  if (tier === null) return html`No plan on file`;
  const plan = planFor(tier);
  return plan ? html`${plan.name}` : html`${tier} <span class="cell-sub">not recognised</span>`;
}

/** The listing table's body rows. */
function listingRows(listings: ListingRow[]): TableRow[] {
  return listings.map((l) => ({
    cells: [
      {
        rowHeader: true,
        // The thumbnail lives INSIDE the name cell rather than in a column of
        // its own. A seventh column would narrow every other one on a table
        // that already carries six, and the picture is an attribute of the
        // fragrance named beside it, not an independent fact about it.
        content: html`<span class="cell-with-thumb"
          >${listingThumb(l)}
          <span
            ><span class="cell-title">${l.name}</span>
            <span class="cell-sub">${l.brand}</span></span
          ></span
        >`,
      },
      { content: html`<span class="wrap-anywhere">${l.referenceSlug}</span>` },
      {
        content:
          l.scoreAtRemoval === null
            ? html`<span class="tag-off">Not held here</span>`
            : html`<span class="cell-title">${String(l.scoreAtRemoval)}%</span>
                <span class="cell-sub">frozen at removal</span>`,
      },
      { content: stateBadge(listingStateFor(l)) },
      {
        content: l.lastActionOn
          ? html`<span class="cell-title">${l.lastActionOn}</span>
              <span class="cell-sub">${l.lastAction ?? ""}</span>`
          : html`<span class="cell-sub">Nothing recorded yet</span>`,
      },
      {
        // A LINK, NOT A FORM BUTTON, because this cell only opens the
        // confirmation - the withdrawal itself is a POST from that page. A
        // one-click withdraw in a table row would be an irreversible act behind
        // a stray tap, and this one genuinely is irreversible from the console:
        // the unique constraint on (producerId, referenceSlug) means the
        // withdrawn row still holds the pairing.
        content: withdrawable(l)
          ? html`<a class="cell-action" href="/console/withdraw?id=${l.id}"
              >Withdraw<span class="visually-hidden"> ${l.brand} ${l.name}</span></a
            >`
          : html`<span class="cell-sub">Already withdrawn</span>`,
      },
    ],
  }));
}

/** The same rule countsAgainstAllowance() applies, asked the other way round.
 *  Kept here rather than imported so the table and the withdraw route cannot
 *  disagree about which listings offer the verb: both read publishState. */
function withdrawable(l: ListingRow): boolean {
  return l.publishState !== "WITHDRAWN_BY_PRODUCER" && l.publishState !== "REMOVED_BY_EDITOR";
}

/* ======================================================================== *
 * The exhausted-allowance screen
 * ======================================================================== *
 *
 * UNREACHABLE TODAY, AND BUILT ANYWAY. Nobody can submit anything, so no
 * allowance can be used, so this never renders. It is written now because it
 * is the single most likely place this product fakes success: it is the exact
 * moment a subscription flow wants a Subscribe button, and the button would do
 * nothing. Left to be written in a hurry beside a payment integration, it gets
 * one.
 *
 * It renders from the same count the quota line uses, so the screen and the
 * figure above it cannot disagree.
 */
function exhaustedAllowance(allowance: number, tier: string | null): Html {
  const lead =
    allowance === 1
      ? html`The free tier covers one listing and you have it.`
      : html`The plan on file covers ${String(allowance)} listings and all of them are in
          use.`;

  return section({
    heading: allowance === 1 ? "Your free listing is in use" : "This plan's listings are all in use",
    body: html`
      <div class="stack">
        ${notShipped({
          what: "A second listing needs a paid tier, and no paid tier can be bought here yet",
          reason: html`${lead} There is no checkout on this site, no payment provider
            connected to it, and no way for anyone to take money from you today. We are
            not showing you a Subscribe button that does nothing, because a button that
            cannot work is a slower way of saying this.`,
        })}
        <p>
          <strong>What actually moves this:</strong>
          <a href="/console/plan">your plan page</a> lists what each tier covers and what it
          will cost, and the action on each one writes to us with your company and the tier
          you want already filled in. A person reads it and moves you. That is the whole
          process today, and we cannot give you a date for the automated version.
        </p>
        <p class="muted">
          ${mayWithdrawSelf(tier)
            ? html`Withdrawing a listing frees its slot, and the control is in the listing's own
                row.`
            : html`Withdrawing frees a slot, but doing it yourself is a paid feature - on this
                plan, <a href="mailto:contact@counterscent.com">write to us</a> and a person
                takes it down.`}
          A withdrawn listing keeps its record and its click history; withdrawal is a change of
          state, never a deletion.
        </p>
      </div>
    `,
  });
}

/* ======================================================================== *
 * Shared bands
 * ======================================================================== */

/**
 * The plan comparison, as one table rather than three cards.
 *
 * NOT TASTE. The "no tier buys" rows render INSIDE the same table, spanning
 * the tier columns under a rule, which makes "no plan buys rank" a structural
 * fact of the table rather than a claim printed underneath it. Three cards
 * cannot do that, and the catalogue already owns the card version.
 *
 * THE FIGURES ARE HERE AND THEY ARE GENERATED. This comment used to say the
 * table carried no currency figures at all, on the argument that this project
 * has no import path to the catalogue's lib/plans.ts so any number typed here
 * would be a third hand-written copy that could drift with nothing able to
 * catch it. The founder overruled the conclusion on 2026-09-16 and upheld the
 * objection: the console shows real figures, and they come from
 * src/generated/plans.ts rather than from a typist. `npm run generate --check`
 * is what says the copy is stale. The comment then sat here asserting the
 * opposite of what the founder had decided for two days, which is its own
 * small lesson about a stated reason outliving the decision behind it.
 *
 * THE PRICES ARE STILL PLACEHOLDERS AT THE SOURCE, and the cost row says so
 * rather than leaving a reader to treat $9.99 as a commitment.
 *
 * There is still no monthly/yearly toggle: it is client state, there is no
 * JavaScript budget, and a toggle belongs at a point of purchase, which this
 * is not. Both figures print instead.
 */
/** One tier's cost cell: the free tier has no figure rather than a zero, and a
 *  paid tier prints both figures because there is no toggle to choose between
 *  them. */
function costCell(p: { priceMonthlyUsd: number | null; priceYearlyUsd: number | null }): Html {
  if (p.priceMonthlyUsd === null) return html`Nothing`;
  return html`$${money(p.priceMonthlyUsd)} a month${p.priceYearlyUsd === null
    ? ""
    : html`<span class="cell-sub">or $${money(p.priceYearlyUsd)} a year</span>`}`;
}

/**
 * An allowance as a comparison-table cell.
 *
 * "unknown" cannot occur here - every id in PLANS is one allowanceForTier has
 * a case for - but it is rendered rather than thrown away, because the whole
 * point of that third state is that it refuses to guess a number, and a table
 * that quietly printed a blank would be guessing by omission.
 */
function allowanceCell(a: ReturnType<typeof enforcedAllowance>): Html {
  if (a === "uncapped") return html`No cap`;
  if (a === "unknown") return html`Not known here`;
  return html`${String(a)}`;
}

/** Whole numbers stay whole, decimals get both places. See the fuller note on
 *  the twin of this in routes/plan.ts - two copies because this origin has no
 *  shared ui/money module and one function is not worth inventing one for. */
function money(v: number): string {
  return Number.isInteger(v) ? String(v) : v.toFixed(2);
}

function planTable(): Html {
  const cell = (content: Html) => ({ content });
  const label = (text: string) => ({ content: html`${text}`, rowHeader: true });

  // THE COLUMN HEADERS ARE GENERATED AND THE CELLS ARE HAND-ORDERED, so the two
  // only agree while PLANS stays in ladder order. Reordering or adding a tier in
  // lib/plans.ts would relabel the columns and leave every row's values under
  // the wrong heading: a producer would read the top tier's allowance as the
  // free tier's, and nothing about the page would look broken. Fail loudly
  // instead, at the one place that assumption lives.
  const EXPECTED_TIERS = ["free", "standard", "unlimited"];
  const actual = PLANS.map((p) => p.id);
  if (actual.length !== EXPECTED_TIERS.length || actual.some((id, i) => id !== EXPECTED_TIERS[i])) {
    throw new Error(
      `planTable(): rows are hand-ordered for [${EXPECTED_TIERS.join(", ")}] but PLANS is ` +
        `[${actual.join(", ")}]. Reorder the cells in this function to match, then update ` +
        `EXPECTED_TIERS. Do not just silence this.`,
    );
  }

  return tableBlock({
    label: "What each tier covers",
    // The first column header labels the ROW axis, not a value column, and it
    // has to be true of every row in it. "What you get" was, until the cost row
    // and the "no tier buys" row, which are the two rows most worth reading.
    // DERIVED, NOT TYPED. These read ["Item", "Free", "Standard", "Featured"]
    // as four hand-written strings, which made them a fourth copy of the tier
    // names in a project that generates its constants precisely so a copy
    // cannot drift. The 2026-09-18 rename of "Featured" to "Unlimited" would
    // have had to find this line by memory; now it cannot be missed, because
    // the header comes from the same generated PLANS the rest of the origin
    // reads. The row order below still assumes free, standard, top - which the
    // assertion under this call enforces rather than trusts.
    columns: ["Item", ...PLANS.map((p) => p.name)],
    rows: [
      // GENERATED, AND IT SHOULD HAVE BEEN FROM THE START. This row hand-typed
      // "1 / 25 / No cap" while the cost row directly below it and the column
      // headers directly above it were both read from PLANS - so it was the one
      // hand-typed cell in a table built to prove a copy cannot drift, and on
      // 2026-09-18 it drifted: Standard's allowance moved 25 -> 12 with the
      // price cut and this row went on telling every signed-out reader 25.
      //
      // It now reads enforcedAllowance(), which is the SAME function the quota
      // gate calls, so the number a stranger is shown and the number the form
      // enforces are one value rather than two that agree by habit.
      {
        cells: [
          label("Listings included"),
          ...PLANS.map((p) => cell(allowanceCell(enforcedAllowance(p.id)))),
        ],
      },
      // THREE IDENTICAL CELLS, KEPT AS A ROW ON PURPOSE. Free read "A share of
      // a sale, through an affiliate network" until the founder removed
      // commission from the free tier on 2026-09-18. The row could now be a
      // sentence, but a producer comparing tiers scans this column for exactly
      // this question, and "None / None / None" answers it in the place they
      // look. A row that is the same across every tier is also the strongest
      // kind to leave standing: it cannot be read as an upsell.
      {
        cells: [
          label("Commission we take on your sales"),
          cell(html`None`),
          cell(html`None`),
          cell(html`None`),
        ],
      },
      {
        cells: [
          label("Reviewed by a person"),
          cell(html`Always`),
          cell(html`Always`),
          cell(html`Always`),
        ],
      },
      // ADDED 2026-09-18, when self-serve withdrawal became a real tier
      // difference rather than a line on a pricing page nothing enforced. The
      // free cell says what actually happens instead of just "No": a free
      // producer is not stuck, they ask us, and the one place they would
      // otherwise discover that is by pressing a button that refuses.
      {
        cells: [
          label("Withdraw a listing yourself"),
          cell(html`Ask us and we do it`),
          cell(html`Yes, any time`),
          cell(html`Yes, any time`),
        ],
      },
      {
        cells: [
          label("Priority in the review queue"),
          cell(html`No`),
          cell(html`No`),
          cell(html`Yes`),
        ],
      },
      // GENERATED CELLS, for the same reason the column headers are. Typing
      // "$9.99" here would recreate exactly the hand-copied figure the old
      // version of this function refused to carry, one tier to the left of
      // where the headers now come from.
      {
        cells: [
          label("What it costs"),
          ...PLANS.map((p) => cell(costCell(p))),
        ],
      },
      {
        cells: [
          label("What that price is"),
          {
            colSpan: 3,
            content: html`<span class="table-span"
              >Indicative, not final, and nothing here can take a payment: no checkout, no
              card form, no payment provider connected to this site. The figures are
              published so you can decide whether this is worth your time. They also appear
              on <a href="${CATALOGUE}/producers/pricing">plans and pricing</a>, and the two
              cannot disagree because both are generated from one file.</span
            >`,
          },
        ],
      },
      // THE LIST IS THE GENERATED NEVER_INCLUDED, not four typed lines. It was
      // typed here, which made it a fifth copy of a promise whose whole value
      // is that it says the same thing everywhere it appears - and the copy
      // most likely to be edited in isolation, because it reads as body text
      // rather than as a constant.
      {
        rule: true,
        cells: [
          label("No tier buys, at any price"),
          {
            colSpan: 3,
            content: html`<div class="table-span">
              <ul class="plain-list">
                ${NEVER_INCLUDED.map((line) => html`<li>${line}.</li>`)}
              </ul>
              <p>
                The first two are not only promised. The modules that compute and order
                scores cannot import anything that knows what a producer pays, and the
                catalogue's build fails if that changes.
              </p>
            </div>`,
          },
        ],
      },
    ],
  });
}

/** The ethical core, unchanged since the layout preview and shown wherever
 *  somebody is close enough to listing to need it: (a) and (c). */
function neverDoBand(): Html {
  return section({
    heading: "The two things this screen will never do",
    body: html`
      <div class="grid-2">
        ${card(html`
          <h3>Let you write your own scores</h3>
          <p class="muted">
            The six profile numbers are derived by us from your declared notes and
            concentration. They were once six sliders on a form and were taken out on
            purpose: our copy-detection check compares your notes against those numbers,
            and handing the same party both inputs defeats it by construction.
          </p>
        `)}
        ${card(html`
          <h3>Publish anything by itself</h3>
          <p class="muted">
            No automated step may approve a listing or make a claim on it stronger.
            Automation can flag, weaken and take down; a person has to put something up.
            Even then, publication waits for the next site build.
          </p>
        `)}
      </div>
    `,
  });
}

/* ======================================================================== *
 * The two ways (c) can fail
 * ======================================================================== */

/** The database could not be read. A 503 with a reason, never an empty table:
 *  "you have no listings" and "we could not find out" are different claims and
 *  only one of them is ours to make. */
function listingsUnreadable(auth: AuthUser): Html {
  return layout({
    title: "Producer console",
    heading: "We could not read your listings",
    status: {
      label: "Read failed",
      tone: "outline",
      note: html`This is our side, not yours. Your account and your listings are
        untouched.`,
    },
    standfirst: html`You are signed in as
      <span class="wrap-anywhere">${auth.email}</span>, and the query that loads this
      screen did not come back.`,
    body: html`
      ${section({
        heading: "What this is and is not",
        body: html`
          <div class="stack">
            ${notShipped({
              what: "Nothing was written and nothing was lost",
              reason: html`This screen only reads. A failed read means the database was
                unreachable or refused the query; it does not mean a listing changed
                state, and no listing state is ever changed by loading a page.`,
            })}
            <p>
              Reloading is worth one try. If it keeps happening, tell us at
              <a href="mailto:contact@counterscent.com">contact@counterscent.com</a> and
              say roughly when, which is enough for us to find it in the logs.
            </p>
            <form method="post" action="/sign-out" class="actions">
              ${button("Sign out", { variant: "ghost" })}
            </form>
          </div>
        `,
      })}
    `,
  });
}

/** The account points at a producer record that is not there. Barely
 *  reachable (User.producerId is SetNull on delete, so it can only happen
 *  mid-flight) and worth saying out loud rather than rendering as an empty
 *  workspace, which would read as "you have no listings" to someone who may
 *  have had several. */
function producerRecordMissing(auth: AuthUser): Html {
  return layout({
    title: "Producer console",
    heading: "This account points at a record we cannot find",
    status: {
      label: "Producer record missing",
      tone: "outline",
      note: html`An unusual state, and ours to fix rather than yours.`,
    },
    standfirst: html`You are signed in as
      <span class="wrap-anywhere">${auth.email}</span>, and the producer record this
      address is attached to did not come back from the database.`,
    body: html`
      ${section({
        heading: "What to do",
        body: html`
          <div class="stack">
            <p>
              Write to
              <a href="mailto:contact@counterscent.com">contact@counterscent.com</a> from
              this address and say you saw this. It is specific enough to find, and it is
              not something you can clear from your side.
            </p>
            <p class="muted">
              Listings are never deleted here, so this is not what a removed listing looks
              like. A removal is a change of state and the record stays.
            </p>
            <form method="post" action="/sign-out" class="actions">
              ${button("Sign out", { variant: "ghost" })}
            </form>
          </div>
        `,
      })}
    `,
  });
}
