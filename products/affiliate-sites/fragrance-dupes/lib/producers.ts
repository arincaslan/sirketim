import type { Producer } from "@/lib/types";

/**
 * Producer registry. Added for the marketplace pivot (MARKETPLACE-PLAN.md §3),
 * which makes sellers first-class rather than a bare `brand` string on each
 * dupe.
 *
 * FIXTURE DATA. These are real, currently-operating "inspired by" retailers
 * found in departments/sales/affiliate-program-signup-checklist.md's own
 * research, listed here so the browse-by-producer surface has something real
 * to render. None of them has signed up, subscribed, or submitted anything -
 * there is no producer account system yet, and no subscription billing (see
 * MARKETPLACE-PLAN.md §4). Treat every entry as illustrative until a real
 * producer actually enrolls.
 *
 * COUNTERSCENT's own line (`isHouse`) is the exception: it is ours, so it carries
 * no subscription and skips the approval queue entirely.
 */
export const PRODUCERS: Producer[] = [
  {
    slug: "counterscent-atelier",
    name: "Counterscent Atelier",
    blurb:
      "Our own line. Made in small batches and priced from what it actually costs us to make, with the margin stated plainly rather than buried.",
    isHouse: true,
  },
  {
    slug: "dossier",
    name: "Dossier",
    blurb: "Direct-to-consumer house with a broad catalog of designer-inspired compositions.",
  },
  {
    slug: "microperfumes",
    name: "MicroPerfumes",
    blurb: "Decant-focused retailer, useful for testing a match before committing to a full bottle.",
  },
  {
    slug: "alt-fragrances",
    name: "ALT. Fragrances",
    blurb: "Concentration-forward interpretations, usually at extrait strength.",
  },
  {
    slug: "regency-fragrances",
    name: "Regency Fragrances",
    blurb: "Long-running dupe house with a catalog weighted toward niche originals.",
  },
  {
    slug: "divain",
    name: "Divain",
    blurb: "Numbered-reference catalog covering a wide span of designer releases.",
  },
  {
    slug: "parfum-inspirations",
    name: "Parfum Inspirations",
    blurb: "Smaller catalog, concentrated on well-known feminine designer scents.",
  },
  {
    slug: "hkperfumes",
    name: "hkPerfumes",
    blurb: "Niche-leaning interpretations, including harder-to-dupe woody compositions.",
  },
];

export function getProducer(slug: string): Producer | undefined {
  return PRODUCERS.find((p) => p.slug === slug);
}

export function getProducerName(slug: string): string {
  return getProducer(slug)?.name ?? slug;
}

/** The house producer (COUNTERSCENT's own line), if one is configured. */
export function getHouseProducer(): Producer | undefined {
  return PRODUCERS.find((p) => p.isHouse);
}

/**
 * Whether a producer slug is COUNTERSCENT's own line.
 *
 * Lives here, next to the data, because two very different modules need it and
 * they must never disagree: lib/catalog.ts uses it for the house DISCLOSURE
 * shown to buyers, and lib/verification.ts uses it as a SCORING CONSTRAINT
 * (a house listing can never publish above the unverified cap). If those two
 * ever answered differently, the site would disclose one thing and score
 * another.
 */
export function isHouseProducer(producerSlug: string): boolean {
  return getProducer(producerSlug)?.isHouse === true;
}
