import { text } from "../lib/http";

/**
 * CRAWLING IS ALLOWED HERE, AND THAT IS HOW THIS ORIGIN STAYS UNINDEXED.
 *
 * This reads backwards, so the reasoning is worth keeping. `Disallow: /` is
 * the wrong instrument for "never appears in search": it stops a crawler
 * FETCHING the page, which means it never sees the `X-Robots-Tag: noindex`
 * header this Worker sends on every response - and a disallowed URL can
 * still be listed, URL-only, on the strength of a link from somewhere else.
 * The combination that actually removes a page is the opposite one: let the
 * crawler in, and tell it not to index what it finds.
 *
 * There is a second, concrete reason not to send Disallow from here. This
 * zone has Cloudflare's managed robots.txt turned on, which PREPENDS its own
 * `User-agent: * / Allow: /` block (plus the AI-crawler rules) to whatever we
 * return - verified 2026-09-14 against both this origin and counterscent.com.
 * A `Disallow: /` underneath that produces two contradictory groups for the
 * same user-agent in one file, resolved differently by different crawlers. A
 * file that argues with itself is worse than either answer.
 *
 * The managed block's AI-training rules are wanted and left alone. The
 * marketing pages that describe the programme live on the catalogue at
 * /producers and /producers/pricing, and those ARE meant to be indexed.
 *
 * (Moved here from src/index.ts when the origin was restructured into
 * routes. The reasoning moved with it on purpose: it is the kind of decision
 * a future reader would otherwise "fix" back to Disallow.)
 */
export function robots(): Response {
  return text(
    "# Crawling is permitted so that the X-Robots-Tag: noindex header on\n" +
      "# every response can actually be read. Disallowing here would hide\n" +
      "# that header and leave the URL indexable from external links.\n" +
      "User-agent: *\n" +
      "Allow: /\n",
  );
}
