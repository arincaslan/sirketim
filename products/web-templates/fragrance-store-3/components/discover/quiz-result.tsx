"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MeridianSweep } from "@/components/store/meridian-sweep";
import { AddToCartButton } from "@/components/store/add-to-cart-button";
import { ProductCard } from "@/components/store/product-card";
import { getDefaultSize, getStartingPrice } from "@/lib/products";
import { getProductStill } from "@/lib/media";
import { formatPrice } from "@/lib/utils";
import type { QuizResult } from "@/lib/quiz";

interface QuizResultViewProps {
  result: QuizResult;
  onRetake: () => void;
}

export function QuizResultView({ result, onRetake }: QuizResultViewProps) {
  const { top, alternates, rationale } = result;
  const defaultSize = getDefaultSize(top);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Your recommendation</p>
      <h1 className="font-display mt-3 text-fluid-h1 font-semibold text-balance">{top.name}</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-start">
        <div className="relative aspect-square w-full overflow-hidden border border-border">
          {getProductStill(top.slug) && (
            <MeridianSweep
              family={top.family}
              src={getProductStill(top.slug)!}
              alt={top.name}
              trigger="view"
              priority
              sizes="(min-width: 1024px) 45vw, 100vw"
            />
          )}
        </div>

        <div>
          <p className="text-muted-foreground">{top.tagline}</p>
          <ul className="mt-4 flex flex-col gap-1.5 text-sm text-muted-foreground">
            {rationale.map((line) => (
              <li key={line} className="flex gap-2">
                <span className="text-primary">&mdash;</span>
                {line}
              </li>
            ))}
          </ul>

          <p className="mt-5 text-2xl font-semibold">{formatPrice(getStartingPrice(top))}</p>

          <div className="mt-5 flex flex-wrap gap-3">
            <AddToCartButton
              slug={top.slug}
              name={top.name}
              family={top.family}
              sizeMl={defaultSize.ml}
              unitPrice={defaultSize.price}
              feedback="toast"
              size="lg"
            />
            <Button asChild variant="outline" size="lg">
              <Link href={`/products/${top.slug}`}>
                Explore this scent <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <button
            type="button"
            onClick={onRetake}
            className="mt-6 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Retake the quiz
          </button>
        </div>
      </div>

      {alternates.length > 0 && (
        <div className="mt-16 border-t border-border pt-10">
          <h2 className="font-display text-lg font-semibold">Two more worth trying</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {alternates.map((product, index) => (
              <ProductCard key={product.slug} product={product} index={index} />
            ))}
          </div>
        </div>
      )}

      <div className="mt-10">
        <Button asChild variant="link" className="px-0">
          <Link href="/products">
            Or browse the full collection <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}
