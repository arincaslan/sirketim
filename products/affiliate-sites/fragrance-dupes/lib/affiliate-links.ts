/**
 * From departments/web-development/lib/affiliate-site-kit/lib/affiliate-links.ts
 * (see that kit's README for the pattern this file follows).
 *
 * NO AFFILIATE PROGRAMME IS ENROLLED YET, so this map is empty and every id
 * resolves to a clearly-marked placeholder via the fallback below.
 *
 * It previously held 18 explicit entries. Twelve of them named producer
 * products that do not exist - "Dossier Ambrosia", "ALT. Bright",
 * "ALT. Blue Cedar" and so on - invented names attributed to real,
 * currently-operating companies. They were removed 2026-08-27 along with the
 * listings themselves; see lib/dupes-data.ts for the verification that
 * prompted it. The remaining six were `original-*` placeholders that the
 * fallback already covers.
 *
 * Content never embeds a raw destination URL - it references an id via
 * <AffiliateLink id="...">, which resolves here, and app/go/[slug]/route.ts is
 * the single redirect chokepoint. That indirection is what makes swapping in
 * real programme URLs a data change rather than a content rewrite.
 */

export interface AffiliateLinkEntry {
  destinationUrl: string;
  network: string;
  label: string;
}

/**
 * Real, enrolled programme links. Empty until FINALIZATION-GUIDE.md phase 3.
 *
 * When populating this, note the shape has to grow: Awin and CJ both need a
 * network click URL with the destination URL-encoded inside it, so a real
 * entry needs `network` + a merchant id + the deep link, not one bare string.
 */
export const affiliateLinks: Record<string, AffiliateLinkEntry> = {};

/**
 * Resolve a link id to its destination.
 *
 * While no programme is enrolled, unknown ids fall back to a generated
 * placeholder of an obviously-fake shape (`example.com`, `tag=REPLACE_ME`) so
 * that /go/[slug] still 302s somewhere inspectable during development instead
 * of 404ing.
 *
 * This is a build-time convenience, not shipping behaviour. Once real
 * programmes are enrolled this fallback must become a hard failure, so a
 * missing programme is loud rather than silently sending a buyer - and our
 * commission - to nowhere. `network: "placeholder"` is the flag to key that
 * check off, and `hasRealAffiliateLink()` below is what the UI uses meanwhile.
 */
export function resolveAffiliateLink(id: string): AffiliateLinkEntry | undefined {
  const explicit = affiliateLinks[id];
  if (explicit) return explicit;

  if (/^[a-z0-9-]+$/.test(id)) {
    const isOriginal = id.startsWith("original-");
    const slug = isOriginal ? id.slice("original-".length) : id;
    return {
      destinationUrl: `https://example.com/aff/${isOriginal ? "original" : "listing"}/${slug}?tag=REPLACE_ME`,
      network: "placeholder",
      label: slug,
    };
  }

  return undefined;
}

/**
 * Whether an id resolves to a real, enrolled programme link.
 *
 * The UI calls this before rendering any buy button. A button that leads to
 * `example.com` is worse than no button on a public site: it reads as broken
 * to a visitor and as low quality to the merchant reviewing our affiliate
 * application. Components render an honest "not available yet" state instead.
 *
 * This becomes meaningful on its own the moment the first real entry lands -
 * enrolled merchants get buttons, un-enrolled ones stay quiet, with no further
 * code change.
 */
export function hasRealAffiliateLink(id: string | undefined): boolean {
  if (!id) return false;
  const link = resolveAffiliateLink(id);
  return Boolean(link) && link!.network !== "placeholder";
}
