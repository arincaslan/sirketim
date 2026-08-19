"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";
import {
  PRELOADER_COUNT_MS,
  PRELOADER_EXIT_MS,
  PRELOADER_HOLD_MS,
} from "@/lib/preloader-timing";

/**
 * First-load-only preloader: a 0->100 counter in the site's serif/editorial
 * voice, gone in well under 1.5s. Lives in the root layout, so it mounts
 * once per real page load — Next's App Router keeps the layout tree mounted
 * across client-side `<Link>` navigations, so it never replays on route
 * changes, only on an actual browser load/refresh.
 *
 * The exit is a clip-path wipe (not a fade) so it reads as a curtain lifting
 * off the page rather than the loader just disappearing. The hero's own
 * entrance animation is timed (see lib/preloader-timing.ts) to play as this
 * wipe clears, so the reveal feels coordinated instead of the hero already
 * sitting there static when the counter finishes.
 *
 * Respects `prefers-reduced-motion`: skips straight to content, no counter,
 * no wipe.
 */
export function Preloader() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [phase, setPhase] = useState<"loading" | "done">(
    prefersReducedMotion ? "done" : "loading"
  );
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion) return;

    let raf = 0;
    let holdTimer: ReturnType<typeof setTimeout> | undefined;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / PRELOADER_COUNT_MS);
      const eased = 1 - Math.pow(1 - progress, 2); // ease-out: quick start, settles into 100
      setCount(Math.round(eased * 100));

      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        holdTimer = setTimeout(() => setPhase("done"), PRELOADER_HOLD_MS);
      }
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      if (holdTimer) clearTimeout(holdTimer);
    };
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (phase !== "loading") return;
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = previousOverflow;
    };
  }, [phase]);

  if (prefersReducedMotion) return null;

  return (
    <AnimatePresence>
      {phase === "loading" && (
        <motion.div
          key="preloader"
          aria-hidden="true"
          className="fixed inset-0 z-[10050] flex flex-col items-center justify-center gap-6 bg-background"
          exit={{
            clipPath: "inset(0 0 100% 0)",
            transition: {
              duration: PRELOADER_EXIT_MS / 1000,
              ease: [0.76, 0, 0.24, 1],
            },
          }}
        >
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-gold">
            Ambre
          </p>

          <div className="flex items-baseline font-serif text-6xl font-medium tabular-nums text-foreground md:text-7xl">
            <span>{count}</span>
            <span className="ml-1 text-2xl italic text-muted-foreground md:text-3xl">
              %
            </span>
          </div>

          <div className="h-px w-40 overflow-hidden bg-border">
            <div
              className="h-full bg-gold"
              style={{ width: `${count}%` }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
