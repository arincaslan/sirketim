import { html } from "../lib/html";
import { CATALOGUE, layout } from "../ui/layout";
import { button, card, section, stateRow } from "../ui/components";
import type { Env } from "../lib/env";
import { getAuthContext } from "../lib/auth";
import { page } from "../lib/http";

/**
 * "/" - what this origin is, what it will do, and the one distinction the
 * whole console is organised around.
 *
 * The audience today is not a producer. It is the founder and whoever
 * reviews the shape of this before it opens, which is why the three screens
 * are linked from here and labelled as previews rather than hidden. When the
 * programme opens, this page becomes the signed-out landing page and that
 * section comes out.
 *
 * SINCE STEP 5 (2026-09-16) THIS IS THE ONE PAGE ON THE ORIGIN THAT SHOWS
 * REAL SESSION STATE. Not /console: that page's own file explains why it
 * still hardcodes "signed out" for everyone, including a request carrying a
 * valid session cookie, until step 6 wires the session-check helper in. This
 * page is where "did sign-in actually work" is checkable in the meantime,
 * and where the sign-out form lives, because there is nowhere else on the
 * origin that currently renders a signed-in state to hang one off of.
 */
export async function overview(request: Request, env: Env) {
  const auth = await getAuthContext(request, env);

  const accountStrip = auth
    ? card(html`
        <p><strong>Signed in as ${auth.email}.</strong></p>
        <p class="muted">
          ${
            auth.producerId
              ? "Attached to a producer record."
              : "Not attached to a producer yet - that is a separate, editorial step, not something signing in does on its own."
          }
        </p>
        <form method="post" action="/sign-out" class="actions">
          ${button("Sign out", { variant: "ghost" })}
        </form>
      `)
    : card(html`
        <p><strong>Signed out.</strong></p>
        <p class="muted">
          <a href="/sign-in">Request a sign-in link</a> to check that the account system works. It will not
          put you anywhere useful yet - see "The screens, as they stand" below.
        </p>
      `);

  const body = html`
    ${section({
      heading: "Account",
      body: accountStrip,
    })}

    ${section({
      heading: "What a producer will do here",
      lede: html`Four verbs, from the brief this was designed against. Each one is a
        screen in the console, and each is listed in the producer terms so it can be
        checked against what the code does.`,
      body: html`
        <div class="stack">
        <div class="grid-2">
          ${card(html`
            <h3>Submit a fragrance</h3>
            <p class="muted">
              Against an original that is already in our catalogue. You cannot add an
              original: the comparison is computed against a note pyramid we researched,
              so an original we have not written up cannot be scored against.
            </p>
          `)}
          ${card(html`
            <h3>Follow it through review</h3>
            <p class="muted">
              A person reviews every submission. Nothing is approved automatically, and
              no automated check may ever approve a listing or make a claim on it
              stronger.
            </p>
          `)}
          ${card(html`
            <h3>Ask for a change</h3>
            <p class="muted">
              A request to change something already published is held beside the live
              listing rather than replacing it. The listing keeps serving while the
              request is read.
            </p>
          `)}
          ${card(html`
            <h3>Withdraw a listing</h3>
            <p class="muted">
              Yours to take down, no reason required. Withdrawal is a change of state,
              not a deletion: the record and the click history stay, and the link
              identifier is never reissued to something else.
            </p>
          `)}
        </div>

        <p>
          What the console will <strong>not</strong> let you set: the six profile scores,
          the verdict, or the match score. We derive the profile scores from what you
          declare, we write the verdict in our own voice, and the match score is computed
          by a formula that is
          <a href="${CATALOGUE}/about#methodology">published in full</a>. That is not a
          comment on anyone's honesty. Our copy-detection check compares a declared note
          pyramid against those profile scores, and it only works while we author one
          side of it.
        </p>
        </div>
      `,
    })}

    ${section({
      heading: "Approved and live are different states",
      lede: html`This is the distinction the console is built around, and the reason
        the database carries two separate state columns rather than one.`,
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

        <p>
          The public catalogue is a static export with no server and no database
          connection, which is why it is fast, cheap and hard to break. The cost of that
          choice lands exactly here: an approved listing is not a page on the site until
          the site is rebuilt. A console that showed one combined "approved and live"
          state would be quietly contradicting a term the producer agreed to.
        </p>

        <div class="notice">
          <p class="notice-title">We do not publish a review time or a publication cadence</p>
          <p>
            The producer terms commit us to publishing both, and to publishing them only
            once we have real figures. We have none: no submission has ever been reviewed
            here, because there is nothing to submit with. A number invented now would be
            a promise nobody measured.
          </p>
        </div>

        <div>
        <h3>Every state a listing can be in</h3>
        <p class="muted">
          Named as the database names them, so what a producer reads and what an editor
          reads and what is stored are the same eight words.
        </p>
        <div class="state-list">
          ${stateRow({
            state: "draft",
            meaning: html`Started and not sent. Never exported, never seen by us.`,
            movedBy: "The producer",
          })}
          ${stateRow({
            state: "in-review",
            meaning: html`Sent, waiting for a person. Automated checks may already have
              flagged it, and a flag can stop it here.`,
            movedBy: "The producer",
          })}
          ${stateRow({
            state: "changes-requested",
            meaning: html`We read it and need something fixed before it can be approved.
              This is us asking them, which is the opposite direction from a producer
              asking us for an edit.`,
            movedBy: "An editor",
          })}
          ${stateRow({
            state: "rejected",
            meaning: html`Not publishable, with the reason given. Common reasons: the
              original is not in our catalogue, the declared data contradicts the
              producer's own public product page, or the pyramid restates the original's.`,
            movedBy: "An editor",
          })}
          ${stateRow({
            state: "approved",
            meaning: html`Decided, and not on the site. It joins the catalogue at the
              next build.`,
            movedBy: "An editor",
          })}
          ${stateRow({
            state: "live",
            meaning: html`In the build that is currently serving. This is the only state
              the public site knows about.`,
            movedBy: "A site build",
          })}
          ${stateRow({
            state: "withdrawn",
            meaning: html`The producer took it down. It leaves the catalogue at the next
              build and its link stops resolving. The record stays.`,
            movedBy: "The producer",
          })}
          ${stateRow({
            state: "removed",
            meaning: html`We took it down, and we say which reason: a breach, a rights
              complaint, a dead link, or data we cannot reconcile.`,
            movedBy: "An editor",
          })}
        </div>
        </div>
        </div>
      `,
    })}

    ${section({
      heading: "What no plan buys",
      lede: html`The producer terms say this in words. Two of the three are also
        enforced by something other than good intentions.`,
      body: html`
        <ul class="plain-list">
          <li>
            No plan buys a better match score, a higher rank, placement, or a friendlier
            verdict. The modules that compute and order scores are barred from importing
            anything that knows what a producer pays, and the catalogue's build fails if
            that changes. An import-graph assertion is a control. A promise in a document
            is not.
          </li>
          <li>
            We take no commission on sales from a paid tier's listings, so we have no
            financial interest in where a subscriber ranks or how much traffic they get.
            That is what makes the line above worth anything.
          </li>
          <li>
            A paid tier may buy priority in the review queue. That changes how soon we
            look at a submission and nothing about where it lands.
          </li>
        </ul>
        <p>
          The plans themselves live on the public site:
          <a href="${CATALOGUE}/producers/pricing">plans and pricing</a>. No price shown
          anywhere today is an offer, no payment can be taken, and nothing here will
          charge anyone.
        </p>
      `,
    })}

    ${section({
      heading: "The screens, as they stand",
      lede: html`Sign in is real now (step 5, 2026-09-16). The other two are still layout
        previews that read real state vocabulary and no real data.`,
      body: html`
        <div class="grid-2">
          ${card(html`
            <h3><a href="/sign-in">Sign in</a></h3>
            <p class="muted">
              Where an email sign-in link is requested - a real form, gated on whether the
              database and mail-sending secrets are both configured on this Worker. See
              that page for which, if either, is still missing.
            </p>
          `)}
          ${card(html`
            <h3><a href="/console">The producer console</a></h3>
            <p class="muted">
              The listing table and the four actions, with the empty state that is
              currently the only honest thing to show. Still says "signed out"
              unconditionally, even to a signed-in request - that page is not wired to a
              session yet, on purpose, until step 6.
            </p>
          `)}
          ${card(html`
            <h3><a href="/review">The review queue</a></h3>
            <p class="muted">
              The editor's side: what a reviewer sees, what the decisions are, and where
              automation is allowed to act.
            </p>
          `)}
          ${card(html`
            <h3>Billing is not one of them</h3>
            <p class="muted">
              No checkout, no card, no subscription state, nowhere. It is deliberately
              the last step in the build order, and it is behind a question to the
              payment provider that has not been answered yet.
            </p>
          `)}
        </div>
      `,
    })}

    ${section({
      heading: "If you make fragrances",
      body: html`
        <p>
          Write to
          <a href="mailto:contact@counterscent.com">contact@counterscent.com</a> and we
          will tell you when this opens. A real person reads it. Before you do, the part
          most likely to decide whether this is a fit is
          <a href="${CATALOGUE}/about#methodology">how we score</a>, not the price.
        </p>
      `,
    })}
  `;

  return page(
    layout({
      title: "Producer console",
      heading: "The producer console",
      showBackLink: false,
      status: {
        label: "Not open yet",
        note: html`Signing in is real (see "Account" above); there is still nothing to do
          once signed in and no way to submit anything. Every screen here says so where it
          would matter.`,
      },
      standfirst: html`This is where a fragrance producer will list an alternative on
        counterscent.com, follow it through review, and take it down again. It is being
        built, and the pages below are what has been designed rather than what is
        running.`,
      body,
    }),
    200,
    { allowForms: Boolean(auth) },
  );
}
