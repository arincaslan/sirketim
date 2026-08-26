import type { FacetScores, ReferenceFragrance } from "@/lib/types";

/**
 * A deterministic visual identity per fragrance, used wherever a product
 * photograph would go until licensed photography exists (see the `imageUrl`
 * note in lib/types.ts for why it does not yet).
 *
 * This is not decoration standing in for a missing asset. In a grid of
 * dozens of originals the reader needs something to lock onto per row, and a
 * generic bottle silhouette repeated 68 times gives them nothing - every card
 * would look identical. Deriving the mark from the fragrance's own olfactive
 * family and facet scores makes it stable (the same scent always looks the
 * same), distinct between neighbours, and honestly related to the thing it
 * represents: warm ambers read warm, fresh aquatics read cool.
 *
 * It is explicitly NOT an attempt to depict the real bottle.
 */

/** Base hue per olfactive family, in degrees. Chosen to keep the families a
 *  buyer confuses most (aquatic vs aromatic, amber vs gourmand) far apart on
 *  the wheel rather than to be literal about ingredients. */
const FAMILY_HUES: Record<string, number> = {
  "Amber Woody": 28,
  "Oriental Woody": 24,
  "Oriental Spicy": 18,
  "Oriental Floral": 330,
  "Oriental Vanilla": 36,
  "Gourmand Oriental": 32,
  "Gourmand Woody": 30,
  "Gourmand Chypre": 340,
  "Woody Aromatic": 150,
  "Woody Floral": 200,
  "Woody Floral Musk": 205,
  "Woody Incense": 210,
  "Woody Spicy": 20,
  "Woody Amber": 34,
  Woody: 130,
  "Aromatic Fougere": 145,
  "Aromatic Gourmand": 60,
  "Aromatic Fresh": 165,
  Aromatic: 160,
  "Citrus Aromatic": 70,
  "Citrus Tropical": 48,
  "Aquatic Aromatic": 195,
  "Aquatic Woody": 200,
  "Fresh Woody": 185,
  Fougere: 140,
  "Floral Aldehyde": 300,
  "Floral Fruity": 345,
  "Floral Chypre": 320,
  "Floral Woody": 280,
  "White Floral": 290,
  Floral: 310,
  "Chypre Floral": 315,
  "Chypre Fruity": 350,
  "Fruity Chypre": 355,
  "Leather Chypre": 12,
  "Leather Floral": 8,
  "Leather Woody": 15,
  "Leather Spicy": 10,
  "Amber Floral": 40,
  "Amber Fruity": 44,
};

export interface FragranceVisual {
  /** CSS gradient for the card background. */
  background: string;
  /** Two-letter mark drawn over it. */
  initials: string;
  /** Accessible description of what the mark encodes. */
  label: string;
}

function hueFor(family: string): number {
  if (family in FAMILY_HUES) return FAMILY_HUES[family];
  // Unknown family: derive a stable hue from the string so a newly added
  // family still gets a consistent colour instead of defaulting to grey.
  let hash = 0;
  for (let i = 0; i < family.length; i += 1) {
    hash = (hash * 31 + family.charCodeAt(i)) % 360;
  }
  return hash;
}

/** Two letters from the fragrance name, skipping articles and numerals. */
function initialsFor(name: string): string {
  const words = name
    .replace(/[^\p{L}\p{N} ]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length > 0 && !/^(the|de|du|la|le|of|no|d)$/i.test(w));

  if (words.length === 0) return name.slice(0, 2).toUpperCase();
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

/** Stable small integer from a string, for per-product variation. */
function nameHash(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 33 + name.charCodeAt(i)) % 1000;
  }
  return hash;
}

export function getFragranceVisual(
  fragrance: Pick<ReferenceFragrance, "name" | "family" | "facets">
): FragranceVisual {
  const f: FacetScores = fragrance.facets;

  // Family sets the neighbourhood, the name shifts within it. Without the
  // name term every alternative to one original renders the same colour -
  // they all share the reference's family and their facet scores are close by
  // construction - which is precisely when the reader most needs to tell two
  // cards apart. +/-16 degrees keeps siblings visibly related without
  // colliding with the next family along.
  const jitter = (nameHash(fragrance.name) % 33) - 16;
  const hue = (hueFor(fragrance.family) + jitter + 360) % 360;

  // Warmth and woody depth push the mark darker and more saturated; freshness
  // lifts it. Kept inside a mid band so text stays legible on top in both
  // themes without a per-card contrast check.
  const saturation = 30 + Math.round((f.warmth + f.sweetness) * 2.2);
  const lightness = 62 - Math.round((f.warmth + f.woodyDepth) * 1.4) + Math.round(f.freshness * 1.1);
  const clampedS = Math.min(70, Math.max(22, saturation + ((nameHash(fragrance.name) % 11) - 5)));
  const clampedL = Math.min(64, Math.max(30, lightness + ((nameHash(fragrance.family) % 9) - 4)));

  const secondHue = (hue + 18 + f.sillage * 2) % 360;

  return {
    background: `linear-gradient(145deg, hsl(${hue} ${clampedS}% ${clampedL}%) 0%, hsl(${secondHue} ${Math.max(
      18,
      clampedS - 12
    )}% ${Math.max(22, clampedL - 16)}%) 100%)`,
    initials: initialsFor(fragrance.name),
    label: `${fragrance.family} accent mark`,
  };
}
