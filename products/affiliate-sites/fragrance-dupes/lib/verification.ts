import { isHouseProducer } from "@/lib/producers";
import type { DupeCandidate, FacetScores, FragranceNotes, ReferenceFragrance } from "@/lib/types";

/**
 * The anti-copy-cheat standard.
 *
 * The problem this exists to solve is exact and provable, not hypothetical:
 * lib/similarity.ts's computeSimilarity is
 * `notesScore*0.5 + facetsScore*0.35 + familyBonus*0.15`, where familyBonus is
 * hardcoded to 1 and both notesScore/facetsScore return exactly 1 on identical
 * inputs. A producer who copies a reference's note list and facet scores
 * verbatim gets exactly 100%, deterministically - the formula cannot tell a
 * genuine match from a copy-paste. A producer whose revenue depends on rank
 * has a strong reason to do it on purpose.
 *
 * It already happened to us by accident, with no producer involved: our own
 * `No. 01 Ember` rendered #1 at 79% on Baccarat Rouge 540, 22 points clear of
 * every real listing, purely from favourably-written data. That listing was
 * deleted with the rest of DUPES on 2026-08-27, so the evidence now lives in
 * FINALIZATION-GUIDE.md's board-review section rather than in a code comment -
 * but the hazard is dormant, not solved. It returns the day DUPES is
 * repopulated.
 *
 * The fix is not a smarter formula - no formula over self-reported inputs can
 * distinguish "genuinely this close" from "copied the answer key." The fix is
 * structural: (1) catch the specific copy-paste pattern and force it into
 * mandatory review rather than let it score at all, (2) cap what any
 * unverified submission can publish at, regardless of its computed score,
 * (3) refuse to let OUR OWN listings out of that cap, since we are the ones
 * who grant "verified" and marking our own homework is not verification, and
 * (4) show buyers where a score actually comes from - shared vs. differing
 * notes - instead of one number standing in for the whole judgement.
 *
 * See MARKETPLACE-PLAN.md §2/§3, PRODUCER-PROGRAM.md §7 (this module is the
 * decision that section's option list was building toward), and
 * lib/similarity.ts's own doc comment for the formula this constrains.
 */

/** Above this, two facet scores count as "copied," not "coincidentally similar." */
const FACET_EPSILON = 0.5;

/** An unverified submission can never publish above this, no matter how high
 *  its raw computed score is. Chosen so a genuinely strong, honestly-declared
 *  match still reads as excellent (a buyer sees "90%+" as a clear win) while
 *  making a plain, uncomfortable enough gap from 100 that it does not read
 *  as a rounding artifact - the cap has to be visible to do its job. */
const UNVERIFIED_SCORE_CAP = 90;

/**
 * Decided 2026-09-08 alongside the ingredient scoring component in
 * lib/similarity.ts - see PRODUCER-PROGRAM.md §7 for the full record. No
 * published score may EVER exceed this, including a listing whose
 * verificationStatus is "verified" - which, before this, could publish its
 * raw score uncapped, up to 100. Rationale: even a dupe declaring the exact
 * same notes as the original never contains them in the same proportions,
 * and no formula built on presence/absence data can certify otherwise - so
 * no displayed number should claim to. The only listing allowed to exceed
 * it is one carrying a `founderOverride`, which is a human, not a formula,
 * making the claim.
 */
const STRUCTURAL_CEILING = 95;

/**
 * Subtracted from the raw score, before either ceiling, when a listing's
 * note-tier split was invented by us rather than published by the seller
 * (dupe.pyramidSource === "imputed") - see the project CLAUDE.md's "THE
 * SPLIT IS OURS" sections. Our own tier choice can be tuned to flatter the
 * score in a way a seller's own published tiering cannot be, so it must
 * never score as if it were equally trustworthy. Decided 2026-09-08
 * alongside STRUCTURAL_CEILING above.
 */
const IMPUTED_PYRAMID_PENALTY = 10;

