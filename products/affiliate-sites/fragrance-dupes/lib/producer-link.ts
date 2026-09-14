/**
 * What a producer's outbound link has to survive before it can reach a page.
 *
 * TWO PLACES CALL THIS AND BOTH ARE REQUIRED. The producer console calls it at
 * submit time so a producer finds out immediately; the export step calls it again
 * before writing a link into the generated table. Submit-time validation alone is
 * not enough - the row can be edited, imported, or written by an earlier version
 * of the console - and export-time alone is not enough either, because by then the
 * producer is not there to fix it.
 *
 * WHY THE EXPORT STEP CANNOT JUST TRUST THE ROW. `scripts/generate-redirects.mjs`
 * runs in `prebuild`, so it runs on Cloudflare's builder for the PUBLIC site. It
 * throws on a link it cannot classify - deliberately, because a silently dropped
 * buy button is worse than a failed build. But that means **a single malformed
 * producer link would fail the deploy of the whole catalogue**, taking 620 working
 * affiliate redirects and 247 pages down with it. The exporter must therefore
 * refuse to emit what it cannot classify, and leave the listing unpublished,
 * rather than hand the problem to a build step whose only move is to abort.
 *
 * None of this is about distrusting producers. It is that the blast radius of a
 * bad row is the entire site, and the person who pasted it will not be watching.
 */

/** Why a link was refused. Kept as a union so the console can show real copy. */
export type ProducerLinkRejection =
  | "empty"
  | "not-a-url"
  | "not-https"
  | "has-credentials"
  | "not-own-domain"
  | "affiliate-network";

export interface ProducerLinkResult {
  ok: boolean;
  /** The normalised URL to store and emit. Only set when ok. */
  url?: string;
  reason?: ProducerLinkRejection;
  /** One sentence, safe to show a producer verbatim. */
  message?: string;
}

/**
 * Hosts that mean "this is somebody's affiliate link, not a product page".
 *
 * THE ATTACK THIS BLOCKS IS NOT HYPOTHETICAL AND IT IS NOT EVEN DISHONEST. A
 * producer pastes the tracking link they use everywhere else - their own affiliate
 * programme's, or worse, one belonging to a third party. We would then route our
 * readers through somebody else's attribution, earn nothing, and publish a link
 * whose destination we do not control and which can be re-pointed after approval
 * without touching anything we can see.
 *
 * It also catches the subtler version: a subscriber on a no-commission tier
 * quietly supplying an affiliate link so that OUR traffic credits THEIR affiliate
 * account twice over.
 *
 * This list is the networks we already know by their click domains, plus the
 * common shorteners, which are refused for the same reason - a link whose
 * destination can change after we approved it is not a link we can publish.
 */
const NETWORK_HOSTS = [
  // Awin
  "awin1.com", "awin.com", "zenaps.com",
  // CJ / Commission Junction
  "dpbolvw.net", "jdoqocy.com", "tkqlhce.com", "anrdoezrs.net", "kqzyfj.com",
  "ftjcfx.com", "cj.dotomi.com", "commission-junction.com", "cj.com",
  // Other large networks
  "shareasale.com", "shrsl.com", "impact.com", "impactradius.com",
  "rakutenadvertising.com", "linksynergy.com", "partnerize.com", "prf.hn",
  "amazon-adsystem.com", "sovrn.co", "viglink.com", "skimresources.com",
  // Shorteners: the destination can change after approval
  "bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly", "rebrand.ly", "cutt.ly",
];

function hostMatches(host: string, domain: string): boolean {
  const h = host.toLowerCase().replace(/^www\./, "");
  const d = domain.toLowerCase().replace(/^www\./, "");
  return h === d || h.endsWith(`.${d}`);
}

/**
 * Validate a producer's product URL against the store domain on their account.
 *
 * `storeDomain` is the domain recorded when the producer was approved, e.g.
 * "opulensi.com". Requiring the link to live on it is what stops the classic
 * marketplace swap - approved pointing at product A, re-pointed at product B, or
 * at a different site entirely, after nobody is looking. A producer who genuinely
 * moves domains asks us, which is a conversation rather than a silent redirect.
 */
export function validateProducerLink(
  raw: string,
  storeDomain: string
): ProducerLinkResult {
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

  // user:pass@host in a product URL is either a mistake or an attempt to confuse
  // the visible host. Either way it is not a product page.
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
        "own store - we do not route readers through another network's attribution.",
    };
  }

  if (!hostMatches(url.hostname, storeDomain)) {
    return {
      ok: false,
      reason: "not-own-domain",
      message: `The link has to be on ${storeDomain}, the store on your account. Tell us first if you have moved domains.`,
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
 * The `/go/` id for a producer listing.
 *
 * NAMESPACED, and this repo has already paid for getting it wrong: both originals
 * merchants once keyed `original-<slug>` and collided on 91 of 123 ids, where
 * spread order silently decided which retailer survived and the other's links
 * vanished with no error anywhere. Producer ids carry both the producer and the
 * listing because listing slugs are only unique PER PRODUCER (see
 * @@unique([producerId, slug]) in prisma/schema.prisma).
 */
export function producerLinkId(producerSlug: string, listingSlug: string): string {
  return `producer-${producerSlug}-${listingSlug}`;
}
