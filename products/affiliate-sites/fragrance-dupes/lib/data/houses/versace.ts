import type { ReferenceFragrance } from "@/lib/types";

/** Versace. See lib/data/references.ts for data-accuracy caveats. */
export const VERSACE: ReferenceFragrance[] = [
  {
    slug: "eros",
    name: "Eros",
    brand: "Versace",
    family: "Aromatic Fougere",
    notes: {
      top: ["Mint", "Green Apple", "Lemon"],
      heart: ["Tonka Bean", "Geranium", "Ambroxan"],
      base: ["Vanilla", "Vetiver", "Oakmoss", "Cedarwood"],
    },
    facets: { freshness: 6, sweetness: 6, warmth: 5, woodyDepth: 4, longevity: 8, sillage: 8 },
    longevityHoursRange: [7, 10],
    sillageLabel: "Beast Mode",
    priceUsd: 75,
    bottleMl: 100,
    concentration: "Eau de Toilette",
    affiliateLinkId: "original-eros",
  },
  {
    slug: "dylan-blue",
    name: "Dylan Blue",
    brand: "Versace",
    family: "Aquatic Woody",
    notes: {
      top: ["Bergamot", "Grapefruit", "Fig Leaf"],
      heart: ["Papyrus", "Patchouli", "Ambrette Seeds"],
      base: ["Saffron", "Musk", "Tonka Bean", "Incense"],
    },
    facets: { freshness: 6, sweetness: 3, warmth: 5, woodyDepth: 5, longevity: 7, sillage: 7 },
    longevityHoursRange: [6, 9],
    sillageLabel: "Strong",
    priceUsd: 72,
    bottleMl: 100,
    concentration: "Eau de Toilette",
    affiliateLinkId: "original-dylan-blue",
  },
  {
    slug: "bright-crystal",
    name: "Bright Crystal",
    brand: "Versace",
    family: "Floral Fruity",
    notes: {
      top: ["Yuzu", "Pomegranate", "Ice Accord"],
      heart: ["Peony", "Magnolia", "Lotus Flower"],
      base: ["Musk", "Amber", "Mahogany"],
    },
    facets: { freshness: 6, sweetness: 5, warmth: 3, woodyDepth: 2, longevity: 5, sillage: 5 },
    longevityHoursRange: [4, 6],
    sillageLabel: "Moderate",
    priceUsd: 68,
    bottleMl: 90,
    concentration: "Eau de Toilette",
    affiliateLinkId: "original-bright-crystal",
  },
];
