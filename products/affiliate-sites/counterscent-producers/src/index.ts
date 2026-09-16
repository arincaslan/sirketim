/**
 * The Counterscent producer console, on its own origin.
 *
 * WHAT THIS WAS ON 2026-09-14: a skeleton that told the truth by having
 * nothing behind any surface - no accounts, no sign-in, no way to submit
 * anything. That house rule (a feature whose backing service does not exist
 * yet must say so at the point of use, never a fake success) has not
 * changed; what changed on 2026-09-16 (build step 5) is that part of this
 * origin now has a backing service. Accounts and sign-in are real: POST
 * /sign-in stores an expiring, single-use token and emails a link (gated on
 * whether the mail secret is actually set - see src/lib/mailer.ts), GET
 * /verify consumes it once and starts a session, and this Worker now holds a
 * real (if minimal) connection to the database provisioned 2026-09-14. What
 * is still exactly a skeleton: /console and /review. Both remain unwired to
 * the session this step built - see their own files and src/routes/verify.ts
 * for why that is deliberate, not an oversight, until build steps 6 and 7.
 *
 * WHAT IT WILL BE: build steps 6 and 7 of HANDOFF.md - the producer console
 * (submit, list, withdraw, request an edit, see status) and the admin
 * approval queue.
 *
 * ---------------------------------------------------------------------------
 * THE ARCHITECTURE, AND WHAT WAS REJECTED
 * ---------------------------------------------------------------------------
 *
 * A hand-written Worker that renders HTML on the server, plus static assets
 * (one stylesheet, one small script, two fonts) served straight from the
 * edge. No framework, no client-side application, no build step beyond the
 * bundling wrangler already does.
 *
 * 1. REJECTED: one template literal in this file, which is what it was.
 *    It does not survive the second page. The head, the header and the
 *    footer duplicate immediately, and the 404 had already grown its own
 *    private copy of the colour palette.
 *
 * 2. REJECTED: a fresh Next app on a current version with an adapter.
 *    The board's stated reason for avoiding it is real - the catalogue is
 *    pinned to Next 14, `@opennextjs/cloudflare` dropped Next 14, and a
 *    framework here would import that version question into a new project.
 *    But the stronger reason is what this application actually is: roughly
 *    eight server-rendered screens of forms and tables behind a session. A
 *    framework would buy routing, RSC and image optimisation, none of which
 *    is the hard part. The hard parts are session cookies, an append-only
 *    audit trail, a review queue and an export that refuses to emit what it
 *    cannot classify. All of those are plain Worker code either way, and a
 *    framework would add a build step and several hundred transitive
 *    dependencies to a repository the founder reviews by hand.
 *
 * 3. REJECTED, AND THIS IS A DEPARTURE FROM THE BOARD'S RECORDED LEAN: a
 *    static React UI (the "static UI plus a hand-written Worker" half of
 *    HANDOFF's architecture note) talking to a JSON API on this Worker.
 *    A single-page application forces a JSON API and a client-held auth
 *    story on an app whose every screen is a form post and a table. It
 *    doubles the surface to maintain (an API and a client that must agree),
 *    it moves the assembly of a producer's listing state into the browser
 *    rather than the server that owns it, and it makes `Cache-Control:
 *    no-store` and per-role rendering harder rather than easier. Server-
 *    rendered HTML with progressive enhancement is strictly simpler here and
 *    has a smaller attack surface. So: Worker yes, static ASSETS yes, static
 *    single-page app no.
 *
 * The cost of choice 3 is worth naming: there is no CSS pipeline, so
 * public/assets/console.css is a hand-maintained copy of the catalogue's
 * design tokens rather than a generated one. That file says so at the top.
 * It is the right trade at this size and the wrong one past a few hundred
 * lines.
 *
 * ---------------------------------------------------------------------------
 *
 * THIS ORIGIN IS NEVER INDEXED. A producer console has no business in search
 * results: its pages are either private or meaningless to a reader, and an
 * indexed sign-in page under the Counterscent name is a phishing template
 * somebody else gets to use. Enforced by the `X-Robots-Tag` header on every
 * response (src/lib/http.ts) and, for the static assets that never reach this
 * Worker, by public/_headers. See src/routes/robots.ts for why robots.txt
 * says Allow rather than Disallow; that is not an oversight.
 */

import { page, SECURITY_HEADERS } from "./lib/http";
import { health } from "./routes/health";
import { notFound } from "./routes/not-found";
import { overview } from "./routes/overview";
import { producerConsole } from "./routes/console";
import { reviewQueue } from "./routes/review";
import { robots } from "./routes/robots";
import { signIn, signInSubmit } from "./routes/sign-in";
import { verify } from "./routes/verify";
import { signOut } from "./routes/sign-out";
import type { Env } from "./lib/env";

type Handler = (request: Request, env: Env) => Response | Promise<Response>;

/**
 * Every path this origin answers, and which HTTP methods it takes. A table
 * rather than a chain of ifs, so adding a screen (or a verb on an existing
 * one) is one or two lines and the whole surface is readable at once.
 *
 * Widened from a GET-only table to this shape in step 5, when POST /sign-in
 * and POST /sign-out became the first two real writes this origin has ever
 * accepted. The `Allow` header on a 405 (below) is now built from this
 * table's own keys rather than a hardcoded string, so it cannot drift from
 * what a route actually supports.
 */
const ROUTES: Record<string, Partial<Record<"GET" | "POST", Handler>>> = {
  "/": { GET: (req, env) => overview(req, env) },
  "/sign-in": { GET: (req, env) => signIn(req, env), POST: (req, env) => signInSubmit(req, env) },
  "/verify": { GET: (req, env) => verify(req, env) },
  "/sign-out": { POST: (req, env) => signOut(req, env) },
  "/console": { GET: () => page(producerConsole()) },
  "/review": { GET: () => page(reviewQueue()) },
  "/robots.txt": { GET: robots },
  "/health": { GET: health },
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method === "HEAD" ? "GET" : request.method;

    // One canonical URL per page. "/console/" and "/console" being two
    // addresses for one screen is the kind of thing that turns into two
    // entries in a log and one confusing bug report.
    if (url.pathname.length > 1 && url.pathname.endsWith("/")) {
      const canonical = url.pathname.replace(/\/+$/, "") || "/";
      if (canonical in ROUTES) {
        return new Response(null, {
          status: 301,
          headers: { Location: canonical + url.search, ...SECURITY_HEADERS },
        });
      }
    }

    const route = ROUTES[url.pathname];
    if (!route) {
      // 404s rather than falling through to the overview. A catch-all that
      // returns 200 for any path tells a crawler every typo is a real page,
      // which is the same reason the catalogue sets `not_found_handling` to
      // "404-page" instead of serving index.html for unknown URLs.
      return page(notFound(), 404);
    }

    const handler = route[method as "GET" | "POST"];
    if (!handler) {
      // A 405 with an Allow header, not a 404: a 404 on a POST invites a
      // retry against a different path, a 405 says this address exists and
      // names what it does take.
      const allowed = Object.keys(route).join(", ");
      return new Response(`This address does not accept ${request.method}.`, {
        status: 405,
        headers: {
          Allow: allowed,
          "Content-Type": "text/plain; charset=utf-8",
          ...SECURITY_HEADERS,
        },
      });
    }

    return handler(request, env);
  },
};
