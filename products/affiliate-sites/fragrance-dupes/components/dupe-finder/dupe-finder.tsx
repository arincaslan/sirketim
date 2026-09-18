"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ReferencePicker } from "@/components/dupe-finder/reference-picker";
import { DupeResultCard } from "@/components/dupe-finder/dupe-result-card";
import { ComparisonDetail } from "@/components/dupe-finder/comparison-detail";
import { ProducerFilter } from "@/components/dupe-finder/producer-filter";
import { REFERENCES } from "@/lib/dupes-data";
import { hasRealAffiliateLink } from "@/lib/affiliate-links";
import {
  filterDupesByProducer,
  getProducerSlugsFor,
  getRankedDupesFor,
} from "@/lib/catalog";

/**
 * The results surface.
 *
 * RESTAGED 2026-09-18, to finish what the card rebuild started. Three things
 * changed and each was a legibility or a comprehension problem rather than a
 * taste one:
 *
 * 1. The producer filter sat above a two-column grid, so nothing said which
 *    column it acted on. It filters the ranked list, so it now lives in the
 *    ranked list's own header, under the count it changes.
 * 2. The reference's name was a 2xl heading competing with the picker above it
 *    and the card scores below it. It is the subject of everything on screen
 *    and now reads at section scale, once, across the full width.
 * 3. The list column had no head and no foot, so a column of restyled cards
 *    floated inside an unstyled frame. It now opens on a hairline rule
 *    carrying the count and closes on the sort key, which is the one fact a
 *    reader needs in order to trust the order.
 *
 * Nothing here computes a score. getRankedDupesFor() ranks and gates, the card
 * renders getPublishedSimilarity(), and this file only decides where they sit.
 */
export function DupeFinder({ initialReferenceSlug }: { initialReferenceSlug?: string }) {
  const [referenceSlug, setReferenceSlug] = useState(initialReferenceSlug ?? REFERENCES[0].slug);
  const [producerSlug, setProducerSlug] = useState("");

  const reference = REFERENCES.find((r) => r.slug === referenceSlug) ?? REFERENCES[0];

  const rankedDupes = useMemo(() => getRankedDupesFor(reference), [reference]);
  const producerSlugs = useMemo(() => getProducerSlugsFor(reference), [reference]);
  const visibleDupes = useMemo(
    () => filterDupesByProducer(rankedDupes, producerSlug),
    [rankedDupes, producerSlug]
  );

  const [dupeSlug, setDupeSlug] = useState(rankedDupes[0]?.slug);

  // Reset the selected dupe and clear any producer filter whenever the
  // reference changes, so neither the detail panel nor the filter can carry a
  // selection over from a different fragrance.
  useEffect(() => {
    setProducerSlug("");
    setDupeSlug(getRankedDupesFor(reference)[0]?.slug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reference.slug]);

  // Keep the detail panel on a listing that is actually visible: filtering to
  // a producer whose bottle is not the selected one should move the panel, not
  // leave it showing something the list no longer offers.
  useEffect(() => {
    if (visibleDupes.length > 0 && !visibleDupes.some((d) => d.slug === dupeSlug)) {
      setDupeSlug(visibleDupes[0].slug);
    }
  }, [visibleDupes, dupeSlug]);

  const selectedDupe = visibleDupes.find((d) => d.slug === dupeSlug) ?? visibleDupes[0];

  return (
    <div className="flex flex-col gap-10">
      <ReferencePicker
        references={REFERENCES}
        selectedSlug={reference.slug}
        onSelect={setReferenceSlug}
      />

      <header className="flex flex-col gap-2 border-t border-border pt-9">
        <h2 className="font-display text-fluid-h2">Alternatives to {reference.name}</h2>
        <p className="max-w-[60ch] text-muted-foreground">
          Every listing we hold against {reference.name} ({reference.brand}), put through the
          same published formula as everything else on this site. Pick one to see where it
          matches and where it does not.
        </p>
      </header>

      {visibleDupes.length === 0 ? (
        <div className="flex flex-col items-start gap-4 rounded-frame border border-dashed border-border bg-card/40 p-8 sm:p-10">
          {rankedDupes.length === 0 ? (
            <>
              <p className="max-w-[52ch] font-display text-xl leading-snug text-foreground/85">
                Nobody has listed an alternative to {reference.name} yet.
              </p>
              {hasRealAffiliateLink(reference.affiliateLinkId) ? (
                <a
                  href={`/go/${reference.affiliateLinkId}`}
                  rel="sponsored nofollow noopener"
                  target="_blank"
                  className="text-sm font-semibold text-primary underline underline-offset-4"
                >
                  Buy {reference.name} - ${reference.priceUsd}
                </a>
              ) : (
                <p className="max-w-[52ch] text-sm text-muted-foreground">
                  We are not enrolled in a retailer programme yet, so there is nothing to link
                  to. The comparison data below is real either way.
                </p>
              )}
            </>
          ) : (
            <p className="max-w-[52ch] font-display text-xl leading-snug text-foreground/85">
              Nothing listed against {reference.name} from that producer yet.
            </p>
          )}
        </div>
      ) : (
        <div className="grid gap-x-10 gap-y-10 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:items-start">
          <div className="flex flex-col">
            <div className="flex items-baseline justify-between gap-4 border-b border-border pb-3">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Ranked
              </span>
              <span className="text-sm tabular-nums text-muted-foreground">
                {visibleDupes.length} {visibleDupes.length === 1 ? "listing" : "listings"}
              </span>
            </div>

            {/* The filter belongs to the list it filters. Above the grid it sat
                between two columns with nothing saying which one it acted on. */}
            <ProducerFilter
              producerSlugs={producerSlugs}
              selected={producerSlug}
              onSelect={setProducerSlug}
              className="mt-4"
            />

            <ol className="mt-4 flex flex-col gap-3">
              {visibleDupes.map((dupe, index) => (
                <DupeResultCard
                  key={dupe.slug}
                  reference={reference}
                  dupe={dupe}
                  rank={index + 1}
                  index={index}
                  active={dupe.slug === selectedDupe?.slug}
                  onSelect={() => setDupeSlug(dupe.slug)}
                />
              ))}
            </ol>

            {/* The order is the claim this column makes, so it says what the
                order is rather than leaving a reader to infer it from the
                numbers. "Published" is the load-bearing word: an unverified
                listing is capped before it gets here. */}
            <p className="mt-5 border-t border-border/70 pt-4 text-xs text-muted-foreground">
              Ordered by published match score, highest first.{" "}
              <a
                href="/about#methodology"
                className="underline underline-offset-2 hover:text-primary"
              >
                How we calculate it
              </a>
            </p>
          </div>

          <div id="comparison-detail" className="lg:sticky lg:top-24">
            <AnimatePresence mode="wait">
              {selectedDupe && (
                <motion.div
                  key={selectedDupe.slug}
                  initial={{ opacity: 0, transform: "translateY(8px)" }}
                  animate={{ opacity: 1, transform: "translateY(0px)" }}
                  exit={{ opacity: 0, transform: "translateY(-4px)" }}
                  transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                >
                  <ComparisonDetail reference={reference} dupe={selectedDupe} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
