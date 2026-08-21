import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { ProductPurchasePanel } from "@/components/store/product-purchase-panel";
import { NotesPyramid } from "@/components/store/notes-pyramid";
import { RelatedRail } from "@/components/store/related-rail";
import { getAllProducts, getProductBySlug } from "@/lib/products";

interface ProductPageProps {
  params: { slug: string };
}

export function generateStaticParams() {
  return getAllProducts().map((product) => ({ slug: product.slug }));
}

export function generateMetadata({ params }: ProductPageProps): Metadata {
  const product = getProductBySlug(params.slug);
  if (!product) return {};
  return {
    title: `${product.name} — Nocturne`,
    description: product.tagline,
  };
}

export default function ProductPage({ params }: ProductPageProps) {
  const product = getProductBySlug(params.slug);
  if (!product) {
    notFound();
  }

  return (
    <div>
      <div className="container pt-6">
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/" className="transition-colors hover:text-foreground">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/products" className="transition-colors hover:text-foreground">
            Fragrances
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">{product.name}</span>
        </nav>
      </div>

      <div className="container grid gap-10 py-8 md:grid-cols-2 md:items-start md:py-12">
        {/* Stacked vertical image sections — the main photo, then a second
            typographic "atmosphere" block — instead of a single static
            image or a thumbnail-strip carousel (see DESIGN.md). */}
        <div className="flex flex-col gap-4">
          <div className="spotlight-card relative aspect-square w-full overflow-hidden rounded-sm border border-border">
            <Image
              src={product.image}
              alt={product.name}
              fill
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-contain p-10"
            />
            {product.badge && (
              <Badge className="absolute left-4 top-4">{product.badge}</Badge>
            )}
          </div>

          <div className="relative flex aspect-[16/7] w-full items-center overflow-hidden rounded-sm border border-border bg-secondary px-8">
            <span
              aria-hidden="true"
              className="font-display pointer-events-none absolute -right-4 text-[7rem] font-semibold leading-none text-foil/10 sm:text-[9rem]"
            >
              {product.family}
            </span>
            <p className="relative max-w-xs text-sm text-muted-foreground">
              {product.family} &middot; {product.concentration}
            </p>
          </div>
        </div>

        <div className="md:sticky md:top-24">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {product.family} &middot; {product.concentration}
          </p>
          <h1 className="font-display mt-2 text-fluid-h1 font-semibold">
            {product.name}
          </h1>
          <p className="mt-3 max-w-md text-muted-foreground">{product.tagline}</p>

          <div className="mt-6 border-t border-border pt-6">
            <ProductPurchasePanel product={product} />
          </div>
        </div>
      </div>

      <div className="container pb-16">
        <h2 className="font-display text-xl font-semibold">About this scent</h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">{product.description}</p>
        <div className="mt-8 max-w-2xl">
          <NotesPyramid notes={product.notes} />
        </div>
      </div>

      <RelatedRail slug={product.slug} />
    </div>
  );
}
