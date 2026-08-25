"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { MistBurst } from "@/components/site/mist-burst";
import {
  PRELOADER_COUNT_MS,
  PRELOADER_EXIT_MS,
  PRELOADER_HOLD_MS,
} from "@/lib/preloader-timing";

/**
 * First-load-only preloader: a 0-100 counter set in the site's own display
 * serif, gone in well under 1.5s. Lives in the root layout, so it mounts
 * once per real page load - Next's App Router keeps the layout tree mounted
 * across client-side `<Link>` navigations, so it never replays on route
 * changes, only on an actual browser load/refresh.
 *
 * Exit (Implementation addendum v3, "The Atomizer"): the content block
 * (wordmark, counter, progress rule) blur-dissolves - `filter: blur()` +
 * a slight scale-up + fade, Emil Kowalski's "use blur to mask an imperfect
 * transition" recipe applied literally here, since the transition being
 * masked is "this text becomes mist" - while a `MistBurst` releases from
 * the same spot and the outer container still runs its proven clip-path
 * curtain wipe underneath, all three playing over the same
 * `PRELOADER_EXIT_MS` window. This is deliberate: the site's signature
 * motion system now shows up from first paint, not just partway down the
 * homepage. The counter/timing mechanics themselves (the RAF-driven
 * 0-100 count, the hold, the coordinated hero-reveal delay) are unchanged
 * and proven - only the exit's visual treatment changed.
 *
 * Respects `prefers-reduced-motion`: skips straight to content, no
 * counter, no wipe, no mist.
 */
export function Preloader() {
  const prefersReducedMotion = useReducedMotion();
  const [phase, setPhase] = useState<"loading" | "done">(
    prefersReducedMotion ? "done" : "loading"
  );
  const [bursting, setBursting] = useState(false);
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
        holdTimer = setTimeout(() => {
          // Flip both in the same tick: MistBurst mounts into the exact
          // render snapshot AnimatePresence carries into the exit
          // transition, so the burst starts exactly as the curtain wipe
          // and the content dissolve both begin, not before or after.
          setBursting(true);
          setPhase("done");
        }, PRELOADER_HOLD_MS);
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
          className="fixed inset-0 z-[10050] flex flex-col items-center justify-center gap-7 bg-background"
          exit={{
            clipPath: "inset(0 0 100% 0)",
            transition: {
              duration: PRELOADER_EXIT_MS / 1000,
              ease: [0.76, 0, 0.24, 1],
            },
          }}
        >
          <motion.div
            className="relative flex flex-col items-center gap-7"
            exit={{
              filter: "blur(9px)",
              opacity: 0,
              transform: "scale(1.08)",
              transition: { duration: (PRELOADER_EXIT_MS * 0.7) / 1000, ease: [0.23, 1, 0.32, 1] },
            }}
          >
            <p className="font-display text-2xl font-semibold tracking-[0.02em] text-foreground/90">
              DRYDOWN
            </p>

            <div className="flex items-baseline font-display text-6xl font-medium tabular-nums text-foreground md:text-7xl">
              <span>{count}</span>
              <span className="ml-1 text-2xl text-muted-foreground">%</span>
            </div>

            <div className="h-px w-40 overflow-hidden bg-border">
              <div className="h-full bg-primary" style={{ width: `${count}%` }} />
            </div>

            {bursting && <MistBurst count={26} radius={90} durationS={0.5} />}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
