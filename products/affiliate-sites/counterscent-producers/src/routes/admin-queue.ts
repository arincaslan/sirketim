import { html, type Html } from "../lib/html";
import { page, redirect as httpRedirect } from "../lib/http";

// SEE THE NOTE IN lib/http.ts: this used to be a THREE-LINE LOCAL FUNCTION of
// the same name, and because it shadowed the shared one, every response from
// this file - including every successful admin write - went out with no CSP,
// no X-Frame-Options, no Referrer-Policy, no X-Content-Type-Options and no
// X-Robots-Tag. The router's 404, its 405 and its 301 all carried them; the
// highest-privilege routes on the origin did not. A local helper that shares a
// name with a shared one is the cheapest way to lose a cross-cutting concern.
function redirect(to: string): Response {
  return httpRedirect(to, { status: 303 });
}
import { layout } from "../ui/layout";
import {
  button,
  card,
  csrfInput,
  emptyState,
  listingThumb,
  section,
  stateBadge,
  textareaField,
} from "../ui/components";
import type { Env } from "../lib/env";
import { adminActorId, requireAdmin } from "../lib/admin";
import { CSRF_FIELD, csrfToken, verifyCsrf } from "../lib/csrf";
import { generateId, type Sql } from "../lib/auth";
import { formatWhen } from "./admin";

/**
 * "/admin/queue" - the screen where a listing is acknowledged.
 *
 * FOUNDER INSTRUCTION 2026-09-18: "we want to acknowledge listings". This is
 * the only place on the origin where an editorial decision is recorded, and it
 * is the highest-privilege write here by a distance: approving a listing puts
 * a claim about somebody else's product onto a public catalogue under our
 * name.
 *
 * ============================================================================
 * FOUR RULES THIS SCREEN ENFORCES, THREE OF THEM IN CODE.
 * ============================================================================
 *
 * 1. APPROVAL DOES NOT MEAN LIVE, AND THIS NEVER WRITES `LIVE`. The catalogue
 *    is a static export, so a listing becomes live when a build emits it and
 *    not one moment sooner. Approving sets `approvalStatus = APPROVED` and
 *    leaves `publishState = PENDING`, which the shared badge renders as
 *    "Approved, not yet live". Writing LIVE here would be this console
 *    asserting something about the public site that the public site does not
 *    yet reflect - the exact class of lie the state split exists to prevent.
 *
 * 2. A REFUSAL NEEDS A REASON, ENFORCED SERVER-SIDE. Rejecting, requesting
 *    changes and taking a listing down all require text, and the check is in
 *    the handler rather than in a `required` attribute, because an attribute
 *    is a suggestion to a browser. The reason is stored on the AuditEvent and
 *    is what a producer is owed: "no" with no reason is not a decision, it is
 *    an outcome.
 *
 * 3. APPROVING NEEDS NO REASON, deliberately. Requiring one would produce a
 *    field full of "ok" and "fine", which is worse than an empty column
 *    because it looks like a record and is not. Silence on approval means the
 *    listing met the published standard; anything else has to be said.
 *
 * 4. EVERY DECISION WRITES AN AuditEvent IN THE SAME STATEMENT SEQUENCE AS THE
 *    STATE CHANGE. Not enforced by a transaction, which this driver does not
 *    give us over separate tagged template calls - so the audit row is written
 *    FIRST and the state change second. If only one of the two can survive a
 *    failure, the safe survivor is a log entry describing a change that did
 *    not happen (visible, correctable) rather than a change nobody recorded
 *    (invisible, permanent).
 */

const DECISIONS = {
  approve: {
    label: "Approve",
    approvalStatus: "APPROVED",
    publishState: null,
    action: "approved",
    needsReason: false,
  },
  changes: {
    label: "Request changes",
    approvalStatus: "CHANGES_REQUESTED",
    publishState: "DRAFT",
    action: "revision_requested",
    needsReason: true,
  },
  reject: {
    label: "Reject",
    approvalStatus: "REJECTED",
    publishState: null,
    action: "rejected",
    needsReason: true,
  },
  remove: {
    label: "Take down",
    approvalStatus: null,
    publishState: "REMOVED_BY_EDITOR",
    action: "removed_by_editor",
    needsReason: true,
  },
} as const;

type DecisionKey = keyof typeof DECISIONS;

function isDecision(v: string): v is DecisionKey {
  return Object.prototype.hasOwnProperty.call(DECISIONS, v);
}

/* ---------------------------------------------------------------------- *
 * GET
 * ---------------------------------------------------------------------- */

export async function adminQueue(request: Request, env: Env): Promise<Response> {
  const gate = await requireAdmin(request, env);
  if (gate.kind === "refused") return gate.response;

  const url = new URL(request.url);
  return renderQueue(request, env, gate.sql, {
    done: url.searchParams.get("done"),
    problem: url.searchParams.get("problem"),
  });
}

