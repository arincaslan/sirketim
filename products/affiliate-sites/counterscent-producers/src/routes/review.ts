import { html } from "../lib/html";
import { layout } from "../ui/layout";
import { page } from "../lib/http";
import type { Env } from "../lib/env";
import { requireAdmin } from "../lib/admin";
import {
  card,
  deadButton,
  deadField,
  emptyState,
  notShipped,
  section,
  stateBadge,
  tableBlock,
} from "../ui/components";

/**
 * "/review" - the editor's side, in its pre-launch state.
 *
 * It is a separate screen from the console rather than a mode of it, because
 * the two have different readers, different permissions and different
 * vocabulary. A producer never sees this page.
 *
 * It is linked from the overview rather than hidden, because today the only
 * readers of this origin are the people deciding whether the shape is right.
 * When accounts exist, this route goes behind the session and stops being
 * linked from a public page.
 *
 * IT IS NOW BEHIND requireAdmin, AND THAT CLOSES A STANDING DEBT. Until
 * 2026-09-18 this route answered 200 to anyone, and the note here said the
 * real check had to land in the SAME change as its first real query. The real
 * query landed that day - at /admin/queue, which reads and decides live
 * submissions - so the guard landed with it, and it is applied to this page
 * too rather than only to the new one. An unprotected page that merely LOOKS
 * like an editor surface is still an invitation to go looking for the one that
 * is not a mock-up.
 *
 * WHAT THIS PAGE IS NOW: the layout study, kept because it documents the
 * vocabulary and the shape the real queue grew into, and reachable only by an
 * administrator. The working screen is /admin/queue and this page says so at
 * the top rather than leaving an admin to work out which of the two is real.
 */
