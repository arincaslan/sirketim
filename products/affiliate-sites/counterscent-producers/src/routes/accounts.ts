/**
 * ============================================================================
 * /console/accounts - "How you sign in"
 * ============================================================================
 *
 * THIS PAGE EXISTS BECAUSE OF THE NO-AUTO-LINK RULE, and it is the only place
 * a provider can be attached to an account. src/lib/oauth-account.ts refuses to
 * join a provider identity to an existing account from the sign-in page; that
 * refusal is only reasonable if there is somewhere else to do it, and this is
 * it. The two ship together or neither should.
 *
 * IT IS NOT IN THE MAIN NAV, deliberately. The nav carries task items a
 * producer uses repeatedly (listings, submit, plan) and already ran out of
 * horizontal room once at 1440px, which is how "Producers and accounts" became
 * "People" on 2026-09-18. A settings page visited twice in an account's
 * lifetime does not belong in that bar. It is linked from the identity strip
 * instead, next to the address it is about, which is where somebody looks when
 * the question in their head is about their account rather than their work.
 *
 * IT DOES NOT REQUIRE A PRODUCER. requireProducer() is the wrong gate here:
 * every account on production today has no producer attached, and how they
 * sign in is exactly the thing they may want to change before creating a
 * company. Session only.
 */

import type { Env } from "../lib/env";
import { db } from "../lib/db";
import { html, type Html } from "../lib/html";
import { page, redirect } from "../lib/http";
import { layout } from "../ui/layout";
import { button, card, csrfInput, linkButton, section } from "../ui/components";
import { getAuthContext, type AuthUser } from "../lib/auth";
import { isAdminEmail } from "../lib/admin";
import { CSRF_FIELD, csrfToken, verifyCsrf } from "../lib/csrf";
import { configuredProviders, PROVIDERS, toProviderId, type ProviderId } from "../lib/providers";
import { listLinkedProviders, unlinkProvider } from "../lib/oauth-account";
import { accountWriteKey, bumpRateLimit, PRODUCER_WRITE_MAX, PRODUCER_WRITE_WINDOW_SECONDS } from "../lib/rate-limit";

/** What the page renders one row per. */
interface MethodRow {
  name: string;
  state: "always" | "connected" | "available";
  provider?: ProviderId;
  note: Html;
}

/* ---------------------------------------------------------------------- *
 * GET /console/accounts
 * ---------------------------------------------------------------------- */

