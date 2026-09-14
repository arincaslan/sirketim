import type { FacetScores, FragranceNotes } from "@/lib/types";

/**
 * Derive the six radar facets from a declared note list and concentration.
 *
 * WHY THIS EXISTS. Until 2026-09-11 the producer submission form asked a
 * producer to rate their own fragrance on these six sliders. Those sliders were
 * removed because isVerbatimCopy() in lib/verification.ts cross-references a
 * listing's NOTES against its FACETS, and that check is only independent while
 * we author the facets: hand the same party both inputs and they can copy the
 * reference's pyramid, nudge one facet past FACET_EPSILON, and publish at the
 * cap on their own reference with nothing flagged. Removing the sliders closed
 * that hole and opened this one - a producer listing arrives with no facets at
 * all, and facets are 30-35% of the similarity score (lib/similarity.ts).
 *
 * WHAT KIND OF CLAIM THIS IS. The facet scores on every reference and every
 * hand-authored listing are editorial estimates, not measurements - lib/data/
 * references.ts says so and /about#methodology discloses it. This table is the
 * same class of claim, with one difference that favours it: it is ONE disclosed
 * judgement applied uniformly and auditable in a single file, rather than 79
 * separate guesses nobody can re-derive. It is not a measurement and must never
 * be described as one.
 *
 * WHY FAMILIES RATHER THAN PER-NOTE VALUES. The catalogue uses 341 distinct
 * note names. Assigning six numbers to each would be 2,046 invented figures,
 * most of them for materials appearing once. Mapping a note to an olfactive
 * family is largely a matter of settled perfumery classification - Bergamot is
 * citrus, Oakmoss is mossy - and that mapping is checkable by anyone who knows
 * the material. Only the 16 family vectors below are editorial.
 *
 * WHAT IT DELIBERATELY DOES NOT READ. Not the producer's own longevity or
 * sillage claim, and not their asserted olfactive family. Those are exactly the
 * fields a seller inflates, and routing them into the score would rebuild the
 * hole the sliders left. Longevity and sillage come from the tenacity and
 * projection of the declared materials plus the declared concentration, which
 * is a fact checkable against their own product page.
 *
 * ============ READ THIS BEFORE PUBLISHING A DERIVED FACET ==============
 *
 * THIS OUTPUT IS A PROPOSAL FOR A HUMAN REVIEWER, NOT A PUBLISHED VALUE.
 * Shipping it straight into a listing costs that listing about 2.6 points of
 * published score, for a reason that has nothing to do with the fragrance.
 *
 * Measured over the 79 real listings (scripts/calibrate-facets.ts):
 *
 *   mean facet gap, reference vs its listing
 *     both sides hand-written (today)      0.66
 *     both sides derived                   0.62
 *     listing derived, reference by hand   1.35
 *
 *   mean published score across the 79
 *     A  today, both hand-written          62.23
 *     B  derived listing vs hand reference 59.85   (-2.38, 69 of 79 fall)
 *     C  derived on BOTH sides             62.35   (+0.13, 31 up / 24 down)
 *
 * The derivation reproduces the reference-to-listing RELATIONSHIP at least as
 * tightly as the hand-written pairs do (0.62 against 0.66). What costs the 2.4
 * points is mixing two authoring methods across one subtraction: the
 * hand-written pairs were written by one person looking at both sides, so they
 * sit artificially close, and no independent estimate can reproduce that
 * closeness. Regime B would therefore hand every paying producer a systematic
 * handicap - the mirror image of the -10 pyramid-penalty asymmetry HANDOFF.md
 * already flags, and just as indefensible.
 *
 * So the reviewer authors the final facets, the same way they were authored
 * for the 79 merchant listings, with this function proposing a starting point
 * on the right scale. Regime C - deriving both sides so like is compared with
 * like - is the better answer at volume and costs nothing in aggregate
 * (+0.13), but it recomputes the radar profile of all 216 references and moves
 * 55 of 79 published scores, which is a founder decision of the same size as
 * the 2026-09-08 score reform, not a refactor.
 *
 * THE FAILURE MODE TO WATCH: a reviewer who accepts every proposal unchanged
 * has silently put us in regime B. Track the accepted-unchanged rate; if it is
 * high, the honest move is to adopt regime C rather than to keep pretending a
 * human authored the number.
 * =======================================================================
 */

