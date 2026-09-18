import { REFERENCES } from "@/lib/data/references";
import type { ReferenceFragrance } from "@/lib/types";

/**
 * The note vocabulary, and filtering a set of originals down by it.
 *
 * WHY THIS IS ITS OWN MODULE RATHER THAN MORE OF lib/catalog.ts. Two reasons,
 * and the second is the load-bearing one.
 *
 * 1. catalog.ts is a scoring entry point (scripts/check-scoring-isolation.mjs
 *    lists it), so every import added there widens what that guard has to walk.
 *    Nothing here decides a score or an order - a filter narrows which
 *    originals you are offered and changes no number on any of them.
 *
 * 2. catalog.ts imports lib/dupes-data.ts, which is 217KB of listing data. The
 *    catalog index at /fragrance ships 190 bytes of route JS today, and a note
 *    filter that reached for catalog.ts would have pulled the entire dupe
 *    dataset into a page that renders none of it. This module imports the
 *    reference list and nothing else.
 *
 * THE VOCABULARY IS THE AUTHORED ONE, NOT A NORMALISED ONE. 286 distinct notes
 * across 216 originals, and near neighbours are kept apart on purpose: "Musk"
 * and "White Musk" are different materials to anyone who would filter by
 * either, and collapsing them would quietly answer a question the reader asked
 * precisely. Comparison is case- and space-insensitive so a stored "Tonka Bean"
 * still matches a URL or a keystroke that says "tonka bean", but two genuinely
 * different names stay two entries.
 */

export interface NoteCount {
  /** The note as the catalogue spells it - what gets rendered. */
  note: string;
  /** How many originals carry it, within whatever set was counted. */
  count: number;
}

/** Case- and spacing-insensitive key, so "Tonka Bean" and "tonka bean" meet. */
export function noteKey(note: string): string {
  return note.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Every note on one original, across all three tiers, deduplicated. A note
 *  listed in both the heart and the base is one note for filtering purposes. */
export function notesOf(reference: ReferenceFragrance): string[] {
  const seen = new Map<string, string>();
  for (const note of [
    ...reference.notes.top,
    ...reference.notes.heart,
    ...reference.notes.base,
  ]) {
    const key = noteKey(note);
    if (!seen.has(key)) seen.set(key, note);
  }
  return [...seen.values()];
}

/**
 * The whole vocabulary, commonest first, then alphabetical within a count.
 *
 * Sorted by count because that is the order a filter is useful in: Bergamot
 * (105 originals) and Vanilla (98) are the notes a reader arrives wanting,
 * and 122 of the 286 appear on exactly one bottle. Ties break alphabetically
 * so the order is stable between builds rather than dependent on which house
 * file happened to load first.
 */
export function getNoteIndex(references: ReferenceFragrance[] = REFERENCES): NoteCount[] {
  const counts = new Map<string, { note: string; count: number }>();
  for (const reference of references) {
    for (const note of notesOf(reference)) {
      const key = noteKey(note);
      const entry = counts.get(key);
      if (entry) entry.count += 1;
      else counts.set(key, { note, count: 1 });
    }
  }
  return [...counts.values()].sort(
    (a, b) => b.count - a.count || a.note.localeCompare(b.note)
  );
}

/**
 * Originals carrying EVERY note selected, not any of them.
 *
 * AND rather than OR, and the choice is visible in the UI copy rather than
 * left to be inferred. OR makes each extra note widen the results, which is
 * the opposite of what pressing a filter looks like it should do; AND makes
 * "Vanilla, then Amber" narrow from 98 to the overlap, which is the question
 * someone picking two notes is actually asking. The count beside every
 * unselected note is computed against the current selection for the same
 * reason - so a combination that would return nothing is visible as a zero
 * before it is chosen, rather than discovered as an empty page.
 */
export function filterReferencesByNotes(
  references: ReferenceFragrance[],
  notes: string[]
): ReferenceFragrance[] {
  if (notes.length === 0) return references;
  const wanted = notes.map(noteKey);
  return references.filter((reference) => {
    const has = new Set(notesOf(reference).map(noteKey));
    return wanted.every((note) => has.has(note));
  });
}

/**
 * The selected notes as a readable phrase: "Vanilla", "Vanilla and Amber",
 * "Vanilla, Amber and Oud".
 *
 * Here rather than in each caller because both surfaces announce the same
 * sentence to a screen reader and two copies of a serial comma is exactly the
 * kind of difference that shows up only in an audio readout nobody runs.
 */
export function formatNoteList(notes: string[]): string {
  if (notes.length === 0) return "";
  if (notes.length === 1) return notes[0];
  return `${notes.slice(0, -1).join(", ")} and ${notes[notes.length - 1]}`;
}

/**
 * How many originals each note would leave, given what is already selected.
 *
 * Counted over the already-filtered set, so a note reading "3" means three
 * results if you add it, not three in the catalogue. An already-selected note
 * is left out: it is rendered as a removable chip elsewhere and offering it
 * twice in two different states is the kind of thing that makes a filter feel
 * untrustworthy.
 */
export function getAvailableNoteCounts(
  references: ReferenceFragrance[],
  selected: string[]
): Map<string, number> {
  const remaining = filterReferencesByNotes(references, selected);
  const selectedKeys = new Set(selected.map(noteKey));
  const counts = new Map<string, number>();
  for (const reference of remaining) {
    for (const note of notesOf(reference)) {
      const key = noteKey(note);
      if (selectedKeys.has(key)) continue;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  return counts;
}
