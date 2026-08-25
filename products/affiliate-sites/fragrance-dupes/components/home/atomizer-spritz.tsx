"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";

import { MistBurst } from "@/components/site/mist-burst";
import { RadarChart } from "@/components/dupe-finder/radar-chart";
import type { FacetScores } from "@/lib/types";

/** Roughly matches MistBurst's own duration + its last particle's random
 *  start delay, so the chart appears just as the mist finishes releasing,
 *  not before it or with a dead gap after. */
const CHART_DELAY_MS = 550;

/**
 * The chapter-3 "spritz" (Implementation addendum v3, "The Atomizer") -
 * the moment the founder named directly: an abstract atomizer silhouette
 * releases, and the mist leads straight into the Dupe Finder's own
 * already-built radar chart, tying the flourish to the site's real
 * substance (the disclosed formula's actual note/facet data) instead of
 * leaving it purely decorative.
 *
 * The silhouette is hand-built inline SVG, not an OpenArt image - a
 * generated raster risked reading as stock/product photography (the exact
 * generic-premium-brand problem this pass exists to fix) and risked this
 * department's own trademark-caution line on bottle imagery; a spare line
 * drawing is abstract by construction and matches the radar chart's own
 * hand-built-SVG visual language rather than introducing a new one.
 *
 * `radar-chart.tsx` itself is untouched - its "Match Reveal" entrance
 * (stroke-draw + spring) plays exactly as it does on `/dupe-finder` and in
 * articles, just given a beat of room after the mist disperses rather than
 * mounting immediately, so it reads as the payoff rather than competing
 * with the mist for attention.
 *
 * Triggered once on scroll into view (`onViewportEnter`, `once: true`) -
 * the same viewport-trigger convention `Reveal` and the Match Reveal
 * already use elsewhere on this site, not a new interaction pattern.
 * Under `prefers-reduced-motion`, skips the silhouette and burst outright
 * and renders the chart directly - not a faster flourish, no flourish.
 */
export function AtomizerSpritz({
  referenceName,
  dupeName,
  referenceFacets,
  dupeFacets,
}: {
  referenceName: string;
  dupeName: string;
  referenceFacets: FacetScores;
  dupeFacets: FacetScores;
}) {
  const shouldReduceMotion = useReducedMotion();
  const [triggered, setTriggered] = useState(false);
  const [chartVisible, setChartVisible] = useState(false);

  if (shouldReduceMotion) {
    return (
      <RadarChart
        referenceName={referenceName}
        dupeName={dupeName}
        referenceFacets={referenceFacets}
        dupeFacets={dupeFacets}
      />
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <motion.div
        className="relative flex h-16 w-16 items-center justify-center"
        onViewportEnter={() => {
          if (triggered) return;
          setTriggered(true);
          window.setTimeout(() => setChartVisible(true), CHART_DELAY_MS);
        }}
        viewport={{ once: true, amount: 0.6 }}
      >
        <motion.svg
          viewBox="0 0 48 48"
          className="h-10 w-10 text-primary"
          initial={{ opacity: 0, transform: "translateY(6px) scale(0.92)" }}
          animate={triggered ? { opacity: 1, transform: "translateY(0px) scale(1)" } : undefined}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        >
          {/* Abstract atomizer silhouette: bulb, stem, nozzle - line art
              only, no bottle shape, no label, per the trademark-caution
              rule this department holds on every image/asset. */}
          <ellipse
            cx="18"
            cy="30"
            rx="9"
            ry="11"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <line
            x1="26"
            y1="24"
            x2="38"
            y2="14"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <circle cx="40" cy="12" r="2.4" fill="currentColor" />
        </motion.svg>

        {triggered && <MistBurst count={20} radius={46} durationS={0.55} />}
      </motion.div>

      {chartVisible && (
        <RadarChart
          referenceName={referenceName}
          dupeName={dupeName}
          referenceFacets={referenceFacets}
          dupeFacets={dupeFacets}
        />
      )}
    </div>
  );
}
