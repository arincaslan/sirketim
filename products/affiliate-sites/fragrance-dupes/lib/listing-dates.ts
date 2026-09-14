import { LISTING_FIRST_LIVE } from "@/lib/data/listing-dates.generated";

/**
 * When each dupe listing first went live, and what that is a claim about.
 *
 * `DupeCandidate` deliberately has no date field. The 79 hand-authored
 * listings would have needed 79 back-filled guesses, and a producer listing
 * would have needed the exporter to stamp one — a fourth thing it can get
 * wrong, on a path whose failure mode is the whole site's deploy. Git already
 * holds the answer exactly, for both kinds, and cannot be nudged by the party
 * being measured. See scripts/generate-listing-dates.mjs.
 *
 * FIRST LIVE, NOT APPROVED AND NOT SUBMITTED. Those three moments diverge by
 * days once a producer queue exists, and only one of them is true from the
 * reader's side:
 *
 *   submitted   the producer's fact. Belongs in the producer console. On the
 *               public site it would make "new" mean "new to our queue".
 *   approved    our fact, and the one the console must show. The catalogue is
 *               a static export, so approved is not live until the next
 *               build — printing it publicly would date a listing to a day on
 *               which nobody could have seen it.
 *   first live  the commit that put it into a build. What "newly added" on a
 *               public page actually asserts.
 *
 * The producer console will show all three, from the database. This module
 * exists so that the public site shows only the third and cannot accidentally
 * show one of the others.
 *
 * RESOLUTION IS A DAY, DELIBERATELY. The site rebuilds on a commit, not on a
 * clock, so "3 hours ago" would imply a freshness this publishing model does
 * not have. Render an absolute date.
 *
 * AN UNDATED LISTING IS A NORMAL LISTING. It ranks, renders and sells exactly
 * as any other; it is only excluded from the "recently added" surface. That is
 * the right failure direction — the alternative is inventing a date, and every
 * surface here is built on not inventing things. It also means a stale
 * generated file degrades to "the new listing is not in the new list", never
 * to a wrong date or a broken build.
 */

/** ISO date (YYYY-MM-DD) this listing first appeared in a build, or null. */
export function listingFirstLive(slug: string): string | null {
  return LISTING_FIRST_LIVE[slug] ?? null;
}

/** How many of `slugs` we can date. Used to caption a surface honestly rather
 *  than let a partial list read as the whole catalogue. */
export function datedCount(slugs: string[]): number {
  return slugs.filter((slug) => slug in LISTING_FIRST_LIVE).length;
}

/**
 * The most recent date any listing went live, or null when none is dated.
 *
 * This is the site's real freshness signal — the answer to "has anything
 * changed since I was last here" — and it is a fact about the catalogue
 * rather than about traffic, so nobody can move it without publishing
 * something that passed review.
 */
export function catalogLastUpdated(): string | null {
  const dates = Object.values(LISTING_FIRST_LIVE);
  if (dates.length === 0) return null;
  return dates.reduce((latest, d) => (d > latest ? d : latest));
}

/**
 * Render a YYYY-MM-DD as "5 September 2026".
 *
 * Fixed to en-GB and UTC on purpose: the same build output is served from
 * every Cloudflare edge, so a locale- or timezone-dependent format would make
 * the static HTML disagree with itself depending on where it was generated.
 */
export function formatListingDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
