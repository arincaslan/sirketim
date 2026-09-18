import { html, type Html } from "../lib/html";
import { page } from "../lib/http";
import { CATALOGUE, layout } from "../ui/layout";
import {
  button,
  card,
  deadButton,
  emptyState,
  identityBar,
  listingStates,
  listingThumb,
  notShipped,
  section,
  stateBadge,
  tableBlock,
  listingStateFor,
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
 *       real account is in this state at the moment it is created, and will be
 *       until a person attaches it by hand. A design that treats it as an
 *       error would be showing an error to every producer who ever signs in.
 *       It is a waypoint and it reads as one: no error colour, no empty table,
 *       and the account card first, because the reader just clicked a link in
 *       an email and their only question is whether it worked.
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
    ${section({
      heading: "Two ways in, and there are only two",
      lede: html`There is no signup form on this origin. That is a decision, not a
        missing page: a listing claims a relationship between your product and somebody
        else's, so we would rather know who is making the claim before there is an
        account to make it from.`,
      body: html`
        <div class="grid-2">
          ${card(html`
            <h3>You already have an account</h3>
            <p class="muted">
              We email you a link. It works once, for fifteen minutes, and there is no
              password to lose or to be stolen from us.
            </p>
            <p class="door-action">
              <a class="btn btn-primary" href="/sign-in">Request a sign-in link</a>
            </p>
          `)}
          ${card(html`
            <h3>You do not</h3>
            <p class="muted">
              Write to us with the fragrances you would list and the originals they go
              against. A person reads it and answers. We cannot tell you how long that
              takes, because nobody has been through it yet and a number invented now
              would be a promise nobody measured.
            </p>
            <p class="door-action">
              <a class="btn btn-ghost" href="mailto:contact@counterscent.com"
                >Write to contact@counterscent.com</a
              >
            </p>
          `)}
        </div>
      `,
    })}

    ${section({
      heading: "What a listing buys, and what no plan buys",
      lede: html`This is the question this audience arrives with, so it is answered above
        the plans rather than underneath them.`,
      body: html`
        <div class="stack">
          <div>
          <h3>What a listing buys</h3>
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
          </div>
          <div>
          <h3>What no plan buys</h3>
          <ul class="plain-list">
            <li>
              <strong>No plan buys a better match score</strong>, a higher rank,
              placement, or a friendlier verdict. The modules that compute and order
              scores are barred from importing anything that knows what a producer pays,
              and the catalogue's build fails if that changes. An import-graph assertion
              is a control; a promise in a document is not.
            </li>
            <li>
              <strong>We take no commission on your sales, on any tier</strong>, the
              free one included. We have no financial interest in where any listing
              ranks or how much traffic it gets, which is what makes the line above
              worth anything. A subscription, if you take one, is the only thing you
              ever pay us.
            </li>
            <li>
              <strong>Nothing is approved automatically</strong>, at any tier. Automation
              may flag a listing, weaken a claim on it, or take it down. It may never put
              one up.
            </li>
          </ul>
          </div>
        </div>
      `,
    })}

    ${section({
      heading: "The plans",
      lede: html`What each tier covers. What each tier costs is not printed on this
        screen, and the row that would carry it says why.`,
      body: html`
        <div class="stack">
          ${planTable()}
          ${notShipped({
            what: "Nothing on this screen can be paid for",
            reason: html`There is no checkout on this origin, no payment provider
              connected to it, and no way for anyone to take money from you today. Which
              provider it will eventually be is also unsettled: the usual ones do not
              serve a Turkey-based business, so the shortlist is short and the question
              is open. Three capability lines are missing from the table above for a
              different reason. Click reporting and conversion reporting are not built
              for anyone, at any tier, and who may withdraw or request an edit without
              paying is a contradiction between our own plan list and our producer terms
              that we have not settled. We would rather leave a row out than print a
              contested capability as a fact.`,
          })}
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
    standfirst: html`What listing a fragrance here involves, what each tier covers, and
      the two ways to get an account. There is no self-serve signup: a person attaches an
      account to a real company by hand.`,
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
function noProducerAttached(auth: AuthUser, isAdmin = false): Html {
  const body = html`
    ${section({
      heading: "Account",
      body: card(html`
        <p><strong>Signed in as <span class="wrap-anywhere">${auth.email}</span>.</strong></p>
        <p class="muted">
          The sign-in link worked and this session lasts thirty days. No company record is
          attached to this address yet, which is the normal state of a new account here
          rather than something that went wrong.
        </p>
        <form method="post" action="/sign-out" class="actions">
          ${button("Sign out", { variant: "ghost" })}
        </form>
      `),
    })}

    ${section({
      heading: "What happens next, and who does it",
      lede: html`Three steps, with a real actor on each. None of them is a queue position,
        because there is no queue.`,
      body: html`
        <div class="stack">
          <ul class="plain-list">
            <li>
              <strong>You write to us</strong> at
              <a href="mailto:contact@counterscent.com">contact@counterscent.com</a> from
              this address, with your company and the fragrances you would list. If you
              have already done that, nothing more is needed from you.
            </li>
            <li>
              <strong>A person attaches this address</strong> to your company's record.
              It is a decision about identity, so it is made by a person and not by
              signing in. It is also the reason nobody can create a producer here by
              filling in a form.
            </li>
            <li>
              <strong>This page changes on its own</strong> the next time you load it.
              There is nothing to click at that point and no second email to wait for.
            </li>
          </ul>
          <p class="muted">
            We are not going to tell you how long that takes. Nobody has been through it
            yet, so any figure would be invented, and our own terms commit us to
            publishing a review time only once we have measured real ones.
          </p>
        </div>
      `,
    })}

    ${section({
      heading: "The tier an attached account starts on",
      body: html`
        <p>
          The free tier, which covers one listing, reviewed by a person like every other
          listing here. Nothing is on file for this address: there is no producer record
          and no subscription record, so there is no plan to show you yet. What each tier
          covers is on
          <a href="${CATALOGUE}/producers/pricing">plans and pricing</a>, and no figure
          anywhere on this origin is an offer.
        </p>
      `,
    })}

    ${section({
      heading: "Your listings",
      body: notShipped({
        what: "There is no listings table on this screen yet",
        reason: html`A table of listings belongs to a producer record, and this address is
          not attached to one. An empty table here would be a table of nothing about
          nobody, and it would make this screen look like the one an attached producer
          sees, which is the single most misleading thing this page could do. It appears
          when the attachment does.`,
      }),
    })}
  `;

  return layout({
    title: "Producer console",
    heading: "Your account is set up.",
    // See the note above this function: rendered for an admin, omitted for a
    // producer, because only one of the two has somewhere to go from here.
    nav: isAdmin ? { current: "listings", showAdmin: true } : undefined,
    status: {
      label: "No producer attached",
      tone: "outline",
      note: html`Signing in worked. The next step is ours, not yours, and it is described
        below.`,
    },
    standfirst: html`You are signed in as
      <span class="wrap-anywhere">${auth.email}</span>. What is missing is the link
      between this address and a company, which a person makes by hand.`,
    body,
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
      lede: html`One row per fragrance, whatever state it is in. Withdrawn and removed
        listings stay in this table rather than disappearing from it, because a record you
        can make vanish is not a record.`,
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

    ${verdict.kind === "at-allowance" ? exhaustedAllowance(verdict.allowance) : ""}

    ${section({
      heading: "What each column means",
      body: html`
        <ul class="plain-list">
          <li>
            <strong>Compared against</strong> is an original already in our catalogue. You
            choose it; you cannot add one. The comparison runs against a note pyramid we
            researched, so a fragrance we have not written up yet cannot be scored
            against, and we do not commit to a date for researching one.
          </li>
          <li>
            <strong>Match</strong> is computed, not negotiated. It is capped at 90 per
            cent while a listing is producer-declared and at 95 once we have verified it
            independently; nothing publishes above 95. This console does not hold a copy
            of the figure: it is computed by the catalogue's own build, so the number on
            your public listing is the only one there is. The one score stored here is the
            score a listing had at the moment it came down, frozen.
          </li>
          <li>
            <strong>State</strong> is the pair of database columns, shown as one label per
            row. The one to read carefully is ${stateBadge("approved")}, which means we
            have said yes and the catalogue has not been rebuilt yet.
          </li>
          <li>
            <strong>Last change</strong> is read from an append-only event log, not from a
            timestamp somebody can overwrite. Every state change is attributed to a
            person, to us, or to an automated check, so months later it is still possible
            to say who moved a listing and when.
          </li>
        </ul>
      `,
    })}

    ${neverDoBand()}

    ${notShipped({
      what: "Photograph upload is not here either",
      reason: html`A listing will require a product photograph and a statement that you
        hold the rights to it. That needs file storage, a rights declaration recorded
        against the image, and a path for getting the file into a static build. None of
        those exist, so the field is not on this page pretending to.`,
    })}
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
      note: html`This screen is reading your producer record. Submitting a fragrance and
        withdrawing one both work. Requesting an edit does not yet, and that button says so
        itself rather than leaving you to find out by pressing it.`,
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
    if (left === 0) note = html`Withdrawing one frees its slot, or move up a tier.`;
  }

  // The missing-record fact outranks the allowance notes: it is the only one
  // that says something about the account rather than about the count, and a
  // producer who does not know a record is absent cannot make sense of why
  // the number is what it is.
  if (noRecord) note = html`No subscription record exists yet. This is what we enforce.`;

  return html`<div class="plan-panel">
    <p class="plan-panel-label">Your plan</p>
    <p class="plan-panel-name">${heading}</p>
    <p class="plan-panel-count">
      <span class="plan-panel-listed"
        >${inUse === 1 ? "1 listed" : `${String(inUse)} listed`}</span
      >
      <span class="plan-panel-room">${room}</span>
    </p>
    ${note ? html`<p class="plan-panel-note">${note}</p>` : ""}
    <p class="plan-panel-link"><a href="/console/plan">See plans and move tier</a></p>
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
  return html`<div class="plan-panel">
    <p class="plan-panel-label">Your access</p>
    <p class="plan-panel-name">Administrator</p>
    <p class="plan-panel-count">
      <span class="plan-panel-listed"
        >${inUse === 1 ? "1 listed" : `${String(inUse)} listed`}</span
      >
      <span class="plan-panel-room">No listing cap</span>
    </p>
    <p class="plan-panel-note">
      Anything you submit still joins the queue and waits for a decision, the same as a
      producer's.
    </p>
    <p class="plan-panel-link"><a href="/admin">Open the admin panel</a></p>
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
function exhaustedAllowance(allowance: number): Html {
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
          Withdrawing a listing frees its slot. A withdrawn listing keeps its record and
          its click history; withdrawal is a change of state, never a deletion.
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
      {
        cells: [
          label("Listings included"),
          cell(html`1`),
          cell(html`25`),
          cell(html`No cap`),
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
