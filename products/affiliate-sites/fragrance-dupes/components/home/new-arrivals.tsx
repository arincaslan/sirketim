"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { FocusEvent, KeyboardEvent } from "react";
import Link from "next/link";
import { ArrowRight, CaretLeft, CaretRight, Pause, Play } from "@phosphor-icons/react/dist/ssr";
import {
  animate,
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
} from "motion/react";
import { FragranceImage } from "@/components/fragrance/fragrance-image";
import { Reveal } from "@/components/site/reveal";
import { cn } from "@/lib/utils";

/**
 * The most recently added listings, as a chapter of the home page, drawn as
 * an auto-advancing plate slider.
 *
 * WHAT DECIDES WHAT APPEARS HERE, AND WHY IT MATTERS MORE THAN IT LOOKS.
 * Recency, and nothing else. Not score, not price, and above all not whether
 * the producer pays us. The selection itself lives in `newestArrivals()` in
 * app/page.tsx, with the full reasoning; read that before changing an order,
 * a cap, or a slot. The short version is that "newest first, everyone" is an
 * editorial rule a subscriber benefits from, while "subscribers on the home
 * page" is placement sold for money, and /disclosure promises in those words
 * that we sell none.
 *
 * THE SLIDE ORDER IS THE SELECTION ORDER. The plate turns newest-first and
 * the index below reads in the same direction, so the ordering rule the
 * standfirst states in words is the one a reader watches happen. Nothing
 * about slot one can be bought that slot five could not, and the two-per-
 * producer cap still binds. But it IS a visible hierarchy, so if the
 * ordering rule ever changes, this is the surface where that becomes obvious
 * to a reader, not a detail buried in a sort.
 *
 * AUTO-ADVANCE, AND THE COMMENT THIS REPLACES. An earlier version of this
 * file said "do not reintroduce auto-advance", on the argument that motion
 * which moves content out from under a reader has to earn it by making
 * something reachable that otherwise is not. THE FOUNDER HAS OVERRIDDEN THAT,
 * twice and explicitly ("5 tanesi donsun", then "slider olsun"). The form is
 * settled; do not re-litigate it. What the old argument bought instead is
 * paid for structurally here rather than by refusing the pattern:
 *
 *  - Every one of the five is reachable at all times from the index strip
 *    below the plate, which is a real tablist, not a row of dots. Nothing is
 *    ever behind a wait.
 *  - There is a VISIBLE pause/play control, not only pause-on-hover. WCAG 2.2
 *    SC 2.2.2 wants a mechanism to stop anything auto-moving for more than
 *    five seconds, and hover is not a mechanism on touch. The previous
 *    carousel paused on hover and focus and exposed no control at all.
 *  - Rotation also stops on hover, on KEYBOARD focus entering the section
 *    (checked with :focus-visible, so a tap on a tab does not silently kill
 *    rotation for the rest of the visit), when the section is scrolled out of
 *    view, and when the tab is backgrounded.
 *  - prefers-reduced-motion removes the timer entirely rather than speeding
 *    it up, and collapses the slide change to a short opacity crossfade with
 *    no transform at all.
 *
 * WHY THE PLATE IS STACKED, NOT SWAPPED. All five slides stay mounted in one
 * CSS grid cell (`col-start-1 row-start-1`), so the container is always as
 * tall as the tallest of them and a long fragrance name can never make the
 * page jump mid-rotation. It also means all five photographs are decoded
 * before their turn, so a slide never arrives with an empty frame. The four
 * inactive slides are taken out of reach four ways over, because any one of
 * them failing silently is a focus trap in a thing that moves on its own:
 * `visibility: hidden`, `aria-hidden`, `pointer-events: none`, and
 * `tabIndex={-1}` on the only focusable element each one contains. All four
 * are set from React state. See the `leaving` state below for why none of
 * them may hang off an animation finishing.
 *
 * THREE PROPERTIES OF THE OLD COMPONENT THAT ARE KEPT DELIBERATELY:
 *
 *  1. NO CSS KEYFRAME ANIMATION ANYWHERE. app/globals.css sets a global
 *     `animation-iteration-count: 1` under prefers-reduced-motion, which for
 *     a looping animation means it runs to completion instantly and parks
 *     wherever the last frame put it. That is how retailer-band's marquee
 *     ended up half off-screen. Every moving thing here is a Motion
 *     animation instead, including the progress sweep on the active tab:
 *     Motion drives WAAPI/rAF, which CSS `animation-*` properties do not
 *     reach, so the global reset cannot park anything. Reduced motion is
 *     handled by reading the setting in JS, not by hoping the reset is kind.
 *  2. IT RENDERS NOTHING when nothing is dated. No placeholder cards. An
 *     undated listing is a normal listing (see lib/listing-dates.ts) and a
 *     home page inventing five of them would be the one dishonest surface on
 *     a site whose argument is that it does not overclaim.
 *  3. THE SCORE IS getPublishedSimilarity's, passed in already computed, so a
 *     listing cannot show one number here and another on its comparison page.
 *
 * AND THE TWO THE PREVIOUS PASS ADDED, WHICH ALSO STAY: this is a chapter of
 * the page rather than a bordered card band borrowed from retailer-band (the
 * page's quietest footer-adjacent element, whose costume is what made the
 * first version read as a widget dropped in), and the photographs are LARGE.
 * Five licensed product photographs rendered at 44px was half the original
 * diagnosis; they run 224px to 448px here. Do not shrink them back.
 *
 * MOTION SPEC (via the `animate` skill; DESIGN.md section 5 "Settle").
 * Frequency tier is occasional/marketing, so the durations sit above the
 * 300ms UI ceiling on purpose. Purposes, one per moving thing: the crossfade
 * is state indication plus bridging content that would otherwise teleport;
 * the type stagger is hierarchy; the progress sweep is explanation (it tells
 * a reader how long the plate will stay); press and hover are feedback.
 * A continuous Ken Burns drift on the photograph was considered and rejected:
 * perpetual decorative motion over content a reader is trying to look at,
 * with no purpose nameable from that list. The photograph settles once, on
 * arrival, and then holds still.
 *
 *   slide crossfade      opacity + translateX(20px), 520ms in / 360ms out,
 *                        cubic-bezier(0.23, 1, 0.32, 1)
 *   photograph settle    scale(1.045) -> scale(1), 620ms, same curve. Never
 *                        scale(0); nothing appears out of nothing.
 *   type stagger         four lines, 55ms apart, 420ms each, 10px rise
 *   progress sweep       scaleX 0 -> 1, LINEAR, over the remaining dwell.
 *                        Progress must not ease, and it freezes and resumes
 *                        rather than restarting, so the bar and the timer
 *                        cannot disagree about how long is left.
 *   press feedback       120ms, scale(0.97)
 *   swipe                spring via Motion's drag elasticity, offset OR
 *                        velocity, so a flick counts as well as a long drag
 *
 * AND ONE THING THAT CHANGED BACK: this is a client component again. It was
 * briefly a server component, between the carousel being removed and the
 * slider being asked for. The timer, the reduced-motion read and the gesture
 * handling all need the client, so the home page ships this JS again. Note
 * that app/page.tsx's comment above `newestArrivals()` already describes it
 * as a client component, which was stale and is now true again.
 */

