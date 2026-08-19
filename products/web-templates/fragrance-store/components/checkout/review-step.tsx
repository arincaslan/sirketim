"use client";

import { Button } from "@/components/ui/button";
import { OrderSummary } from "@/components/store/order-summary";
import type { CartLine, PaymentDetails, ShippingDetails } from "@/lib/types";

interface ReviewStepProps {
  lines: CartLine[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingDetails: ShippingDetails;
  paymentDetails: PaymentDetails;
  onBack: () => void;
  onPlaceOrder: () => void;
  isPlacingOrder: boolean;
}

export function ReviewStep({
  lines,
  subtotal,
  shipping,
  tax,
  total,
  shippingDetails,
  paymentDetails,
  onBack,
  onPlaceOrder,
  isPlacingOrder,
}: ReviewStepProps) {
  const maskedCard = paymentDetails.cardNumber.replace(/\s/g, "").slice(-4);

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-serif text-xl">Review your order</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Ship to
          </p>
          <p className="mt-2 text-sm font-medium">
            {shippingDetails.fullName}
          </p>
          <p className="text-sm text-muted-foreground">
            {shippingDetails.address1}
            {shippingDetails.address2 ? `, ${shippingDetails.address2}` : ""}
          </p>
          <p className="text-sm text-muted-foreground">
            {shippingDetails.city}, {shippingDetails.region}{" "}
            {shippingDetails.postalCode}
          </p>
          <p className="text-sm text-muted-foreground">
            {shippingDetails.country}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {shippingDetails.email}
          </p>
        </div>

        <div className="rounded-lg border border-border p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Payment (demo)
          </p>
          <p className="mt-2 text-sm font-medium">{paymentDetails.cardName}</p>
          <p className="text-sm text-muted-foreground">
            Card ending in {maskedCard || "----"}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            No real payment will be processed — see the notice on the
            previous step.
          </p>
        </div>
      </div>

      <OrderSummary
        lines={lines}
        subtotal={subtotal}
        shipping={shipping}
        tax={tax}
        total={total}
      />

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isPlacingOrder}
        >
          Back to payment
        </Button>
        <Button
          type="button"
          size="lg"
          onClick={onPlaceOrder}
          disabled={isPlacingOrder}
        >
          {isPlacingOrder ? "Placing order…" : "Place order"}
        </Button>
      </div>
    </div>
  );
}
