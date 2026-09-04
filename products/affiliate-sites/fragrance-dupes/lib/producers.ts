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
  // Added 2026-09-01 with the first real listings in lib/dupes-data.ts. Unlike
  // the entries above, these two are not merely "found in research": specific
  // products of theirs were read off a live retailer's product feed, which is
  // what made those listings writable at all.
  {
    slug: "armaf",
    name: "Armaf",
    blurb:
      "Sharjah-based house whose Club de Nuit line is the most widely worn set of designer alternatives in the category. Sold through mainstream retailers rather than direct-to-consumer.",
  },
  {
    slug: "lattafa",
    name: "Lattafa",
    blurb:
      "Dubai perfume house with a large catalog spanning both original compositions and closely-inspired interpretations of Western releases.",
  },
  // Added 2026-09-02, same standard: each has a specific product read off the
  // Opulensi feed, and in every case the retailer's own listing names the
  // Western release it is interpreting.
  {
    slug: "maison-alhambra",
    name: "Maison Alhambra",
    blurb:
      "Lattafa's sister label, aimed almost entirely at close interpretations of European designer releases. Its listings are usually sold under a renamed version of the original.",
  },
  {
    slug: "ard-al-zaafaran",
    name: "Ard Al Zaafaran",
    blurb:
      "Dubai house working at the budget end of the category, with a catalog split between traditional Arabian compositions and interpretations of Western bestsellers.",
  },
  {
    slug: "fragrance-world",
    name: "Fragrance World",
    blurb:
      "UAE house that builds its range almost exclusively around near-name interpretations of niche and designer releases, typically sold under a deliberately similar name.",
  },
  // Added 2026-09-02 with the coverage batch.
  {
    slug: "afnan",
    name: "Afnan",
    blurb:
      "Long-established Dubai house, at the upper end of the category on price and on composition quality. Its Supremacy line is the range most often bought as a designer alternative.",
  },
  {
    slug: "rasasi",
    name: "Rasasi",
    blurb:
      "One of the oldest UAE perfume houses, founded 1979, with its own perfumery rather than a pure clone catalogue. The Hawas line is what brings it into dupe comparisons.",
  },
  {
    slug: "french-avenue",
    name: "French Avenue",
    blurb:
      "Fragrance World's higher-priced label, working the same near-interpretation model at extrait concentration.",
  },
  // Added 2026-09-03, final batch from the Opulensi feed.
  {
    slug: "zimaya",
    name: "Zimaya",
    blurb:
      "Afnan-perfumed sister label sold under its own name — the feed's own copy credits Afnan as the perfumer behind Zimaya's range.",
  },
  // Added 2026-09-03 with the FIRST listings from a second merchant, Clone of
  // Perfume (Awin 117395). Structurally different from every producer above and
  // it is worth being explicit about why:
  //
  //   Every other entry here is a HOUSE WHOSE PRODUCT A RESELLER CARRIES —
  //   Opulensi stocks Lattafa, Armaf, Afnan and the rest, so producer and
  //   merchant are two different companies and an offer's `merchant` names the
  //   shop rather than the maker. The CLONE sells only its own line, direct, so
  //   here the producer and the merchant ARE the same company under two names:
  //   the brand is "The CLONE", the storefront and Awin advertiser are
  //   "Clone of Perfume" (cloneofperfume.com).
  //
  // That matters for reading the data, not for the schema: `brand`/`producerSlug`
  // say The CLONE and `offers[].merchant` says Clone of Perfume, and those
  // pointing at one legal entity is correct rather than a duplication to tidy up.
  //
  // It also means this producer's price IS the street price, which is why these
  // listings take `priceUsd` from the merchant while every listing above hand-
  // maintains it — see the note above LISTINGS in lib/dupes-data.ts.
  //
  // NOT A HOUSE PRODUCER. `isHouse` stays absent (so isHouseProducer() is false):
  // this is a third party we have an affiliate relationship with, not Counterscent's
  // own line. Setting it true would lift nothing and break the disclosure — the
  // house badge exists to tell buyers when we are selling to them, and we are not.
  {
    slug: "the-clone",
    name: "The CLONE",
    blurb:
      "US dupe house selling direct rather than through retailers, with a small numbered range built entirely at extrait concentration in 50ml bottles. Its listings name the designer original outright, including in the product's own type field.",
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
