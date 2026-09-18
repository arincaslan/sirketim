import { html, type Html } from "../lib/html";
import { page } from "../lib/http";
import { layout } from "../ui/layout";
import {
  button,
  card,
  csrfInput,
  emptyState,
  section,
  selectField,
  tableBlock,
} from "../ui/components";
import type { Env } from "../lib/env";
import { requireAdmin } from "../lib/admin";
import { CSRF_FIELD, csrfToken, verifyCsrf } from "../lib/csrf";
import type { Sql } from "../lib/auth";
import { formatWhen } from "./admin";

/**
 * "/admin/people" - producers, the accounts that sign in, and the one action
 * that connects them.
 *
 * ============================================================================
 * THE ATTACH FORM REPLACES HAND-WRITTEN SQL, WHICH IS THE POINT OF IT.
 * ============================================================================
 *
 * findOrCreateUser() deliberately never creates a Producer row: attaching an
 * inbox to a real business is a decision about identity and a person makes it.
 * That decision was real and the mechanism was not - until now it meant
 * someone opening a psql session against production and writing an UPDATE by
 * hand. That is the worst possible way to run a privileged, routine operation:
 * no audit trail, no confirmation of what it matched, no protection against a
 * mistyped id, and it happens at exactly the moment a new producer is waiting.
 *
 * WHAT THE FORM REFUSES TO DO, and why each refusal is here rather than left
 * to care:
 *
 *   - IT WILL NOT REASSIGN AN ALREADY-ATTACHED ACCOUNT. Moving a user from one
 *     producer to another silently changes who owns a set of listings. The
 *     select only offers unattached accounts, AND the handler re-checks, so
 *     the guarantee does not rest on the select being rendered honestly.
 *   - IT WILL NOT INVENT A PRODUCER. The producer must already exist. Creating
 *     a company record is a different decision from connecting an inbox to one
 *     and collapsing them into a single form would make the careless path the
 *     easy one.
 *
 * DETACHING IS NOT HERE ON PURPOSE. `User.producerId` is SetNull on delete, so
 * detaching is reachable if it is ever genuinely needed, but a one-click
 * detach in an admin panel is how somebody loses access to their own listings
 * by misclick. When there is a real reason to detach, it should arrive with
 * its own confirmation screen saying what the account will lose.
 */

/* ---------------------------------------------------------------------- *
 * GET
 * ---------------------------------------------------------------------- */

export async function adminPeople(request: Request, env: Env): Promise<Response> {
  const gate = await requireAdmin(request, env);
  if (gate.kind === "refused") return gate.response;

  const url = new URL(request.url);
  return renderPeople(request, gate.sql, {
    done: url.searchParams.get("done"),
    problem: url.searchParams.get("problem"),
  });
}

/* ---------------------------------------------------------------------- *
 * POST - attach an account to a producer
 * ---------------------------------------------------------------------- */

export async function adminAttach(request: Request, env: Env): Promise<Response> {
  const gate = await requireAdmin(request, env);
  if (gate.kind === "refused") return gate.response;
  const { sql } = gate;

  const form = await request.formData();
  if (!(await verifyCsrf(request, "admin-attach", asString(form.get(CSRF_FIELD))))) {
    return redirect("/admin/people?problem=csrf");
  }

  const userId = asString(form.get("userId"));
  const producerId = asString(form.get("producerId"));
  if (!userId || !producerId) return redirect("/admin/people?problem=malformed");

  try {
    // RE-CHECKED SERVER-SIDE, not trusted from the select. A rendered <option>
    // is a suggestion; this is the guarantee. `producerId IS NULL` in the
    // WHERE clause is what makes the write refuse to reassign rather than
    // merely decline to offer it.
    const rows = (await sql`
      UPDATE "User"
      SET "producerId" = ${producerId}
      WHERE id = ${userId}
        AND "producerId" IS NULL
        AND EXISTS (SELECT 1 FROM "Producer" WHERE id = ${producerId})
      RETURNING id
    `) as { id: string }[];

    if (rows.length === 0) return redirect("/admin/people?problem=refused");
    return redirect("/admin/people?done=attached");
  } catch {
    return redirect("/admin/people?problem=write");
  }
}