/* ---------------------------------------------------------------------- *
 * POST
 * ---------------------------------------------------------------------- */

export async function adminDecide(request: Request, env: Env): Promise<Response> {
  const gate = await requireAdmin(request, env);
  if (gate.kind === "refused") return gate.response;
  const { sql, auth } = gate;

  // PARSED IN A try/catch BECAUSE formData() THROWS ON A BODY IT CANNOT READ.
  // The other three write routes on this origin all guard it and each says why:
  // unguarded, an absent or unparseable body answers with a generic 500, which
  // is the fake-failure shape this project's notShipped() ethos exists to
  // prevent. A browser cannot produce it; only a non-browser client can, and it
  // should get the same honest refusal as a missing token. Admin-only
  // reachability made this low severity, never correct.
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return redirect("/admin/queue?problem=malformed");
  }
  const ok = await verifyCsrf(request, "admin-decide", asString(form.get(CSRF_FIELD)));
  if (!ok) return redirect("/admin/queue?problem=csrf");

  const id = asString(form.get("submissionId"));
  const raw = asString(form.get("decision"));
  const reason = (asString(form.get("reason")) ?? "").trim();

  if (!id || !raw || !isDecision(raw)) return redirect("/admin/queue?problem=malformed");
  const decision = DECISIONS[raw];

  // SERVER-SIDE, not a `required` attribute. See rule 2 in the header.
  if (decision.needsReason && reason.length < 4) {
    return redirect(`/admin/queue?problem=reason&id=${encodeURIComponent(id)}`);
  }

  try {
    const rows = (await sql`
      SELECT s.id, s."producerId", s."approvalStatus", s."publishState",
             sub.tier AS tier, sub.status AS "subStatus"
      FROM "Submission" s
      LEFT JOIN "Subscription" sub ON sub."producerId" = s."producerId"
      WHERE s.id = ${id}
      LIMIT 1
    `) as {
      id: string;
      producerId: string;
      approvalStatus: string;
      publishState: string;
      tier: string | null;
      subStatus: string | null;
    }[];

    const row = rows[0];
    if (!row) return redirect("/admin/queue?problem=gone");

    const nextApproval = decision.approvalStatus ?? row.approvalStatus;
    const nextPublish = decision.publishState ?? row.publishState;

    // NOTHING TO DO IS NOT AN ERROR, but it must not write an audit row
    // claiming a change. Two tabs open on the same listing is the ordinary way
    // to reach this.
    if (nextApproval === row.approvalStatus && nextPublish === row.publishState) {
      return redirect("/admin/queue?problem=nochange");
    }

    // AUDIT FIRST. See rule 4: if exactly one of these two writes survives, a
    // recorded change that did not happen is recoverable and an unrecorded
    // change that did is not.
    await sql`
      INSERT INTO "AuditEvent" (
        id, "submissionId", "producerId", action, "actorType", "actorId",
        channel, before, after, reason, "tierAtEvent", "statusAtEvent"
      ) VALUES (
        ${generateId()}, ${row.id}, ${row.producerId}, ${decision.action},
        'FOUNDER', ${adminActorId(auth)},
        'admin-console',
        ${JSON.stringify({ approvalStatus: row.approvalStatus, publishState: row.publishState })}::jsonb,
        ${JSON.stringify({ approvalStatus: nextApproval, publishState: nextPublish })}::jsonb,
        ${reason.length > 0 ? reason : null},
        ${row.tier}, ${row.subStatus}
      )
    `;

    await sql`
      UPDATE "Submission"
      SET "approvalStatus" = ${nextApproval},
          "publishState"   = ${nextPublish},
          "updatedAt"      = now()
      WHERE id = ${row.id}
    `;

    return redirect(`/admin/queue?done=${encodeURIComponent(decision.action)}`);
  } catch {
    return redirect("/admin/queue?problem=write");
  }
}



// `FormDataEntryValue` is a DOM lib name and is not in the Workers types,
// so this takes `unknown` and narrows. A File upload therefore reads as
// null rather than as "[object File]", which is the right answer for every
// field on these forms.
function asString(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}

/* ---------------------------------------------------------------------- *
 * Rendering
 * ---------------------------------------------------------------------- */

interface QueueRow {
  id: string;
  slug: string;
  name: string;
  brand: string;
  referenceSlug: string;
  concentration: string;
  priceUsd: number;
  bottleMl: number;
  imageUrl: string | null;
  approvalStatus: string;
  publishState: string;
  submittedAt: unknown;
  producerName: string;
  tier: string | null;
}