export async function reviewQueue(request: Request, env: Env) {
  const gate = await requireAdmin(request, env);
  if (gate.kind === "refused") return gate.response;
  const auth = gate.auth;
  const body = html`
    ${section({
      heading: "Waiting for a decision",
      lede: html`Oldest first, with a paid tier's submissions taking priority within the
        same day. Priority changes how soon something is read and nothing about where it
        lands.`,
      body: tableBlock({
        label: "Submissions waiting for a decision",
        columns: [
          "Submitted",
          "Producer",
          "Fragrance",
          "Against",
          "Automated checks",
          "State",
        ],
        empty: emptyState({
          headline: "The queue is empty because there is no queue",
          because: html`No submission has ever been made, there is no route that could
            accept one, and this page holds no database connection. The admin queue is
            step 7 of the build order.`,
        }),
      }),
    })}

    ${section({
      heading: "The decisions, and who is allowed to make them",
      lede: html`The control floor, decided by the founder and not an implementation
        detail: automation may always take something down or make a claim weaker. It may
        never put something up or make a claim stronger.`,
      body: html`
        <div class="stack">
        <div class="grid-2">
          ${card(html`
            <h3>What automation does on its own</h3>
            <ul class="plain-list">
              <li>Flags a submission whose pyramid restates the original's.</li>
              <li>Rejects a link that is not https, or that is a tracking or shortened link.</li>
              <li>Caps a score, and refuses to lift a cap.</li>
              <li>Holds anything it cannot classify, rather than guessing.</li>
            </ul>
          `)}
          ${card(html`
            <h3>What only a person does</h3>
            <ul class="plain-list">
              <li>Approves a listing. There is no auto-approval and there will not be one.</li>
              <li>Writes the verdict, in our voice, including where the product falls short.</li>
              <li>Marks a listing editorially verified, which is what lifts the 90 cap to 95.</li>
              <li>Gives the reason attached to a rejection or a removal.</li>
            </ul>
          `)}
        </div>

        ${card(
          html`
            <h3>The decision panel</h3>
            <p class="field-hint">
              Disabled throughout. There is nothing in the queue to decide about.
            </p>
            <fieldset disabled class="fieldset-body">
              ${deadField({
                label: "Verdict",
                kind: "textarea",
                placeholder: "How this compares, in our voice, including where it falls short.",
                hint: html`Written by us, not the producer, and not subject to their
                  approval. A verdict that only says what is good is an advertisement.`,
              })}
              ${deadField({
                label: "Reason",
                placeholder: "Required on a rejection, a change request, or a removal.",
                hint: html`The producer is told which reason applies. "No" with no reason
                  attached is the thing that turns a queue into a black box.`,
              })}
              <div class="actions">
                ${deadButton("Approve", {
                  reason: html`This page reads nothing and writes nothing. There is no
                    submission behind this panel to approve, and no access control
                    deciding who may.`,
                })}
                ${deadButton("Request changes", {
                  variant: "ghost",
                  reason: html`Same: nothing to ask about. A change request is addressed
                    to a producer, and no submission here has one.`,
                })}
                ${deadButton("Reject", {
                  variant: "ghost",
                  reason: html`Same, and a rejection is the one decision that must always
                    reach a named person with a written reason attached.`,
                })}
                ${deadButton("Remove a live listing", {
                  variant: "ghost",
                  reason: html`Nothing is live. A removal also sets a state rather than
                    deleting a row, so the record and the click history survive it.`,
                })}
              </div>
            </fieldset>
          `,
          "review-card",
        )}
        </div>
      `,
    })}

    ${section({
      heading: "What happens after Approve",
      lede: html`Approving does not publish. The chain below is the publish path, and
        the gap in the middle of it is the reason the console shows
        ${stateBadge("approved")} as a state of its own.`,
      body: html`
        <ul class="plain-list">
          <li>An editor approves. The database records the decision and who made it.</li>
          <li>
            An export script writes the approved listings into generated TypeScript in
            the catalogue's source tree. It refuses to emit anything it cannot classify,
            rather than emitting something the public build would choke on.
          </li>
          <li>
            That output is committed. Deliberately a commit and not a step inside the
            build: if the public build read the database, a sleeping free-tier database
            could fail the whole site's deploy, and a database credential would have to
            live in the build environment. Committing keeps the public build reading only
            repository files, puts every published listing in a diff somebody can read,
            and makes reverting a commit a working takedown.
          </li>
          <li>The site builds and deploys. Only now is the listing live.</li>
        </ul>

        <div class="notice">
          <p class="notice-title">A removal follows the same path in reverse</p>
          <p>
            A withdrawn or removed listing leaves the catalogue at the next build, and
            its link identifier stops resolving because the redirect map only contains
            identifiers that were emitted. The identifier is never reissued: clicks
            already made can still pay out weeks later inside an affiliate network's
            cookie window, and reusing the identifier would attribute them to a different
            product.
          </p>
        </div>
      `,
    })}

    ${section({
      heading: "The pattern this queue exists to be able to see",
      body: html`
        <p>
          Withdrawing after a bad score and resubmitting with a friendlier note pyramid
          is review suppression wearing a different hat. Withdraw at 62, come back with a
          different pyramid, publish at 88.
        </p>
        <p>
          It is detectable rather than merely disapproved of, because a producer can hold
          only one listing per original and the earlier submission's data is retained. A
          resubmission against an original the same producer previously withdrew from
          arrives in this queue with both versions shown side by side. Whether that is
          built as a flag or left to a reviewer's eye is a decision for step 7, not a
          thing this page should imply already works.
        </p>
      `,
    })}

    ${notShipped({
      what: "Nothing on this page is wired to anything",
      reason: html`No sign-in, no roles, no database connection, no export. The
        vocabulary and the layout are the reviewable part; the mechanism is steps 7 and 8
        of the build order.`,
    })}
  `;

  return page(
    layout({
      title: "Review queue",
      heading: "Review queue (layout study)",
      // Every reader here is an administrator now - requireAdmin ran above and
      // returned its own response otherwise - so the nav is unconditional and
      // carries the admin group.
      nav: { current: "review", showAdmin: true, showReview: true },
      status: {
        label: "Not the working screen",
        tone: "outline",
        note: html`This page reads nothing and writes nothing. The queue that actually
          decides listings is <a href="/admin/queue">the listing queue</a>.`,
      },
      standfirst: html`Kept because it documents the decision vocabulary and the shape the
        real queue grew into. You are signed in as
        <span class="wrap-anywhere">${auth.email ?? ""}</span>.`,
      body,
    }),
  );
}
