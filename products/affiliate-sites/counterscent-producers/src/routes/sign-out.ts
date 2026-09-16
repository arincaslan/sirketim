import { redirect } from "../lib/http";
import type { Env } from "../lib/env";
import { db } from "../lib/db";
import { clearSessionCookieHeader, deleteSession, readSessionCookie } from "../lib/auth";

/**
 * POST "/sign-out" - deletes the Session row (best-effort - a missing
 * database connection should not stop the cookie from clearing, since the
 * cookie is the one thing this Worker can always act on regardless of the
 * database's state) and clears the cookie unconditionally.
 *
 * The form that posts here lives on "/" (src/routes/overview.ts), shown only
 * when a real session is detected - there is nowhere else on this origin
 * that currently renders a "you are signed in" state to hang a sign-out
 * control off of. See overview.ts's own comment.
 */
export async function signOut(request: Request, env: Env): Promise<Response> {
  const token = readSessionCookie(request);
  if (token) {
    const sql = db(env);
    if (sql) {
      await deleteSession(sql, token);
    }
  }
  return redirect("/", { setCookie: clearSessionCookieHeader() });
}
