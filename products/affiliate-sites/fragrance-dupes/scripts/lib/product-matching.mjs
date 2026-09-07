/**
 * Shared product-identity vocabulary for feed ingest scripts.
 *
 * WHY THIS EXISTS SEPARATELY
 * --------------------------
 * Deciding whether a merchant's product row denotes the same fragrance as one
 * of our references is the same problem on every affiliate network — only the
 * column names differ. The rules below were tuned against a real 9,844-row
 * Awin feed and are the expensive part; the per-network column mapping is the
 * cheap part. Keeping the rules here means a fix lands once.
 *
 * scripts/ingest-feed.mjs holds a FROZEN older copy of these rules inline. It
 * was deliberately not converted to import from here: its input feed
 * (my-perfume-shop.csv) no longer exists on disk and its merchant's programme
 * closed for tracking on 2026-09-01, so the script cannot be re-run and a
 * refactor of it could not be verified. Treat this module as canonical for new
 * work; if that Awin feed is ever re-downloaded, port that script onto this
 * module and diff the regenerated output against the committed one.
 */

/**
 * Fold to comparable words.
 *
 * The diacritic strip is load-bearing, not cosmetic: a merchant writes
 * "HERMÈS" and we write "Hermes". Without folding, dropping non-ASCII turns
 * that into "herm s" — two tokens, neither of which is "hermes" — and every
 * Hermès, Chloé and Privé reference silently fails to match.
 */
export const norm = (s) =>
  (s ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&amp;/g, " and ")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

/**
 * The two ways a merchant may write an elided apostrophe, as token lists.
 *
 * We spell fragrances "J'adore", "L'Homme", "Terre d'Hermès". CJ's export
 * strips the apostrophe and closes the gap — "Jadore", "LHomme", "Terre
 * DHermes" — with no apostrophised form anywhere in 5,802 rows. Awin's feed
 * kept them. Splitting on the apostrophe (the older behaviour) turns
 * "Terre d'Hermès" into terre/hermes, so the merchant's "dhermes" is left
 * unexplained and the strict leftover rule rejects a correct match.
 *
 * Returning both spellings and accepting either covers both conventions
 * without loosening the leftover rule, which is what keeps flankers out.
 */
