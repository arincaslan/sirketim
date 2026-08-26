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
 * genuine match from a copy-paste. This already happened to us by accident
 * (lib/dupes-data.ts's No. 01 Ember comment: 79%, 22 points clear, purely
 * from favourably-written data with no producer involved). A producer whose
 * revenue depends on rank has a stronger reason to do it on purpose.
 *
 * The fix is not a smarter formula - no formula over self-reported inputs can
 * distinguish "genuinely this close" from "copied the answer key." The fix is
 * structural: (1) catch the specific copy-paste pattern and force it into
 * mandatory review rather than let it score at all, (2) cap what any
 * unverified submission can publish at, regardless of its computed score, and
 * (3) show buyers where a score actually comes from - shared vs. differing
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
 * checking stands behind the listing. A verbatim copy is not merely capped -
 * it does not get a published score at all, because it should not be live to
 * begin with (see the flagged branch in getVerificationBadge).
 *
 * Only "verified" - earned by editorial review, never a default - can publish
 * above the cap. This is deliberately independent of subscription tier: no
 * tier in PRODUCER-PROGRAM.md §3 is allowed to buy rank, and a cap that a
 * higher tier could pay past would be exactly that.
 */
export function getPublishedScore(rawScore: number, status: DupeCandidate["verificationStatus"]): number {
  if (status === "verified") return rawScore;
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
