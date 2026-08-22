"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/store/scroll-reveal";
import { MeridianSweep } from "@/components/store/meridian-sweep";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";
import { CAMPAIGN_COPPER_COAST_IMAGE, CAMPAIGN_COPPER_COAST_VIDEO } from "@/lib/media";
import { getLimitedEdition } from "@/lib/products";
import { formatPrice } from "@/lib/utils";

export function LimitedCampaign() {
  const product = getLimitedEdition();
  const reduced = usePrefersReducedMotion();
  if (!product) return null;

  const isPreorder = product.availability === "preorder";

  return (
    <section className="container py-16">
      <ScrollReveal>
        <div className="relative grid overflow-hidden border border-border lg:grid-cols-[1fr_1.1fr]">
          <div className="flex flex-col justify-center p-8 sm:p-12">
            <Badge className="w-fit">{product.badge}</Badge>
            <h2 className="font-display mt-4 text-fluid-h2 font-semibold text-balance">{product.name}</h2>
            <p className="mt-3 max-w-sm text-muted-foreground">{product.tagline}</p>
            <p className="mt-5 text-sm font-semibold">
              From {formatPrice(Math.min(...product.sizes.filter((s) => !s.isSample).map((s) => s.price)))}
            </p>
            <Button asChild size="lg" className="mt-6 w-fit">
              <Link href={`/products/${product.slug}`}>{isPreorder ? "Preorder now" : "Shop the edition"}</Link>
            </Button>
          </div>
          <div className="relative aspect-[4/3] w-full lg:aspect-auto">
            {reduced ? (
              <MeridianSweep
                family={product.family}
                src={CAMPAIGN_COPPER_COAST_IMAGE}
                alt="Copper Coast campaign photography — a flacon on weathered copper pipe"
                trigger="view"
                sizes="(min-width: 1024px) 55vw, 100vw"
              />
            ) : (
              <video
                className="h-full w-full object-cover"
                src={CAMPAIGN_COPPER_COAST_VIDEO}
                poster={CAMPAIGN_COPPER_COAST_IMAGE}
                autoPlay
                muted
                loop
                playsInline
                aria-label="Copper Coast campaign film"
              />
            )}
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