/**
 * One shape for the three transport controls. 36px square is well past the
 * 24 CSS px floor WCAG 2.2 SC 2.5.8 sets for a pointer target, without
 * becoming a button bar that competes with the plate. `ring-ring` rather
 * than a tinted ring because a focus indicator needs 3:1 against what
 * surrounds it: the full-strength accent measures 6.78:1 on paper and
 * 6.49:1 on the dark ground, a 40%-opacity one clears neither.
 */
const stepButton =
  "inline-flex h-9 min-w-[2.25rem] scroll-mt-24 items-center justify-center border border-border " +
  "text-xs text-muted-foreground outline-none transition-[color,border-color,transform] duration-150 " +
  "ease-out hover:border-primary/60 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring " +
  "focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.97]";

/** Strong ease-out. Matches --ease-out in DESIGN.md and tailwind's `ease-out`. */
const EASE_OUT = [0.23, 1, 0.32, 1] as const;

/**
 * How long a plate holds before the next one. Longer than the 6s the old
 * carousel used because a plate carries more to read than a 44px card did:
 * a producer, a name, a score, the original it is set against, a price and a
 * date. WCAG 2.2.2 is satisfied by the pause control rather than by this
 * number, so it is set for reading comfort, not to duck a threshold.
 */
const DWELL_MS = 6500;