function normalizeNoteList(notes: string[]): Set<string> {
  return new Set(notes.map((n) => n.trim().toLowerCase()));
}

function setsEqual(a: Set<string>, b: Set<string>): boolean {
  if (a.size !== b.size) return false;
  for (const item of a) if (!b.has(item)) return false;
  return true;
}

function notesAreVerbatim(a: FragranceNotes, b: FragranceNotes): boolean {
  return (
    setsEqual(normalizeNoteList(a.top), normalizeNoteList(b.top)) &&
    setsEqual(normalizeNoteList(a.heart), normalizeNoteList(b.heart)) &&
    setsEqual(normalizeNoteList(a.base), normalizeNoteList(b.base))
  );
}

function facetsAreVerbatim(a: FacetScores, b: FacetScores): boolean {
  const keys: (keyof FacetScores)[] = [
    "freshness",
    "sweetness",
    "warmth",
    "woodyDepth",
    "longevity",
    "sillage",
  ];
  return keys.every((k) => Math.abs(a[k] - b[k]) <= FACET_EPSILON);
}

/**
 * True when a submission's declared data is close enough to the reference's
 * to be a copy rather than an independent assessment - notes AND facets both
 * matching, since either alone can be honest coincidence (a genuinely close
 * dupe might share most notes; two unrelated fragrances might share a facet
 * profile by chance) but both together on a self-reported submission is the
 * specific abuse pattern this exists to catch.
 */
export function isVerbatimCopy(reference: ReferenceFragrance, dupe: DupeCandidate): boolean {
  return notesAreVerbatim(reference.notes, dupe.notes) && facetsAreVerbatim(reference.facets, dupe.facets);
}

/** Subtracts IMPUTED_PYRAMID_PENALTY when dupe.pyramidSource === "imputed",
 *  floored at 0. Exported so lib/catalog.ts's ranking tie-break can use the
 *  same honesty-adjusted number the published score is built from, rather
 *  than the pure formula output a copied or self-imputed pyramid could still
 *  flatter. */
export function applyPyramidPenalty(rawScore: number, dupe: DupeCandidate): number {
  return dupe.pyramidSource === "imputed" ? Math.max(0, rawScore - IMPUTED_PYRAMID_PENALTY) : rawScore;
}

/**
 * The raw score after every adjustment EXCEPT the two ceilings: a
 * founderOverride replaces the number outright (a human override is not
 * "the formula, penalized" - it is a different claim entirely), otherwise
 * the imputed-pyramid penalty above applies. This is what
 * getRankedDupesFor's tie-break sorts on, so a listing cannot rank ahead of
 * an honestly-tiered one merely because its self-imputed split happened to
 * maximise overlap.
 */
export function getPreCeilingScore(rawScore: number, dupe: DupeCandidate): number {
  if (dupe.founderOverride) return dupe.founderOverride.score;
  return applyPyramidPenalty(rawScore, dupe);
}