/** [freshness, sweetness, warmth, woodyDepth, tenacity, projection], 0-10. */
type FamilyVector = readonly [number, number, number, number, number, number];

/**
 * The only editorial numbers in this file. Tenacity and projection are inputs
 * to longevity/sillage rather than facets themselves - a material's staying
 * power and its throw are different properties, and several families rank high
 * on one and low on the other (musk is tenacious and quiet; citrus is loud and
 * gone in twenty minutes).
 */
export const FAMILY_VECTORS: Record<string, FamilyVector> = {
  citrus: [9, 2, 1, 0, 2, 6],
  aromatic: [8, 1, 2, 1, 3, 5],
  green: [8, 1, 1, 1, 3, 4],
  marine: [9, 1, 0, 0, 3, 4],
  fruity: [6, 7, 1, 0, 3, 6],
  floral: [5, 4, 3, 1, 5, 6],
  whiteFloral: [6, 5, 3, 0, 6, 8],
  spicy: [3, 3, 8, 3, 6, 7],
  gourmand: [1, 9, 7, 1, 8, 7],
  woody: [3, 2, 5, 9, 8, 6],
  resinous: [1, 5, 9, 4, 9, 7],
  animalic: [1, 2, 8, 5, 9, 8],
  musk: [3, 3, 4, 1, 8, 4],
  mossy: [4, 1, 3, 7, 8, 5],
  powdery: [4, 4, 4, 2, 6, 4],
  tea: [7, 2, 2, 1, 3, 3],
};

/**
 * Note name to family. Keys are lowercased; lookup normalises the input.
 *
 * Where a material genuinely straddles two families it is filed under the one
 * that dominates its PERCEIVED character rather than its botanical origin:
 * Iris is powdery before it is floral, Neroli is a white floral rather than a
 * citrus, Patchouli is mossy-earthy rather than plainly woody. Those three are
 * the judgement calls worth arguing with; the rest are settled.
 */
const NOTE_FAMILY: Record<string, string> = {};

const assign = (family: string, names: string[]) => {
  for (const n of names) NOTE_FAMILY[n.toLowerCase()] = family;
};

