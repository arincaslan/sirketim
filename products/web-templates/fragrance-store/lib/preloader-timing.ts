/**
 * Shared timing constants for the first-load preloader (components/store/
 * preloader.tsx) and the coordinated hero entrance that follows it
 * (components/store/hero.tsx). Centralized so the hero's entrance delay can
 * never drift out of sync with when the preloader actually clears — without
 * this, editing one file's animation timing silently breaks the "reveal"
 * feel in the other.
 *
 * Total first-load time budget stays well under the ~1.5s ceiling: this is a
 * taste beat, not something the user has to wait through.
 */

/** How long the 0->100 counter takes to complete. */
export const PRELOADER_COUNT_MS = 800;

/** Brief hold at 100 before the wipe-out starts. */
export const PRELOADER_HOLD_MS = 100;

/** Duration of the clip-path wipe that clears the preloader. */
export const PRELOADER_EXIT_MS = 450;

/**
 * When the hero's own entrance animation should begin, in seconds, so it
 * plays as the preloader wipes away instead of finishing invisibly behind
 * it. Reduced-motion users skip the preloader entirely, so they should also
 * skip this delay (see hero.tsx).
 */
export const HERO_REVEAL_DELAY_S =
  (PRELOADER_COUNT_MS + PRELOADER_HOLD_MS) / 1000;
