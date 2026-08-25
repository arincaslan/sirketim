"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ReferencePicker } from "@/components/dupe-finder/reference-picker";
import { DupeResultCard } from "@/components/dupe-finder/dupe-result-card";
import { ComparisonDetail } from "@/components/dupe-finder/comparison-detail";
import { REFERENCES, getDupesFor } from "@/lib/dupes-data";
import { computeSimilarity } from "@/lib/similarity";

export function DupeFinder({ initialReferenceSlug }: { initialReferenceSlug?: string }) {
  const [referenceSlug, setReferenceSlug] = useState(initialReferenceSlug ?? REFERENCES[0].slug);
  const reference = REFERENCES.find((r) => r.slug === referenceSlug) ?? REFERENCES[0];

  const rankedDupes = useMemo(() => {
    return getDupesFor(reference.slug)
      .map((dupe) => ({ dupe, score: computeSimilarity(reference, dupe) }))
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.dupe);
  }, [reference]);

  const [dupeSlug, setDupeSlug] = useState(rankedDupes[0]?.slug);

  // Reset the selected dupe whenever the reference changes, so the detail
  // panel never shows a candidate for a different fragrance.
  useEffect(() => {
    setDupeSlug(rankedDupes[0]?.slug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reference.slug]);

  const selectedDupe = rankedDupes.find((d) => d.slug === dupeSlug) ?? rankedDupes[0];

  return (
    <div className="flex flex-col gap-8">
      <ReferencePicker
        references={REFERENCES}
        selectedSlug={reference.slug}
        onSelect={setReferenceSlug}
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-start">
        <ol className="flex flex-col gap-3">
          {rankedDupes.map((dupe, index) => (
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
    </div>
  );
}