export async function accountsPage(request: Request, env: Env): Promise<Response> {
  const auth = await getAuthContext(request, env);
  if (!auth) return redirect("/sign-in");

  const sql = db(env);
  if (!sql) return page(unreadable(auth), 503, { allowForms: true });

  let linked: ProviderId[];
  try {
    linked = (await listLinkedProviders(sql, auth.id)).map((l) => l.provider);
  } catch {
    return page(unreadable(auth), 503, { allowForms: true });
  }

  const configured = configuredProviders(env).map((p) => p.id);

  /**
   * THE UNION OF CONFIGURED AND LINKED, not just configured.
   *
   * A provider whose secrets are removed after somebody connected it would
   * otherwise vanish from this page while the Account row stayed in the
   * database - a connection the producer can see the effects of and cannot
   * remove. Rendering linked-but-unconfigured providers means disconnect is
   * always reachable for anything that is actually attached.
   */
  const shown: ProviderId[] = [];
  for (const id of [...configured, ...linked]) {
    if (!shown.includes(id)) shown.push(id);
  }

  const rows: MethodRow[] = [
    {
      name: "Email link",
      state: "always",
      note: html`A single-use link sent to <span class="wrap-anywhere">${auth.email}</span>. There is no
        password on this origin, so there is nothing to forget, reuse or leak. This method cannot be turned
        off, which is what makes disconnecting any of the others safe.`,
    },
    ...shown.map((id): MethodRow => {
      const isLinked = linked.includes(id);
      const label = PROVIDERS[id].label;
      return {
        name: label,
        state: isLinked ? "connected" : "available",
        provider: id,
        note: isLinked
          ? html`Signing in with ${label} brings you straight here. Your email link still works as well.`
          : html`Connect ${label} and you can use it to sign in instead of waiting for an email.`,
      };
    }),
  ];

  const token = await csrfToken(request, "disconnect-provider");
  const result = new URL(request.url).searchParams.get("result");

  return page(
    layout({
      title: "How you sign in",
      heading: "How you sign in",
      standfirst: html`The ways this account can prove it is you.`,
      nav: { showAdmin: isAdminEmail(auth.email, env) },
      body: html`
        ${resultNotice(result)}
        ${card(html`
          <h3>Sign-in methods</h3>
          <ul class="method-list">
            ${rows.map((r) => methodRow(r, token))}
          </ul>
        `)}
        ${section({
          heading: "Why connecting happens here and not on the sign-in page",
          body: html`
            <p>
              Pressing "Continue with Google" on the sign-in page will not attach Google to an account that
              already exists, even when the address matches exactly. It refuses and sends you here.
            </p>
            <p>
              That is on purpose. An address is a claim a third party makes about you; being signed in is
              proof you already hold the account. Connecting from inside a session means the two are joined
              by the person who owns both, rather than by whoever can get a provider to assert an address.
              Administrative access on this origin is granted by email address, so the difference is not
              theoretical.
            </p>
          `,
        })}
        ${section({
          heading: "What we keep",
          body: html`
            <p>
              The provider's own account identifier, and nothing else. No access token, no refresh token, no
              contact list, no profile. We ask the provider one question when you sign in and never speak to
              it again, so there is no stored credential of yours here to be taken.
            </p>
            <p>Disconnecting removes that identifier. It does not close your account or touch your listings.</p>
          `,
        })}
      `,
    }),
    200,
    { allowForms: true },
  );
}

/** One row. `connected` gets a disconnect form, `available` gets a link, and
 *  `always` gets neither because there is nothing to press. */
function methodRow(row: MethodRow, token: string | null): Html {
  let action: Html = html``;

  if (row.state === "connected" && row.provider && token) {
    action = html`<form method="post" action="/console/accounts/disconnect" class="actions">
      ${csrfInput(CSRF_FIELD, token)}
      <input type="hidden" name="provider" value="${row.provider}">
      ${button("Disconnect " + row.name, { variant: "ghost" })}
    </form>`;
  } else if (row.state === "available" && row.provider) {
    // A LINK, NOT A FORM. See the header of src/routes/oauth.ts: a form POST
    // that redirects to another origin runs into browser disagreement about
    // whether form-action is re-checked on the redirect, and this origin sets
    // form-action 'self'. The callback's state check is what defends this
    // flow, and it does so whichever verb began it.
    action = linkButton("/auth/" + row.provider + "/start?mode=link", "Connect " + row.name, { variant: "ghost" });
  }

  return html`<li class="method-row">
    <div class="method-main">
      <h4 class="method-name">${row.name}</h4>
      <p class="method-state${row.state === "available" ? " is-off" : ""}">${stateWord(row.state)}</p>
      <p class="method-note">${row.note}</p>
    </div>
    <div class="method-action">${action}</div>
  </li>`;
}

/** The word, not a coloured dot. A dot before every row is decoration that
 *  reads as status without carrying any, and a reader using a screen reader
 *  gets nothing from it at all. */
function stateWord(state: MethodRow["state"]): string {
  if (state === "always") return "Always on";
  return state === "connected" ? "Connected" : "Not connected";
}

