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
    <div className="flex flex-col gap-8">
      <ReferencePicker
        references={REFERENCES}
        selectedSlug={reference.slug}
        onSelect={setReferenceSlug}
      />

      <div className="flex flex-col gap-4 border-t border-border/70 pt-8">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 className="font-display text-2xl">
            Alternatives to {reference.name}
          </h2>
          <p className="text-sm text-muted-foreground">
            {visibleDupes.length} {visibleDupes.length === 1 ? "listing" : "listings"}, ranked by
            match
          </p>
        </div>

        <ProducerFilter
          producerSlugs={producerSlugs}
          selected={producerSlug}
          onSelect={setProducerSlug}
        />
      </div>

      {visibleDupes.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-frame border border-dashed border-border p-10 text-center">
          {rankedDupes.length === 0 ? (
            <>
              <p className="max-w-[52ch] text-sm text-muted-foreground">
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
                <p className="max-w-[52ch] text-xs text-muted-foreground">
                  We are not enrolled in a retailer programme yet, so there is nothing to link
                  to. The comparison data below is real either way.
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Nothing listed against {reference.name} from that producer yet.
            </p>
          )}
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-start">
          <ol className="flex flex-col gap-3">
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

          <div className="lg:sticky lg:top-24">
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
