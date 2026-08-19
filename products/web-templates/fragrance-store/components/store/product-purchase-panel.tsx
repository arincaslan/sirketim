"use client";

import { useState } from "react";

import { SizeSelector } from "@/components/store/size-selector";
import { QuantityStepper } from "@/components/store/quantity-stepper";
import { AddToCartButton } from "@/components/store/add-to-cart-button";
import { formatPrice } from "@/lib/utils";
import { getDefaultSize } from "@/lib/products";
import type { Product } from "@/lib/types";

export function ProductPurchasePanel({ product }: { product: Product }) {
  const [selectedSize, setSelectedSize] = useState(getDefaultSize(product));
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="flex flex-col gap-6">
      <p className="text-2xl font-semibold">
        {formatPrice(selectedSize.price)}
        <span className="ml-1 text-sm font-normal text-muted-foreground">
          / {selectedSize.ml}ml
        </span>
      </p>

      <div>
        <p className="mb-2 text-sm font-medium">Size</p>
        <SizeSelector
          sizes={product.sizes}
          selected={selectedSize}
          onSelect={setSelectedSize}
          layoutId={`size-highlight-${product.slug}`}
        />
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">Quantity</p>
        <QuantityStepper value={quantity} onChange={setQuantity} max={10} />
      </div>

      <AddToCartButton
        slug={product.slug}
        name={product.name}
        image={product.image}
        family={product.family}
        sizeMl={selectedSize.ml}
        unitPrice={selectedSize.price}
        quantity={quantity}
        size="lg"
        className="w-full sm:w-auto"
        label={`Add to bag — ${formatPrice(selectedSize.price * quantity)}`}
      />
    </div>
  );
}
