"use client";

import type { ReactNode } from "react";
import { MotionConfig } from "motion/react";

/**
 * Global reduced-motion gate. Individual components also check
 * useReducedMotion() where they need to skip a whole effect (e.g. the
 * radar chart's stroke-draw), but MotionConfig's reducedMotion="user"
 * catches every other Motion-driven transform (entrance staggers, hover/
 * tap physics) site-wide without needing a manual check in every
 * component - the transform-based part of an animation is nulled, opacity
 * fades still play, matching the "fewer and gentler, not zero" a11y
 * guidance in DESIGN.md §5/§6.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
