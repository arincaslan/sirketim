"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="container grid items-center gap-12 py-16 md:grid-cols-[1.15fr_0.85fr] md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            Eleven scents, after dark
          </p>
          <h1 className="font-display mt-5 max-w-2xl text-fluid-hero font-semibold text-balance">
            Fragrance for the{" "}
            <span className="text-primary">hours after</span> the sun goes
            down.
          </h1>
          <p className="mt-6 max-w-md text-muted-foreground">
            No forty-note pyramids, no seasonal drops. Eleven fragrances,
            each built around one idea, blended in small batches — worn
            best when the lights are low.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
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
          transition={{ duration: 0.7, delay: 0.15 }}
          className="spotlight-card relative aspect-[4/5] w-full overflow-hidden rounded-sm border border-border"
        >
          <Image
            src="/hero.jpg"
            alt="A perfume bottle catching prism light against a dark surface"
            fill
            priority
            sizes="(min-width: 768px) 42vw, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/95 to-transparent p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-foil">
              Bottle of the hour
            </p>
            <p className="font-display mt-1 text-xl font-semibold">
              Midnight Leather
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
