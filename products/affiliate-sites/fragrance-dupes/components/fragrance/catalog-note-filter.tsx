"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { NoteFilter } from "@/components/fragrance/note-filter";
import { formatNoteList, noteKey, type NoteCount } from "@/lib/notes";

/**
 * The note filter over the catalog index, applied to server-rendered cards.
 *
 * WHY THIS HIDES MARKUP INSTEAD OF RENDERING IT. /fragrance ships 190 bytes of
 * route JavaScript and carries all 216 internal links to the fragrance pages -
 * it is the page that exists because those pages were otherwise reachable only
 * from the sitemap. Rebuilding the cards on the client would have meant either
 * serialising the whole reference list into the RSC payload or importing
 * lib/catalog.ts, which pulls in 217KB of listing data this page renders none
 * of. So the server keeps rendering every card, every link stays in the HTML
 * for a crawler and for a reader with no JavaScript, and the client receives
 * one compact index: note -> the positions of the cards carrying it.
 *
 * THE DOM WRITES ARE SAFE BECAUSE REACT DOES NOT OWN THESE NODES. `children`
 * is a stable RSC payload, so a state change here re-renders the control and
 * bails out of reconciling the cards; `hidden` and the jump-nav counts
 * therefore survive. That stops being true the moment anything makes the
 * children depend on state - if that ever happens, this has to become a real
 * render rather than a mutation, and the symptom will be filters that undo
 * themselves.
 */
export function CatalogNoteFilter({
  notes,
  noteMap,
  total,
  children,
}: {
  /** The vocabulary with catalogue-wide counts, commonest first. */
  notes: NoteCount[];
  /** Note key -> indices of the cards carrying it, in rendered order. */
  noteMap: Record<string, number[]>;
  /** How many cards there are in total, for the unfiltered status line. */
  total: number;
  children: ReactNode;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  /** The cards still standing, or null when nothing is selected. Null rather
   *  than "all of them" so the effect below can skip the work entirely and
   *  leave the server's markup exactly as it shipped. */
  const matching = useMemo(() => {
    if (selected.length === 0) return null;
    const lists = selected.map((note) => noteMap[noteKey(note)] ?? []);
    lists.sort((a, b) => a.length - b.length);
    let set = new Set(lists[0]);
    for (const list of lists.slice(1)) {
      const next = new Set<number>();
      for (const i of list) if (set.has(i)) next.add(i);
      set = next;
    }
    return set;
  }, [selected, noteMap]);

  /** Results remaining per note, given the selection - the same contract as
   *  getAvailableNoteCounts(), computed from the index instead of the data. */
  const counts = useMemo(() => {
    const selectedKeys = new Set(selected.map(noteKey));
    const out = new Map<string, number>();
    for (const [key, list] of Object.entries(noteMap)) {
      if (selectedKeys.has(key)) continue;
      out.set(key, matching === null ? list.length : list.filter((i) => matching.has(i)).length);
    }
    return out;
  }, [noteMap, matching, selected]);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const liveByHouse = new Map<string, number>();
    root.querySelectorAll<HTMLElement>("[data-card]").forEach((card) => {
      const show = matching === null || matching.has(Number(card.dataset.card));
      card.hidden = !show;
      const house = card.dataset.house;
      if (show && house) liveByHouse.set(house, (liveByHouse.get(house) ?? 0) + 1);
    });

    // A house heading with nothing under it reads as a house we hold nothing
    // for, which is a different and false claim. Hide the whole section.
    root.querySelectorAll<HTMLElement>("[data-house-section]").forEach((section) => {
      section.hidden = (liveByHouse.get(section.dataset.houseSection ?? "") ?? 0) === 0;
    });

    root.querySelectorAll<HTMLElement>("[data-house-jump]").forEach((jump) => {
      jump.hidden = (liveByHouse.get(jump.dataset.houseJump ?? "") ?? 0) === 0;
    });

    // Every count keyed to a house moves with the filter - the jump row's and
    // the section heading's alike. The heading one matters most: "Chanel 14"
    // sitting directly above three cards is a number contradicting the list
    // underneath it, which is worse than no number at all.
    root.querySelectorAll<HTMLElement>("[data-house-count]").forEach((badge) => {
      badge.textContent = String(liveByHouse.get(badge.dataset.houseCount ?? "") ?? 0);
    });
  }, [matching]);

  const shown = matching === null ? total : matching.size;
  const status =
    selected.length === 0
      ? `All ${total} originals. Pick a note to narrow them.`
      : shown === 0
        ? `No original carries ${formatNoteList(selected)}.`
        : `${shown} ${shown === 1 ? "original carries" : "originals carry"} ${formatNoteList(selected)}.`;

  return (
    <>
      <NoteFilter
        notes={notes}
        counts={counts}
        selected={selected}
        onChange={setSelected}
        status={status}
        className="mb-10 rounded-frame border border-border bg-card/40 p-5 sm:p-6"
      />

      <div ref={containerRef}>
        {children}

        {/* UNREACHABLE BY CLICKING, ON PURPOSE, AND KEPT ANYWAY. Every chip
            carries the count it would leave and a chip reading zero refuses
            the click, so no sequence of presses can empty this page - that is
            the whole point of contextual counts. This is the net under that
            invariant: if the counts ever go back to being catalogue-wide, the
            page would otherwise just go blank with the filter still insisting
            the notes are there. It cannot live inside `children`, which is
            server markup this component only hides. */}
        {matching !== null && shown === 0 && (
          <div className="flex flex-col items-start gap-3 rounded-frame border border-dashed border-border bg-card/40 p-8 sm:p-10">
            <p className="max-w-[52ch] font-display text-xl leading-snug text-foreground/85">
              No original in the catalogue carries {formatNoteList(selected)} together.
            </p>
            <button
              type="button"
              onClick={() => setSelected([])}
              className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
            >
              Clear the note filter
            </button>
          </div>
        )}
      </div>
    </>
  );
}
