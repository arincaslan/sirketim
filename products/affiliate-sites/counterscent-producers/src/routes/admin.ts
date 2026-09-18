import { html, type Html } from "../lib/html";
import { page } from "../lib/http";
import { layout } from "../ui/layout";
import { emptyState, section, tableBlock } from "../ui/components";
import type { Env } from "../lib/env";
import { requireAdmin } from "../lib/admin";
import type { Sql } from "../lib/auth";

/**
 * "/admin" - what is on the site right now, in one screen.
 *
 * FOUNDER INSTRUCTION 2026-09-18: "we are the admin who has every power to
 * monitor this affiliate site." This page is the monitoring half; the deciding
 * half is /admin/queue and the account half is /admin/people.
 *
 * IT IS A READ, AND ONLY A READ. There is no form on it and it asks for no
 * `allowForms` CSP grant. Every number here is a link to the screen where the
 * corresponding thing can actually be changed, which keeps one rule: the page
 * that tells you something is wrong is never also the page that quietly lets
 * you change it on the way past.
 *
 * WHY THE COUNTS ARE ONE QUERY PER QUESTION RATHER THAN ONE CLEVER ONE. A
 * single pivot would be faster and would be the thing nobody can read in six
 * months. There are four producers-worth of data here at most for a long time;
 * the query budget is not the constraint, and a count somebody can check by
 * eye against the table underneath it is worth more than a saved round trip.
 */
export async function adminOverview(request: Request, env: Env): Promise<Response> {
  const gate = await requireAdmin(request, env);
  if (gate.kind === "refused") return gate.response;
  const { sql, auth } = gate;

  let data: Overview;
  try {
    data = await loadOverview(sql);
  } catch (e) {
    return page(readFailed(e), 503);
  }

  return page(
    layout({
      title: "Admin",
      heading: "Everything, at a glance",
      nav: { current: "admin", showAdmin: true, showReview: true },
      status: {
        label: "Admin",
        tone: "solid",
        note: html`You are signed in as
          <span class="wrap-anywhere">${auth.email ?? ""}</span>, which is on this
          deployment's administrator list. Nothing on this screen changes anything.`,
      },
      standfirst: html`Producers, accounts and every listing state, read live. The numbers
        link to the screens that can act on them.`,
      body: html`
        ${section({
          heading: "Waiting on you",
          lede: html`The only two numbers on this page that represent an obligation rather
            than a fact.`,
          body: html`
            <div class="grid-2">
              ${statCard({
                label: "Listings awaiting a decision",
                value: data.pending,
                href: "/admin/queue",
                cta: "Open the queue",
                zero: "Nothing is waiting. The queue is empty.",
              })}
              ${statCard({
                label: "Accounts with no producer attached",
                value: data.unattachedUsers,
                href: "/admin/people",
                cta: "Attach an account",
                zero: "Every account that exists is attached to a company.",
              })}
            </div>
          `,
        })}

        ${section({
          heading: "Listings by state",
          lede: html`Approval status is what we decided. Publish state is where the listing
            actually is. They are different questions and a listing can be approved without
            being live, because the catalogue is a static export.`,
          body: html`
            <div class="stack">
              ${tableBlock({
                label: "Approval status",
                columns: ["Status", "Listings"],
                rows: data.byApproval.map((r) => ({
                  cells: [
                    { content: html`${r.key}`, rowHeader: true },
                    { content: html`${String(r.n)}` },
                  ],
                })),
                empty: emptyState({
                  headline: "No submissions exist yet",
                  because: html`Nothing has ever been submitted to this deployment. The
                    queue, the states and the counts all fill in from the first one.`,
                }),
              })}
              ${tableBlock({
                label: "Publish state",
                columns: ["State", "Listings"],
                rows: data.byPublish.map((r) => ({
                  cells: [
                    { content: html`${r.key}`, rowHeader: true },
                    { content: html`${String(r.n)}` },
                  ],
                })),
                empty: emptyState({
                  headline: "Nothing to place yet",
                  because: html`Publish state is recorded per submission, and there are
                    none.`,
                }),
              })}
            </div>
          `,
        })}

        ${section({
          heading: "The register",
          body: html`
            <div class="grid-2">
              ${statCard({
                label: "Producers on file",
                value: data.producers,
                href: "/admin/people",
                cta: "See producers",
                zero: "No producer records exist yet.",
              })}
              ${statCard({
                label: "Accounts that have signed in",
                value: data.users,
                href: "/admin/people",
                cta: "See accounts",
                zero: "Nobody has ever signed in.",
              })}
            </div>
          `,
        })}

        ${section({
          heading: "The last thing that happened",
          lede: html`Read from the append-only event log, newest first. Every state change
            on this origin is attributed to a person, to us, or to an automated check.`,
          body: tableBlock({
            label: "Recent audit events",
            columns: ["When", "Action", "Who", "How"],
            rows: data.events.map((e) => ({
              cells: [
                { content: html`${e.at}`, rowHeader: true },
                { content: html`${e.action}` },
                { content: html`<span class="wrap-anywhere">${e.actor}</span>` },
                { content: html`${e.channel ?? "not recorded"}` },
              ],
            })),
            empty: emptyState({
              headline: "The log is empty",
              because: html`No listing has changed state on this deployment yet. This table
                is the first place to look when one has.`,
            }),
          }),
        })}
      `,
    }),
  );
}

