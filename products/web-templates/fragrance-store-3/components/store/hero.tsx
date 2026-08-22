"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { MeridianSweep } from "@/components/store/meridian-sweep";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";
import { HERO_IMAGE, HERO_VIDEO } from "@/lib/media";
import { getBestsellers } from "@/lib/products";

/**
 * Full-bleed layered composition, not a centered banner or a side-by-side
 * grid (Ambre/Nocturne's respective devices) — the headline card overlaps
 * the visual's bottom edge, breaking across the boundary between the two,
 * for real depth via overlap. See DESIGN.md.
 *
 * Motion users get the real hero cinemagraph (`home-hero-video`), which
 * already carries the Meridian Sweep's literal light-band-crossing motion
 * baked into its own footage (see asset-manifest.json) — layering the coded
 * MeridianSweep component on top of that would be a redundant second sweep
 * on the same frame. Reduced-motion visitors (and the instant first paint,
 * via the video's `poster`) get the static hero still instead, run through
 * the coded MeridianSweep once on load so the reveal still happens, just as
 * an instant color resolve rather than a travelling band.
 */
export function Hero() {
  const reduced = usePrefersReducedMotion();
  const featured = getBestsellers(1)[0];

  return (
    <section className="relative">
      <div className="group relative h-[78vh] min-h-[520px] w-full overflow-hidden bg-secondary sm:h-[86vh]">
        <motion.div
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0"
        >
          {reduced ? (
            <MeridianSweep family={featured.family} src={HERO_IMAGE} alt="A Meridian flacon on a quiet horizon" priority />
          ) : (
            <video
              className="h-full w-full object-cover"
              src={HERO_VIDEO}
              poster={HERO_IMAGE}
              autoPlay
              muted
              loop
              playsInline
              aria-label="A Meridian flacon on a quiet horizon, a band of light crossing the frame once"
            />
          )}
        </motion.div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      <div className="container">
        <motion.div
          initial={reduced ? { opacity: 1 } : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: reduced ? 0 : 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 -mt-24 max-w-2xl border border-border bg-card p-8 shadow-object sm:-mt-32 sm:p-12"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Scent as a place</p>
          <h1 className="font-display mt-4 text-fluid-hero font-semibold leading-[0.98] text-balance">
            Every bottle is a room you can walk back into.
          </h1>
          <p className="mt-6 max-w-md text-muted-foreground">
            Ten fragrances, each built around a specific remembered place — a
            greenhouse in February, a stairwell after closing, a tideline at
            six in the morning. No forty-note marketing pyramids.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" asChild>
              <Link href="/products">Explore fragrances</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/discover">Discover your scent</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
