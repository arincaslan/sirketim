"use client";

import { useState } from "react";
import { AlertCircle, Clock, Info, PackageCheck, Star } from "lucide-react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AddToCartButton } from "@/components/store/add-to-cart-button";
import { QuantityStepper } from "@/components/store/quantity-stepper";
import { SizeSelector } from "@/components/store/size-selector";
import { formatPrice, formatRating } from "@/lib/utils";
import { getDefaultSize } from "@/lib/products";
import type { Product } from "@/lib/types";

interface ProductPurchasePanelProps {
  product: Product;
}

const AVAILABILITY_COPY: Record<Product["availability"], { label: string; tone: string; icon: typeof PackageCheck }> = {
  "in-stock": { label: "In stock, ships within 2 business days", tone: "text-success", icon: PackageCheck },
  "low-stock": { label: "Low stock — a few bottles left in this batch", tone: "text-primary", icon: AlertCircle },
  preorder: { label: "Available for preorder — ships with the next batch", tone: "text-primary", icon: Clock },
  "sold-out": { label: "Sold out — restock notifications coming soon", tone: "text-muted-foreground", icon: Info },
};

export function ProductPurchasePanel({ product }: ProductPurchasePanelProps) {
  const defaultSize = getDefaultSize(product);
  const [sizeMl, setSizeMl] = useState(defaultSize.ml);
  const [quantity, setQuantity] = useState(1);

  const selectedSize = product.sizes.find((size) => size.ml === sizeMl) ?? defaultSize;
  const availability = AVAILABILITY_COPY[product.availability];
  const AvailabilityIcon = availability.icon;
  const soldOut = product.availability === "sold-out";

  return (
    <div id="purchase-panel">
      <div className="flex items-center gap-3">
        <p className="text-2xl font-semibold">{formatPrice(selectedSize.price)}</p>
        <span className="flex items-center gap-1 text-sm text-muted-foreground">
          <Star className="h-3.5 w-3.5 fill-primary text-primary" aria-hidden="true" />
          {formatRating(product.rating)} ({product.reviewCount})
        </span>
      </div>

      <p className={`mt-2 flex items-center gap-1.5 text-sm font-medium ${availability.tone}`}>
        <AvailabilityIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
        {availability.label}
      </p>

      <div className="mt-6">
        <SizeSelector sizes={product.sizes} selected={sizeMl} onChange={setSizeMl} />
      </div>

      <div className="mt-6 flex items-center gap-4">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Qty</span>
        <QuantityStepper quantity={quantity} onChange={setQuantity} />
      </div>

      <AddToCartButton
        slug={product.slug}
        name={product.name}
        family={product.family}
        sizeMl={sizeMl}
        unitPrice={selectedSize.price}
        isSample={selectedSize.isSample}
        quantity={quantity}
        size="lg"
        disabled={soldOut}
        className="mt-6 w-full"
        label={soldOut ? "Sold out" : selectedSize.isSample ? "Add sample" : "Add to bag"}
      />

      <Accordion type="single" collapsible defaultValue="details" className="mt-8">
        <AccordionItem value="details">
          <AccordionTrigger>Family, concentration &amp; performance</AccordionTrigger>
          <AccordionContent>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <dt className="text-foreground/70">Family</dt>
              <dd>{product.family}</dd>
              <dt className="text-foreground/70">Concentration</dt>
              <dd>{product.concentration}</dd>
              <dt className="text-foreground/70">Longevity</dt>
              <dd>{product.longevity}</dd>
              <dt className="text-foreground/70">Sillage</dt>
              <dd>{product.sillage}</dd>
              <dt className="text-foreground/70">Best in</dt>
              <dd>{product.seasons.join(", ")}</dd>
            </dl>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="highlights">
          <AccordionTrigger>Why this one</AccordionTrigger>
          <AccordionContent>
            <ul className="flex flex-col gap-2">
              {product.highlights.map((point) => (
                <li key={point} className="flex gap-2">
                  <span className="text-primary">&#10003;</span>
                  {point}
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="ingredients">
          <AccordionTrigger>Ingredients &amp; sourcing</AccordionTrigger>
          <AccordionContent>{product.ingredientsNote}</AccordionContent>
        </AccordionItem>
        <AccordionItem value="sustainability">
          <AccordionTrigger>Sustainability</AccordionTrigger>
          <AccordionContent>{product.sustainabilityNote}</AccordionContent>
        </AccordionItem>
        <AccordionItem value="shipping">
          <AccordionTrigger>Shipping &amp; samples</AccordionTrigger>
          <AccordionContent>
            Free shipping on orders over {formatPrice(120)}. Otherwise a flat {formatPrice(12)} fee applies at
            checkout. Every full-size order ships with a free 2ml sample of your choice, selected at checkout.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
