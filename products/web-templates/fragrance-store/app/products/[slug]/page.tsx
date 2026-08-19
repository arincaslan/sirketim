import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { ProductPurchasePanel } from "@/components/store/product-purchase-panel";
import { NotesList } from "@/components/store/notes-list";
import { RelatedProducts } from "@/components/store/related-products";
import { Badge } from "@/components/ui/badge";
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
    title: `${product.name} — Ambre`,
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
          <Link
            href="/products"
            className="transition-colors hover:text-foreground"
          >
            Fragrances
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">{product.name}</span>
        </nav>
      </div>

      <div className="container grid gap-10 py-8 md:grid-cols-2 md:py-12">
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-secondary">
          <Image
            src={product.image}
            alt={product.name}
            fill
            priority
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
          {product.badge && (
            <Badge
              variant={product.badge === "Bestseller" ? "gold" : "secondary"}
              className="absolute left-4 top-4 shadow-sm"
            >
              {product.badge}
            </Badge>
          )}
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {product.family} &middot; {product.concentration}
          </p>
          <h1 className="mt-2 font-serif text-3xl sm:text-4xl">
            {product.name}
          </h1>
          <p className="mt-3 text-muted-foreground">{product.tagline}</p>

          <div className="mt-6 border-t border-border pt-6">
            <ProductPurchasePanel product={product} />
          </div>

          <ul className="mt-6 flex flex-col gap-2 border-t border-border pt-6 text-sm text-muted-foreground">
            {product.highlights.map((point) => (
              <li key={point} className="flex gap-2">
                <span className="text-gold">&#10003;</span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="container pb-16">
        <h2 className="font-serif text-xl">About this scent</h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          {product.description}
        </p>
        <div className="mt-6 max-w-2xl">
          <NotesList notes={product.notes} />
        </div>
      </div>

      <RelatedProducts slug={product.slug} />
    </div>
  );
}
