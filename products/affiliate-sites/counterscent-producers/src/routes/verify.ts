import { html } from "../lib/html";
import { page, redirect } from "../lib/http";
import { layout } from "../ui/layout";
import { section } from "../ui/components";
import type { Env } from "../lib/env";
import { db } from "../lib/db";
import { consumeVerificationToken, createSession, findOrCreateUser, setSessionCookieHeader } from "../lib/auth";

/**
 * "/verify" - the magic-link callback. Not linked from anywhere on this
 * origin; the only way here is the URL emailed by POST /sign-in.
 *
 * REDIRECTS TO "/", NOT "/console", ON SUCCESS. That is a deliberate
 * deviation from the obvious "sign in, land where you'll work" flow, and the
 * reason is step 6, not this step: /console (src/routes/console.ts) still
 * unconditionally renders "Not signed in... there is no account system on
 * this origin" - it does not call the session-check helper this step built,
 * on purpose, because wiring it in is step 6's job. Sending a freshly
 * authenticated producer straight to a page that would then tell them,
 * falsely, that they are signed out is worse than sending them to the
 * overview instead, which DOES reflect real session state (src/routes/
 * overview.ts). Revisit this redirect target when step 6 lands.
 */
export async function verify(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const rawToken = url.searchParams.get("token");

  if (!rawToken) {
    return page(
      layout({
        title: "Sign-in link",
        heading: "This link is missing something",
        body: section({
          heading: "No token in the address",
          body: html`<p>
            The link is incomplete - a full email client should not produce this. Request a new one from
            <a href="/sign-in">sign in</a>.
          </p>`,
        }),
      }),
      400,
    );
  }

  const sql = db(env);
  if (!sql) {
    return page(
      layout({
        title: "Sign-in link",
        heading: "This cannot be verified right now",
        body: section({
          heading: "No database connection",
          body: html`<p>
            This Worker has no database connection configured, so no token can be looked up. Nothing was
            signed in.
          </p>`,
        }),
      }),
      503,
    );
  }

  const identifier = await consumeVerificationToken(sql, rawToken);
  if (!identifier) {
    return page(
      layout({
        title: "Sign-in link",
        heading: "This link has expired or was already used",
        body: section({
          heading: "Links work once, and only for 15 minutes",
          body: html`<p>
            That is by design - a link that could be reused is worth stealing, one that cannot is not.
            Request a new one from <a href="/sign-in">sign in</a>.
          </p>`,
        }),
      }),
      410,
    );
  }

  const user = await findOrCreateUser(sql, identifier);
  const session = await createSession(sql, user.id);

  return redirect("/", { setCookie: setSessionCookieHeader(session.token, session.expires) });
}
