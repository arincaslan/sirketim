/**
 * From departments/web-development/lib/affiliate-site-kit/lib/affiliate-links.ts
 * (see that kit's README for the pattern this file follows).
 *
 * PLACEHOLDER DATA ONLY - no real affiliate-program enrollment exists yet
 * (see departments/sales/affiliate-program-signup-checklist.md). Every
 * destinationUrl below is a clearly-marked placeholder. Content never
 * embeds a raw destination URL - it references an id via <AffiliateLink id="...">,
 * which resolves here, and app/go/[slug]/route.ts is the single redirect
 * chokepoint.
 */

export interface AffiliateLinkEntry {
  destinationUrl: string;
  network: string;
  label: string;
}

export const affiliateLinks: Record<string, AffiliateLinkEntry> = {
  "dossier-ambrosia": {
    destinationUrl: "https://example.com/aff/dossier/ambrosia?tag=REPLACE_ME",
    network: "placeholder",
    label: "Dossier - Ambrosia",
  },
  "microperfumes-amber-nights": {
    destinationUrl: "https://example.com/aff/microperfumes/amber-nights?tag=REPLACE_ME",
    network: "placeholder",
    label: "MicroPerfumes - Amber Nights",
  },
  "alt-blue-cedar": {
    destinationUrl: "https://example.com/aff/alt-fragrances/blue-cedar?tag=REPLACE_ME",
    network: "placeholder",
    label: "ALT. Fragrances - Blue Cedar",
  },
  "dossier-aromatic-blue": {
    destinationUrl: "https://example.com/aff/dossier/aromatic-blue?tag=REPLACE_ME",
    network: "placeholder",
    label: "Dossier - Aromatic Blue",
  },
  "alt-bright": {
    destinationUrl: "https://example.com/aff/alt-fragrances/bright?tag=REPLACE_ME",
    network: "placeholder",
    label: "ALT. Fragrances - Bright",
  },
  "regency-midnight-bloom": {
    destinationUrl: "https://example.com/aff/regency/midnight-bloom?tag=REPLACE_ME",
    network: "placeholder",
    label: "Regency Fragrances - Midnight Bloom",
  },
  "divain-111": {
    destinationUrl: "https://example.com/aff/divain/no-111?tag=REPLACE_ME",
    network: "placeholder",
    label: "Divain - No. 111",
  },
  "parfum-inspirations-mademoiselle-rose": {
    destinationUrl: "https://example.com/aff/parfum-inspirations/mademoiselle-rose?tag=REPLACE_ME",
    network: "placeholder",
    label: "Parfum Inspirations - Mademoiselle Rose",
  },
  "divain-823": {
    destinationUrl: "https://example.com/aff/divain/no-823?tag=REPLACE_ME",
    network: "placeholder",
    label: "Divain - No. 823",
  },
  "microperfumes-tobacco-amber": {
    destinationUrl: "https://example.com/aff/microperfumes/tobacco-amber?tag=REPLACE_ME",
    network: "placeholder",
    label: "MicroPerfumes - Tobacco Amber",
  },
  "regency-sandalwood-33": {
    destinationUrl: "https://example.com/aff/regency/sandalwood-33?tag=REPLACE_ME",
    network: "placeholder",
    label: "Regency Fragrances - Sandalwood 33",
  },
  "hkperfumes-santal-leather": {
    destinationUrl: "https://example.com/aff/hkperfumes/santal-leather?tag=REPLACE_ME",
    network: "placeholder",
    label: "hkPerfumes - Santal Leather",
  },

  /* Buy-the-original links. Added for the marketplace pivot
   * (MARKETPLACE-PLAN.md §1): DRYDOWN earns commission whichever way the
   * buyer goes, so the reference fragrance needs its own outbound link, not
   * just the dupes it is compared against. Same placeholder status as every
   * entry above - no retailer program is enrolled. */
  "original-baccarat-rouge-540": {
    destinationUrl: "https://example.com/aff/original/baccarat-rouge-540?tag=REPLACE_ME",
    network: "placeholder",
    label: "Maison Francis Kurkdjian - Baccarat Rouge 540",
  },
  "original-bleu-de-chanel": {
    destinationUrl: "https://example.com/aff/original/bleu-de-chanel?tag=REPLACE_ME",
    network: "placeholder",
    label: "Chanel - Bleu de Chanel",
  },
  "original-black-opium": {
    destinationUrl: "https://example.com/aff/original/black-opium?tag=REPLACE_ME",
    network: "placeholder",
    label: "Yves Saint Laurent - Black Opium",
  },
  "original-coco-mademoiselle": {
    destinationUrl: "https://example.com/aff/original/coco-mademoiselle?tag=REPLACE_ME",
    network: "placeholder",
    label: "Chanel - Coco Mademoiselle",
  },
  "original-tobacco-vanille": {
    destinationUrl: "https://example.com/aff/original/tobacco-vanille?tag=REPLACE_ME",
    network: "placeholder",
    label: "Tom Ford - Tobacco Vanille",
  },
  "original-santal-33": {
    destinationUrl: "https://example.com/aff/original/santal-33?tag=REPLACE_ME",
    network: "placeholder",
    label: "Le Labo - Santal 33",
  },
};

/**
 * Resolve a link id to its destination.
 *
 * Originals follow an `original-<slug>` convention and there are now dozens of
 * them across the seven houses in lib/data/references.ts. Rather than hand-
 * maintain an entry per fragrance while every destination is still a
 * placeholder, unknown `original-` ids fall back to a generated placeholder of
 * the same clearly-fake shape as the explicit entries above.
 *
 * This is a build-time convenience, not a shipping behaviour: once real
 * retailer programs are enrolled, each original needs a real entry with its
 * real tracking URL, and this fallback should become a hard failure so a
 * missing program is loud instead of silently redirecting a buyer (and our
 * commission) to nowhere. `network: "placeholder"` is the flag to key that
 * check off.
 */
export function resolveAffiliateLink(id: string): AffiliateLinkEntry | undefined {
  const explicit = affiliateLinks[id];
  if (explicit) return explicit;

  // Placeholder-phase fallback. Covers both `original-<slug>` buy-the-original
  // links and producer listing ids added since this map was written.
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
