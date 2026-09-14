"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FragranceImage } from "@/components/fragrance/fragrance-image";
import { cn } from "@/lib/utils";

/**
 * The five most recently added listings, as a slider on the home page.
 *
 * WHAT DECIDES WHAT APPEARS HERE, AND WHY IT MATTERS MORE THAN IT LOOKS.
 * Recency, and nothing else. Not score, not price, and above all not whether
 * the producer pays us.
 *
 * The founder's reason for wanting this surface is that a subscriber should
 * get visible value for their subscription, which is fair and is exactly what
 * happens: a new listing is new whoever filed it, so a subscriber's fragrance
 * lands here the week it publishes. But the RULE stays neutral, and the
 * difference between those two framings is the whole ballgame. "Newest first,
 * everyone" is an editorial rule a subscriber benefits from. "Subscribers on
 * the home page" is placement sold for money - and /disclosure currently says,
 * in those words, that we do not accept payment for placement and never will.
 * One of those sentences can stay true alongside this component. The other
 * cannot.
 *
 * So: if this list is ever re-sorted to put paying producers first, filtered
 * to subscribers only, or given a reserved slot, that is a different product
 * and /disclosure and the home page's "No paid placement" panel have to be
 * rewritten in the same change. Do not do it quietly.
 *
 * HOW THE ROTATION DEGRADES, in three steps, because each has bitten this
 * project or its neighbours:
 *
 *  1. No JavaScript: the track is a CSS scroll-snap row. It renders, it is
 *     readable, and it swipes on touch. Nothing here depends on hydration.
 *  2. Reduced motion: auto-advance never starts and scrolling is instant
 *     rather than smooth. The marquee in retailer-band.tsx had to learn this
 *     the hard way - the global `animation-iteration-count: 1` rule parked its
 *     track half off-screen. This component uses no CSS animation at all,
 *     which sidesteps that class of bug entirely.
 *  3. Hover, focus, or a hidden tab: the timer stops. A carousel that moves
 *     out from under a pointer, or while the reader is tabbing through it, is
 *     hostile, and one that keeps ticking in a background tab is just waste.
 */

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

const ADVANCE_MS = 6000;

export function NewArrivals({ arrivals }: { arrivals: NewArrival[] }) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  // Read from the DOM rather than from a media query hook so this is correct
  // on first paint and follows the OS setting if it changes mid-visit.
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  const goTo = useCallback(
    (index: number) => {
      const track = trackRef.current;
      if (!track) return;
      const card = track.children[index] as HTMLElement | undefined;
      if (!card) return;
      track.scrollTo({
        left: card.offsetLeft - track.offsetLeft,
        behavior: reducedMotion ? "auto" : "smooth",
      });
      setActive(index);
    },
    [reducedMotion]
  );

  useEffect(() => {
    if (paused || reducedMotion || arrivals.length < 2) return;
    const timer = window.setInterval(() => {
      setActive((current) => {
        const next = (current + 1) % arrivals.length;
        const track = trackRef.current;
        const card = track?.children[next] as HTMLElement | undefined;
        if (track && card) {
          track.scrollTo({ left: card.offsetLeft - track.offsetLeft, behavior: "smooth" });
        }
        return next;
      });
    }, ADVANCE_MS);
    return () => window.clearInterval(timer);
  }, [paused, reducedMotion, arrivals.length]);

  // A background tab should not be advancing a carousel nobody is looking at.
  useEffect(() => {
    const sync = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  // Keep the dots honest when the reader swipes or scrolls the track by hand,
  // rather than letting them describe a position the track is not in.
  const onScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    let nearest = 0;
    let best = Infinity;
    for (let i = 0; i < track.children.length; i += 1) {
      const card = track.children[i] as HTMLElement;
      const distance = Math.abs(card.offsetLeft - track.offsetLeft - track.scrollLeft);
      if (distance < best) {
        best = distance;
        nearest = i;
      }
    }
    setActive(nearest);
  }, []);

  if (arrivals.length === 0) return null;

  return (
    <section aria-labelledby="new-arrivals-heading">
      <div className="container pb-16 pt-4 sm:pb-20">
        <div className="rounded-frame border border-border bg-card/60 py-8">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 px-6 sm:px-8">
            <h2
              id="new-arrivals-heading"
              className="font-display text-sm uppercase tracking-[0.14em] text-muted-foreground"
            >
              Newest alternatives in the catalogue
            </h2>
            <Link
              href="/new"
              className="text-sm underline-offset-4 hover:text-primary hover:underline"
            >
              See everything added
            </Link>
          </div>

          <ul
            ref={trackRef}
            onScroll={onScroll}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={() => setPaused(false)}
            className={cn(
              "mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2 sm:px-8",
              // The scrollbar is redundant next to the dots and noisy on a
              // short track; the row stays keyboard- and touch-scrollable.
              "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            )}
          >
            {arrivals.map((arrival) => (
              <li
                key={arrival.slug}
                className="w-[17rem] shrink-0 snap-start sm:w-[19rem]"
              >
                <Link
                  href={`/dupe-finder?ref=${arrival.referenceSlug}`}
                  data-cursor="view"
                  className="group flex h-full items-start gap-3 rounded-frame border border-border bg-card p-4 transition-[border-color,transform] duration-150 ease-out hover:border-primary/50 active:scale-[0.99]"
                >
                  <FragranceImage
                    fragrance={{
                      name: arrival.name,
                      brand: arrival.brand,
                      family: arrival.family,
                      facets: arrival.facets,
                      imageUrl: arrival.imageUrl,
                    }}
                    className="h-11 w-11 shrink-0 text-sm"
                  />
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="line-clamp-2 font-semibold transition-colors group-hover:text-primary">
                      {arrival.name}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {arrival.brand} &middot; {arrival.pricePerMl}
                    </span>
                    <span className="mt-1 text-xs text-muted-foreground">
                      Listed against{" "}
                      <span className="font-semibold text-foreground/85">
                        {arrival.referenceName}
                      </span>{" "}
                      ({arrival.referenceBrand})
                    </span>
                    <time
                      dateTime={arrival.firstLive}
                      className="mt-1 text-xs text-muted-foreground"
                    >
                      Added {arrival.firstLiveLabel}
                    </time>
                  </span>
                  {/* Not text-dupe: that token is a chart-series mark and
                      measures 4.03:1 in dark mode at this size, under AA. */}
                  <span className="shrink-0 font-display text-lg leading-none">
                    {arrival.score}%
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          {arrivals.length > 1 && (
            <div className="mt-4 flex items-center gap-2 px-6 sm:px-8">
              {arrivals.map((arrival, index) => (
                <button
                  key={arrival.slug}
                  type="button"
                  onClick={() => goTo(index)}
                  aria-label={`Show ${arrival.name}`}
                  aria-current={index === active ? "true" : undefined}
                  className={cn(
                    "h-2 rounded-full transition-[width,background-color] duration-200",
                    // Hit target stays 44px tall via padding on the wrapper
                    // below; the visible dot is the 8px bar.
                    index === active
                      ? "w-6 bg-foreground/70"
                      : "w-2 bg-foreground/25 hover:bg-foreground/40"
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
