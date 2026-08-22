import type { ScentFamily } from "@/lib/types";

/**
 * Five muted olfactive-family accent tones, carried over unchanged from v1
 * (see DESIGN.md "Design tokens" — "already muted, decorative-only, and
 * never competed with the primary accent, so there's no reason to
 * re-derive them"). Their job changed in this rebuild: they used to be
 * gradient stops for a generative CSS background system
 * (`familyGradient()`/`familyRadial()`, both removed). Now they drive:
 *  - the Meridian Sweep's duotone "before" state over that family's real
 *    photography (`components/store/meridian-sweep.tsx`),
 *  - that family's filter chip and notes-timeline node tint,
 *  - a liquid-color cue referenced consistently across that family's
 *    product photography prompts (see `asset-manifest.json`).
 */
export interface MaterialStop {
  /** HSL triplet as "H S% L%", ready to drop into hsl(). */
  hsl: string;
}

export interface FamilyMaterial {
  deep: MaterialStop;
  mid: MaterialStop;
  light: MaterialStop;
  /** The family's node/chip/duotone tint. */
  ink: MaterialStop;
  label: string;
}

export const FAMILY_MATERIAL: Record<ScentFamily, FamilyMaterial> = {
  Floral: {
    deep: { hsl: "340 22% 70%" },
    mid: { hsl: "340 28% 85%" },
    light: { hsl: "38 25% 94%" },
    ink: { hsl: "340 25% 32%" },
    label: "Rose quartz",
  },
  Woody: {
    deep: { hsl: "25 22% 55%" },
    mid: { hsl: "28 26% 76%" },
    light: { hsl: "36 22% 93%" },
    ink: { hsl: "25 30% 24%" },
    label: "Umber clay",
  },
  Oriental: {
    deep: { hsl: "28 38% 52%" },
    mid: { hsl: "30 40% 74%" },
    light: { hsl: "38 30% 92%" },
    ink: { hsl: "22 40% 26%" },
    label: "Amber smoke",
  },
  Fresh: {
    deep: { hsl: "170 18% 58%" },
    mid: { hsl: "170 20% 80%" },
    light: { hsl: "180 15% 94%" },
    ink: { hsl: "195 30% 24%" },
    label: "Sage quartz",
  },
  Gourmand: {
    deep: { hsl: "20 24% 50%" },
    mid: { hsl: "22 26% 74%" },
    light: { hsl: "34 24% 92%" },
    ink: { hsl: "18 35% 24%" },
    label: "Cocoa dust",
  },
};
