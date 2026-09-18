"use client";

import { motion, useReducedMotion } from "motion/react";
import { Star } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";
import { describeValueMultiple, formatPricePerMl, valueMultiple } from "@/lib/similarity";
import { getOriginalPricing, getPublishedSimilarity, isHouseProduct } from "@/lib/catalog";
import { getReviewSummary } from "@/lib/reviews";
import { getVerificationBadge } from "@/lib/verification";
import { HouseBadge } from "@/components/dupe-finder/house-badge";
import { MatchRule } from "@/components/dupe-finder/match-rule";
import { VerificationBadge } from "@/components/dupe-finder/verification-badge";
import { FragranceImage } from "@/components/fragrance/fragrance-image";
import type { DupeCandidate, ReferenceFragrance } from "@/lib/types";

/**
 * One candidate in the ranked list.
 *
 * REBUILT 2026-09-18, and the reason was a legibility failure rather than a
 * taste one: the old row packed name, brand, score, badge, price-per-ml, value
 * multiple and a caret into a single flex line, which left the product name
 * roughly 110px and truncated it on live data. "Barakkat Ro..." by "Fragrance
 * W..." is not a listing anybody can act on, and the name is the one field
 * that must never be clipped.
 *
 * The shape now is three bands: identity (image, name, brand, disclosure
 * badges), the score as the row's anchor plus a MatchRule whose length IS the
 * number, then the evidence line (why it matches, what it costs). Reading down
 * the column, the rules shorten - that descending ladder is the ranking made
 * visible, and it costs no extra data because getRankedDupesFor() already
 * sorts by the published score.
 *
 * Nothing here computes or re-derives a score: getPublishedSimilarity() is the
 * only source, exactly as before.
 */
export function DupeResultCard({
  reference,
  dupe,
  rank,
  index,
  active,
  onSelect,
}: {
  reference: ReferenceFragrance;
  dupe: DupeCandidate;
  rank: number;
  index: number;
  active: boolean;
  onSelect: () => void;
}) {
  const reduce = useReducedMotion();
  const score = getPublishedSimilarity(reference, dupe);
  const multiple = valueMultiple(reference, dupe, getOriginalPricing(reference));
  const house = isHouseProduct(dupe);
  const reviews = getReviewSummary(dupe.slug);
  const verification = getVerificationBadge(reference, dupe);
  // "Why it matches" - the first clause of the editorial verdict, so the
  // rationale on the card and the fuller verdict shown in the comparison
  // detail never contradict each other.
  const rationale = dupe.verdict.split(".")[0] + ".";
  const stagger = Math.min(index, 5) * 0.04;

  return (
    <motion.li
      initial={reduce ? false : { opacity: 0, transform: "translateY(10px)" }}
      animate={{ opacity: 1, transform: "translateY(0px)" }}
      transition={{ duration: 0.35, delay: stagger, ease: [0.23, 1, 0.32, 1] }}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={active}
        // Names the panel this row drives. Without it a screen reader hears a
        // pressed toggle and gets no indication that something elsewhere on the
        // page changed as a result.
        aria-controls="comparison-detail"
        className={cn(
          "group relative w-full overflow-hidden rounded-frame border pl-5 pr-4 py-4 text-left",
          "transition-[border-color,background-color,transform] duration-150 ease-out active:scale-[0.99]",
          active
            ? "border-primary/45 bg-secondary/60"
            : "border-border bg-card hover:border-primary/40 hover:bg-secondary/25"
        )}
      >
        {/* The seam. A selected row is marked on its leading edge rather than
            by a ring around the whole card, so the list keeps one continuous
            left margin and the eye can find the selection without re-reading
            every border. */}
        <span
          aria-hidden
          className={cn(
            "absolute inset-y-0 left-0 w-[3px] transition-colors duration-150 ease-out",
            active ? "bg-dupe-mark" : "bg-transparent group-hover:bg-dupe-mark/35"
          )}
        />

        <span className="flex items-start gap-4">
          <FragranceImage
            fragrance={{
              name: dupe.name,
              brand: dupe.brand,
              family: reference.family,
              facets: dupe.facets,
              // A listing only has one where the merchant's programme actually
              // tracks (see scripts/fetch-dupe-images.mjs); the others fall
              // back to the generated note signature, same as references do.
              imageUrl: dupe.imageUrl,
            }}
            className="h-14 w-14 shrink-0 text-base"
          />

          <span className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-semibold tabular-nums text-foreground/70">#{rank}</span>
              <span className="truncate">{dupe.brand}</span>
            </span>
            {/* Never truncated. The name is the only field a reader needs in
                order to go and look the product up somewhere else. */}
            <span className="font-display text-lg leading-tight text-foreground">
              {dupe.name}
            </span>
          </span>

          <span className="flex shrink-0 flex-col items-end leading-none">
            <span className="font-display text-3xl tabular-nums lining-nums text-dupe">
              {score}
              <span className="text-lg align-top">%</span>
            </span>
            <span className="mt-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              match
            </span>
          </span>
        </span>

        <MatchRule score={score} delay={reduce ? 0 : stagger + 0.12} className="mt-4" />

        <span className="mt-3 flex flex-col gap-2">
          <span className="text-sm leading-relaxed text-foreground/75">{rationale}</span>

          <span className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="text-sm font-semibold tabular-nums">
              {formatPricePerMl(dupe.priceUsd, dupe.bottleMl)}
            </span>
            {/* describeValueMultiple() returns "no cheaper" and "Nx more
                expensive" as well as "Nx cheaper" - comparing against a
                discounter genuinely inverts some of these. Render whatever it
                gives back; never assume the savings direction. */}
            <span className="text-sm text-muted-foreground">{describeValueMultiple(multiple)}</span>

            <VerificationBadge info={verification} compact className="ml-auto" />
            {house && <HouseBadge />}
            {reviews && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Star weight="fill" className="h-3 w-3 text-primary" aria-hidden />
                <span className="font-semibold tabular-nums text-foreground/80">
                  {reviews.average.toFixed(1)}
                </span>
                ({reviews.count})
              </span>
            )}
          </span>
        </span>
      </button>
    </motion.li>
  );
}
