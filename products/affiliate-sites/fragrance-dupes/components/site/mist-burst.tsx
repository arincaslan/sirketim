"use client";

import { useMemo } from "react";
import { motion } from "motion/react";

interface MistParticleSpec {
  angle: number;
  distance: number;
  size: number;
  delay: number;
}

/**
 * A one-shot burst of small particles releasing outward from wherever this
 * component is placed, then fading - the same visual grammar as the
 * cursor's continuous mist trail (custom-cursor.tsx), built once and
 * reused at the two moments this site treats as genuinely rare/first-time
 * (`animate` skill's delight tier): the preloader's exit (preloader.tsx)
 * and the "spritz" that leads into the Dupe Finder's radar chart
 * (atomizer-spritz.tsx). Not meant for anything more frequent than that -
 * this is a burst, not an ambient effect; the cursor trail already owns
 * the continuous/ambient register, so this component is never reused
 * beyond those two deliberate moments.
 *
 * Deliberately Motion, not canvas, unlike the cursor: this is a small,
 * bounded, one-shot particle count, not a continuous high-frequency
 * emitter, so Motion's declarative stagger and easing are the cheaper
 * tool to build and to coordinate with each caller's own timing (the
 * `animate` skill's "cheapest tool that works," walked to a different
 * answer than the cursor precisely because the frequency/count profile is
 * different).
 *
 * Particles only ever decelerate outward and fade - no bounce, no
 * overshoot, matching "Settle" (DESIGN.md §5) and the cursor's own
 * physics. The parent controls mounting via conditional rendering, so
 * this component has no internal trigger/gating logic of its own beyond
 * rendering its (randomized-once) particle set when mounted - the parent
 * also owns `prefers-reduced-motion` handling (skip mounting this
 * entirely under reduced motion, same as every other decorative moment on
 * the site).
 */
export function MistBurst({
  count = 22,
  radius = 60,
  color = "hsl(var(--primary))",
  durationS = 0.6,
}: {
  count?: number;
  radius?: number;
  color?: string;
  durationS?: number;
}) {
  const particles = useMemo<MistParticleSpec[]>(
    () =>
      Array.from({ length: count }, () => ({
        angle: Math.random() * Math.PI * 2,
        distance: radius * (0.5 + Math.random() * 0.5),
        size: 2 + Math.random() * 3,
        delay: Math.random() * 0.12,
      })),
    [count, radius]
  );

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {particles.map((p, i) => (
        <motion.span
          key={i}
          className="absolute left-1/2 top-1/2 rounded-full"
          style={{ width: p.size, height: p.size, backgroundColor: color }}
          initial={{ opacity: 0.55, transform: "translate(-50%, -50%) scale(0.5)" }}
          animate={{
            opacity: 0,
            transform: `translate(calc(-50% + ${Math.cos(p.angle) * p.distance}px), calc(-50% + ${Math.sin(p.angle) * p.distance}px)) scale(1.6)`,
          }}
          transition={{ duration: durationS, delay: p.delay, ease: [0.23, 1, 0.32, 1] }}
        />
      ))}
    </div>
  );
}