/**
 * The score a buyer actually sees, given the raw computed score and how much
 * INDEPENDENT checking stands behind the listing. A verbatim copy is not
 * merely capped - it does not get a published score at all, because it should
 * not be live to begin with (see the flagged branch in getVerificationBadge).
 *
 * Order of operations, decided 2026-09-08 (PRODUCER-PROGRAM.md §7):
 *  1. founderOverride, if present, is the published score outright - it
 *     bypasses the imputed-pyramid penalty AND both ceilings below. It is
 *     the ONLY way a score may exceed STRUCTURAL_CEILING. It does NOT bypass
 *     isVerbatimCopy, which runs upstream in getRankedDupesFor - a flagged
 *     copy never reaches this function at all.
 *  2. Otherwise, IMPUTED_PYRAMID_PENALTY is subtracted when the listing's
 *     note-tier split was ours, not the seller's.
 *  3. That result is capped: STRUCTURAL_CEILING (95) for everyone, tightened
 *     to UNVERIFIED_SCORE_CAP (90) for anything that is not editorially
 *     "verified" - earned by review, never a default - or that is a house
 *     product. The Math.min of both constants (rather than assuming 90 < 95
 *     numerically) keeps "nothing but a founder override exceeds 95" true
 *     even if either constant is edited later.
 *
 * That is deliberately independent of subscription tier: no tier in
 * PRODUCER-PROGRAM.md §3 may buy rank, and a cap a higher tier could pay
 * past would be exactly that.
 *
 * HOUSE PRODUCTS CAN NEVER LIFT THE CAP, whatever their status field says.
 * This closes a hole found in the 2026-08-27 board review: the cap keyed on
 * "verified", we are the only party who can grant "verified", and we also sell
 * a fragrance line here. Nothing structural stopped COUNTERSCENT marking its own
 * bottle verified and publishing an uncapped score at #1 on a page branded
 * "Independent Fragrance Comparisons" - self-certification wearing the badge
 * of editorial review. A house listing can still rank first on merit; it just
 * cannot show a number that only an independent check is allowed to earn. The
 * same reasoning is why a founderOverride can never be set on a house
 * listing - see the module-load guard in lib/dupes-data.ts.
 *
 * Takes the whole candidate rather than a bare status so this cannot be
 * bypassed by a call site that has the status to hand but not the producer.
 */
export function getPublishedScore(rawScore: number, dupe: DupeCandidate): number {
  const preCeiling = getPreCeilingScore(rawScore, dupe);
  if (dupe.founderOverride) return preCeiling;

  const verified = dupe.verificationStatus === "verified" && !isHouseProducer(dupe.producerSlug);
  const cap = verified ? STRUCTURAL_CEILING : Math.min(UNVERIFIED_SCORE_CAP, STRUCTURAL_CEILING);
  return Math.min(preCeiling, cap);
}

export interface NoteDiff {
  shared: string[];
  referenceOnly: string[];
  dupeOnly: string[];
}

function diffLayer(a: string[], b: string[]): NoteDiff {
  const setA = normalizeNoteList(a);
  const setB = normalizeNoteList(b);
  return {
    shared: a.filter((n) => setB.has(n.trim().toLowerCase())),
    referenceOnly: a.filter((n) => !setB.has(n.trim().toLowerCase())),
    dupeOnly: b.filter((n) => !setA.has(n.trim().toLowerCase())),
  };
}

/**
 * What's actually the same and actually different, per note layer - the
 * "explain difference and similarities" half of the standard. This is
 * derived directly from the two note lists, so it cannot drift from the score
 * the way a hand-written verdict sentence could.
 */
export function getNoteDiff(reference: ReferenceFragrance, dupe: DupeCandidate): Record<keyof FragranceNotes, NoteDiff> {
  return {
    top: diffLayer(reference.notes.top, dupe.notes.top),
    heart: diffLayer(reference.notes.heart, dupe.notes.heart),
    base: diffLayer(reference.notes.base, dupe.notes.base),
  };
}

/** "founder-override" is not a VerificationStatus a listing can declare on
 *  itself - it is derived purely from whether `founderOverride` is set, the
 *  same way "flagged" is derived from isVerbatimCopy rather than stored. */
export type BadgeStatus = NonNullable<DupeCandidate["verificationStatus"]> | "founder-override";

export interface VerificationBadgeInfo {
  status: BadgeStatus;
  label: string;
  description: string;
}

/** Appended to a badge description when the listing's pyramid was ours, not
 *  the seller's - see DupeCandidate.pyramidSource and
 *  IMPUTED_PYRAMID_PENALTY. Not shown on the founder-override branch: an
 *  override replaces the whole score, penalty included, so citing a penalty
 *  that was never applied would be misleading. */
function pyramidSourceNote(dupe: DupeCandidate): string {
  return dupe.pyramidSource === "imputed"
    ? " Its note-tier split was assigned by us, not the seller, so 10 points are subtracted before any cap applies."
    : "";
}

