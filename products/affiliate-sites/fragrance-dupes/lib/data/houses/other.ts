import type { ReferenceFragrance } from "@/lib/types";

/**
 * Houses outside the seven the catalog was expanded around. These four were
 * the original fixture set and already carry producer listings, so they stay.
 */
export const OTHER_HOUSES: ReferenceFragrance[] = [
  {
    slug: "baccarat-rouge-540",
    name: "Baccarat Rouge 540",
    brand: "Maison Francis Kurkdjian",
    family: "Amber Woody",
    notes: {
      top: ["Saffron", "Jasmine"],
      heart: ["Amberwood", "Ambergris"],
      base: ["Fir Resin", "Cedar"],
    },
    facets: { freshness: 2, sweetness: 7, warmth: 8, woodyDepth: 7, longevity: 9, sillage: 8 },
    longevityHoursRange: [8, 12],
    sillageLabel: "Beast Mode",
    priceUsd: 325,
    bottleMl: 70,
    concentration: "Extrait de Parfum",
    affiliateLinkId: "original-baccarat-rouge-540",
  },
  {
    slug: "black-opium",
    name: "Black Opium",
    brand: "Yves Saint Laurent",
    family: "Gourmand Oriental",
    notes: {
      top: ["Pear", "Pink Pepper", "Orange Blossom"],
      heart: ["Coffee", "Jasmine", "Bitter Almond"],
      base: ["Vanilla", "Patchouli", "Cedar"],
    },
    facets: { freshness: 3, sweetness: 8, warmth: 6, woodyDepth: 3, longevity: 8, sillage: 8 },
    longevityHoursRange: [8, 10],
    sillageLabel: "Beast Mode",
    priceUsd: 168,
    bottleMl: 90,
    concentration: "Eau de Parfum",
    affiliateLinkId: "original-black-opium",
  },
  {
    slug: "tobacco-vanille",
    name: "Tobacco Vanille",
    brand: "Tom Ford",
    family: "Oriental Spicy",
    notes: {
      top: ["Tobacco Leaf", "Spices"],
      heart: ["Vanilla", "Cacao", "Tonka Bean"],
      base: ["Dried Fruit", "Woods"],
    },
    facets: { freshness: 1, sweetness: 8, warmth: 9, woodyDepth: 6, longevity: 9, sillage: 8 },
    longevityHoursRange: [8, 12],
    sillageLabel: "Beast Mode",
    priceUsd: 248,
    bottleMl: 50,
    concentration: "Eau de Parfum",
    affiliateLinkId: "original-tobacco-vanille",
  },
  {
    slug: "santal-33",
    name: "Santal 33",
    brand: "Le Labo",
    family: "Woody",
    notes: {
      top: ["Cardamom", "Violet", "Iris"],
      heart: ["Sandalwood", "Papyrus"],
      base: ["Leather", "Cedarwood", "Musk"],
    },
    facets: { freshness: 4, sweetness: 3, warmth: 5, woodyDepth: 9, longevity: 7, sillage: 6 },
    longevityHoursRange: [6, 8],
    sillageLabel: "Strong",
    priceUsd: 210,
    bottleMl: 50,
    concentration: "Eau de Parfum",
    affiliateLinkId: "original-santal-33",
  },
];