/**
 * The sweep never starts at zero, and never sits at zero.
 *
 * The filled rule is what says "you are here" on the index strip, and a
 * reader who presses pause immediately after pressing a tab would otherwise
 * get an active rule indistinguishable from the four inactive ones. A small
 * floor keeps a visible mark at every point in the cycle. Where the slider
 * cannot rotate at all (one listing, or prefers-reduced-motion) the rule is
 * simply filled: there is no elapsing time for it to represent.
 */
const SWEEP_FLOOR = 0.05;

/**
 * Crossfade durations, in seconds, in one place because a second thing now
 * depends on them: the timer that commits `visibility: hidden` after a plate
 * has finished leaving. Two values written twice would drift, and the drift
 * would be a plate that vanishes mid-fade.
 */
const FADE_IN_S = 0.52;
const FADE_OUT_S = 0.36;
const FADE_REDUCED_S = 0.16;

/** Raw pointer travel, in px, that counts as a swipe rather than a tap. */
const SWIPE_DISTANCE = 56;
/** ...or this much px/s, so a short flick counts too. */
const SWIPE_VELOCITY = 320;

export interface NewArrival {
  slug: string;
  name: string;
  brand: string;
  family: string;
  imageUrl?: string;
  facets: {
    freshness: number;
    sweetness: number;
    warmth: number;
    woodyDepth: number;
    longevity: number;
    sillage: number;
  };
  pricePerMl: string;
  score: number;
  referenceSlug: string;
  referenceName: string;
  referenceBrand: string;
  firstLive: string;
  firstLiveLabel: string;
}

/**
 * The empty guard lives out here so the slider itself can hold hooks
 * unconditionally. Returning null before a hook call would be a rules-of-
 * hooks violation, and "renders nothing when nothing is dated" is a property
 * worth keeping structurally rather than by remembering to order the code
 * correctly.
 */
export function NewArrivals({ arrivals }: { arrivals: NewArrival[] }) {
  if (arrivals.length === 0) return null;
  return <NewArrivalsSlider arrivals={arrivals} />;
}

