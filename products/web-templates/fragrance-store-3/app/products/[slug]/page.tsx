import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { ProductGallery } from "@/components/store/product-gallery";
import { ProductPurchasePanel } from "@/components/store/product-purchase-panel";
import { NotesThread } from "@/components/store/notes-thread";
import { Reviews } from "@/components/store/reviews";
import { ProductRail } from "@/components/store/product-rail";
import { StickyMobileBuybar } from "@/components/store/sticky-mobile-buybar";
import { ScrollReveal } from "@/components/store/scroll-reveal";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getAllProducts, getCrossSellProducts, getProductBySlug, getRelatedProducts } from "@/lib/products";

interface ProductPageProps {
  params: { slug: string };
}

const FAQS = [
  {
    q: "How big is the sample size, and is it really free?",
    a: "Every full-size order ships with one free 2ml sample of your choice, selected at checkout — enough for roughly 20–30 wears. You can also buy any sample on its own for $8–13 without ordering a full bottle.",
  },
  {
    q: "What's your return policy?",
    a: "Unopened bottles can be returned within 30 days for a full refund. Opened bottles aren't eligible for return for hygiene reasons — this is exactly why we make samples available on everything before you commit to a full size.",
  },
  {
    q: "Are these fragrances tested on animals?",
    a: "No formula in this collection is tested on animals at any stage of development.",
  },
  {
    q: "How long will one bottle last with normal use?",
    a: "At two to three sprays a day, a 50ml bottle typically lasts four to six months. The 100ml size is the better value if a fragrance becomes part of your regular rotation.",
  },
];

export function generateStaticParams() {
  return getAllProducts().map((product) => ({ slug: product.slug }));
}

export function generateMetadata({ params }: ProductPageProps): Metadata {
  const product = getProductBySlug(params.slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.tagline,
  };
}

export default function ProductPage({ params }: ProductPageProps) {
  const product = getProductBySlug(params.slug);
  if (!product) {
    notFound();
  }

  const related = getRelatedProducts(product.slug, 4);
  const crossSell = getCrossSellProducts(product.slug, 3);

  return (
    <div>
      <div className="container pt-6">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/" className="transition-colors hover:text-foreground">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" aria-hidden="true" />
          <Link href="/products" className="transition-colors hover:text-foreground">
            Fragrances
          </Link>
          <ChevronRight className="h-3 w-3" aria-hidden="true" />
          <span aria-current="page" className="text-foreground">
            {product.name}
          </span>
        </nav>
      </div>

      <div className="container grid gap-10 py-8 md:grid-cols-2 md:items-start md:py-12">
        <ProductGallery product={product} />

        <div className="md:sticky md:top-24">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{product.place}</p>
          <h1 className="font-display mt-2 text-fluid-h1 font-semibold text-balance">{product.name}</h1>
          <p className="mt-3 max-w-md text-muted-foreground">{product.story}</p>

          <div className="mt-6 border-t border-border pt-6">
            <ProductPurchasePanel product={product} />
          </div>
        </div>
      </div>

      <div className="container pb-16">
        <ScrollReveal>
          <h2 className="font-display text-2xl font-semibold">About this scent</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">{product.description}</p>
        </ScrollReveal>

        <div className="mt-10 grid gap-12 lg:grid-cols-2">
          <ScrollReveal delay={0.1}>
            <NotesThread notes={product.notes} family={product.family} />
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <h3 className="font-display text-lg font-semibold">Questions</h3>
            <Accordion type="single" collapsible className="mt-4">
              {FAQS.map((faq) => (
                <AccordionItem key={faq.q} value={faq.q}>
                  <AccordionTrigger>{faq.q}</AccordionTrigger>
                  <AccordionContent>{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </ScrollReveal>
        </div>

        <div className="mt-16 border-t border-border pt-12">
          <h2 className="font-display text-2xl font-semibold">Reviews</h2>
          <div className="mt-6">
            <Reviews product={product} />
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <ProductRail
          title={`More from ${product.family}`}
          subtitle="Same family, a different place."
          products={related}
          viewAllHref={`/products?family=${product.family}`}
        />
      </div>
      <div className="border-t border-border">
        <ProductRail
          title="Complete the ritual"
          subtitle="A different family, worth pairing or layering with this one."
          products={crossSell}
        />
      </div>

      <StickyMobileBuybar product={product} />
    </div>
  );
}
