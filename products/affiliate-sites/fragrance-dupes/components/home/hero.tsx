"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";

import { Button } from "@/components/ui/button";
import { AtmosphereVideo } from "@/components/home/atmosphere-video";
import { MistHeadline, type HeadlineWord } from "@/components/home/mist-headline";
import { HERO_REVEAL_DELAY_S } from "@/lib/preloader-timing";

const HEADLINE_WORDS: HeadlineWord[] = [
  { text: "Find" },
  { text: "out" },
  { text: "what" },
  { text: "a" },
  { text: "dupe" },
  { text: "actually", italic: true },
  { text: "matches." },
];

/**
 * Chapter 0 - the opening of the homepage's scroll narrative (see
 * DESIGN.md's Implementation addendum v2 for the full six-chapter
 * structure). Still the "Editorial Manifesto Hero" this site was built
 * around - type-led, asymmetric, no product photography - now staged as a
 * full-bleed atmosphere loop instead of a boxed image panel, so the opening
 * beat reads with the same confidence the founder pointed to in
 * otsuka-air.jp. The video is mood, not a product shot: the type still
 * carries the actual message, sitting on a paper-toned scrim rather than
 * the generic dark-overlay-plus-white-text video-hero cliche, which also
 * keeps this section inside the site's own light-paper theme rather than
 * flipping to an inverted dark band (Page Theme Lock).
 *
 * Timed to start as the first-load preloader wipes away (see
 * lib/preloader-timing.ts) so the reveal feels coordinated instead of the
 * hero having already finished behind the loader. Reduced-motion users
 * never see the preloader, so they get no delay either.
 */
export function Hero() {
  const shouldReduceMotion = useReducedMotion();
  const revealDelay = shouldReduceMotion ? 0 : HERO_REVEAL_DELAY_S;

  return (
    <section className="relative min-h-[100dvh] w-full overflow-hidden border-b border-border">
      <AtmosphereVideo
        src="/generated/home-hero-loop.mp4"
        poster="/generated/home-hero-atmosphere.png"
        alt=""
      />

      {/* Paper-toned scrim: solid where the manifesto text sits, clearing
          to fully transparent on the right so the video still breathes.
          Uses the theme's own --background token (not a hardcoded black),
          so this reads as "Drydown's paper" rather than a generic dark
          gradient, and inverts correctly for dark mode automatically. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/15 lg:to-transparent"
      />

      <div className="relative z-10 flex min-h-[100dvh] flex-col justify-end gap-6 px-6 pb-16 pt-24 sm:px-10 lg:max-w-[56ch] lg:justify-center lg:pb-24">
        <MistHeadline
          words={HEADLINE_WORDS}
          delayS={revealDelay}
          className="max-w-[21ch] font-display text-fluid-h1"
        />

        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, transform: "translateY(14px)" }}
          animate={{ opacity: 1, transform: "translateY(0px)" }}
          transition={{ duration: 0.6, delay: revealDelay + 0.4, ease: [0.23, 1, 0.32, 1] }}
          className="flex flex-col gap-6"
        >
          <p className="max-w-[44ch] text-lg text-muted-foreground">
            We compare designer fragrances against their closest dupes with
            real note data, not marketing copy.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link href="/dupe-finder">
                Find your dupe
                <ArrowRight className="ml-1 h-4 w-4" aria-hidden />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/about">Our standards</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