function NewArrivalsSlider({ arrivals }: { arrivals: NewArrival[] }) {
  const count = arrivals.length;
  // useId contains colons, which are legal in an id attribute but awkward in
  // anything that later wants a CSS selector. Strip them at the source.
  const uid = useId().replace(/:/g, "");
  const reduce = useReducedMotion() ?? false;

  const carouselRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const draggedRef = useRef(false);
  const inView = useInView(carouselRef, { amount: 0.3 });

  // index, the slide it came from, and which way it travelled, kept as one
  // object so they can never describe different moments. `prev` is what lets
  // the outgoing plate leave towards where the reader came from while the
  // next one waits on the other side.
  const [slide, setSlide] = useState({ index: 0, prev: -1, direction: 1 });
  const { index, prev, direction } = slide;

  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [keyboardInside, setKeyboardInside] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);

  const progress = useMotionValue(0);
  const sweep = useMotionTemplate`scaleX(${progress})`;
  const line = lineVariants(reduce);

  // The plate that is currently ON ITS WAY OUT, tracked in React state rather
  // than inferred from an animation finishing.
  //
  // `visibility: hidden` is what actually takes an inactive plate out of the
  // tab order and the accessibility tree, so which plates are hidden is
  // correctness, not decoration, and it must not hang off a transition that a
  // reader can interrupt. It did, briefly: driving it through Motion's
  // `transitionEnd` left ALL FIVE plates `visibility: visible` after forty
  // rapid tab presses, because every exit animation was cancelled before its
  // end fired. Nothing leaked, only because aria-hidden, tabIndex and
  // pointer-events are React-driven and held. That is a backup doing the
  // primary job. Now the final state is set directly and the timer only
  // decides WHEN, so an interrupted fade cannot leave anything behind.
  const [leaving, setLeaving] = useState(-1);
  const fadeOut = reduce ? FADE_REDUCED_S : FADE_OUT_S;

  useEffect(() => {
    if (prev < 0) return;
    setLeaving(prev);
    const timer = window.setTimeout(() => setLeaving(-1), fadeOut * 1000 + 60);
    return () => window.clearTimeout(timer);
  }, [index, prev, fadeOut]);

  // Whether the slider CAN rotate at all, which is a different question from
  // whether it is rotating right now. The first decides what the index rule
  // means; the second decides whether the timer runs.
  const canRotate = count > 1 && !reduce;
  const rotating = canRotate && !paused && !hovered && !keyboardInside && !tabHidden && inView;

  const goTo = useCallback((next: number, dir: number) => {
    setSlide((current) =>
      next === current.index ? current : { index: next, prev: current.index, direction: dir }
    );
  }, []);

  const step = useCallback(
    (delta: number) => {
      setSlide((current) => ({
        index: (current.index + delta + arrivals.length) % arrivals.length,
        prev: current.index,
        direction: delta > 0 ? 1 : -1,
      }));
    },
    [arrivals.length]
  );

  // Declared before the rotation effect on purpose: effects run in order, so
  // an index change rewinds the sweep before the next one reads it.
  useEffect(() => {
    progress.set(canRotate ? SWEEP_FLOOR : 1);
  }, [index, canRotate, progress]);

  useEffect(() => {
    if (!rotating) return;
    // Resume from where the sweep froze rather than restarting the dwell, so
    // the bar on screen and the timer that moves the plate always agree.
    const remaining = Math.max(400, DWELL_MS * (1 - progress.get()));
    const bar = animate(progress, 1, { duration: remaining / 1000, ease: "linear" });
    const timer = window.setTimeout(() => step(1), remaining);
    return () => {
      bar.stop();
      window.clearTimeout(timer);
    };
  }, [rotating, index, progress, step]);

  useEffect(() => {
    const onVisibility = () => setTabHidden(document.hidden);
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  function onTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, i: number) {
    let next: number | null = null;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (i + 1) % count;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (i - 1 + count) % count;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = count - 1;
    if (next === null) return;
    event.preventDefault();
    goTo(next, next > i ? 1 : -1);
    tabRefs.current[next]?.focus();
  }

  // Only KEYBOARD focus stops rotation. Treating every focus as a pause means
  // one tap on a tab leaves focus parked on a button and the slider never
  // moves again for the rest of the visit, which is the founder's stated
  // requirement quietly defeated on the device most likely to be used.
  function onFocusEnter(event: FocusEvent<HTMLDivElement>) {
    const target = event.target;
    if (target instanceof HTMLElement && typeof target.matches === "function") {
      try {
        if (target.matches(":focus-visible")) setKeyboardInside(true);
      } catch {
        /* :focus-visible unsupported; hover and the button still cover it. */
      }
    }
  }

  function onFocusLeave(event: FocusEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setKeyboardInside(false);
    }
  }

  return (
    <section aria-labelledby="new-arrivals-heading" className="border-b border-border">
      <div className="container py-16 sm:py-20">
        {/* A grid rather than a wrapping flex row. Above sm the link sits on
            the headline's baseline, the way library-proof does it; below it,
            a wrapping row put the link BETWEEN the headline and the sentence
            explaining the section, which is the wrong reading order. Explicit
            row/column placement at sm+, source order on mobile. */}
        <Reveal className="mb-10 grid gap-x-10 gap-y-3 sm:mb-14 sm:grid-cols-[1fr_auto]">
          <h2
            id="new-arrivals-heading"
            className="font-display text-fluid-h2 sm:col-start-1 sm:row-start-1"
          >
            Newest in the catalogue
          </h2>
          <p className="max-w-[52ch] text-muted-foreground sm:col-start-1 sm:row-start-2">
            The most recent alternatives to go live, newest first, and never more than two
            from any one producer.
          </p>
          <Link
            href="/new/"
            className="inline-flex scroll-mt-24 items-center gap-1.5 justify-self-start rounded-frame text-sm font-semibold text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background sm:col-start-2 sm:row-start-1 sm:self-end sm:justify-self-end"
          >
            See everything added
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </Reveal>

        <Reveal>
          <div
            ref={carouselRef}
            role="group"
            aria-roledescription="carousel"
            aria-label="Newest listings"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onFocus={onFocusEnter}
            onBlur={onFocusLeave}
          >
            {/* Announce slide changes only when the reader is driving. APG's
                carousel pattern: off while it rotates on its own, polite once
                it has been stopped. */}
            <div aria-live={rotating ? "off" : "polite"}>
              <motion.div
                className="grid"
                // Motion sets touch-action: pan-y for a horizontal drag, so a
                // vertical swipe still scrolls the page rather than being
                // swallowed by the slider.
                drag={count > 1 ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                // Friction rather than a wall: the plate gives a little and
                // springs back. Zero under reduced motion, where the gesture
                // still registers but nothing visibly moves.
                dragElastic={reduce ? 0 : 0.22}
                dragMomentum={false}
                onDragStart={() => {
                  draggedRef.current = false;
                }}
                onDrag={(_event, info) => {
                  if (Math.abs(info.offset.x) > 8) draggedRef.current = true;
                }}
                onDragEnd={(_event, info) => {
                  const { offset, velocity } = info;
                  if (offset.x < -SWIPE_DISTANCE || velocity.x < -SWIPE_VELOCITY) step(1);
                  else if (offset.x > SWIPE_DISTANCE || velocity.x > SWIPE_VELOCITY) step(-1);
                }}
                // Motion suppresses the click after a drag itself; this is the
                // second lock, because the thing being dragged wraps a link
                // and a swipe that navigates is worse than a swipe that does
                // nothing.
                onClickCapture={(event) => {
                  if (draggedRef.current) {
                    event.preventDefault();
                    event.stopPropagation();
                    draggedRef.current = false;
                  }
                }}
              >
                {arrivals.map((arrival, i) => {
                  const active = i === index;
                  // Where an off-screen plate waits. The one just left goes
                  // back the way the reader came from; everything else waits
                  // ahead, so whichever is next arrives from the right side.
                  const parked = i === prev ? -20 * direction : 20 * direction;
                  const offsetX = reduce || active ? 0 : parked;

                  return (
                    <motion.div
                      key={arrival.slug}
                      role="tabpanel"
                      id={`${uid}-panel-${i}`}
                      aria-labelledby={count > 1 ? `${uid}-tab-${i}` : undefined}
                      aria-roledescription="slide"
                      aria-hidden={!active}
                      // visibility is React's, opacity's starting value is
                      // the pre-hydration one so four plates are not briefly
                      // stacked on top of each other in the static HTML.
                      // The opacity entry is a constant per plate, so React
                      // never rewrites it and never fights the animation.
                      style={{
                        visibility: active || i === leaving ? "visible" : "hidden",
                        opacity: i === 0 ? 1 : 0,
                      }}
                      initial={false}
                      animate={
                        active
                          ? { opacity: 1, transform: "translateX(0px)" }
                          : { opacity: 0, transform: `translateX(${offsetX}px)` }
                      }
                      transition={
                        reduce
                          ? { duration: FADE_REDUCED_S, ease: EASE_OUT }
                          : { duration: active ? FADE_IN_S : FADE_OUT_S, ease: EASE_OUT }
                      }
                      className={cn(
                        "col-start-1 row-start-1",
                        !active && "pointer-events-none"
                      )}
                    >
                      <Link
                        href={`/dupe-finder?ref=${arrival.referenceSlug}`}
                        data-cursor="view"
                        tabIndex={active ? undefined : -1}
                        className="group grid scroll-mt-24 gap-6 rounded-frame outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-8 focus-visible:ring-offset-background sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-8 lg:gap-12 xl:gap-16"
                      >
                        {/* The photograph is first in the DOM and second in
                            the grid from sm up. Placed explicitly rather than
                            with `order`, so the reading order is one thing at
                            every width: the bottle, then what it is. */}
                        <div className="sm:col-start-2 sm:row-start-1">
                          {/* Square, and a fixed width per breakpoint rather
                              than a share of the column, because the shots are
                              heterogeneous (some square studio, some portrait,
                              one lifestyle frame) and a tall crop takes the cap
                              off whichever one is widest. object-cover rather
                              than contain: these are white-ground merchant
                              photographs, and letterboxing one on a dark card
                              prints a white rectangle with bars. */}
                          <div className="aspect-square w-[62%] max-w-[15rem] overflow-hidden rounded-frame border border-border bg-card sm:w-[11rem] sm:max-w-none md:w-[13rem] lg:w-[17rem] xl:w-[23rem]">
                            <motion.div
                              className="h-full w-full"
                              initial={false}
                              animate={{
                                transform:
                                  reduce || active ? "scale(1)" : "scale(1.045)",
                              }}
                              transition={{
                                duration: reduce ? 0 : 0.62,
                                ease: EASE_OUT,
                              }}
                            >
                              <FragranceImage
                                fragrance={{
                                  name: arrival.name,
                                  brand: arrival.brand,
                                  family: arrival.family,
                                  facets: arrival.facets,
                                  imageUrl: arrival.imageUrl,
                                }}
                                className="h-full w-full text-4xl"
                              />
                            </motion.div>
                          </div>
                        </div>

                        {/* Capped, and left-aligned with the h2 above it. The
                            cap is what keeps the score a readable distance
                            from the name it belongs to: at 1232px the type
                            column would otherwise be 750px wide and a short
                            name would leave the two more than 400px apart,
                            which is the exact failure the previous layout was
                            measured for. The slack lands between the text and
                            the photograph instead, where it reads as the
                            gutter of a spread. */}
                        <motion.div
                          className="min-w-0 max-w-[33rem] sm:col-start-1 sm:row-start-1 xl:max-w-[36rem]"
                          initial={false}
                          animate={active ? "shown" : "waiting"}
                          variants={{
                            shown: {
                              transition: reduce
                                ? {}
                                : { staggerChildren: 0.055, delayChildren: 0.08 },
                            },
                            waiting: {},
                          }}
                        >
                          <motion.p
                            variants={line}
                            className="break-words text-xs uppercase tracking-[0.16em] text-muted-foreground"
                          >
                            {arrival.brand}
                          </motion.p>

                          <motion.div
                            variants={line}
                            className="mt-2.5 flex items-baseline justify-between gap-5 sm:gap-8"
                          >
                            {/* A span, not an h3. The five index entries below
                                are tabs rather than headings, and heading-
                                marking only the visible plate would tell a
                                screen reader the other four sit underneath it.
                                The section's own h2 names the region. Same call
                                /new and library-proof already make. */}
                            <span className="min-w-0 break-words font-display text-[1.75rem] leading-[1.15] transition-colors group-hover:text-primary group-active:text-primary sm:text-[2.5rem] lg:text-5xl xl:text-[3.25rem]">
                              {arrival.name}
                            </span>
                            {/* Deliberately NOT text-dupe. That token is a
                                chart-series mark for separating two series, it
                                carries no meaning on a number standing alone,
                                and it measures 4.03:1 in dark mode, under AA. */}
                            <p className="shrink-0 text-right leading-none">
                              {/* lining-nums: Cormorant Garamond defaults to
                                  OLD-STYLE figures, so 51% renders with the 5
                                  descending below the baseline and the 1 at
                                  x-height. Fine in prose, wrong for a measured
                                  value. The font ships real lnum and tnum,
                                  verified in the browser rather than assumed. */}
                              <span className="block font-display text-[1.75rem] leading-none lining-nums transition-colors group-hover:text-primary group-active:text-primary sm:text-[2.5rem] lg:text-[3.25rem] xl:text-[3.5rem]">
                                {arrival.score}%
                              </span>
                              <span className="mt-1.5 block text-xs text-muted-foreground">
                                match
                              </span>
                            </p>
                          </motion.div>

                          {/* "against X" set in the display family at two
                              sizes rather than a sans line with a serif word
                              dropped into it. The original and the alternative
                              then carry the same typographic voice, which is
                              the comparison this whole site is. Never "by
                              <brand>": several houses here are called "By
                              Kilian" and "by By Kilian" reads as a typo. */}
                          <motion.div variants={line} className="mt-6 sm:mt-7 lg:mt-9">
                            <p className="font-display text-xl leading-[1.2] sm:text-2xl">
                              <span className="text-base text-muted-foreground sm:text-lg">
                                {"against "}
                              </span>
                              {arrival.referenceName}
                            </p>
                            <p className="mt-1.5 text-sm text-muted-foreground">
                              {arrival.referenceBrand}
                            </p>
                          </motion.div>

                          <motion.div
                            variants={line}
                            className="mt-6 flex flex-col items-start gap-2 border-t border-border pt-4 text-xs text-muted-foreground sm:mt-8 sm:flex-row sm:items-center sm:justify-between sm:gap-4 lg:mt-10"
                          >
                            <p>
                              {`${arrival.pricePerMl} `}
                              <span aria-hidden>&middot;</span>
                              {" added "}
                              <time dateTime={arrival.firstLive}>{arrival.firstLiveLabel}</time>
                            </p>
                            <span className="inline-flex shrink-0 items-center gap-1.5 font-semibold text-primary">
                              Compare
                              <ArrowRight
                                className="h-3.5 w-3.5 transition-transform duration-150 ease-out group-hover:translate-x-0.5"
                                aria-hidden
                              />
                            </span>
                          </motion.div>
                        </motion.div>
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>

            {count > 1 && (
              <div className="mt-10 flex flex-col gap-5 sm:mt-12 md:flex-row md:items-start md:gap-8">
                {/* Named tabs, not dots. Five dots say "there is more"; five
                    names say what the more is, and keep every entry reachable
                    in one press whatever the timer is doing. Below md they
                    stack as a contents list, each name trailed by its own
                    rule; from md up the rule goes above the name and the five
                    run as a strip. */}
                <div
                  role="tablist"
                  aria-label="Choose which new arrival to show"
                  className="flex min-w-0 flex-1 flex-col md:grid md:grid-cols-5 md:gap-4"
                >
                  {arrivals.map((arrival, i) => {
                    const active = i === index;
                    return (
                      <button
                        key={arrival.slug}
                        type="button"
                        role="tab"
                        id={`${uid}-tab-${i}`}
                        aria-controls={`${uid}-panel-${i}`}
                        aria-selected={active}
                        tabIndex={active ? 0 : -1}
                        ref={(el) => {
                          tabRefs.current[i] = el;
                        }}
                        onClick={() => goTo(i, i > index ? 1 : -1)}
                        onKeyDown={(event) => onTabKeyDown(event, i)}
                        className="group/tab flex min-h-[2.75rem] w-full scroll-mt-24 items-center gap-4 rounded-frame text-left outline-none transition-transform duration-150 ease-out focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background active:scale-[0.99] md:min-h-0 md:flex-col md:items-stretch md:gap-2.5"
                      >
                        <span
                          className={cn(
                            "order-2 h-[3px] min-w-0 flex-1 overflow-hidden transition-colors duration-150 ease-out md:order-1 md:w-full md:flex-none",
                            active ? "bg-border" : "bg-border group-hover/tab:bg-muted-foreground"
                          )}
                        >
                          {active && (
                            <motion.span
                              className="block h-full w-full bg-primary"
                              style={{ transform: sweep, transformOrigin: "left" }}
                            />
                          )}
                        </span>
                        <span
                          className={cn(
                            "order-1 shrink-0 font-display text-base leading-tight transition-colors duration-150 ease-out md:order-2 md:min-w-0 md:shrink md:break-words md:text-[0.95rem] md:leading-[1.25]",
                            active
                              ? "text-foreground"
                              : "text-muted-foreground group-hover/tab:text-foreground"
                          )}
                        >
                          {arrival.name}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Transport controls: step back, stop, step forward.
                    Pause alone satisfies WCAG 2.2 SC 2.2.2, but the WAI
                    carousel guidance asks for previous/next as well, and they
                    earn their place twice over here. They are the single-
                    pointer, keyboard-operable equivalent of the swipe, which
                    SC 2.5.7 requires a drag gesture to have, and they step in
                    the direction the plate turns, which the tabs do not
                    express. Icon-only, so each carries its own accessible
                    name and the glyph itself is hidden from the tree. */}
                <div className="flex shrink-0 items-center gap-2 self-start md:-mt-1.5 md:self-auto">
                  <button
                    type="button"
                    onClick={() => step(-1)}
                    aria-label="Previous arrival"
                    className={cn(stepButton, "rounded-button")}
                  >
                    <CaretLeft weight="bold" className="h-3.5 w-3.5" aria-hidden />
                  </button>
                  {/* Text plus icon rather than icon alone: the label is what
                      identifies this one, and it is also what makes the
                      accessible name contain the visible one (SC 2.5.3). */}
                  <button
                    type="button"
                    onClick={() => setPaused((value) => !value)}
                    className={cn(stepButton, "gap-2 rounded-button px-3 text-xs font-semibold")}
                  >
                    {paused ? (
                      <Play weight="fill" className="h-3 w-3 text-foreground" aria-hidden />
                    ) : (
                      <Pause weight="fill" className="h-3 w-3 text-foreground" aria-hidden />
                    )}
                    {paused ? "Play" : "Pause"}
                    <span className="sr-only"> the newest arrivals slideshow</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => step(1)}
                    aria-label="Next arrival"
                    className={cn(stepButton, "rounded-button")}
                  >
                    <CaretRight weight="bold" className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </div>
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/**
 * One staggered line of the type block. Under reduced motion the rise is
 * removed and only the opacity remains, which is the "fewer and gentler,
 * not zero" degradation rather than an instant snap.
 */
function lineVariants(reduce: boolean) {
  return {
    shown: {
      opacity: 1,
      transform: "translateY(0px)",
      transition: { duration: reduce ? 0.16 : 0.42, ease: EASE_OUT },
    },
    waiting: {
      opacity: reduce ? 1 : 0,
      transform: reduce ? "translateY(0px)" : "translateY(10px)",
      transition: { duration: reduce ? 0 : 0.24, ease: EASE_OUT },
    },
  };
}
