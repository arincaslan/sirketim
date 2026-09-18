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
 * no displayed number should claim to.
 *
 * IT HAS NO EXCEPTIONS AS OF 2026-09-18. There used to be exactly one: a
 * `founderOverride`, a personally-worn, personally-stated figure that replaced
 * the computed score and bypassed both ceilings. The founder removed the
 * mechanism, unused, before any listing carried one. What that buys is a claim
 * that needs no asterisk - nothing on this site publishes above 95, and the
 * sentence stops there. An exception only the site's owner can invoke is the
 * hardest kind for a reader to check, and its existence did more damage to the
 * ceiling's credibility than any single use of it would have been worth.
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
 * The raw score after every adjustment EXCEPT the two ceilings - which today
 * means the imputed-pyramid penalty and nothing else. This is what
 * getRankedDupesFor's tie-break sorts on, so a listing cannot rank ahead of
 * an honestly-tiered one merely because its self-imputed split happened to
 * maximise overlap.
 *
 * It is now a thin wrapper around applyPyramidPenalty and it is kept as its own
 * function anyway: the two names mean different things to a reader (one is "an
 * adjustment", the other is "everything before the ceilings"), and collapsing
 * them would make the next adjustment land in whichever one the author happened
 * to be looking at.
 */
export function getPreCeilingScore(rawScore: number, dupe: DupeCandidate): number {
  return applyPyramidPenalty(rawScore, dupe);
}

/**
 * The score a buyer actually sees, given the raw computed score and how much
 * INDEPENDENT checking stands behind the listing. A verbatim copy is not
 * merely capped - it does not get a published score at all, because it should
 * not be live to begin with (see the flagged branch in getVerificationBadge).
 *
 * Order of operations, decided 2026-09-08 (PRODUCER-PROGRAM.md §7) and
 * shortened on 2026-09-18 when the founder-override step was removed:
 *  1. IMPUTED_PYRAMID_PENALTY is subtracted when the listing's note-tier split
 *     was ours, not the seller's.
 *  2. That result is capped: STRUCTURAL_CEILING (95) for everyone, tightened
 *     to UNVERIFIED_SCORE_CAP (90) for anything that is not editorially
 *     "verified" - earned by review, never a default - or that is a house
 *     product. The Math.min of both constants (rather than assuming 90 < 95
 *     numerically) keeps "nothing exceeds 95" true even if either constant is
 *     edited later.
 *
 * THERE IS NO STEP THAT SKIPS THE CAP. The function has exactly one exit and
 * it goes through Math.min. That is worth more than the comment saying so: a
 * reader can check it in four lines.
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
 * cannot show a number that only an independent check is allowed to earn.
 *
 * Takes the whole candidate rather than a bare status so this cannot be
 * bypassed by a call site that has the status to hand but not the producer.
 */
export function getPublishedScore(rawScore: number, dupe: DupeCandidate): number {
  const preCeiling = getPreCeilingScore(rawScore, dupe);
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

/** Every badge a listing can wear. "flagged" is the one that is derived rather
 *  than stored - it comes from isVerbatimCopy, not from anything a producer can
 *  declare about itself. A "founder-override" member was removed on 2026-09-18
 *  with the mechanism behind it. */
export type BadgeStatus = NonNullable<DupeCandidate["verificationStatus"]>;

export interface VerificationBadgeInfo {
  status: BadgeStatus;
  label: string;
  description: string;
}

/** Appended to a badge description when the listing's pyramid was ours, not
 *  the seller's - see DupeCandidate.pyramidSource and
 *  IMPUTED_PYRAMID_PENALTY. */
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
 * producer's own status field could opt out of. It is checked FIRST and stays
 * first: in practice isVerbatimCopy already excludes a flagged listing from
 * getRankedDupesFor before a badge is ever requested, but
 * components/content/embedded-comparison.tsx resolves a dupe directly and
 * calls this function without that upstream gate, so the ordering here has
 * to be defensive on its own.
 *
 * A house listing never reads "Editorially verified" either, for the reason in
 * getPublishedScore: we would be certifying our own product. It says so on the
 * badge rather than quietly capping the number and leaving the buyer to wonder
 * why our bottle scores lower than its data implies.
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

/*
 * validateFounderOverride WAS HERE and went with the mechanism on 2026-09-18.
 * It was a module-load guard that fired if an override was added without a
 * justification, on a house product, or with an out-of-range score - a no-op
 * for its whole life, because no listing ever carried one.
 *
 * Nothing replaces it, and nothing needs to: the guard existed to police an
 * exception, and there is no longer an exception to police. getPublishedScore
 * now has a single exit through Math.min, which is a stronger guarantee than
 * any amount of validation around a bypass.
 */