assign("citrus", [
  "Bergamot", "Lemon", "Mandarin", "Mandarin Orange", "Grapefruit", "Orange", "Lime",
  "Bitter Orange", "Blood Orange", "Tangerine", "Yuzu", "Pomelo", "Citrus", "Chinotto",
  "Calabrian Bergamot", "Sicilian Lemon", "Italian Lemon", "Sicilian Orange", "Sicilian Citrus",
  "Green Mandarin", "Orange Zest", "Blood Mandarin", "White Bergamot", "African Orange",
]);
assign("aromatic", [
  "Lavender", "Lavender Absolute", "Rosemary", "Sage", "Clary Sage", "Thyme", "Basil", "Mint",
  "Peppermint", "Spearmint", "Juniper", "Juniper Berries", "Artemisia", "Wormwood", "Oregano",
  "Chamomile", "Roman Chamomile", "Angelica", "Anise", "Star Anise", "Licorice", "Caraway",
  "Coriander", "Bay Leaf", "Myrtle", "Santolina", "Cypress", "Pine Needles", "Davana",
]);
assign("green", [
  "Galbanum", "Violet Leaf", "Green Notes", "Fig Leaf", "Bamboo", "Cucumber", "Pineapple Leaf",
  "Green Almond", "Petitgrain", "Hedione", "Lemon Verbena", "Verbena", "Broom", "Rice Husk",
  "Pittosporum", "Mahonial", "Pelargonium", "Hawthorn",
]);
assign("marine", [
  "Sea Notes", "Sea Salt", "Marine Accord", "Marine Notes", "Seaweed", "Posidonia Seaweed",
  "Aquozone", "Watery Notes", "Red Algae", "Mineral Notes", "Flint", "Lotus", "Blue Lotus",
  "Lotus Flower", "Water Jasmine", "Melon", "Watermelon", "Ice", "Ice Accord",
]);
assign("fruity", [
  "Apple", "Green Apple", "Red Apple", "Pear", "White Pear", "Icy Pear", "Peach", "Bitter Peach",
  "Pineapple", "Raspberry", "Raspberry Blossom", "Strawberry", "Wild Strawberry", "Blackcurrant",
  "Black Currant", "Red Currant", "Plum", "Litchi", "Lychee", "Apricot", "Blackberry", "Cherry",
  "Black Cherry", "Sour Cherry", "Cherry Jam", "Cherry Liqueur", "Griotte Syrup", "Rhubarb",
  "Quince", "Fig", "Pomegranate", "Red Berries", "Berries", "Dried Fruits", "Dried Fruit",
  "Dry Fruit", "Candied Fruits", "Passion Fruit", "Passionfruit", "Tropical Fruits", "Dates",
  "Fruity Notes", "Maninka Fruit", "Port Wine", "Hibiscus",
]);
assign("floral", [
  "Rose", "Turkish Rose", "Turkish Rose Petals", "Bulgarian Rose", "Damask Rose", "Rose Absolute",
  "Rose de Mai", "Rose Oil", "Grasse Rose", "Black Rose", "White Rose", "Jasmine", "Peony",
  "White Peony", "Violet", "Black Violet", "Geranium", "Lily", "Casablanca Lily",
  "Lily of the Valley", "Ylang-Ylang", "Tuberose", "Magnolia", "Narcissus", "Daffodil", "Freesia",
  "Hyacinth", "Carnation", "Orchid", "Orchids", "Black Orchid", "Cattleya Orchid", "Vanilla Orchid",
  "Osmanthus", "Mimosa", "Honeysuckle", "Cyclamen", "Marigold", "African Marigold", "Bluebell",
  "Sweet Pea", "Cherry Blossom", "Pear Blossom", "Silk Tree Blossom", "Queen of the Night",
  "Rangoon Creeper", "Cotton Flower", "Ginger Flower", "Nutmeg Flower", "Petalia",
]);
assign("whiteFloral", [
  "Orange Blossom", "Neroli", "Gardenia", "Frangipani", "Jasmine Sambac", "African Orange Flower",
  "White Flowers", "Olive Blossom",
]);
assign("spicy", [
  "Cinnamon", "Cinnamon Bark", "Cardamom", "Nutmeg", "Pepper", "Pink Pepper", "Black Pepper",
  "White Pepper", "Sichuan Pepper", "Chinese Pepper", "Pepperwood", "Clove", "Ginger", "Saffron",
  "Cumin", "Pimento", "Paprika", "Spices", "Spicy Notes",
]);
assign("gourmand", [
  "Vanilla", "Vanilla Bourbon", "Salted Vanilla", "Tonka Bean", "Tonka Beans", "Coumarin",
  "Caramel", "Toffee", "Honey", "Coffee", "Mocha", "Cacao", "Chocolate", "Dark Chocolate",
  "White Chocolate", "Milk Chocolate", "Gianduia Cream", "Praline", "Coconut", "Copra", "Almond",
  "Bitter Almond", "Sugared Almond", "Marshmallow", "Cotton Candy", "Sugar", "Brown Sugar",
  "Sugar Cane", "Sugary Wood Sap", "Rum", "White Rum", "Rum Absolute", "Cognac", "Liquor Accord",
  "Hazelnut", "Chestnut", "Wheat", "Kulfi", "Immortelle",
]);
assign("woody", [
  "Cedar", "Cedarwood", "Virginia Cedar", "Virginian Cedar", "Atlas Cedar", "Sandalwood",
  "Vetiver", "Guaiac Wood", "Oud", "Oudh", "Oud Wood", "Agarwood", "Papyrus", "Cypriol",
  "Cypriol Oil or Nagarmotha", "Amberwood", "Cashmeran", "Cashmere Wood", "Rosewood", "Mahogany",
  "Birch", "Black Birch", "Woods", "Woody Notes", "White Woods", "Blonde Woods", "Driftwood",
  "Oak", "Oak Wood", "Olive Wood", "Coconut Wood", "Amyris", "Amyris Wood", "Iso E Super",
  "Ambroxan", "Ambrofix", "Clearwood", "Palisander", "Lentisque", "Tuber",
]);
assign("resinous", [
  "Amber", "Benzoin", "Labdanum", "Cistus Labdanum", "Incense", "Frankincense", "Olibanum",
  "Myrrh", "Opoponax", "Elemi", "Mastic", "Peru Balsam", "Tolu Balsam", "Fir Resin",
  "Spruce Resin", "Gurjum Balsam", "Balsam Fir", "Cade",
]);
assign("animalic", [
  "Leather", "Suede", "Castoreum", "Civet", "Tobacco", "Tobacco Leaf", "Ambergris", "Beeswax",
  "Black Truffle",
]);
assign("musk", [
  "Musk", "White Musk", "Ambrette", "Ambrette Seed", "Ambrette Seeds", "Ambrette (Musk Mallow)",
]);
assign("mossy", ["Oakmoss", "Moss", "Crystal Moss", "Evernyl", "Patchouli"]);
assign("powdery", ["Iris", "Orris", "Orris Root", "Heliotrope", "Aldehydes", "Powdery Notes"]);
assign("tea", ["Tea", "Green Tea", "Black Tea", "Matcha Tea", "Tea Accord", "Jasmine Tea"]);