function resultNotice(result: string | null): Html {
  if (!result) return html``;
  const messages: Record<string, string> = {
    linked: "Connected. You can use it to sign in from now on.",
    "already-linked": "That was already connected to this account. Nothing changed.",
    "claimed-elsewhere":
      "That account is already connected to a different Counterscent account, so it was not connected here. Nothing changed.",
    disconnected: "Disconnected. Your email link sign-in is unaffected.",
    "not-connected": "That was not connected to this account, so there was nothing to remove.",
  };
  const message = messages[result];
  if (!message) return html``;
  return html`<div class="notice"><p class="notice-title">${message}</p></div>`;
}

/* ---------------------------------------------------------------------- *
 * POST /console/accounts/disconnect
 * ---------------------------------------------------------------------- */

export async function accountsDisconnect(request: Request, env: Env): Promise<Response> {
  const auth = await getAuthContext(request, env);
  if (!auth) return new Response("Unauthorized", { status: 401 });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    // Guarded, because an unguarded formData() on a live route is the exact
    // bug that shipped a generic 500 on POST /sign-in and had to be fixed
    // against the production origin on 2026-09-16.
    return redirect("/console/accounts");
  }

  const submitted = form.get(CSRF_FIELD);
  if (!(await verifyCsrf(request, "disconnect-provider", typeof submitted === "string" ? submitted : null))) {
    return new Response("Forbidden", { status: 403 });
  }

  const raw = form.get("provider");
  const provider = typeof raw === "string" ? toProviderId(raw) : null;
  if (!provider) return redirect("/console/accounts");

  const sql = db(env);
  if (!sql) return page(unreadable(auth), 503, { allowForms: true });

  /**
   * RATE LIMITED, although it is authenticated and touches only the caller's
   * own row, because connect and disconnect each write an AuditEvent when the
   * account has a producer. A loop between the two is therefore unbounded
   * growth in the one table whose value is that everything in it is real.
   * Shares the account bucket rather than inventing a new one: it is the same
   * kind of write, by the same actor, for the same reason.
   */
  const limit = await bumpRateLimit(sql, {
    key: accountWriteKey(auth.id),
    windowSeconds: PRODUCER_WRITE_WINDOW_SECONDS,
    limit: PRODUCER_WRITE_MAX,
  });
  if (limit.kind === "limited" || limit.kind === "unavailable") {
    return page(writeRefused(auth), 429, { allowForms: true });
  }

  let removed: boolean;
  try {
    removed = await unlinkProvider(sql, auth, provider);
  } catch {
    return page(unreadable(auth), 503, { allowForms: true });
  }

  return redirect("/console/accounts?result=" + (removed ? "disconnected" : "not-connected"));
}

/* ---------------------------------------------------------------------- *
 * Refusals
 * ---------------------------------------------------------------------- */

function shell(auth: AuthUser, heading: string, body: Html): Html {
  return layout({
    title: heading,
    heading,
    standfirst: html`Signed in as <span class="wrap-anywhere">${auth.email}</span>.`,
    body,
  });
}

function unreadable(auth: AuthUser): Html {
  return shell(
    auth,
    "Sign-in methods are unreadable right now",
    section({
      heading: "Nothing was changed",
      body: html`
        <p>
          The database this page reads is not answering, so we cannot show which methods are connected, and
          nothing was connected or disconnected.
        </p>
        <p>
          Your existing sign-in methods are unaffected by this: they are read at sign-in, not from this
          page. Try again in a few minutes.
        </p>
        <div class="btn-row">${linkButton("/console", "Back to the console", { variant: "ghost" })}</div>
      `,
    }),
  );
}

function writeRefused(auth: AuthUser): Html {
  return shell(
    auth,
    "Too many changes in a short time",
    section({
      heading: "Nothing was changed",
      body: html`
        <p>
          This account has made ${PRODUCER_WRITE_MAX} changes in the last
          ${PRODUCER_WRITE_WINDOW_SECONDS / 60} minutes, which is the limit. Nothing was disconnected.
        </p>
        <p>Your sign-in methods are exactly as they were. Try again shortly.</p>
        <div class="btn-row">${linkButton("/console/accounts", "Back", { variant: "ghost" })}</div>
      `,
    }),
  );
}
