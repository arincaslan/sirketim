"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { PRODUCTS, SCENT_FAMILY_IMAGES } from "@/lib/products";
import type { ScentFamily } from "@/lib/types";

const FAMILY_BLURB: Record<ScentFamily, string> = {
  Oriental: "Saffron, oud, amber. The loudest family in the collection.",
  Woody: "Cedar, vetiver, smoked birch. Dry, cold-weather, unhurried.",
  Floral: "Rose, jasmine, iris — never the candy version.",
  Fresh: "Sea spray, citrus, green tea. Light, but never plain.",
  Gourmand: "Vanilla, tonka, caramel — grounded, not sugary.",
};

// Large / small span pairing drives the asymmetric bento layout — two large
// tiles, three small — rather than a uniform grid (see DESIGN.md).
const LAYOUT: { family: ScentFamily; span: "large" | "small" }[] = [
  { family: "Oriental", span: "large" },
  { family: "Woody", span: "large" },
  { family: "Floral", span: "small" },
  { family: "Fresh", span: "small" },
  { family: "Gourmand", span: "small" },
];

export function BentoCollections() {
  return (
    <section className="border-b border-border py-20">
      <div className="container">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              Browse by family
            </p>
            <h2 className="font-display mt-3 text-fluid-h2 font-semibold">
              Five families, eleven scents
            </h2>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-6 md:auto-rows-[minmax(180px,auto)]">
          {LAYOUT.map(({ family, span }, index) => {
            const count = PRODUCTS.filter((p) => p.family === family).length;
            return (
              <motion.div
                key={family}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: index * 0.06 }}
                className={cn(
                  "col-span-2 row-span-1",
                  span === "large" && "md:col-span-3 md:row-span-2",
                  span === "small" && "md:col-span-2 md:row-span-1"
                )}
              >
                <Link
                  href={`/products?family=${family}`}
                  className="group spotlight-card relative flex h-full min-h-[180px] flex-col justify-end overflow-hidden rounded-sm border border-border p-5"
                >
                  <Image
                    src={SCENT_FAMILY_IMAGES[family]}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-contain object-bottom opacity-90 transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                  <div className="relative">
                    <p className="font-display text-2xl font-semibold">{family}</p>
                    <p className="mt-1 max-w-xs text-sm text-muted-foreground opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      {FAMILY_BLURB[family]}
                    </p>
                    <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-foil">
                      {count} scents
                      <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