/**
 * Resolves a listing's effective status. Absent `verificationStatus` reads as
 * "declared," not "verified" - see the field's doc comment in lib/types.ts.
 * A verbatim copy always reads as "flagged," overriding whatever the listing
 * claims, because the flag is a property of the data itself, not something a
 * producer's own status field could opt out of. This check runs BEFORE
 * founderOverride below for the same reason: a copy-cheat flag must never be
 * silently overridable by a founder note, or the override becomes exactly
 * the undisclosed backdoor STRUCTURAL_CEILING's disclosure on /about exists
 * to rule out. In practice isVerbatimCopy already excludes a flagged listing
 * from getRankedDupesFor before a badge is ever requested, but
 * components/content/embedded-comparison.tsx resolves a dupe directly and
 * calls this function without that upstream gate, so the ordering here has
 * to be defensive on its own.
 *
 * A house listing never reads "Editorially verified" either, for the reason in
 * getPublishedScore: we would be certifying our own product. It says so on the
 * badge rather than quietly capping the number and leaving the buyer to wonder
 * why our bottle scores lower than its data implies. A founderOverride can
 * never be set on a house listing (see the module-load guard in
 * lib/dupes-data.ts), so this branch and the founder-override branch below
 * never actually compete in practice - the ordering is defence in depth, not
 * a real decision point.
 */
export function getVerificationBadge(reference: ReferenceFragrance, dupe: DupeCandidate): VerificationBadgeInfo {
  if (isVerbatimCopy(reference, dupe)) {
    return {
      status: "flagged",
      label: "Flagged for review",
      description:
        "This listing's declared notes and facet scores match the original too closely to publish as an independent assessment. Held for manual review.",
    };
  }

  if (dupe.founderOverride) {
    return {
      status: "founder-override",
      label: "Founder's personal assessment",
      description: `The founder's own judgement, not independent verification: "${dupe.founderOverride.note}" This is the only way a score can exceed the ${STRUCTURAL_CEILING}% structural ceiling — see /about#methodology.`,
    };
  }

  if (isHouseProducer(dupe.producerSlug)) {
    return {
      status: "declared",
      label: "Our own product — self-declared",
      description: `This is COUNTERSCENT's own fragrance. We don't mark our own listings editorially verified, so its score is capped exactly like any other unverified listing (${UNVERIFIED_SCORE_CAP}%).${pyramidSourceNote(dupe)}`,
    };
  }

  const status = dupe.verificationStatus ?? "declared";

  if (status === "verified") {
    return {
      status,
      label: "Editorially verified",
      description: `Checked by us against independent sources before publishing. Capped at ${STRUCTURAL_CEILING}% — no formula built on declared notes can certify identical composition.${pyramidSourceNote(dupe)}`,
    };
  }

  return {
    status: "declared",
    label: "Producer declared",
    description: `Reported by the producer, not yet independently verified. Score capped at ${UNVERIFIED_SCORE_CAP}% until it is.${pyramidSourceNote(dupe)}`,
  };
}

/**
 * Throws if a listing's founderOverride is malformed - called at module load
 * from lib/dupes-data.ts, mirroring the duplicate-slug guard in
 * lib/data/references.ts. A no-op today (zero listings use founderOverride),
 * but fails the build loudly the moment one is added incorrectly - including
 * the specific integrity hole the founder override mechanism exists to avoid
 * creating: a house-brand listing quietly self-certifying past the ceiling.
 */
export function validateFounderOverride(dupe: DupeCandidate): void {
  if (!dupe.founderOverride) return;
  if (!dupe.founderOverride.note.trim()) {
    throw new Error(`founderOverride on "${dupe.slug}" has an empty note - a justification is required.`);
  }
  if (isHouseProducer(dupe.producerSlug)) {
    throw new Error(`founderOverride on "${dupe.slug}" is a house product - never permitted, see getPublishedScore.`);
  }
  if (dupe.founderOverride.score < 0 || dupe.founderOverride.score > 100) {
    throw new Error(`founderOverride on "${dupe.slug}" has an out-of-range score: ${dupe.founderOverride.score}.`);
  }
}
