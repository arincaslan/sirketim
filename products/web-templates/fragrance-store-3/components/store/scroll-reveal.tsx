"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";
import { cn } from "@/lib/utils";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

/**
 * A plain opacity + small y-offset scroll reveal — replaces v1's
 * `ApertureReveal` (removed outright, see DESIGN.md) for every text-only
 * section that isn't a photograph. The old component's circular clip-path
 * "aperture" default mode was retired along with the rest of the generative
 * visual system it was built to dress up; its plain "fade" mode is kept
 * here as its own small component, since that's the reveal every long-form
 * page (About, Journal, checkout, product-detail copy blocks) actually
 * wants — see DESIGN.md's per-page "States" notes ("stays fast/readable,
 * no Meridian Sweep here"). Photograph reveals use `MeridianSweep` instead.
 */
export function ScrollReveal({ children, className, delay = 0 }: ScrollRevealProps) {
  const reduced = usePrefersReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: reduced ? 0 : 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: reduced ? 0 : delay, ease: [0.16, 1, 0.3, 1] }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
