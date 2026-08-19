"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";
import { HERO_REVEAL_DELAY_S } from "@/lib/preloader-timing";

export function Hero() {
  // Timed to start as the first-load preloader wipes away (see
  // lib/preloader-timing.ts) so the hero visibly animates into place as part
  // of the reveal, instead of having already finished behind the loader.
  // Reduced-motion users never see the preloader, so they get no delay either.
  const reduceMotion = usePrefersReducedMotion();
  const revealDelay = reduceMotion ? 0 : HERO_REVEAL_DELAY_S;

  return (
    <section className="overflow-hidden border-b border-border">
      <div className="container grid items-center gap-10 py-16 md:grid-cols-2 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: revealDelay }}
        >
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-gold">
            Twelve scents, small batches
          </p>
          <h1 className="mt-4 max-w-xl text-fluid-hero font-serif font-medium text-balance">
            Fragrance built around{" "}
            <span className="italic">one idea</span> per bottle.
          </h1>
          <p className="mt-6 max-w-md text-muted-foreground">
            No forty-note pyramids, no seasonal drops. Twelve fragrances,
            each built around a single clear idea, blended in small batches
            and sized so you actually finish the bottle.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" asChild>
              <Link href="/products">Shop the collection</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/about">Our story</Link>
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: revealDelay + 0.1 }}
          className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-secondary"
        >
          <Image
            src="/hero-new.png"
            alt="A glass perfume bottle with warm amber liquid on a travertine surface, beside linen and dried botanicals"
            fill
            priority
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </motion.div>
      </div>
    </section>
  );
}
