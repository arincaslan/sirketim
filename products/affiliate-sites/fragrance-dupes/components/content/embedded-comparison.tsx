import { ComparisonDetail } from "@/components/dupe-finder/comparison-detail";
import { getDupe, getReference } from "@/lib/dupes-data";

/**
 * MDX-embeddable comparison: `<EmbeddedComparison referenceSlug="..."
 * dupeSlug="..." />`. Reuses the exact same dataset and ComparisonDetail
 * component the interactive Dupe Finder tool renders, so a written article
 * and the tool never disagree with each other (see DESIGN.md §9).
 */
export function EmbeddedComparison({
  referenceSlug,
  dupeSlug,
}: {
  referenceSlug: string;
  dupeSlug: string;
}) {
  const reference = getReference(referenceSlug);
  const dupe = getDupe(dupeSlug);

  if (!reference || !dupe) {
    return (
      <p className="not-prose rounded-frame border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
        Unknown comparison pairing: {referenceSlug} / {dupeSlug}
      </p>
    );
  }

  return (
    <div className="not-prose my-8">
      <ComparisonDetail reference={reference} dupe={dupe} />
    </div>
  );
}
