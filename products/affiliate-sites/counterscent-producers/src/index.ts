/**
 * The Counterscent producer console, on its own origin.
 *
 * WHAT THIS WAS ON 2026-09-14: a skeleton that told the truth by having
 * nothing behind any surface - no accounts, no sign-in, no way to submit
 * anything. That house rule (a feature whose backing service does not exist
 * yet must say so at the point of use, never a fake success) has not
 * changed; what changed on 2026-09-16 (build steps 5 and 6) is that part of
 * this origin now has a backing service. Accounts and sign-in are real: POST
 * /sign-in stores an expiring, single-use token and emails a link (gated on
 * whether the mail secret is actually set - see src/lib/mailer.ts), GET
 * /verify consumes it once and starts a session, and this Worker now holds a
 * real (if minimal) connection to the database provisioned 2026-09-14. Step 6
 * wired /console to that session: it reads who you are and renders one of
 * three real screens, including your own listings if a producer record is
 * attached to your address. What is still exactly a skeleton: /review, which
 * stays unwired because it needs an access-control story first - there is no
 * role column on User and it is currently linked from a public page.
 *
 * WHAT IT WILL BE: the rest of build steps 6 and 7 of HANDOFF.md - the submit
 * form and the per-listing verbs (withdraw, request an edit), then the admin
 * approval queue. Nothing on this origin can submit a listing today, and
 * every screen that would carry that verb says so where the button is.
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
import { producerPlan } from "./routes/plan";
import { adminOverview } from "./routes/admin";
import { adminQueue, adminDecide } from "./routes/admin-queue";
import { adminPeople, adminAttach } from "./routes/admin-people";
import { reviewQueue } from "./routes/review";
import { robots } from "./routes/robots";
import { signIn, signInSubmit } from "./routes/sign-in";
import { verify } from "./routes/verify";
import { signOut } from "./routes/sign-out";
import { submitPage, submitListing } from "./routes/submit";
import { withdrawPage, withdrawSubmit } from "./routes/withdraw";
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
  // Takes (req, env) and returns its own Response rather than being wrapped in
  // page() here, for the same reason "/" does: it reads the session, and the
  // signed-in branches carry a real sign-out <form>, so it has to decide its
  // own `form-action` grant. A route whose CSP is chosen by the table cannot
  // do that without the table knowing who is signed in.
  "/console": { GET: (req, env) => producerConsole(req, env) },
  // The two authenticated writes this origin accepts. Both are POST-only for
  // the act itself and GET for the screen that precedes it, so neither can be
  // triggered by a link, an image, or a prefetch.
  "/console/submit": {
    GET: (req, env) => submitPage(req, env),
    POST: (req, env) => submitListing(req, env),
  },
  "/console/withdraw": {
    GET: (req, env) => withdrawPage(req, env),
    POST: (req, env) => withdrawSubmit(req, env),
  },
  // GET only, and that is the honest shape rather than an omission. Moving
  // tier is a mailto today because no payment provider is connected, so there
  // is nothing here to POST to; see the header comment in routes/plan.ts for
  // why a request table was rejected. When billing lands this gains a POST and
  // the `allowForms` grant arrives with it.
  "/console/plan": { GET: (req, env) => producerPlan(req, env) },
  // Async now, because it reads the session to decide whether to render the
  // console nav. That is a navigation affordance, NOT a guard - see the header
  // comment in routes/review.ts before assuming this route is protected.
  // Behind requireAdmin since 2026-09-18, and it returns its own Response now
  // (the gate's refusal is a 404 or a 503, which the router must not re-wrap
  // as a 200). See the header comment in routes/review.ts.
  "/review": { GET: (req, env) => reviewQueue(req, env) },

  // THE ADMIN SURFACE. Every one of these calls requireAdmin() as its first
  // statement and returns that refusal untouched; the router grants no
  // privilege of its own. `allowForms` is decided inside each handler rather
  // than here, because the GET pages that carry a decision form need it and
  // the refusal screens deliberately do not.
  "/admin": { GET: (req, env) => adminOverview(req, env) },
  "/admin/queue": {
    GET: (req, env) => adminQueue(req, env),
    POST: (req, env) => adminDecide(req, env),
  },
  "/admin/people": {
    GET: (req, env) => adminPeople(req, env),
    POST: (req, env) => adminAttach(req, env),
  },
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
