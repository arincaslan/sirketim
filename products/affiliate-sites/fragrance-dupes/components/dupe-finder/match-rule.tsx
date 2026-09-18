"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * A published figure, drawn as a rule whose LENGTH is the figure.
 *
 * Why this exists: the ranked list used to state four numbers per row in four
 * different registers (a percentage, a badge, a price-per-ml, a value
 * multiple) and nothing let you compare two rows without reading both. A rule
 * scaled to the score turns the list into a ladder you can read at a glance,
 * and the ladder descends because getRankedDupesFor() already sorts by
 * published score. It renders the score, it does not compute one - the caller
 * passes what getPublishedSimilarity() returned.
 *
 * Deliberately NO background track. A filled track with a partial fill on top
 * is dashboard chrome (design-taste-frontend section 9.F bans it outright as a
 * comparison visual); several bare rules sharing one container width compare
 * perfectly well against each other without one, and the absence is what keeps
 * this reading as editorial rather than as a progress bar.
 *
 * GENERALISED 2026-09-18, additively: `tone` and `max` are both optional and
 * both default to what the ranked card already passed, so that call site
 * renders byte-identically. Two reasons for widening it rather than writing a
 * second near-identical component. First, /fragrance/[slug] was drawing its
 * facet profile as six filled-track progress bars, the exact pattern this
 * component's own doc comment says is banned, so it needed this shape; a copy
 * would have been a third rule primitive nothing could keep in step. Second,
 * the two tones carry the site's existing chart grammar onto pages that had
 * none: gold (`reference-mark`) describes the original, green (`dupe-mark`)
 * describes an alternative, exactly as in the radar chart. Both are the
 * non-text chart-mark tokens, which is what a bare rule is.
 *
 * Motion: a constant-rate line draw, so `linear` is correct - the same
 * reasoning (and the same curve) DESIGN.md section 5 already applies to the
 * radar chart's stroke-draw, extended to the site's second line-draw rather
 * than a new curve being invented for it. scaleX on a 1px element, so it is
 * transform-only and never touches layout. Reduced motion skips straight to
 * the final length; the site's global CSS reset cannot reach a JS-driven
 * animation, so this has to be handled here.
 */
export function MatchRule({
  score,
  max = 100,
  tone = "dupe",
  delay = 0,
  thickness = "hairline",
  className,
}: {
  score: number;
  /** Full-width value. 100 for a percentage, 10 for a facet rating. */
  max?: number;
  /** Which series this figure belongs to. See the note above on the grammar. */
  tone?: "dupe" | "reference";
  delay?: number;
  thickness?: "hairline" | "bold";
  className?: string;
}) {
  const reduce = useReducedMotion();
  const width = Math.max(0, Math.min(100, (score / max) * 100));

  return (
    <span
      aria-hidden
      className={cn("block w-full overflow-hidden", thickness === "bold" ? "h-0.5" : "h-px", className)}
    >
      <motion.span
        className={cn(
          "block origin-left rounded-pill",
          tone === "reference" ? "bg-reference-mark" : "bg-dupe-mark",
          thickness === "bold" ? "h-0.5" : "h-px"
        )}
        style={{ width: `${width}%` }}
        initial={reduce ? false : { transform: "scaleX(0)" }}
        animate={{ transform: "scaleX(1)" }}
        transition={{ duration: 0.5, delay, ease: "linear" }}
      />
    </span>
  );
}
