"use client";

import Image from "next/image";
import { motion } from "framer-motion";

import { FAMILY_MATERIAL } from "@/lib/scent-material";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";
import { cn } from "@/lib/utils";
import type { ScentFamily } from "@/lib/types";

interface MeridianSweepProps {
  family: ScentFamily;
  /** The image that resolves to — always rendered underneath, full color. */
  src: string;
  /** Optional different "before" image (e.g. a card's resting "still" shot,
   * swept away to reveal a different "lifestyle" shot underneath). Defaults
   * to `src` itself, so the effect reads as one photograph settling into
   * color rather than two different photos. */
  beforeSrc?: string;
  alt: string;
  /** "view": plays once as the element scrolls into view (hero, gallery,
   * editorial, campaign, about). "hover": plays on pointer hover/focus, at
   * a smaller/quicker scale, for grid cards — see DESIGN.md "Signature
   * motion." */
  trigger?: "view" | "hover";
  priority?: boolean;
  sizes?: string;
  className?: string;
}

/**
 * The Meridian Sweep — this template's signature motion (see DESIGN.md),
 * replacing v1's aperture-iris reveal + pointer-glow with one device: a
 * soft diagonal light-wash band travels across a photograph once. The
 * portion the band hasn't reached sits in a muted duotone tinted with the
 * product's olfactive-family color; the portion it has passed resolves to
 * full natural color. Reveal and color-grade settle are the same motion.
 *
 * Implementation technique (clip-path driven by a motion value, not React
 * state) adapted from 21st.dev's "Image reveal slider"
 * (@motiondotdev/motion-image-reveal-slider — official Motion examples
 * catalog): that component proved out `clipPath: inset(0% 0% 0% 0%)` ->
 * `inset(0% 0% 0% 100%)` as a clean way to wipe one image layer away to
 * reveal another underneath. This component reuses that mechanic, replacing
 * its draggable-handle interaction with a scroll-triggered or hover-
 * triggered animation, and adds the duotone family tint + moving highlight
 * band the brand motif calls for.
 *
 * Gates fully under `prefers-reduced-motion`: an instant opacity fade
 * straight to full color, no duotone flash, no travelling band.
 */
export function MeridianSweep({
  family,
  src,
  beforeSrc,
  alt,
  trigger = "view",
  priority = false,
  sizes = "100vw",
  className,
}: MeridianSweepProps) {
  const reduced = usePrefersReducedMotion();
  const tint = `hsl(${FAMILY_MATERIAL[family].ink.hsl})`;
  const before = beforeSrc ?? src;

  // clip-path removes area from the left edge inward as the percentage
  // grows, so the duotone layer's remaining *visible* region is always its
  // right-hand portion — meaning color reveals starting from the left and
  // sweeping right as this animates from 0% to 100%.
  const swept = { clipPath: "inset(0% 0% 0% 100%)" };
  const unswept = { clipPath: "inset(0% 0% 0% 0%)" };
  const bandSwept = { left: "100%" };
  const bandUnswept = { left: "-4rem" };
  const transition = { duration: 1.1, ease: [0.16, 1, 0.3, 1] as const };

  const viewProps =
    trigger === "view"
      ? { initial: unswept, whileInView: swept, viewport: { once: true, amount: 0.4 }, transition }
      : {
          initial: unswept,
          animate: unswept,
          whileHover: swept,
          whileFocus: swept,
          transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] as const },
        };

  const bandProps =
    trigger === "view"
      ? { initial: bandUnswept, whileInView: bandSwept, viewport: { once: true, amount: 0.4 }, transition }
      : {
          initial: bandUnswept,
          animate: bandUnswept,
          whileHover: bandSwept,
          whileFocus: bandSwept,
          transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] as const },
        };

  return (
    <div className={cn("group relative h-full w-full overflow-hidden", className)}>
      {/* Base layer: always the resolved, full-color image. */}
      <Image src={src} alt={alt} fill priority={priority} sizes={sizes} className="object-cover" />

      {!reduced && (
        <>
          <motion.div aria-hidden="true" className="absolute inset-0 [will-change:clip-path]" {...viewProps}>
            {/* Duotone "before" layer: grayscale photo + family-color overlay via mix-blend-color. */}
            <Image
              src={before}
              alt=""
              fill
              priority={priority}
              sizes={sizes}
              className="object-cover grayscale contrast-[1.05]"
              aria-hidden="true"
            />
            <div className="absolute inset-0 mix-blend-color" style={{ backgroundColor: tint }} aria-hidden="true" />
            <div className="absolute inset-0 bg-black/10" aria-hidden="true" />
          </motion.div>
          {/* The travelling light band — a separate layer (not clipped by
              the duotone above it) animated with the same duration/easing
              so it visually rides the reveal boundary left to right. */}
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 w-16 bg-gradient-to-r from-transparent via-white/40 to-transparent sm:w-24"
            {...bandProps}
          />
        </>
      )}
    </div>
  );
}