/** A number with somewhere to go. The zero case gets its own sentence rather
 *  than a bare 0, because "0 waiting" and "nothing has ever been submitted"
 *  look identical as a digit and mean completely different things. */
function statCard(o: {
  label: string;
  value: number;
  href: string;
  cta: string;
  zero: string;
}): Html {
  return html`<div class="card">
    <p class="plan-panel-label">${o.label}</p>
    <p class="plan-now-name">${String(o.value)}</p>
    ${o.value === 0
      ? html`<p class="muted">${o.zero}</p>`
      : html`<p class="door-action"><a class="btn btn-primary" href="${o.href}">${o.cta}</a></p>`}
  </div>`;
}

/* ---------------------------------------------------------------------- *
 * Reading
 * ---------------------------------------------------------------------- */

interface Overview {
  pending: number;
  unattachedUsers: number;
  producers: number;
  users: number;
  byApproval: { key: string; n: number }[];
  byPublish: { key: string; n: number }[];
  events: { at: string; action: string; actor: string; channel: string | null }[];
}

async function loadOverview(sql: Sql): Promise<Overview> {
  const [[pending], [unattached], [producers], [users], byApproval, byPublish, events] =
    await Promise.all([
      sql`SELECT count(*)::int AS n FROM "Submission" WHERE "approvalStatus" = 'PENDING'`,
      sql`SELECT count(*)::int AS n FROM "User" WHERE "producerId" IS NULL`,
      sql`SELECT count(*)::int AS n FROM "Producer"`,
      sql`SELECT count(*)::int AS n FROM "User"`,
      sql`SELECT "approvalStatus" AS key, count(*)::int AS n FROM "Submission"
          GROUP BY "approvalStatus" ORDER BY "approvalStatus"`,
      sql`SELECT "publishState" AS key, count(*)::int AS n FROM "Submission"
          GROUP BY "publishState" ORDER BY "publishState"`,
      sql`SELECT action, "actorId", channel, "createdAt" FROM "AuditEvent"
          ORDER BY "createdAt" DESC LIMIT 12`,
    ]);

  return {
    pending: Number((pending as { n: number }).n),
    unattachedUsers: Number((unattached as { n: number }).n),
    producers: Number((producers as { n: number }).n),
    users: Number((users as { n: number }).n),
    byApproval: (byApproval as { key: string; n: number }[]).map((r) => ({
      key: r.key,
      n: Number(r.n),
    })),
    byPublish: (byPublish as { key: string; n: number }[]).map((r) => ({
      key: r.key,
      n: Number(r.n),
    })),
    events: (events as { action: string; actorId: string; channel: string | null; createdAt: unknown }[]).map(
      (r) => ({
        at: formatWhen(r.createdAt),
        action: r.action,
        actor: r.actorId,
        channel: r.channel,
      }),
    ),
  };
}

/** ISO date only. Not a relative "3 hours ago": this is an audit surface, and
 *  a relative string is unusable the moment somebody quotes it in an email. */
export function formatWhen(v: unknown): string {
  if (v instanceof Date) return v.toISOString().slice(0, 16).replace("T", " ");
  const s = String(v ?? "");
  return s.length >= 16 ? s.slice(0, 16).replace("T", " ") : s;
}

function readFailed(e: unknown): Html {
  return layout({
    title: "Admin",
    heading: "The database did not answer",
    nav: { current: "admin", showAdmin: true, showReview: true },
    status: {
      label: "Read failed",
      tone: "outline",
      note: html`Nothing was written. Loading a page never changes anything here.`,
    },
    body: section({
      heading: "What happened",
      body: html`
        <div class="stack">
          <p class="muted">
            <code>${e instanceof Error ? e.message : String(e)}</code>
          </p>
          <p>Reloading is worth one try. <a href="/console">Back to the console</a>.</p>
        </div>
      `,
    }),
  });
}
