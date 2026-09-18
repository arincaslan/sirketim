import { html, type Html } from "../lib/html";
import { page } from "../lib/http";
import { layout } from "../ui/layout";
import { disclosure, emptyState, section, tableBlock } from "../ui/components";
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
      nav: { current: "admin", showAdmin: true },
      status: {
        label: "Admin",
        tone: "solid",
        note: html`You are signed in as
          <span class="wrap-anywhere">${auth.email ?? ""}</span>, which is on this
          deployment's administrator list. Nothing on this screen changes anything.`,
      },
      // "EVERY NUMBER HERE LINKS TO THE SCREEN THAT CAN ACT ON IT" is what this
      // said, and it stopped being true in the same change that wrote it: the
      // register's two figures are deliberately not links now, because they are
      // facts rather than work. A standfirst describing an interaction the page
      // does not offer is the small end of the same habit as a button that does
      // nothing.
      standfirst: html`What is on the site right now, and what is waiting on you.`,
      body: html`
        ${
          // NO LEDE, AND THAT IS THE POINT OF THE HEADING. It read "the only two
          // numbers on this page that represent an obligation rather than a
          // fact", which is a sentence explaining why the section is called
          // "Waiting on you" to somebody who has just read "Waiting on you".
          // The hierarchy now carries it instead: these two are the only cards
          // on the page, they are the only figures with a button under them,
          // and a figure with work behind it takes a rule in the accent colour
          // that a settled one does not.
          section({
            heading: "Waiting on you",
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
          })
        }

        ${section({
          heading: "Listings by state",
          // THE TWO-ENUM EXPLANATION IS REFERENCE, not a lede. It is true, it is
          // the distinction this whole console is organised around, and an
          // administrator reads it once and then never again - which is the test
          // this repo applies before folding anything. It is also already on
          // /console under "Reference", in more detail, for the producer.
          body: html`
            <div class="stack">
              ${disclosure({
                summary: "Approval status and publish state are different questions",
                body: html`
                  <p>
                    Approval status is what we decided. Publish state is where the listing
                    actually is. A listing can be approved without being live, because the
                    catalogue is a static export and joins it at the next build.
                  </p>
                `,
              })}
              <div class="grid-2 table-pair">
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
            </div>
          `,
        })}

        ${
          // DEMOTED FROM TWO CARDS TO TWO FIGURES, deliberately. These were
          // rendered by the same statCard() as the two above, in the same
          // two-column grid, at the same 2.5rem - so "nobody is waiting on you"
          // and "here is how many producers exist" arrived with identical
          // weight, and the page had four equally loud numbers on it. Neither of
          // these is an obligation: they are the size of the register, and they
          // go to the same screen whichever one you click.
          section({
            heading: "The register",
            // THE LINK IS OUTSIDE THE <dl>. A <div> child of a definition list
            // has to contain dt/dd pairs, so a div holding only an anchor is
            // invalid there - the kind of thing that renders fine and fails
            // validation, which is how it survives.
            body: html`<div class="figure-row">
              <dl class="figures">
                ${figure({ label: "Producers on file", value: data.producers })}
                ${figure({ label: "Accounts that have signed in", value: data.users })}
              </dl>
              <p class="figure-link"><a href="/admin/people">Producers and accounts</a></p>
            </div>`,
          })
        }

        ${section({
          heading: "The last thing that happened",
          lede: html`The append-only event log, newest first. Every state change is attributed
            to a person, to us, or to an automated check.`,
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

/**
 * A number with work behind it, and somewhere to go and do it.
 *
 * The zero case gets its own sentence rather than a bare 0, because "0
 * waiting" and "nothing has ever been submitted" look identical as a digit and
 * mean completely different things.
 *
 * `.stat-label` / `.stat-value` RATHER THAN THE PLAN PANEL'S CLASSES. This
 * reached across and borrowed `.plan-panel-label` and `.plan-now-name` to
 * render a count of pending listings, which is the failure console.css calls
 * out beside `.summary-panel`: a class named after one caller and used by
 * three. `.plan-panel-label` had since been renamed and this was still asking
 * for it, so the label on the highest-priority figure on the admin panel was
 * being styled by a rule that no longer existed.
 *
 * `is-waiting` IS NOT DECORATION. It marks the cards that represent an
 * obligation, and it is applied from the value rather than by hand, so a card
 * cannot go on looking urgent after the queue empties. Colour is not the only
 * channel: the button under the number appears and disappears with it.
 */
function statCard(o: {
  label: string;
  value: number;
  href: string;
  cta: string;
  zero: string;
}): Html {
  return html`<div class="card stat-card${o.value === 0 ? "" : " is-waiting"}">
    <p class="stat-label">${o.label}</p>
    <p class="stat-value">${String(o.value)}</p>
    ${o.value === 0
      ? html`<p class="muted">${o.zero}</p>`
      : html`<p class="door-action"><a class="btn btn-primary" href="${o.href}">${o.cta}</a></p>`}
  </div>`;
}

/** A number that is a fact rather than a task: smaller, no card, no button of
 *  its own. A <div> of dt/dd pairs inside the <dl> keeps each label with its
 *  value, which is what lets the row wrap without a label landing over the
 *  wrong figure. */
function figure(o: { label: string; value: number }): Html {
  return html`<div class="figure">
    <dt class="stat-label">${o.label}</dt>
    <dd class="figure-value">${String(o.value)}</dd>
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
    nav: { current: "admin", showAdmin: true },
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
