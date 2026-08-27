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

/**
 * The score a buyer actually sees, given the raw computed score and how much
 * INDEPENDENT checking stands behind the listing. A verbatim copy is not
 * merely capped - it does not get a published score at all, because it should
 * not be live to begin with (see the flagged branch in getVerificationBadge).
 *
 * Only "verified" - earned by editorial review, never a default - can publish
 * above the cap. That is deliberately independent of subscription tier: no
 * tier in PRODUCER-PROGRAM.md §3 may buy rank, and a cap a higher tier could
 * pay past would be exactly that.
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
  if (dupe.verificationStatus === "verified" && !isHouseProducer(dupe.producerSlug)) {
    return rawScore;
  }
  return Math.min(rawScore, UNVERIFIED_SCORE_CAP);
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

export interface VerificationBadgeInfo {
  status: NonNullable<DupeCandidate["verificationStatus"]>;
  label: string;
  description: string;
}

/**
 * Resolves a listing's effective status. Absent `verificationStatus` reads as
 * "declared," not "verified" - see the field's doc comment in lib/types.ts.
 * A verbatim copy always reads as "flagged," overriding whatever the listing
 * claims, because the flag is a property of the data itself, not something a
 * producer's own status field could opt out of.
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
      description:
        "This is COUNTERSCENT's own fragrance. We don't mark our own listings editorially verified, so its score is capped exactly like any other unverified listing.",
    };
  }

  const status = dupe.verificationStatus ?? "declared";

  if (status === "verified") {
    return {
      status,
      label: "Editorially verified",
      description: "Checked by us against independent sources before publishing.",
    };
  }

  return {
    status: "declared",
    label: "Producer declared",
    description: "Reported by the producer, not yet independently verified. Score capped until it is.",
  };
}
