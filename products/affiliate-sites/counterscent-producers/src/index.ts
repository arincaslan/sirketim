/**
 * The Counterscent producer console, on its own origin.
 *
 * WHAT THIS IS TODAY: a skeleton that tells the truth. There are no accounts,
 * no sign-in, and no way to submit anything, so what it serves is the shape
 * of the application with every surface saying plainly that nothing behind it
 * exists. That is deliberate and it is the house rule: a feature whose
 * backing service does not exist yet must say so at the point of use, never a
 * fake success and never a form that silently discards what someone typed
 * into it.
 *
 * WHAT IT WILL BE: build steps 5, 6 and 7 of HANDOFF.md - magic-link auth,
 * the producer console (submit, list, withdraw, request an edit, see status)
 * and the admin approval queue. The database is already provisioned (Neon,
 * 2026-09-14, ten tables) and this Worker is deliberately NOT connected to
 * it: nothing here reads or writes a row.
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
import { signIn } from "./routes/sign-in";

/**
 * Every path this origin answers. A table rather than a chain of ifs, so
 * adding a screen is one line and the whole surface is readable at once.
 */
const PAGES: Record<string, () => Response> = {
  "/": () => page(overview()),
  "/sign-in": () => page(signIn()),
  "/console": () => page(producerConsole()),
  "/review": () => page(reviewQueue()),
  "/robots.txt": robots,
  "/health": health,
};

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    /**
     * Nothing here accepts a write, and the answer to an attempted one
     * should say that rather than "not found". A 404 on a POST invites a
     * retry against a different path; a 405 with an Allow header does not.
     * When sign-in lands, this becomes a per-route method list.
     */
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("This origin accepts no writes. Nothing here can be submitted.", {
        status: 405,
        headers: {
          Allow: "GET, HEAD",
          "Content-Type": "text/plain; charset=utf-8",
          ...SECURITY_HEADERS,
        },
      });
    }

    // One canonical URL per page. "/console/" and "/console" being two
    // addresses for one screen is the kind of thing that turns into two
    // entries in a log and one confusing bug report.
    if (url.pathname.length > 1 && url.pathname.endsWith("/")) {
      const canonical = url.pathname.replace(/\/+$/, "") || "/";
      if (canonical in PAGES) {
        return new Response(null, {
          status: 301,
          headers: { Location: canonical + url.search, ...SECURITY_HEADERS },
        });
      }
    }

    const handler = PAGES[url.pathname];
    if (handler) return handler();

    // Everything else 404s rather than falling through to the overview. A
    // catch-all that returns 200 for any path tells a crawler every typo is
    // a real page, which is the same reason the catalogue sets
    // `not_found_handling` to "404-page" instead of serving index.html for
    // unknown URLs.
    return page(notFound(), 404);
  },
};