/**
 * Last-resort classification for a material not in the table above.
 *
 * A producer can type any string into the notes field, so the map will always
 * be incomplete - and an unclassified note silently contributing nothing would
 * bias the result toward whatever the OTHER notes are, which is the failure
 * mode that flatters a short, cherry-picked list. These patterns catch the
 * common compound names ("Grasse Rose", "Virginian Cedar"), and deriveFacets
 * reports anything that still falls through, so a real gap stays visible
 * rather than being absorbed into a number.
 */
const FALLBACK_PATTERNS: [RegExp, string][] = [
  [/\b(wood|woods|woody|cedar|oud|sandal|sandalwood|vetiver)\b/i, "woody"],
  [/\bmusk\b/i, "musk"],
  [/\bmoss\b/i, "mossy"],
  [/\b(amber|balsam|resin|incense)\b/i, "resinous"],
  [/\b(rose|jasmine|flower|flowers|floral|blossom|lily|orchid)\b/i, "floral"],
  [/\b(vanilla|sugar|caramel|chocolate|praline|honey|cream)\b/i, "gourmand"],
  [/\b(pepper|spice|spices|spicy|cinnamon|clove)\b/i, "spicy"],
  [/\b(lemon|orange|citrus|bergamot|lime|mandarin)\b/i, "citrus"],
  [/\b(berry|berries|fruit|fruits|fruity|apple|pear|peach|plum|cherry)\b/i, "fruity"],
  [/\b(marine|aquatic|water|watery|sea|ocean)\b/i, "marine"],
  [/\b(leather|tobacco)\b/i, "animalic"],
  [/\b(mint|herb|herbal|aromatic|sage|lavender)\b/i, "aromatic"],
  [/\b(green|leaf|leaves|grass)\b/i, "green"],
  [/\btea\b/i, "tea"],
];

/** The family a note belongs to, or null when nothing classifies it. */
export function familyOfNote(note: string): string | null {
  const key = note.trim().toLowerCase();
  if (NOTE_FAMILY[key]) return NOTE_FAMILY[key];
  for (const [pattern, family] of FALLBACK_PATTERNS) {
    if (pattern.test(key)) return family;
  }
  return null;
}

/**
 * Tier weights for the four character facets, matching the 20/35/45 split
 * lib/similarity.ts already uses for note overlap. Reused rather than invented
 * so the site has one answer to "how much does a base note count".
 */
