"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="overflow-hidden border-b border-border">
      <div className="container grid items-center gap-10 py-16 md:grid-cols-2 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-gold">
            Twelve scents, small batches
          </p>
          <h1 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">
            Fragrance built around one idea per bottle.
          </h1>
          <p className="mt-5 max-w-md text-muted-foreground">
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
          transition={{ duration: 0.7, delay: 0.1 }}
          className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-secondary"
        >
          <Image
            src="/hero.jpg"
            alt="An ornate glass perfume bottle catching prism light"
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