async function renderQueue(
  request: Request,
  env: Env,
  sql: Sql,
  flags: { done: string | null; problem: string | null },
): Promise<Response> {
  const token = await csrfToken(request, "admin-decide");

  let waiting: QueueRow[] = [];
  let standing: QueueRow[] = [];
  try {
    waiting = (await sql`
      SELECT s.id, s.slug, s.name, s.brand, s."referenceSlug", s.concentration,
             s."priceUsd", s."bottleMl", s."imageUrl", s."approvalStatus",
             s."publishState", s."submittedAt", p.name AS "producerName", sub.tier AS tier
      FROM "Submission" s
      JOIN "Producer" p ON p.id = s."producerId"
      LEFT JOIN "Subscription" sub ON sub."producerId" = s."producerId"
      WHERE s."approvalStatus" = 'PENDING' AND s."publishState" IN ('PENDING','DRAFT')
      ORDER BY s."submittedAt" ASC
    `) as QueueRow[];

    standing = (await sql`
      SELECT s.id, s.slug, s.name, s.brand, s."referenceSlug", s.concentration,
             s."priceUsd", s."bottleMl", s."imageUrl", s."approvalStatus",
             s."publishState", s."submittedAt", p.name AS "producerName", sub.tier AS tier
      FROM "Submission" s
      JOIN "Producer" p ON p.id = s."producerId"
      LEFT JOIN "Subscription" sub ON sub."producerId" = s."producerId"
      WHERE s."publishState" IN ('LIVE','PENDING')
        AND s."approvalStatus" = 'APPROVED'
      ORDER BY s."submittedAt" DESC
      LIMIT 50
    `) as QueueRow[];
  } catch (e) {
    return page(
      layout({
        title: "Listing queue",
        heading: "The queue could not be read",
        nav: { current: "queue", showAdmin: true },
        status: { label: "Read failed", tone: "outline", note: html`Nothing was written.` },
        body: section({
          heading: "What happened",
          body: html`<p class="muted"><code>${e instanceof Error ? e.message : String(e)}</code></p>`,
        }),
      }),
      503,
    );
  }

  return page(
    layout({
      title: "Listing queue",
      // "LISTINGS WAITING ON A DECISION" WAS THE <h1> AND "Awaiting a decision"
      // the first section heading directly under it, which is the same phrase
      // twice in fourteen words. It was also half-true: the page carries the
      // approved-and-standing listings as well, which are the ones nothing is
      // waiting on.
      heading: "Listing queue",
      nav: { current: "queue", showAdmin: true },
      status: {
        label: waiting.length > 0 ? `${waiting.length} waiting` : "Queue empty",
        tone: waiting.length > 0 ? "solid" : "outline",
        note: html`Approving records a decision. It does not publish anything: the
          catalogue is a static export and a listing goes live when the next build emits
          it.`,
      },
      standfirst: html`Every listing here is a claim about somebody else's product that
        would carry our name. A refusal needs a reason; an approval does not.`,
      body: html`
        ${flag(flags)}
        ${section({
          heading: "Awaiting a decision",
          body:
            waiting.length === 0
              ? emptyState({
                  headline: "Nothing is waiting",
                  because: html`No submission is sitting in PENDING. New ones appear here
                    the moment a producer submits, ordered oldest first so nothing is left
                    at the bottom.`,
                })
              : html`<div class="stack">
                  ${waiting.map((r) => decisionCard(r, token, ["approve", "changes", "reject"]))}
                </div>`,
        })}

        ${section({
          heading: "Approved and standing",
          lede: html`Already decided. The only action left here is taking one down, which
            needs a reason and is recorded as ours rather than the producer's.`,
          body:
            standing.length === 0
              ? emptyState({
                  headline: "Nothing has been approved yet",
                  because: html`Once a listing is approved it appears here so it can still
                    be taken down after a complaint, a dead link or a failed re-check.`,
                })
              : html`<div class="stack">
                  ${standing.map((r) => decisionCard(r, token, ["remove"]))}
                </div>`,
        })}
      `,
    }),
    200,
    { allowForms: true },
  );
}

/**
 * One listing, and the decision it is waiting for.
 *
 * ============================================================================
 * WHAT CAME OUT OF THIS CARD, AND WHY IT WAS SAFE TO TAKE.
 * ============================================================================
 *
 * A queue is read down a column, not across one item, so anything printed per
 * card is printed once per listing. Two things here were.
 *
 * THE FACTS WERE A BULLETED LIST OF SENTENCES. Three <li>s reading "Compared
 * against x.", "Eau de Parfum, 50 ml, $39.", "Slug y. Current state z." - which
 * is a table of five values wearing full stops. They are now a definition list:
 * same five values, each under its own label, scannable in a column beside the
 * next card's. Nothing was dropped.
 *
 * THE REASON FIELD CARRIED A PARAGRAPH EXPLAINING ITSELF. "Required for
 * anything except approving. This is stored on the audit record and is what the
 * producer is owed: 'no' with no reason is an outcome, not a decision." That is
 * the right rule and it was already stated twice above, in the standfirst ("A
 * refusal needs a reason; an approval does not") and in this file's header. On
 * a queue of twenty it was the same paragraph twenty times, between the reader
 * and the buttons. The hint keeps the operative half.
 *
 * WHAT DID NOT CHANGE: the `required` attribute still follows needsReason, the
 * verbs still carry the decision as a button value, and the server-side reason
 * check in adminDecide() is untouched and remains the only one that counts.
 */
function decisionCard(r: QueueRow, token: string | null, verbs: DecisionKey[]): Html {
  const needsReason = verbs.some((v) => DECISIONS[v].needsReason);
  return card(html`
    <div class="cell-with-thumb">
      ${listingThumb({ name: r.name, imageUrl: r.imageUrl })}
      <div>
        <h3>${r.brand} ${r.name}</h3>
        <p class="muted">
          by ${r.producerName}${r.tier ? html` on ${r.tier}` : html` (no plan on file)`},
          submitted ${formatWhen(r.submittedAt)}
        </p>
      </div>
    </div>
    <dl class="decision-meta">
      <div>
        <dt>Compared against</dt>
        <dd><code class="wrap-anywhere">${r.referenceSlug}</code></dd>
      </div>
      <div>
        <dt>Product</dt>
        <dd>${r.concentration}, ${String(r.bottleMl)} ml, $${String(r.priceUsd)}</dd>
      </div>
      <div>
        <dt>Slug</dt>
        <dd><code class="wrap-anywhere">${r.slug}</code></dd>
      </div>
      <div>
        <dt>State</dt>
        <dd>
          ${stateBadge(r.approvalStatus === "APPROVED" ? "approved" : "in-review")}
        </dd>
      </div>
    </dl>
    ${token === null
      ? html`<p class="muted">
          This form cannot be rendered without a session token. Reload the page.
        </p>`
      : html`<form method="post" action="/admin/queue" class="stack">
          ${csrfInput(CSRF_FIELD, token)}
          <input type="hidden" name="submissionId" value="${r.id}">
          ${textareaField({
            id: `reason-${r.id}`,
            name: "reason",
            label: "Reason",
            required: needsReason,
            hint: needsReason
              ? html`Required for anything except approving. Stored on the audit record.`
              : html`Optional when approving. Stored on the audit record.`,
            rows: 2,
          })}
          <div class="actions">
            ${verbs.map((v) =>
              button(DECISIONS[v].label, {
                name: "decision",
                value: v,
                variant: v === "approve" ? "primary" : "ghost",
                // See the note on `novalidate` in ui/components.ts. The shared
                // textarea is `required` for this card because at least one of
                // its verbs needs a reason; without this, that requirement also
                // blocked the verb that deliberately does not.
                novalidate: !DECISIONS[v].needsReason,
              }),
            )}
          </div>
        </form>`}
  `);
}

/** The result of the last decision, read from the query string. Deliberately
 *  a small vocabulary rather than free text: anything reflected out of a URL
 *  into a page is an injection surface, and a fixed set of keys has none. */
function flag(flags: { done: string | null; problem: string | null }): Html {
  const MESSAGES: Record<string, string> = {
    approved: "Approved. It goes live at the next catalogue build, not now.",
    revision_requested: "Changes requested. The listing is back with the producer as a draft.",
    rejected: "Rejected, with your reason on the record.",
    removed_by_editor: "Taken down. The row and its click history are kept.",
  };
  const PROBLEMS: Record<string, string> = {
    csrf: "That form was not carrying a valid token for your session. Nothing changed. Reload and try again.",
    malformed: "That request was missing a listing or a decision. Nothing changed.",
    reason: "That decision needs a reason of at least a few words. Nothing changed.",
    gone: "That listing no longer exists. Nothing changed.",
    nochange: "That listing was already in the state you asked for. Nothing was written.",
    write: "The database refused the write. Nothing changed. Try again, and tell someone if it repeats.",
  };

  if (flags.done && MESSAGES[flags.done]) {
    return html`<div class="notice-done" role="status" tabindex="-1" autofocus>
      <p class="notice-done-title">${MESSAGES[flags.done]}</p>
    </div>`;
  }
  if (flags.problem && PROBLEMS[flags.problem]) {
    return html`<div class="notice-done" role="alert" tabindex="-1" autofocus>
      <p class="notice-done-title">${PROBLEMS[flags.problem]}</p>
    </div>`;
  }
  return html``;
}
