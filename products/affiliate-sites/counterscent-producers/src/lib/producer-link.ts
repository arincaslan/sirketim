import { NETWORK_HOSTS } from "../generated/network-hosts";

/**
 * ============================================================================
 * A DELIBERATE PORT, WITH A NAMED SOURCE.
 * ============================================================================
 *
 * Source of truth:
 *   products/affiliate-sites/fragrance-dupes/lib/producer-link.ts
 *
 * That file's own header says two places call this and both are required: the
 * producer console at submit time so a producer finds out immediately, and the
 * export step before a link is written into the generated redirect table. This
 * is the first of those two callers, in a project with no import path to the
 * second. Same register as the mark in src/ui/layout.ts and the tokens in
 * public/assets/console.css, both of which are documented hand copies for the
 * same reason: this origin is a separate Worker with a separate deploy, and
 * coupling the two builds would undo the property the second origin exists to
 * protect.
 *
 * WHAT IS NOT COPIED: the host list. NETWORK_HOSTS is generated out of the
 * catalogue's array by scripts/generate-constants.mjs, because it is the part
 * most likely to drift - it grows every time a new network or shortener turns
 * up, and a console validating against last month's copy would accept a link
 * the export step later refuses, leaving a producer with a submission that
 * passed and then could not publish.
 *
 * ----------------------------------------------------------------------------
 * WHICH CHECKS RUN HERE, AND THE ONE THAT CANNOT
 * ----------------------------------------------------------------------------
 *
 * RUNS:  empty, not-a-url, not-https, has-credentials, affiliate-network (the
 *        networks and the shorteners), and the query-parameter normalisation
 *        that strips campaign ids and the fragment.
 *
 * DOES NOT RUN:  `not-own-domain`.
 *
 * Not an omission and not a relaxation. The catalogue's version takes a
 * `storeDomain` argument described as "the domain recorded when the producer
 * was approved", and THERE IS NO SUCH COLUMN. `Producer` in
 * prisma/migrations/20260914092338_init_producer_programme/migration.sql
 * carries id, slug, name, blurb, isHouse, contactEmail, createdAt, updatedAt,
 * and nothing that records where a producer sells. Adding one is a migration,
 * which this phase is barred from. So the check has no input, and inventing
 * one - deriving a "store domain" from the first link a producer happens to
 * submit - would be worse than not running it: it would enforce a rule against
 * a value we made up, and it would let the first submission define the domain
 * every later one is measured against.
 *
 * WHAT IS LOST BY ITS ABSENCE, said plainly rather than left for somebody to
 * discover: this cannot stop a producer linking to a product page on a domain
 * that is not theirs. PRODUCER-TERMS section 8 states the rule contractually
 * and a reviewer reads every submission before it publishes, so the rule is
 * enforced by a person rather than by this function. PRODUCER-TERMS' own
 * cross-reference table was corrected on 2026-09-16 to say so, because it
 * credited the whole of section 8 to this function and only part of it is true.
 */

export type ProducerLinkRejection =
  | "empty"
  | "not-a-url"
  | "not-https"
  | "has-credentials"
  | "affiliate-network";

export interface ProducerLinkResult {
  ok: boolean;
  /** The normalised URL to store. Only set when ok. */
  url?: string;
  reason?: ProducerLinkRejection;
  /** One sentence, safe to show a producer verbatim. */
  message?: string;
}

function hostMatches(host: string, domain: string): boolean {
  const h = host.toLowerCase().replace(/^www\./, "");
  const d = domain.toLowerCase().replace(/^www\./, "");
  return h === d || h.endsWith(`.${d}`);
}

export function validateProducerLink(raw: string): ProducerLinkResult {
  const value = (raw ?? "").trim();
  if (!value) {
    return { ok: false, reason: "empty", message: "Add the link to this product on your store." };
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return {
      ok: false,
      reason: "not-a-url",
      message: "That is not a full web address. Paste the complete link, starting with https://",
    };
  }

  if (url.protocol !== "https:") {
    return {
      ok: false,
      reason: "not-https",
      message: "The link has to be https. We do not send readers to an unencrypted page.",
    };
  }

  // user:pass@host in a product URL is either a mistake or an attempt to
  // confuse the visible host. Either way it is not a product page.
  if (url.username || url.password) {
    return {
      ok: false,
      reason: "has-credentials",
      message: "Remove the username or password from the link.",
    };
  }

  if (NETWORK_HOSTS.some((h) => hostMatches(url.hostname, h))) {
    return {
      ok: false,
      reason: "affiliate-network",
      message:
        "That is a tracking or shortened link, not a product page. Link to the product on your " +
        "own store: we do not route readers through another network's attribution.",
    };
  }

  // Normalise away the fragment and any tracking parameters the producer's own
  // site added, so two submissions of the same product compare equal and we do
  // not republish somebody else's campaign ids.
  url.hash = "";
  for (const p of [...url.searchParams.keys()]) {
    if (/^(utm_|fbclid|gclid|msclkid|mc_|_ga|ref|aff)/i.test(p)) url.searchParams.delete(p);
  }

  return { ok: true, url: url.toString() };
}

/**
 * The `/go/` id a published producer listing would carry.
 *
 * Ported unchanged, and used on this origin only to TELL a producer which
 * identifier stops resolving when they withdraw. Nothing here mints one: the
 * catalogue's export step owns that, and a withdrawn identifier is never
 * reissued, because clicks already made can still pay out weeks later inside
 * an affiliate network's cookie window.
 */
export function producerLinkId(producerSlug: string, listingSlug: string): string {
  return `producer-${producerSlug}-${listingSlug}`;
}