function redirect(to: string): Response {
  return new Response(null, { status: 303, headers: { Location: to } });
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

interface ProducerRow {
  id: string;
  name: string;
  slug: string;
  tier: string | null;
  subStatus: string | null;
  listings: number;
  live: number;
  accounts: number;
  createdAt: unknown;
}
interface UserRow {
  id: string;
  email: string | null;
  producerId: string | null;
  producerName: string | null;
}

async function renderPeople(
  request: Request,
  sql: Sql,
  flags: { done: string | null; problem: string | null },
): Promise<Response> {
  const token = await csrfToken(request, "admin-attach");

  let producers: ProducerRow[] = [];
  let users: UserRow[] = [];
  try {
    producers = (await sql`
      SELECT p.id, p.name, p.slug, p."createdAt",
             sub.tier AS tier, sub.status AS "subStatus",
             (SELECT count(*)::int FROM "Submission" s WHERE s."producerId" = p.id) AS listings,
             (SELECT count(*)::int FROM "Submission" s WHERE s."producerId" = p.id AND s."publishState" = 'LIVE') AS live,
             (SELECT count(*)::int FROM "User" u WHERE u."producerId" = p.id) AS accounts
      FROM "Producer" p
      LEFT JOIN "Subscription" sub ON sub."producerId" = p.id
      ORDER BY p."createdAt" DESC
    `) as ProducerRow[];

    users = (await sql`
      SELECT u.id, u.email, u."producerId", p.name AS "producerName"
      FROM "User" u
      LEFT JOIN "Producer" p ON p.id = u."producerId"
      ORDER BY (u."producerId" IS NOT NULL), u.email
    `) as UserRow[];
  } catch (e) {
    return page(
      layout({
        title: "Producers and accounts",
        heading: "That could not be read",
        nav: { current: "people", showAdmin: true },
        status: { label: "Read failed", tone: "outline", note: html`Nothing was written.` },
        body: section({
          heading: "What happened",
          body: html`<p class="muted"><code>${e instanceof Error ? e.message : String(e)}</code></p>`,
        }),
      }),
      503,
    );
  }

  const unattached = users.filter((u) => u.producerId === null);

  return page(
    layout({
      title: "Producers and accounts",
      heading: "Producers and accounts",
      nav: { current: "people", showAdmin: true },
      status: {
        label: "Admin",
        tone: "solid",
        note: html`Attaching an account to a producer is the one write on this screen. It
          cannot reassign an account that is already attached, and it cannot create a
          company.`,
      },
      standfirst: html`Every company record, every inbox that has ever signed in, and which
        of them are connected.`,
      body: html`
        ${flag(flags)}

        ${section({
          heading: "Attach an account to a producer",
          lede: html`This is the step that turns a signed-in stranger into a producer who
            can submit. Every account starts unattached, by design.`,
          body:
            unattached.length === 0
              ? emptyState({
                  headline: "Every account is already attached",
                  because: html`Nobody is waiting. A new account appears here the first time
                    somebody signs in with an address we have never seen.`,
                })
              : producers.length === 0
                ? emptyState({
                    headline: "There is no producer to attach anyone to",
                    because: html`${String(unattached.length)} account${unattached.length === 1 ? " is" : "s are"}
                      waiting, but no Producer row exists yet. A company record has to be
                      created before an inbox can be connected to one, and that is
                      deliberately not a button on this page.`,
                  })
                : token === null
                  ? html`<p class="muted">No session token. Reload the page.</p>`
                  : card(html`
                      <form method="post" action="/admin/people" class="stack">
                        ${csrfInput(CSRF_FIELD, token)}
                        ${selectField({
                          name: "userId",
                          label: "Account",
                          required: true,
                          emptyLabel: "Choose an account",
                          hint: html`Only accounts with no producer attached are listed.
                            Reassigning an attached account would silently change who owns a
                            set of listings, so it is not offered here and the handler
                            refuses it as well.`,
                          options: unattached.map((u) => ({
                            value: u.id,
                            label: u.email ?? u.id,
                          })),
                        })}
                        ${selectField({
                          name: "producerId",
                          label: "Producer",
                          required: true,
                          emptyLabel: "Choose a producer",
                          hint: html`The company record this inbox will be able to submit
                            and withdraw listings for.`,
                          options: producers.map((p) => ({
                            value: p.id,
                            label: `${p.name} (${p.slug})`,
                          })),
                        })}
                        <div class="actions">${button("Attach this account")}</div>
                      </form>
                    `),
        })}

        ${section({
          heading: "Producers",
          body: tableBlock({
            label: "Producers on file",
            columns: ["Producer", "Plan", "Listings", "Live", "Accounts", "Since"],
            rows: producers.map((p) => ({
              cells: [
                {
                  content: html`${p.name}<span class="cell-sub">${p.slug}</span>`,
                  rowHeader: true,
                },
                {
                  content: p.tier
                    ? html`${p.tier}<span class="cell-sub">${(p.subStatus ?? "").toLowerCase()}</span>`
                    : html`<span class="cell-sub">no plan on file</span>`,
                },
                { content: html`${String(p.listings)}` },
                { content: html`${String(p.live)}` },
                { content: html`${String(p.accounts)}` },
                { content: html`${formatWhen(p.createdAt)}` },
              ],
            })),
            empty: emptyState({
              headline: "No producers yet",
              because: html`No company record exists on this deployment. Producers are
                created by hand after a conversation, which is why there is no signup form
                anywhere on this origin.`,
            }),
          }),
        })}

        ${section({
          heading: "Accounts",
          lede: html`Every address that has ever completed a sign-in. Unattached ones are
            listed first, because they are the ones waiting on us.`,
          body: tableBlock({
            label: "Accounts",
            columns: ["Address", "Attached to"],
            rows: users.map((u) => ({
              cells: [
                {
                  content: html`<span class="wrap-anywhere">${u.email ?? u.id}</span>`,
                  rowHeader: true,
                },
                {
                  content: u.producerName
                    ? html`${u.producerName}`
                    : html`<span class="cell-sub">not attached</span>`,
                },
              ],
            })),
            empty: emptyState({
              headline: "Nobody has signed in yet",
              because: html`An account row is created the first time somebody completes a
                magic-link sign-in. None has been completed on this deployment.`,
            }),
          }),
        })}
      `,
    }),
    200,
    { allowForms: true },
  );
}

function flag(flags: { done: string | null; problem: string | null }): Html {
  const MESSAGES: Record<string, string> = {
    attached: "Attached. That account can now submit and withdraw for its producer.",
  };
  const PROBLEMS: Record<string, string> = {
    csrf: "That form was not carrying a valid token for your session. Nothing changed.",
    malformed: "That request was missing an account or a producer. Nothing changed.",
    refused:
      "Nothing was attached. Either that account is already attached to a producer, or the producer no longer exists. Both are refused rather than overwritten.",
    write: "The database refused the write. Nothing changed.",
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
