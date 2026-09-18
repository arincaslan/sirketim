"use client";

import { useId, useMemo, useState } from "react";
import { CaretDown, MagnifyingGlass, X } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";
import { noteKey, type NoteCount } from "@/lib/notes";

/**
 * Filter a set of originals by the notes they carry.
 *
 * PRESENTATIONAL ONLY. It renders the control and reports a selection; it does
 * not know what is being filtered, does not compute counts and does not decide
 * what an empty result should say. Two callers apply it very differently - the
 * Dupe Finder narrows the references its picker offers, the catalog index hides
 * server-rendered cards in place - and folding either of those behaviours in
 * here would have made the second one a special case of the first.
 *
 * THREE THINGS IN THE DESIGN ARE DELIBERATE AND EASY TO UNDO BY ACCIDENT.
 *
 * 1. NOTHING IS HIDDEN BEHIND AN INERT "+N". There are 286 notes and 122 of
 *    them appear on exactly one bottle, so the common ones are shown and the
 *    rest sit behind a real, focusable disclosure plus a search box. A "+262"
 *    that a reader cannot open would be a count of things they are not allowed
 *    to have.
 *
 * 2. A NOTE THAT WOULD RETURN NOTHING STAYS ON SCREEN, reading zero, rather
 *    than vanishing. It is marked aria-disabled rather than disabled so it
 *    keeps its place in the tab order and a screen reader still announces
 *    "Oud, 0 results" - the information a sighted reader gets from the dimmed
 *    chip. A `disabled` attribute would have removed it from the tab order and
 *    taken that away.
 *
 * 3. THE COUNTS ARE CONTEXTUAL, NOT GLOBAL. "Amber 12" beside an unselected
 *    note means twelve results if you add it to what is already selected, not
 *    twelve in the catalogue. Global counts read fine until the second note is
 *    picked, at which point every number on screen is about a set the reader is
 *    no longer looking at.
 */

/**
 * How many of the commonest notes to show before the disclosure.
 *
 * SIZED FOR THE PHONE, NOT THE DESKTOP. Two rows at 1440px either way, so the
 * desktop cost of 24 over 16 is nothing; at 375px the chips stack two to a row
 * and 24 of them put twelve rows between the reader and the first result, on a
 * page that already carries a 46-chip house row below this one. Sixteen covers
 * everything down to Mandarin - the notes somebody actually arrives wanting -
 * and the other 270 are one press or one keystroke away.
 */
const SHORTLIST = 16;

/** While searching, cap the result chips so a one-letter query does not render
 *  the entire vocabulary and push the results off screen. */
const SEARCH_LIMIT = 40;

export function NoteFilter({
  notes,
  counts,
  selected,
  onChange,
  status,
  className,
}: {
  /** The whole vocabulary with catalogue-wide counts, commonest first. */
  notes: NoteCount[];
  /** Results remaining per note key, given the current selection. Absent means
   *  zero: adding that note to this selection would return nothing. */
  counts: Map<string, number>;
  /** Selected notes, spelled as the catalogue spells them. */
  selected: string[];
  onChange: (next: string[]) => void;
  /** One sentence for the live region, written by the caller because only the
   *  caller knows what it is counting. */
  status: string;
  className?: string;
}) {
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const listId = useId();

  const selectedKeys = useMemo(() => new Set(selected.map(noteKey)), [selected]);

  const searching = query.trim().length > 0;
  const visible = useMemo(() => {
    const unselected = notes.filter((n) => !selectedKeys.has(noteKey(n.note)));
    if (searching) {
      const q = noteKey(query);
      return unselected.filter((n) => noteKey(n.note).includes(q)).slice(0, SEARCH_LIMIT);
    }
    return showAll ? unselected : unselected.slice(0, SHORTLIST);
  }, [notes, selectedKeys, searching, query, showAll]);

  const hiddenCount = notes.length - selected.length - visible.length;

  function toggle(note: string) {
    const key = noteKey(note);
    onChange(
      selectedKeys.has(key)
        ? selected.filter((n) => noteKey(n) !== key)
        : [...selected, note]
    );
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
        <span
          id={`${listId}-label`}
          className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground"
        >
          Filter by note
        </span>
        {selected.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-xs font-semibold text-primary underline-offset-4 hover:underline"
          >
            Clear {selected.length === 1 ? "the filter" : `all ${selected.length}`}
          </button>
        )}
      </div>

      {/* Selected notes are removable values, not toggles: each carries its own
          remove affordance and an accessible name that says so, because a chip
          whose only way out is to find it again in the list below is a trap. */}
      {selected.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {selected.map((note) => (
            <li key={noteKey(note)}>
              <button
                type="button"
                onClick={() => toggle(note)}
                aria-label={`Remove ${note} from the filter`}
                className="flex items-center gap-1.5 rounded-full border border-primary bg-primary py-1.5 pl-3.5 pr-2.5 text-xs font-semibold text-primary-foreground transition-opacity duration-150 hover:opacity-90"
              >
                {note}
                <X className="h-3 w-3" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="relative">
        <MagnifyingGlass
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${notes.length} notes`}
          aria-label="Search notes"
          className="w-full rounded-frame border border-border bg-card py-2 pl-9 pr-9 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25"
        />
        {searching && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear the note search"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" aria-hidden />
          </button>
        )}
      </div>

      <div
        id={listId}
        role="group"
        aria-labelledby={`${listId}-label`}
        className="flex flex-wrap gap-2"
      >
        {visible.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No note matches &ldquo;{query.trim()}&rdquo;.
          </p>
        ) : (
          visible.map(({ note }) => {
            const remaining = counts.get(noteKey(note)) ?? 0;
            const dead = remaining === 0;
            return (
              <button
                key={noteKey(note)}
                type="button"
                onClick={() => {
                  if (!dead) toggle(note);
                }}
                aria-pressed={false}
                aria-disabled={dead || undefined}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors duration-150",
                  dead
                    ? "cursor-not-allowed border-border/60 bg-card text-muted-foreground opacity-50"
                    : "border-border bg-card text-foreground/75 hover:border-primary/50 hover:text-foreground"
                )}
              >
                {note}
                <span className="ml-1.5 tabular-nums text-muted-foreground">{remaining}</span>
              </button>
            );
          })
        )}
      </div>

      {/* A button rather than a count, so the remaining notes are reachable by
          keyboard as well as by search.

          `showAll ||` IS LOAD-BEARING. Gating this on hiddenCount alone meant
          expanding drove hiddenCount to zero and took the button away with it:
          the list opened and could never be closed again, and aria-expanded
          went with it. The condition is "there is something to disclose, OR
          something is currently disclosed". */}
      {!searching && (showAll || hiddenCount > 0) && (
        <button
          type="button"
          onClick={() => setShowAll((open) => !open)}
          aria-expanded={showAll}
          aria-controls={listId}
          className="flex w-fit items-center gap-1.5 text-xs font-semibold text-primary underline-offset-4 hover:underline"
        >
          {showAll ? "Show the common notes only" : `Show all ${notes.length} notes`}
          <CaretDown
            className={cn("h-3 w-3 transition-transform duration-150", showAll && "rotate-180")}
            aria-hidden
          />
        </button>
      )}

      {/* One announcement for the whole control. It states the result rather
          than the gesture ("18 originals carry Vanilla"), so it is useful on
          its own and does not need the reader to have heard the last one. */}
      <p role="status" aria-live="polite" className="text-xs text-muted-foreground">
        {status}
      </p>
    </div>
  );
}