const CHARACTER_TIER_WEIGHTS = { top: 0.2, heart: 0.35, base: 0.45 } as const;

/** Longevity is a drydown property, so the base tier dominates further. */
const TENACITY_TIER_WEIGHTS = { top: 0.1, heart: 0.3, base: 0.6 } as const;

/** Projection is felt early and throughout, so the opening counts for more. */
const PROJECTION_TIER_WEIGHTS = { top: 0.3, heart: 0.4, base: 0.3 } as const;

/**
 * Concentration adjustments, applied after the material average.
 *
 * Longevity and sillage move in OPPOSITE directions at extrait strength: a
 * higher oil load lasts longer and projects less, because the alcohol doing
 * the throwing is what was reduced. An eau de cologne loses on both.
 *
 * THE UPWARD SHIFTS ARE DELIBERATELY SMALL, and the reason is not that the
 * physics is in doubt. On a listing, `concentration` is a SELLER'S CLAIM, not
 * a verified fact - these are the same sellers whose titles say "Essential Oil
 * Fragrance" over an ingredient list starting `alcohol, aqua`, and whose
 * marketing this project already refuses to repeat as fact. A large extrait
 * bonus would let a producer buy longevity by typing a word into a form, which
 * is precisely the class of self-reported input the slider removal was meant
 * to close. Concentration is a real fact on the REFERENCE side, where it comes
 * from the house; it is a claim on the listing side.
 *
 * The catalogue cannot settle the magnitude either way, and it is worth being
 * explicit about why rather than fitting through it: 51 of the 52 extraits in
 * the data are dupe listings, so "extrait" and "is a dupe listing" are almost
 * perfectly confounded. Any extrait effect fitted here is indistinguishable
 * from "dupe listings were written with more longevity". What the data does
 * show is that a +1.5 bonus overshoots the hand-written listings by 1.36
 * points, while +0.5 leaves 0.71 - so the number below is the conservative end
 * of what the evidence tolerates, chosen in the direction that a seller cannot
 * exploit.
 */
const CONCENTRATION_SHIFT: Record<string, { longevity: number; sillage: number }> = {
  "extrait de parfum": { longevity: 0.5, sillage: -0.5 },
  parfum: { longevity: 0.5, sillage: -0.5 },
  "parfum extrait": { longevity: 0.5, sillage: -0.5 },
  // Present in the reference catalogue and previously absent here, which meant
  // both silently took a zero shift. A missing key must never be the reason a
  // concentration has no effect - that is invisible in the output.
  elixir: { longevity: 0.5, sillage: -0.5 },
  "eau de parfum": { longevity: 0, sillage: 0 },
  "eau de toilette": { longevity: -1.5, sillage: -0.5 },
  cologne: { longevity: -3, sillage: -1.5 },
  "eau de cologne": { longevity: -3, sillage: -1.5 },
  "eau fraiche": { longevity: -3.5, sillage: -1.5 },
};

const clamp = (n: number) => Math.max(0, Math.min(10, Math.round(n * 10) / 10));

interface WeightedNote {
  family: string;
  weight: number;
}

function weightedNotes(
  notes: FragranceNotes,
  weights: { top: number; heart: number; base: number }
): WeightedNote[] {
  const out: WeightedNote[] = [];
  for (const tier of ["top", "heart", "base"] as const) {
    const list = notes[tier] ?? [];
    if (list.length === 0) continue;
    // Divided by the tier's own length so a listing that names eight base notes
    // and one top note does not thereby weight its base eight times as heavily
    // as the tier split says it should. The tier's share is fixed; the notes
    // inside it divide that share between them.
    const per = weights[tier] / list.length;
    for (const note of list) {
      const family = familyOfNote(note);
      if (family) out.push({ family, weight: per });
    }
  }
  return out;
}