export function nameTokenVariants(name) {
  const n = (name ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const split = norm(n.replace(/['’]/g, " "));
  const elided = norm(n.replace(/['’]/g, ""));
  const toTokens = (s) => s.split(" ").filter(Boolean);
  const variants = [toTokens(split)];
  if (elided !== split) variants.push(toTokens(elided));
  return variants;
}

/** Our long-form concentration -> the short forms a merchant puts in a name. */
export const CONCENTRATION_ALIASES = {
  "eau de parfum": ["edp", "eau de parfum"],
  "eau de toilette": ["edt", "eau de toilette"],
  "eau de cologne": ["edc", "eau de cologne", "cologne"],
  "eau fraiche": ["eau fraiche"],
  parfum: ["parfum", "extrait"],
  "extrait de parfum": ["extrait", "parfum"],
  "parfum concentration": ["parfum", "extrait"],
};

/** Every word used by any concentration alias, for leftover accounting. */
export const CONCENTRATION_WORDS = new Set(
  Object.values(CONCENTRATION_ALIASES).flat().flatMap((a) => a.split(" "))
);

/**
 * Words carrying no product identity: gendering, articles, and packaging
 * wording a merchant adds freely. Safe to ignore when deciding whether two
 * names denote the same fragrance.
 *
 * NOT IN HERE, ON PURPOSE, and the single most important thing in this file:
 *
 *   "type", "oil", "roll", "on" — FragranceShop.com sells 1,213 rows titled
 *   "<Real Fragrance> - Type Perfume Oil 1 oz Roll-on" at $7.95-$13.95. "Type"
 *   is the dupe trade's own word ("Creed Green Irish Tweed type"). Our
 *   originals merchant is also a dupe seller. Treating any of these as noise
 *   would link a $9 knock-off oil as the genuine article on a site whose whole
 *   pitch is telling those two apart. They must stay leftover, and they are
 *   why Green Irish Tweed, Royal Oud and Oud Wood are unmatched rather than
 *   cheaply matched.
 *
 *   "tester", "unboxed", "sample", "vial", "miniature", "gift", "set",
 *   "refill" — each is a materially different purchase from the boxed retail
 *   bottle a buyer expects when they click "buy the original".
 */
export const NOISE_WORDS = new Set([
  "for", "men", "mens", "man", "women", "womens", "woman", "unisex",
  "pour", "homme", "femme", "him", "her", "his", "hers",
  "the", "and", "with", "new", "by", "de", "du", "des", "la", "le", "les", "el",
  "spray", "perfume", "fragrance", "scent", "cologne", "eau", "toilette", "parfum",
  "ml", "oz", "bottle", "size", "authentic", "original", "genuine",
  // Line/collection wording that names a range rather than a fragrance:
  // "Maison Margiela 'Replica' Jazz Club" is Jazz Club.
  "replica", "collection", "edition", "limited", "refillable",
  // Creed's name for their standard spray, which this merchant files as a SIZE
  // attribute (?attribute_pa_size=millesime-spray-2-5-oz), not a product:
  // "Creed Millesime Imperial - Millesime Spray 3.3 oz" is Millesime Imperial
  // in a bottle, and "Love In White - Millesime Spray" is plain Love In White.
  // Safe as noise because a reference actually named "Millesime Imperial"
  // still requires both of its own name words to be present.
  "millesime",
]);

/**
 * Extra words a merchant may put in a brand that our catalog spells shorter.
 * We say "Armani"; the merchant says "Giorgio Armani". Keyed by OUR brand
 * string, normalised. Used only after the brand check has already passed, so
 * these identify the same house rather than a different product.
 */
const BRAND_EXTRA_WORDS_RAW = {
  armani: ["giorgio", "emporio"],
  "by kilian": ["kilian"],
  mugler: ["thierry"],
  dior: ["christian"],
  "yves saint laurent": ["ysl"],
  "maison francis kurkdjian": ["mfk"],
  "maison margiela": ["margiela", "maison"],
  "jo malone london": ["jo", "malone", "london"],
  hermes: ["hermes"],
  chloe: ["chloe"],
  montblanc: ["mont", "blanc"],
  "parfums de marly": ["parfums", "marly"],
  "louis vuitton": ["louis", "vuitton"],
  "narciso rodriguez": ["narciso", "rodriguez"],
  "carolina herrera": ["carolina", "herrera"],
  "viktor&rolf": ["viktor", "rolf"],
  "ralph lauren": ["ralph", "lauren"],
  "paco rabanne": ["paco", "rabanne"],
  "tom ford": ["tom", "ford"],
  "le labo": ["le", "labo"],
};

/**
 * Merchant brand string -> our brand string, where the two genuinely name the
 * same house but share no usable token ("YSL - Yves Saint Laurent"), or where
 * the merchant files a house under its parent company.
 * Keyed and valued normalised.
 */
const BRAND_SYNONYMS_RAW = {
  "ysl yves saint laurent": "yves saint laurent",
  ysl: "yves saint laurent",
  "christian dior": "dior",
  "giorgio armani": "armani",
  "emporio armani": "armani",
  "thierry mugler": "mugler",
  "viktor and rolf": "viktor&rolf",
  "jean paul gaultier": "jean paul gaultier",
  "maison francis kurkdjian paris": "maison francis kurkdjian",
  // The merchant MISSPELLS it — "Kurkdijan", an extra i — on both its rows.
  // Found by fuzzing the houses the ingest reported as "not carried", which is
  // this project's standing step after exact matching, and it matters here:
  // Baccarat Rouge 540 carries three dupe listings and its own guide, so an
  // unrecognised brand string was hiding the single most valuable original
  // link in the catalogue. Only ONE real hit came out of that fuzz pass; the
  // rest were short-name noise ("roja" is within edit distance 3 of seventeen
  // unrelated brands), so read every hit rather than trusting the distance.
  "maison francis kurkdijan": "maison francis kurkdjian",
  "maison martin margiela": "maison margiela",
  "kilian paris": "by kilian",
  kilian: "by kilian",
  "mont blanc": "montblanc",
  "issey miyake": "issey miyake",
};

/**
 * Both maps above are keyed and valued by BRAND STRINGS AS A HUMAN WRITES
 * THEM, then normalised here — because every lookup compares against `norm()`
 * output, and hand-writing an already-normalised string is a trap.
 *
 * It fired: `"viktor and rolf": "viktor&rolf"` looked obviously right, but
 * `norm("Viktor&Rolf")` is "viktor and rolf" (the ampersand becomes the word),
 * so the mapped value never equalled our own brand and every Viktor & Rolf
 * reference silently failed the brand gate — Flowerbomb and Spicebomb both had
 * exact matching rows sitting in the feed. Normalising here means a raw entry
 * cannot reintroduce that whole class of miss.
 */
export const BRAND_SYNONYMS = Object.fromEntries(
  Object.entries(BRAND_SYNONYMS_RAW).map(([k, v]) => [norm(k), norm(v)])
);

export const BRAND_EXTRA_WORDS = Object.fromEntries(
  Object.entries(BRAND_EXTRA_WORDS_RAW).map(([k, v]) => [norm(k), v.map(norm)])
);

/**
 * Nominal bottle sizes.
 *
 * A merchant sells "3.4 oz" and means the 100 ml bottle. Converting literally
 * gives 100.55 -> 101 ml, which then fails to equal our reference's bottleMl
 * of 100 and quietly loses the match. These are the sizes the industry
 * actually markets, in ml; a parsed volume snaps to the nearest one within
 * SNAP_TOLERANCE_ML.
 */
export const NOMINAL_ML = [5, 7, 10, 15, 20, 25, 30, 35, 40, 50, 60, 75, 80, 90, 100, 118, 120, 125, 150, 175, 200, 250, 500];
export const SNAP_TOLERANCE_ML = 4;

/** Parse a bottle volume out of a merchant product title, in ml, snapped to a
 *  nominal size. Returns null when the title states no size. */
export function parseNominalMl(title) {
  const m = (title ?? "").match(/(\d+(?:\.\d+)?)\s*(oz|ml)\b/i);
  if (!m) return null;
  const value = Number.parseFloat(m[1]);
  if (!Number.isFinite(value) || value <= 0) return null;
  const ml = m[2].toLowerCase() === "oz" ? value * 29.5735 : value;
  let best = null;
  let bestDelta = Infinity;
  for (const n of NOMINAL_ML) {
    const d = Math.abs(n - ml);
    if (d < bestDelta) {
      bestDelta = d;
      best = n;
    }
  }
  return bestDelta <= SNAP_TOLERANCE_ML ? best : Math.round(ml);
}

/**
 * Decide whether a merchant row denotes the same fragrance as one of our
 * references — strictly.
 *
 * The rule that matters: after accounting for the brand, our fragrance name,
 * the concentration, and pure noise words, **anything left over means it is a
 * different product.** "Mugler Angel Stars EDP" leaves "stars"; "Sauvage
 * Elixir" leaves "elixir"; "Baccarat Rouge 540 Hair Mist" leaves "hair mist".
 * Each of those is a real, separately-sold fragrance or an ancillary product,
 * and pointing a buyer at one while calling it the other is exactly the class
 * of error this project has already had to undo once.
 *
 * Scoring alone was tried first and was not safe enough: a flanker with a
 * short name beat the real thing whenever the real listing happened to carry
 * "For Women". Rejection on leftover words does not have that failure mode.
 *
 * @param ref           { name, brand, concentration }
 * @param rowName       the merchant's product title
 * @param rowBrand      the merchant's brand column, or "" when it has none
 * @param otherRefTokens Set of distinctive words belonging to OTHER references
 * @param opts          `{ noiseWords }` overrides which words carry no product
 *                      identity. A caller that has ALREADY stripped a merchant's
 *                      boilerplate — CJ's "<name> Cologne for Men - <format> <size>"
 *                      grammar, say — must pass a set WITHOUT "cologne"/"perfume",
 *                      because at that point those words can only be part of a
 *                      product's real name. "Creed Viking Cologne" is a different
 *                      fragrance from "Creed Viking", and absorbing the word as
 *                      noise silently linked the flanker as the original.
 */
export function scoreCandidate(ref, rowName, rowBrand, otherRefTokens, opts = {}) {
  const noiseWords = opts.noiseWords ?? NOISE_WORDS;
  // Overridable for the same reason as noiseWords: a caller that has already
  // stripped the merchant's format tail must NOT let "cologne" or "parfum"
  // be absorbed as concentration wording, because at that point they can
  // only belong to the product's name — "Creed Viking Cologne" and "Scandal
  // Le Parfum" are both different fragrances from their bases.
  const concentrationWords = opts.concentrationWords ?? CONCENTRATION_WORDS;
  const rowTokens = norm(rowName).split(" ").filter(Boolean);
  const ourBrand = norm(ref.brand);
  const brandTokens = ourBrand.split(" ").filter((t) => t.length > 1);

  // Our fragrance name under both apostrophe conventions; a match under either
  // is a match. Single letters are dropped as apostrophe debris — "J'adore"
  // splits to "j adore", and "j" identifies nothing.
  const nameVariants = nameTokenVariants(ref.name).map((tokens) =>
    tokens.filter((t) => t.length > 1 && !brandTokens.includes(t))
  );

  // Brand may be carried by a dedicated column instead of repeated in the
  // title — CJ files "Sauvage Elixir Cologne for Men" under brand "Christian
  // Dior" and never says Dior in the title. Accept either channel.
  const merchantBrand = norm(rowBrand);
  const mappedBrand = BRAND_SYNONYMS[merchantBrand] ?? merchantBrand;
  const brandFromColumn =
    merchantBrand.length > 0 &&
    (mappedBrand === ourBrand ||
      (brandTokens.length > 0 && brandTokens.every((t) => mappedBrand.split(" ").includes(t))));
  const brandFromTitle =
    brandTokens.length > 0 && brandTokens.every((t) => rowTokens.includes(t));

  if (brandTokens.length && !brandFromColumn && !brandFromTitle) return null;

  // Every distinctive word of our fragrance name must be present in the title,
  // under at least one apostrophe convention.
  const nameMatched = nameVariants.some(
    (tokens) => tokens.length === 0 || tokens.every((t) => rowTokens.includes(t))
  );
  if (!nameMatched) return null;

  const aliases = CONCENTRATION_ALIASES[norm(ref.concentration)] ?? [];

  const accounted = new Set([
    ...brandTokens,
    // Both spellings are accounted for: whichever the merchant used, the other
    // simply never appears in the row and costs nothing.
    ...nameVariants.flat(),
    ...(BRAND_EXTRA_WORDS[ourBrand] ?? []),
    // Words of the merchant's own brand string are explained by the brand
    // column having already matched.
    ...(brandFromColumn ? mappedBrand.split(" ").concat(merchantBrand.split(" ")) : []),
  ]);

  const leftover = rowTokens.filter(
    (t) =>
      !accounted.has(t) &&
      !noiseWords.has(t) &&
      !concentrationWords.has(t) &&
      !/^\d+$/.test(t) &&
      // Single letters are apostrophe debris — "J'adore" folds to "j adore",
      // and "j" identifies nothing.
      t.length > 1
  );

  if (leftover.length > 0) return { rejected: "leftover: " + leftover.join(" ") };

  // A leftover-free name that happens to be another reference we list is still
  // wrong — belt and braces for names that nest ("Angel" / "Angel Nova").
  if (rowTokens.some((t) => otherRefTokens.has(t) && !accounted.has(t))) return null;

  const hasConcentration = aliases.some((a) =>
    a.split(" ").every((w) => rowTokens.includes(w))
  );

  return { score: hasConcentration ? 100 : 50, hasConcentration };
}

/** Distinctive words belonging to every reference EXCEPT `ref`, so "Angel"
 *  cannot match a row that is really "Angel Nova" when we list Nova too.
 *
 *  Noise and concentration words are excluded, and that exclusion is
 *  load-bearing rather than tidiness. We list "Le Male Le Parfum", which puts
 *  the word "parfum" into this set; CJ writes the format into every single
 *  title ("... - Eau de Parfum Spray 3.4 oz"), so without this filter the
 *  guard rejected all 5,802 rows against all 200 references and the ingest
 *  matched nothing at all. Awin's feed abbreviated to "EDP" and never tripped
 *  it. A word that identifies no product cannot distinguish two products
 *  either, which is the same reason these are already ignored when deciding
 *  whether a row has leftover words. */
export function otherReferenceTokens(references, ref) {
  const set = new Set(
    references
      .filter((r) => r.slug !== ref.slug)
      .flatMap((r) => nameTokenVariants(r.name).flat())
      .filter((t) => t.length > 2 && !NOISE_WORDS.has(t) && !CONCENTRATION_WORDS.has(t))
  );
  for (const t of nameTokenVariants(ref.name).flat()) set.delete(t);
  for (const t of norm(ref.brand).split(" ")) set.delete(t);
  return set;
}
