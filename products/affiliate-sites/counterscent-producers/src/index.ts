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
import { companyPage, createCompany } from "./routes/company";
import { submitPage, submitListing } from "./routes/submit";
import { withdrawPage, withdrawSubmit } from "./routes/withdraw";
import { accountsPage, accountsDisconnect } from "./routes/accounts";
import { oauthStart, oauthCallback } from "./routes/oauth";
import { mediaObject } from "./routes/media";
import { PROVIDERS, type ProviderId } from "./lib/providers";
import type { FlowMode } from "./lib/oauth";
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
/**
 * "link" when the flow was started from /console/accounts, "signin" otherwise.
 *
 * Read here rather than inside the handler so both modes are visible in the
 * routing table, which is where somebody looks to find out what a path does.
 * Anything other than the exact string "link" is treated as "signin": an
 * unrecognised mode must never fall into the one that can attach a provider
 * identity to a live session.
 */
function flowModeFrom(request: Request): FlowMode {
  return new URL(request.url).searchParams.get("mode") === "link" ? "link" : "signin";
}

/**
 * /auth/<provider>/start and /auth/<provider>/callback, GENERATED FROM THE
 * PROVIDER TABLE rather than typed out.
 *
 * src/lib/providers.ts promises that adding a third provider is a data change
 * there and a code change nowhere. Enumerating four literal paths here would
 * have made that promise false the day it was written, and the failure mode is
 * the quiet one: the button renders, the route 404s, and nothing connects the
 * two symptoms. Deriving the paths from PROVIDERS keeps the promise mechanical.
 *
 * Every path exists for every KNOWN provider, configured or not. An
 * unconfigured one answers 404 from inside oauthStart(), which is the same
 * answer a reader gets for a provider this origin has never heard of - see that
 * function for why 404 rather than 503.
 */
const AUTH_ROUTES: Record<string, Partial<Record<"GET" | "POST", Handler>>> = Object.fromEntries(
  (Object.keys(PROVIDERS) as ProviderId[]).flatMap((id) => [
    ["/auth/" + id + "/start", { GET: (req: Request, env: Env) => oauthStart(req, env, id, flowModeFrom(req)) }],
    ["/auth/" + id + "/callback", { GET: (req: Request, env: Env) => oauthCallback(req, env, id) }],
  ]),
);

const ROUTES: Record<string, Partial<Record<"GET" | "POST", Handler>>> = {
  ...AUTH_ROUTES,
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
  // THE FIRST STEP EVERY NEW ACCOUNT TAKES, and until 2026-09-19 it did not
  // exist: nothing in this Worker could create a `Producer` row, so every
  // account that signed in was permanently stuck on a screen saying no company
  // was attached to it. See the header of routes/company.ts for why the manual
  // step it replaces was safe to drop - in short, the listing queue is the
  // identity gate and it was being applied twice.
  "/console/company": {
    GET: (req, env) => companyPage(req, env),
    POST: (req, env) => createCompany(req, env),
  },
  // The authenticated writes this origin accepts. All are POST-only for the
  // act itself and GET for the screen that precedes it, so none can be
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
  // HOW YOU SIGN IN. Session-gated but NOT producer-gated, because every
  // account on production today has no producer attached, and changing how you
  // sign in must not wait on creating a company. The POST is disconnect only;
  // connecting is a GET to /auth/<provider>/start?mode=link, and the header of
  // routes/oauth.ts explains why that asymmetry is deliberate.
  "/console/accounts": {
    GET: (req, env) => accountsPage(req, env),
  },
  "/console/accounts/disconnect": {
    POST: (req, env) => accountsDisconnect(req, env),
  },
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

/**
 * Paths whose EXISTENCE is not public, listed here because the router has to
 * answer for them before any handler runs.
 *
 * This is not the access control - requireAdmin() inside each handler is, and
 * removing a path from this set would leak the address without granting
 * anything. It exists because two router-level answers fire before a handler
 * is ever chosen (the trailing-slash canonicaliser and the 405), and both used
 * to distinguish a real administrative path from a typo for an anonymous
 * caller.
 *
 * Keep it in step with the `admin: true` entries in ui/layout.ts NAV_ITEMS and
 * with every route that calls requireAdmin(). A path missing from here is a
 * disclosure bug, not a crash, which is exactly why it needs saying.
 */
const GATED_PATHS = new Set(["/admin", "/admin/queue", "/admin/people", "/review"]);

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method === "HEAD" ? "GET" : request.method;

    // One canonical URL per page. "/console/" and "/console" being two
    // addresses for one screen is the kind of thing that turns into two
    // entries in a log and one confusing bug report.
    //
    // REDIRECTS UNCONDITIONALLY, AND THAT IS A SECURITY FIX RATHER THAN A
    // TIDY-UP. This used to redirect only when the stripped path was `in
    // ROUTES`, which made the status code an oracle: `/admin/` answered 301
    // and `/wibble/` answered 404, so an anonymous stranger could enumerate
    // every real path on the origin - including the administrative ones -
    // without ever reaching requireAdmin(). Confirmed against production on
    // 2026-09-18 before the fix.
    //
    // Stripping first and letting the ordinary lookup decide costs nothing:
    // an unknown path now redirects once and then 404s, which is the same
    // answer by a slightly longer road, and every path answers alike.
    if (url.pathname.length > 1 && url.pathname.endsWith("/")) {
      const canonical = url.pathname.replace(/\/+$/, "") || "/";
      return new Response(null, {
        status: 301,
        headers: { Location: canonical + url.search, ...SECURITY_HEADERS },
      });
    }

    // THE ONE PREFIX ROUTE. Everything else on this origin is an exact path,
    // and ROUTES is a plain lookup table because of it - there is no matcher,
    // no parameter syntax and no ordering to reason about. An uploaded
    // photograph cannot be an exact path: its key carries a UUID, so it is
    // matched here, ahead of the table, rather than turning the table into a
    // pattern list for one caller.
    //
    // GET only, by omission rather than by a 405: this address is not a write
    // endpoint and never will be - uploads arrive through the submit form,
    // which is where the quota, the session and the review queue are. A POST
    // here falls through to the ordinary 404 below.
    if (method === "GET" && url.pathname.startsWith("/media/")) {
      return mediaObject(request, env);
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
      // THE GATED PATHS GET THE ORDINARY 404 INSTEAD, because a 405 is an
      // admission. `DELETE /admin/queue` answered "405, Allow: GET, POST" to
      // anybody at all, which confirms the address is real AND names the two
      // verbs worth attacking - all of it before requireAdmin() is reached,
      // since there is no handler for the method to call. `DELETE /wibble`
      // answered 404. Verified against production on 2026-09-18.
      //
      // For these paths the whole point is that a stranger cannot tell them
      // from a typo, so they answer the same way for every method. Everything
      // else keeps the 405 and the reasoning below it, which is still right
      // for a public address.
      if (GATED_PATHS.has(url.pathname)) return page(notFound(), 404);

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