/**
 * A weighted POWER mean, not a plain average, and the exponent is the single
 * most consequential number in this file.
 *
 * Measured against the 295 entries that carry both a note list and a
 * hand-written facet set (216 references + 79 listings): a plain mean (p=1)
 * reads every facet LOW - woodyDepth by 2.18 points, sweetness by 1.89 - and
 * drops the published score of 77 of the 79 real listings by an average of 4
 * points. The cause is that averaging treats a blend as the sum of equal
 * contributors, while a nose reads it as whatever dominates: three woody
 * materials in a list of twelve still make a woody fragrance. Raising p lets
 * the strong values carry the result the way perception does. Mean absolute
 * error bottoms out at 1.23 around p=3-4 and rises again by p=5.
 */
const DOMINANCE_EXPONENT = 3;

/**
 * Per-facet offsets, fitted on the 216 REFERENCES and validated on the 79
 * listings held out of the fit.
 *
 * These are calibration, not correction of an error. facetCloseness subtracts
 * one side's facets from the other's, so a derived value is only meaningful on
 * the same scale the references are written on - and the references are the
 * fixed side of every comparison. Held-out result on the 79 listings: mean
 * absolute error 1.06, mean bias +0.14, against hand-written values whose own
 * authoring noise is of the same order.
 *
 * Re-fit them with scripts/calibrate-facets.ts if the family vectors above
 * change, and do not hand-tune them to move a particular listing.
 */
const FACET_OFFSETS = {
  freshness: -0.24,
  sweetness: 0.87,
  warmth: 0.55,
  woodyDepth: 0.08,
  longevity: 0.03,
  sillage: 0.59,
} as const;

function axisAverage(weighted: WeightedNote[], axis: number): number | null {
  let sum = 0;
  let total = 0;
  for (const { family, weight } of weighted) {
    const vector = FAMILY_VECTORS[family];
    if (!vector) continue;
    sum += Math.pow(vector[axis], DOMINANCE_EXPONENT) * weight;
    total += weight;
  }
  return total === 0 ? null : Math.pow(sum / total, 1 / DOMINANCE_EXPONENT);
}

export interface DerivedFacets {
  facets: FacetScores;
  /** Notes no rule could classify. The exporter must surface these rather than
   *  publish a score computed from a partial list. */
  unclassified: string[];
  /** Share of declared notes that were classified, 0-1. */
  coverage: number;
}

/**
 * Derive all six facets. `concentration` is matched case-insensitively against
 * CONCENTRATION_SHIFT; an unrecognised value shifts nothing rather than
 * guessing at what it meant.
 */
export function deriveFacets(notes: FragranceNotes, concentration: string): DerivedFacets {
  const declared = [...(notes.top ?? []), ...(notes.heart ?? []), ...(notes.base ?? [])];
  const unclassified = declared.filter((n) => familyOfNote(n) === null);
  const coverage = declared.length === 0 ? 0 : 1 - unclassified.length / declared.length;

  const character = weightedNotes(notes, CHARACTER_TIER_WEIGHTS);
  const tenacity = weightedNotes(notes, TENACITY_TIER_WEIGHTS);
  const projection = weightedNotes(notes, PROJECTION_TIER_WEIGHTS);

  const shift =
    CONCENTRATION_SHIFT[concentration.trim().toLowerCase()] ?? { longevity: 0, sillage: 0 };

  return {
    facets: {
      freshness: clamp((axisAverage(character, 0) ?? 5) + FACET_OFFSETS.freshness),
      sweetness: clamp((axisAverage(character, 1) ?? 5) + FACET_OFFSETS.sweetness),
      warmth: clamp((axisAverage(character, 2) ?? 5) + FACET_OFFSETS.warmth),
      woodyDepth: clamp((axisAverage(character, 3) ?? 5) + FACET_OFFSETS.woodyDepth),
      longevity: clamp((axisAverage(tenacity, 4) ?? 5) + shift.longevity + FACET_OFFSETS.longevity),
      sillage: clamp((axisAverage(projection, 5) ?? 5) + shift.sillage + FACET_OFFSETS.sillage),
    },
    unclassified,
    coverage,
  };
}
