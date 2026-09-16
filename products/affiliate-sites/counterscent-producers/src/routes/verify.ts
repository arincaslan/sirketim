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
 * REDIRECTS TO "/console" ON SUCCESS, which is the ordinary "sign in, land
 * where you work" flow and needs no defending. It is worth saying what it
 * replaced, once, because the replaced version was right at the time: this
 * used to redirect to "/" because /console rendered "not signed in" to
 * everyone, including a request holding a valid session cookie, so landing a
 * freshly authenticated producer there would have told them their sign-in had
 * failed. Step 6 wired /console to getAuthContext(), that page now reads real
 * session state in all three of its forms, and the reason expired with it.
 *
 * Note what a producer sees on arrival, because it is not a dashboard:
 * findOrCreateUser() never attaches a Producer record, so a brand new account
 * lands on the "signed in, nothing attached yet" screen. That is the normal
 * first experience and /console is built to read as a waypoint rather than an
 * error. Attaching an inbox to a real company stays an editorial act.
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

  return redirect("/console", { setCookie: setSessionCookieHeader(session.token, session.expires) });
}
