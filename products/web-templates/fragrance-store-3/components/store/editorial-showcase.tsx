import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { ScrollReveal } from "@/components/store/scroll-reveal";
import { MeridianSweep } from "@/components/store/meridian-sweep";
import { EDITORIAL_SHOWCASE_IMAGE } from "@/lib/media";
import { getProductBySlug } from "@/lib/products";

export function EditorialShowcase() {
  const product = getProductBySlug("amber-room");
  if (!product) return null;

  return (
    <section className="container py-16">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
        <ScrollReveal>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Editorial</p>
          <h2 className="font-display mt-3 text-fluid-h2 font-semibold text-balance">
            &ldquo;{product.place}.&rdquo;
          </h2>
          <p className="mt-6 max-w-md text-muted-foreground">{product.story}</p>
          <Link
            href={`/products/${product.slug}`}
            className="mt-6 inline-flex items-center gap-1 text-sm font-semibold uppercase tracking-wide text-primary hover:underline"
          >
            Read the full story <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <div className="relative aspect-[4/5] w-full overflow-hidden border border-border">
            <MeridianSweep
              family={product.family}
              src={EDITORIAL_SHOWCASE_IMAGE}
              alt="A hand tilting a Meridian flacon, warm light catching the liquid"
              trigger="view"
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
