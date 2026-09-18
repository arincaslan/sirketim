"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { MagnifyingGlass, X } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";
import { getListingCounts, getReferencesByBrand, searchReferences } from "@/lib/catalog";
import {
  filterReferencesByNotes,
  formatNoteList,
  getAvailableNoteCounts,
  getNoteIndex,
} from "@/lib/notes";
import { FragranceImage } from "@/components/fragrance/fragrance-image";
import { NoteFilter } from "@/components/fragrance/note-filter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemText,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ReferenceFragrance } from "@/lib/types";

/**
 * Pick the original you already know: choose the house, then the bottle.
 *
 * This replaced a flat grid of every reference. That worked at six and became
 * unreadable at sixty-eight - the page was a wall of near-identical cards
 * before the tool below it even started. Two steps keeps one decision on
 * screen at a time: eight brands, then only that brand's fragrances in a
 * dropdown.
 *
 * Search stays as the escape hatch for someone who knows the name and does not
 * want to think about which house makes it, and it searches notes too, so
 * "vanilla" lands somewhere useful.
 */
export function ReferencePicker({
  references,
  selectedSlug,
  onSelect,
}: {
  references: ReferenceFragrance[];
  selectedSlug: string;
  onSelect: (slug: string) => void;
}) {
  const [query, setQuery] = useState("");
  const counts = useMemo(() => getListingCounts(), []);

  // THE NOTE FILTER NARROWS WHAT YOU CAN PICK, not what a comparison says.
  // Every number on the results side is computed from the reference that ends
  // up selected and nothing here touches one - this only decides which bottles
  // the two steps below are willing to offer.
  const [noteFilter, setNoteFilter] = useState<string[]>([]);
  const noteIndex = useMemo(() => getNoteIndex(references), [references]);
  const noteCounts = useMemo(
    () => getAvailableNoteCounts(references, noteFilter),
    [references, noteFilter]
  );
  const pickable = useMemo(
    () => filterReferencesByNotes(references, noteFilter),
    [references, noteFilter]
  );

  const groups = useMemo(() => getReferencesByBrand(pickable), [pickable]);

  const selected = references.find((r) => r.slug === selectedSlug);
  const [brand, setBrand] = useState(selected?.brand ?? groups[0]?.brand ?? "");

  // Follow the selection when it changes from outside (a deep link, or the
  // search results below), so the brand row never contradicts what is actually
  // being compared.
  useEffect(() => {
    if (selected && selected.brand !== brand) setBrand(selected.brand);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.slug]);

  // A filter that narrowed the list but left the comparison sitting on a bottle
  // the list no longer offers would be showing a result for a reference the
  // reader can no longer see - the same trap the ranked column already solves
  // for the producer filter in dupe-finder.tsx. Move to the first bottle that
  // does match; when nothing matches, change nothing and say so instead.
  useEffect(() => {
    if (pickable.length === 0) return;
    if (!pickable.some((r) => r.slug === selectedSlug)) onSelect(pickable[0].slug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickable]);

  // The house row is built from the filtered set, so the selected house can
  // disappear out from under it. Fall back to the first house still standing.
  useEffect(() => {
    if (groups.length > 0 && !groups.some((g) => g.brand === brand)) setBrand(groups[0].brand);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groups]);

  const brandRefs = useMemo(
    () => groups.find((g) => g.brand === brand)?.references ?? [],
    [groups, brand]
  );

  const searching = query.trim().length > 0;
  // Searches the FILTERED set, not the whole catalogue. Search is the escape
  // hatch from the two steps, not an escape hatch from the filter - a note
  // filter that the search box quietly ignored would put results on screen
  // that the control above says are excluded.
  const searchResults = useMemo(
    () => (searching ? searchReferences(query, pickable).slice(0, 8) : []),
    [query, pickable, searching]
  );

  const noteStatus =
    noteFilter.length === 0
      ? `All ${references.length} originals. Pick a note to narrow them.`
      : pickable.length === 0
        ? `No original carries ${formatNoteList(noteFilter)}.`
        : `${pickable.length} ${pickable.length === 1 ? "original carries" : "originals carry"} ${formatNoteList(noteFilter)}.`;

  function pick(slug: string) {
    onSelect(slug);
    setQuery("");
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Search: the direct route, when you already know the name. */}
      <div className="relative">
        <MagnifyingGlass
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search all originals by name, brand, or note"
          aria-label="Search all originals"
          className="w-full rounded-frame border border-border bg-card py-2.5 pl-9 pr-9 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25"
        />
        {searching && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" aria-hidden />
          </button>
        )}

        <AnimatePresence>
          {searching && (
            <motion.div
              initial={{ opacity: 0, transform: "translateY(-4px)" }}
              animate={{ opacity: 1, transform: "translateY(0px)" }}
              exit={{ opacity: 0, transform: "translateY(-4px)" }}
              transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
              className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-30 overflow-hidden rounded-frame border border-border bg-card p-1.5 shadow-lg"
            >
              {searchResults.length === 0 ? (
                <p className="px-3 py-4 text-center text-sm text-muted-foreground">
                  Nothing matches that yet.
                </p>
              ) : (
                <ul>
                  {searchResults.map((ref) => (
                    <li key={ref.slug}>
                      <button
                        type="button"
                        onClick={() => pick(ref.slug)}
                        className="flex w-full items-center gap-3 rounded-[0.375rem] px-3 py-2.5 text-left transition-colors hover:bg-secondary/70"
                      >
                        <FragranceImage fragrance={ref} className="h-9 w-9 text-base" />
                        <span className="flex min-w-0 flex-1 flex-col">
                          <span className="truncate text-sm font-semibold">{ref.name}</span>
                          <span className="truncate text-xs text-muted-foreground">
                            {ref.brand}
                          </span>
                        </span>
                        <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                          {counts.get(ref.slug) ?? 0} listed
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Narrowing, between the two ways in. Search is for someone who knows
          the name; the steps are for someone who knows the house; this is for
          someone who knows neither and does know they want vanilla. */}
      <NoteFilter
        notes={noteIndex}
        counts={noteCounts}
        selected={noteFilter}
        onChange={setNoteFilter}
        status={noteStatus}
        className="border-t border-border pt-6"
      />

      {/* UNREACHABLE BY CLICKING, ON PURPOSE, AND KEPT ANYWAY - the same net,
          for the same reason, as the one in catalog-note-filter.tsx. Every
          chip shows the count it would leave and a zero refuses the click, so
          the two steps cannot be emptied from the control above them. */}
      {pickable.length === 0 ? (
        <div className="flex flex-col items-start gap-3 rounded-frame border border-dashed border-border bg-card/40 p-6">
          <p className="max-w-[52ch] font-display text-lg leading-snug text-foreground/85">
            Nothing in the catalogue carries {formatNoteList(noteFilter)} together.
          </p>
          {/* The selection is untouched behind this, so clearing the filter
              puts the reader back exactly where they were rather than on
              whatever bottle happened to be first. */}
          <button
            type="button"
            onClick={() => setNoteFilter([])}
            className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
          >
            Clear the note filter
          </button>
        </div>
      ) : (
        <>
        {/* Step 1: the house. */}
        <div className="flex flex-col gap-3">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Step 1 - Pick a house
          </span>
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Fragrance house">
            {groups.map((group) => {
              const active = group.brand === brand;
              return (
                <button
                  key={group.brand}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setBrand(group.brand)}
                  className={cn(
                    "relative rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-150",
                    active ? "text-primary-foreground" : "text-foreground/70 hover:text-foreground"
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="brand-pill"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      className="absolute inset-0 rounded-full bg-primary"
                      aria-hidden
                    />
                  )}
                  <span className="relative z-10 whitespace-nowrap">
                    {group.brand}
                    {/* The inactive count was opacity-50 over the pill's own
                        text-foreground/70, i.e. 35% of the ink, and Lighthouse
                        fails it on contrast. --muted-foreground is the token
                        that exists for de-emphasised text and clears AA at
                        5.91:1. The active pill keeps its opacity: white at 70%
                        over the primary green measures 4.71:1, which passes. */}
                    <span className={cn("ml-1.5 text-xs", active ? "opacity-70" : "text-muted-foreground")}>
                      {group.references.length}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: the bottle. */}
        <div className="flex flex-col gap-3">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Step 2 - Pick the fragrance
          </span>

          <AnimatePresence mode="wait">
            <motion.div
              key={brand}
              initial={{ opacity: 0, transform: "translateY(6px)" }}
              animate={{ opacity: 1, transform: "translateY(0px)" }}
              exit={{ opacity: 0, transform: "translateY(-4px)" }}
              transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
              className="flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              <Select value={selectedSlug} onValueChange={pick}>
                <SelectTrigger className="sm:max-w-md" aria-label={`Choose a ${brand} fragrance`}>
                  <SelectValue placeholder={`Choose a ${brand} fragrance`} />
                </SelectTrigger>
                <SelectContent>
                  {brandRefs.map((ref) => {
                    const listings = counts.get(ref.slug) ?? 0;
                    return (
                      <SelectItem key={ref.slug} value={ref.slug}>
                        <FragranceImage fragrance={ref} className="h-8 w-8 text-sm" />
                        <SelectItemText>
                          <span className="flex min-w-0 flex-col">
                            <span className="truncate font-semibold">{ref.name}</span>
                            <span className="truncate text-xs text-muted-foreground">
                              {ref.family} - {listings > 0 ? `${listings} listed` : "none listed yet"}
                            </span>
                          </span>
                        </SelectItemText>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>

              {selected && (
                <div className="flex min-w-0 items-center gap-3">
                  <FragranceImage fragrance={selected} className="h-12 w-12 text-lg" />
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate font-display text-lg leading-tight">
                      {selected.name}
                    </span>
                    <span className="truncate text-xs tabular-nums text-muted-foreground">
                      approx. ${selected.priceUsd} / {selected.bottleMl}ml - {selected.concentration}
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        </>
      )}
    </div>
  );
}
