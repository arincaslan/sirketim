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
};

export function resolveAffiliateLink(id: string): AffiliateLinkEntry | undefined {
  return affiliateLinks[id];
}
