/**
 * SIRKETIM MOTION SYSTEM v1
 * =========================
 * CANONICAL SOURCE OF TRUTH. This file is documentation + master copy.
 * It is NOT imported by any project (projects are deliberately self-contained:
 * own package.json, nothing builds from the repo root).
 *
 * Each project keeps a VERBATIM copy at `<project>/lib/motion.ts`.
 * Drift is caught by `node shared/motion/check-drift.mjs`, which hashes every
 * copy against this file. Run it before shipping any template.
 *
 * WHY THIS EXISTS
 * ---------------
 * Audit 2026-08-25 across five projects found 14 distinct animation durations,
 * 3 near-identical easing curves used arbitrarily per project, 8 different
 * y-offsets for the same conceptual "fade up", and 2 of 5 projects with no
 * custom easing at all. Motion quality was rediscovered from scratch on each
 * build instead of shared. This file is the shared layer.
 *
 * SOURCES: durations and curves follow Emil Kowalski's animation guidance
 * (animations.dev). They are not chosen by feel.
 */

/* ------------------------------------------------------------------ *
 * 1. DURATION SCALE (milliseconds)
 * ------------------------------------------------------------------ *
 * Hard rule: interactive UI stays under 300ms. Only `reveal` and
 * `narrative` may exceed it, and only for scroll/marketing surfaces
 * the user sees once, not repeatedly.
 */
export const duration = {
  /** Keyboard-initiated + high-frequency actions. Never animate these. */
  instant: 0,
  /** Button/press feedback. */
  press: 120,
  /** Tooltips, small popovers, hover color shifts. */
  fast: 160,
  /** Dropdowns, selects, toasts, accordions. The default. */
  base: 200,
  /** Larger menus, modals, search overlays. */
  slow: 260,
  /** Drawers and sheets travelling a full edge. */
  drawer: 320,
  /** Scroll-reveal on marketing sections. Seen once per element. */
  reveal: 420,
  /** Hero entrances and scroll narrative beats only. */
  narrative: 640,
} as const;

/* ------------------------------------------------------------------ *
 * 2. EASING SCALE
 * ------------------------------------------------------------------ *
 * `ease-in` is banned for UI: it delays the first frame, which is
 * exactly the moment the user is watching, so it reads as sluggish.
 */
export const easing = {
  /** Enter + exit. Starts fast, feels responsive. The default. */
  out: [0.23, 1, 0.32, 1],
  /** Elements moving/morphing on screen (both ends anchored). */
  inOut: [0.77, 0, 0.175, 1],
  /** Drawers/sheets. iOS-like, from Ionic. */
  drawer: [0.32, 0.72, 0, 1],
} as const;

/** Same curves as CSS strings, for Tailwind/inline style consumers. */
export const easingCss = {
  out: "cubic-bezier(0.23, 1, 0.32, 1)",
  inOut: "cubic-bezier(0.77, 0, 0.175, 1)",
  drawer: "cubic-bezier(0.32, 0.72, 0, 1)",
  /** Constant motion only: marquees, progress, spinners. */
  linear: "linear",
} as const;

/* ------------------------------------------------------------------ *
 * 3. INTERACTION -> TOKEN MAP
 * ------------------------------------------------------------------ *
 * The single lookup table. If an interaction is not on this list, it
 * probably should not animate.
 *
 *   press feedback ....... press   + out    (scale 0.97, never below 0.95)
 *   hover color .......... fast    + out
 *   tooltip / popover .... fast    + out    (origin-aware, not center)
 *   dropdown / select .... base    + out
 *   toast enter .......... base    + out
 *   toast exit ........... press   + out    (exit is always faster than enter)
 *   accordion ............ base    + inOut
 *   modal ................ slow    + out    (transform-origin stays center)
 *   drawer / sheet ....... drawer  + drawer
 *   layout morph ......... base    + inOut
 *   scroll reveal ........ reveal  + out
 *   hero entrance ........ narrative + out
 *   marquee / progress ... n/a     + linear
 */

/** Stagger between sibling items. Above ~80ms the list reads as slow. */
export const stagger = { tight: 40, base: 60, loose: 80 } as const;

/** Press-feedback scale. Never animate from scale(0): nothing in the
 *  real world appears out of nothing. */
export const pressScale = { button: 0.97, card: 0.99 } as const;

