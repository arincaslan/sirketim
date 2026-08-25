"use client";

import { Fragment } from "react";
import { motion, useReducedMotion } from "motion/react";

export interface HeadlineWord {
  text: string;
  /** Renders as `<em>` in the site's own italic-of-same-family convention
   *  (Cormorant Garamond italic - DESIGN.md §4), for the one emphasis word
   *  in a headline, not a mixed-font insert. */
  italic?: boolean;
}

/**
 * The hero's one deliberate text-dispersal moment (Implementation
 * addendum v3, "The Atomizer") - not a generic pattern meant for reuse on
 * every heading, deliberately used exactly once on the site. Each word
 * resolves from a blurred, slightly scattered, low-opacity state into
 * sharp focus, staggered - words condensing out of mist rather than a
 * block of text fading up as one unit (the far more common technique this
 * site's chapter entrances already use via `Reveal`, kept unchanged for
 * everything else).
 *
 * Timed to start at `delayS` (the caller passes `HERO_REVEAL_DELAY_S`, or
 * 0 under reduced motion) so it begins exactly as the preloader's own
 * exit clears, same coordination convention as the rest of the hero.
 * `filter: blur()` is a paint-only property (no layout cost) - Emil
 * Kowalski's "blur masks an imperfect transition" recipe, applied to a
 * handful of words for well under a second, not a persistent effect.
 *
 * Reduced motion: renders the words as plain static text, no blur, no
 * stagger, no movement - not a faster version of the same animation.
 */
export function MistHeadline({
  words,
  delayS = 0,
  className,
}: {
  words: HeadlineWord[];
  delayS?: number;
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <h1 className={className}>
        {words.map((word, i) => (
          <Fragment key={i}>
            {word.italic ? (
              <em className="inline-block italic leading-[1.15] pb-1">{word.text}</em>
            ) : (
              word.text
            )}
            {i < words.length - 1 ? " " : ""}
          </Fragment>
        ))}
      </h1>
    );
  }

  return (
    <h1 className={className}>
      {words.map((word, i) => (
        <Fragment key={i}>
          <motion.span
            className="inline-block"
            initial={{
              opacity: 0,
              filter: "blur(10px)",
              transform: "translateY(10px) scale(1.06)",
            }}
            animate={{ opacity: 1, filter: "blur(0px)", transform: "translateY(0px) scale(1)" }}
            transition={{ duration: 0.55, delay: delayS + i * 0.05, ease: [0.23, 1, 0.32, 1] }}
          >
            {word.italic ? (
              <em className="italic leading-[1.15] pb-1">{word.text}</em>
            ) : (
              word.text
            )}
          </motion.span>
          {i < words.length - 1 ? " " : ""}
        </Fragment>
      ))}
    </h1>
  );
}
