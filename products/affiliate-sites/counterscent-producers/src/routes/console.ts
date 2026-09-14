import { html } from "../lib/html";
import { CATALOGUE, layout } from "../ui/layout";
import {
  card,
  deadButton,
  emptyState,
  notShipped,
  section,
  stateBadge,
  tableBlock,
} from "../ui/components";

/**
 * "/console" - the producer's own screen, in its pre-launch state.
 *
 * The table is rendered with its real columns and an empty body. That is a
 * deliberate choice over not rendering it: the columns ARE the design
 * decision worth reviewing, and an empty table with a stated reason is
 * honest in a way that a fabricated row of sample data would not be. There
 * are no example producers anywhere on this origin, and there must not be:
 * lib/producers.ts in the catalogue is fixture data naming eighteen real
 * operating companies, none of which signed up, so putting any of them on a
 * screen here would assert a commercial relationship that does not exist.
 *
 * This Worker holds no database binding and issues no query. The Neon
 * database exists (provisioned 2026-09-14) and this origin is not connected
 * to it, which is why the copy says "does not read" rather than "is empty".
 */
export function producerConsole() {
  const body = html`
    ${section({
      heading: "Account",
      body: html`
        ${card(html`
          <p><strong>Not signed in.</strong></p>
          <p class="muted">
            There is no account to be signed in to. When there is, this strip carries who
            you are, which plan you are on, and how many listings that plan covers, read
            from the subscription record rather than typed into a page. The plans
            themselves are on the public site:
            <a href="${CATALOGUE}/producers/pricing">plans and pricing</a>.
          </p>
        `)}
      `,
    })}

    ${section({
      heading: "Everything you have submitted",
      lede: html`One row per fragrance, whatever state it is in. Withdrawn and removed
        listings stay in this table rather than disappearing from it, because a record
        you can make vanish is not a record.`,
      body: html`
        <div class="stack">
          <div>
            ${tableBlock({
              label: "Your listings",
              columns: ["Your fragrance", "Compared against", "Match", "State", "Last change"],
              empty: emptyState({
                headline: "Nothing to show, and nothing to show it from",
                because: html`This page does not read the database. It holds no
                  connection to one, issues no query, and cannot write anything. The
                  producer console is step 6 of the build order; what exists today is the
                  layout it will use.`,
              }),
            })}
          </div>

          <div class="actions">
            ${deadButton("Submit a fragrance")}
            ${deadButton("Request an edit", "ghost")}
            ${deadButton("Withdraw a listing", "ghost")}
            <p class="actions-note">
              Every verb is disabled. None of them has anything to act on.
            </p>
          </div>
        </div>
      `,
    })}

    ${section({
      heading: "What each column will mean",
      body: html`
        <ul class="plain-list">
          <li>
            <strong>Compared against</strong> is an original already in our catalogue.
            You choose it; you cannot add one. The comparison runs against a note pyramid
            we researched, so a fragrance we have not written up yet cannot be scored
            against, and we do not commit to a date for researching one.
          </li>
          <li>
            <strong>Match</strong> is computed, not negotiated. It is capped at 90 per
            cent while a listing is producer-declared, and at 95 once we have verified it
            independently. Nothing publishes above 95. Verification lifts the cap;
            nothing else does, and paying us certainly does not.
          </li>
          <li>
            <strong>State</strong> is the pair of database columns, shown as one label
            per row. The one to read carefully is
            ${stateBadge("approved")}, which means we have said yes and the catalogue has
            not been rebuilt yet.
          </li>
          <li>
            <strong>Last change</strong> comes from an append-only event log, not from a
            timestamp somebody can overwrite. Every state change is attributed to a
            person, to us, or to an automated check, so months later it is still possible
            to say who moved a listing and when.
          </li>
        </ul>
      `,
    })}

    ${section({
      heading: "The two things this screen will never do",
      body: html`
        <div class="grid-2">
          ${card(html`
            <h3>Let you write your own scores</h3>
            <p class="muted">
              The six profile numbers are derived by us from your declared notes and
              concentration. They were once six sliders on a form and were taken out on
              purpose: our copy-detection check compares your notes against those
              numbers, and handing the same party both inputs defeats it by construction.
            </p>
          `)}
          ${card(html`
            <h3>Publish anything by itself</h3>
            <p class="muted">
              No automated step may approve a listing or make a claim on it stronger.
              Automation can flag, weaken and take down; a person has to put something
              up. Even then, publication waits for the next site build.
            </p>
          `)}
        </div>
      `,
    })}

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
    status: {
      label: "Signed out",
      note: html`Not because a session expired. There is no account system on this
        origin, so this page cannot be anything but signed out.`,
    },
    standfirst: html`What a producer sees after signing in: everything they have
      submitted, what state each listing is in, and the four things they can do about
      it.`,
    body,
  });
}
