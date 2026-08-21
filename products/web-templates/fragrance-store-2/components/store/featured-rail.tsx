"use client";

import { useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { ProductCard } from "@/components/store/product-card";
import { PRODUCTS } from "@/lib/products";

const FEATURED_SLUGS = [
  "midnight-leather",
  "velvet-oud",
  "rose-absolute",
  "cedar-smoke",
  "golden-saffron",
  "ocean-bloom",
];

export function FeaturedRail() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const featured = FEATURED_SLUGS.map((slug) =>
    PRODUCTS.find((product) => product.slug === slug)
  ).filter((product): product is (typeof PRODUCTS)[number] => Boolean(product));

  function scrollBy(direction: 1 | -1) {
    scrollerRef.current?.scrollBy({
      left: direction * 340,
      behavior: "smooth",
    });
  }

  return (
    <section className="border-b border-border py-20">
      <div className="container flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            The edit
          </p>
          <h2 className="font-display mt-3 text-fluid-h2 font-semibold">
            Where to start
          </h2>
        </div>
        <div className="hidden gap-2 md:flex">
          <button
            type="button"
            aria-label="Scroll collection left"
            onClick={() => scrollBy(-1)}
            className="flex h-11 w-11 items-center justify-center rounded-sm border border-border transition-colors hover:bg-secondary"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Scroll collection right"
            onClick={() => scrollBy(1)}
            className="flex h-11 w-11 items-center justify-center rounded-sm border border-border transition-colors hover:bg-secondary"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="scroll-snap-x no-scrollbar container mt-10 flex gap-5 overflow-x-auto pb-2"
      >
        {featured.map((product, index) => (
          <div
            key={product.slug}
            className="scroll-snap-start w-[78%] shrink-0 sm:w-[45%] lg:w-[23%]"
          >
            <ProductCard product={product} index={index} />
          </div>
        ))}
        {/* Partial-width spacer so the last card doesn't sit flush against
            the edge — reinforces that there's more to scroll to. */}
        <div className="w-1 shrink-0" aria-hidden="true" />
      </div>
    </section>
  );
}