/** Scroll-reveal offset. ONE value, not the eight the audit found. */
export const revealOffset = 16;

/* ------------------------------------------------------------------ *
 * 4. REDUCED MOTION POLICY
 * ------------------------------------------------------------------ *
 * "Fewer and gentler, not zero."
 *
 * KEEP under prefers-reduced-motion: opacity, color, and blur
 *   transitions. They aid comprehension and do not induce nausea.
 * DROP: transform/position movement, parallax, scroll-hijack,
 *   infinite loops, canvas particle systems, autoplaying video.
 *
 * IMPLEMENTATION: wrap the app once in Motion's
 * `<MotionConfig reducedMotion="user">`. That nulls transform-based
 * animation site-wide while letting opacity fades play, which is the
 * policy above. Add a per-component `useReducedMotion()` check ONLY to
 * skip a whole effect the provider cannot reach (canvas, autoplay video).
 *
 * DO NOT return a fully static element from a reveal wrapper. That is
 * "zero", not "fewer and gentler", and it contradicts the provider.
 */

/* ------------------------------------------------------------------ *
 * 5. PERFORMANCE BUDGET
 * ------------------------------------------------------------------ *
 *  - Animate ONLY `transform` and `opacity`. Never width/height/top/left.
 *  - `transition-all` is banned. Name the properties.
 *  - In Motion, prefer the full `transform` string over the `x`/`y`/`scale`
 *    shorthands: the shorthands run on the main thread via rAF and drop
 *    frames under load; the transform string is hardware-accelerated.
 *  - Gate every hover animation behind
 *    `@media (hover: hover) and (pointer: fine)` so touch taps do not
 *    trigger phantom hover states.
 *  - `window.addEventListener("scroll")` is banned. Use IntersectionObserver,
 *    Motion's `useScroll`, or CSS `animation-timeline: view()`.
 *  - Max ONE continuously-running rAF/canvas effect per page, above the fold
 *    only, lazy-loaded below it.
 *  - Prefer CSS for predetermined one-shot animation (hero entrance, reveals):
 *    it runs off the main thread and survives page-load jank. Use JS/Motion
 *    for dynamic, interruptible, gesture-driven motion.
 *  - Interruptibility: use CSS transitions (retarget from current value) over
 *    keyframes (restart from zero) for anything rapidly re-triggerable.
 *    Use springs where a gesture can reverse mid-flight.
 */

/* ------------------------------------------------------------------ *
 * 6. TAILWIND BRIDGE
 * ------------------------------------------------------------------ *
 * Spread into `theme.extend` so utility classes are token-driven and
 * magic numbers stop reappearing in className strings:
 *
 *   import { tailwindMotion } from "./lib/motion";
 *   theme: { extend: { ...tailwindMotion } }
 *
 * Then: `duration-base ease-out-soft`, `animate-rise`, etc.
 */
export const tailwindMotion = {
  transitionDuration: {
    press: `${duration.press}ms`,
    fast: `${duration.fast}ms`,
    base: `${duration.base}ms`,
    slow: `${duration.slow}ms`,
    drawer: `${duration.drawer}ms`,
    reveal: `${duration.reveal}ms`,
    narrative: `${duration.narrative}ms`,
  },
  transitionTimingFunction: {
    "out-soft": easingCss.out,
    "in-out-soft": easingCss.inOut,
    drawer: easingCss.drawer,
  },
  keyframes: {
    /** The one canonical enter. Replaces the 8 ad-hoc fade-up variants. */
    rise: {
      "0%": { opacity: "0", transform: `translateY(${revealOffset}px)` },
      "100%": { opacity: "1", transform: "translateY(0)" },
    },
    /** Enter for elements that should not travel (images, media). */
    settle: {
      "0%": { opacity: "0", transform: "scale(0.98)" },
      "100%": { opacity: "1", transform: "scale(1)" },
    },
    /** Wipe for masked/clipped reveals. */
    unmask: {
      "0%": { clipPath: "inset(0 0 100% 0)" },
      "100%": { clipPath: "inset(0 0 0 0)" },
    },
  },
  animation: {
    rise: `rise ${duration.narrative}ms ${easingCss.out} both`,
    settle: `settle ${duration.narrative}ms ${easingCss.out} both`,
    unmask: `unmask ${duration.reveal}ms ${easingCss.out} both`,
  },
} as const;
