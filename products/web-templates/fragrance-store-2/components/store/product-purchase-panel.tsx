"use client";

import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AddToCartButton } from "@/components/store/add-to-cart-button";
import { QuantityStepper } from "@/components/store/quantity-stepper";
import { SizeSelector } from "@/components/store/size-selector";
import { formatPrice } from "@/lib/utils";
import { getDefaultSize } from "@/lib/products";
import type { Product } from "@/lib/types";

interface ProductPurchasePanelProps {
  product: Product;
}

export function ProductPurchasePanel({ product }: ProductPurchasePanelProps) {
  const defaultSize = getDefaultSize(product);
  const [sizeMl, setSizeMl] = useState(defaultSize.ml);
  const [quantity, setQuantity] = useState(1);

  const selectedSize = product.sizes.find((size) => size.ml === sizeMl) ?? defaultSize;

  return (
    <div>
      <p className="text-2xl font-semibold text-primary">
        {formatPrice(selectedSize.price)}
      </p>

      <div className="mt-6">
        <SizeSelector sizes={product.sizes} selected={sizeMl} onChange={setSizeMl} />
      </div>

      <div className="mt-6 flex items-center gap-4">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Qty
        </span>
        <QuantityStepper quantity={quantity} onChange={setQuantity} />
      </div>

      <AddToCartButton
        slug={product.slug}
        name={product.name}
        image={product.image}
        family={product.family}
        sizeMl={sizeMl}
        unitPrice={selectedSize.price}
        quantity={quantity}
        size="lg"
        className="mt-6 w-full"
      />

      <Accordion type="single" collapsible className="mt-8">
        <AccordionItem value="notes">
          <AccordionTrigger>Notes</AccordionTrigger>
          <AccordionContent>
            <p>
              Top: {product.notes.top.join(", ")}. Heart: {product.notes.heart.join(", ")}.
              Base: {product.notes.base.join(", ")}.
            </p>
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
        <AccordionItem value="shipping">
          <AccordionTrigger>Shipping</AccordionTrigger>
          <AccordionContent>
            Free shipping on orders over {formatPrice(120)}. Otherwise a flat{" "}
            {formatPrice(12)} fee applies at checkout.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
