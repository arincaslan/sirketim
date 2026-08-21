"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ShippingSection } from "@/components/checkout/shipping-section";
import { PaymentSection } from "@/components/checkout/payment-section";
import { Confirmation } from "@/components/checkout/confirmation";
import { OrderSummary } from "@/components/store/order-summary";
import { useCartStore, selectCartSubtotal } from "@/lib/cart-store";
import { computeOrderTotals } from "@/lib/utils";
import type { PaymentDetails, ShippingDetails } from "@/lib/types";

const EMPTY_SHIPPING: ShippingDetails = {
  fullName: "",
  email: "",
  phone: "",
  address1: "",
  address2: "",
  city: "",
  region: "",
  postalCode: "",
  country: "",
};

const EMPTY_PAYMENT: PaymentDetails = {
  cardName: "",
  cardNumber: "",
  expiry: "",
  cvc: "",
};

type ShippingErrors = Partial<Record<keyof ShippingDetails, string>>;
type PaymentErrors = Partial<Record<keyof PaymentDetails, string>>;

function generateOrderNumber() {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `NCT-${random}`;
}

function validateShipping(value: ShippingDetails): ShippingErrors {
  const errors: ShippingErrors = {};
  if (!value.fullName.trim()) errors.fullName = "Enter your full name.";
  if (!/^\S+@\S+\.\S+$/.test(value.email)) errors.email = "Enter a valid email address.";
  if (!value.address1.trim()) errors.address1 = "Enter your street address.";
  if (!value.city.trim()) errors.city = "Enter your city.";
  if (!value.region.trim()) errors.region = "Enter your state or region.";
  if (!value.postalCode.trim()) errors.postalCode = "Enter your postal code.";
  if (!value.country.trim()) errors.country = "Choose a country.";
  return errors;
}

function validatePayment(value: PaymentDetails): PaymentErrors {
  const errors: PaymentErrors = {};
  if (!value.cardName.trim()) errors.cardName = "Enter the name on the card.";
  if (value.cardNumber.replace(/\s/g, "").length < 16)
    errors.cardNumber = "Card number looks incomplete.";
  if (!/^\d{2}\/\d{2}$/.test(value.expiry)) errors.expiry = "Use MM/YY format.";
  if (value.cvc.length < 3) errors.cvc = "CVC looks incomplete.";
  return errors;
}

export default function CheckoutPage() {
  const lines = useCartStore((state) => state.lines);
  const clearCart = useCartStore((state) => state.clearCart);
  const subtotal = useCartStore(selectCartSubtotal);
  const hasHydrated = useCartStore((state) => state.hasHydrated);
  const { shipping, tax, total } = computeOrderTotals(subtotal);

  const [shippingDetails, setShippingDetails] = useState<ShippingDetails>(EMPTY_SHIPPING);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>(EMPTY_PAYMENT);
  const [shippingErrors, setShippingErrors] = useState<ShippingErrors>({});
  const [paymentErrors, setPaymentErrors] = useState<PaymentErrors>({});
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [placedTotal, setPlacedTotal] = useState(0);
  const [placedEmail, setPlacedEmail] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const nextShippingErrors = validateShipping(shippingDetails);
    const nextPaymentErrors = validatePayment(paymentDetails);
    setShippingErrors(nextShippingErrors);
    setPaymentErrors(nextPaymentErrors);

    if (Object.keys(nextShippingErrors).length || Object.keys(nextPaymentErrors).length) {
      return;
    }

    setIsPlacingOrder(true);
    // Simulated latency only — there is no server request here. Nothing is
    // sent anywhere; this just mimics a processing step.
    window.setTimeout(() => {
      setOrderNumber(generateOrderNumber());
      setPlacedTotal(total);
      setPlacedEmail(shippingDetails.email);
      setIsPlacingOrder(false);
      clearCart();
    }, 900);
  }

  if (orderNumber) {
    return (
      <div className="container">
        <Confirmation orderNumber={orderNumber} email={placedEmail} total={placedTotal} />
      </div>
    );
  }

  if (!hasHydrated) {
    return (
      <div className="container py-24 text-center text-sm text-muted-foreground">
        Loading checkout…
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="container flex flex-col items-center justify-center gap-4 py-32 text-center">
        <ShoppingBag className="h-10 w-10 text-muted-foreground" />
        <h1 className="font-display text-2xl font-semibold">Your bag is empty</h1>
        <p className="max-w-sm text-muted-foreground">
          Add something to your bag before checking out.
        </p>
        <Button asChild size="lg">
          <Link href="/products">Shop fragrances</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <h1 className="font-display text-fluid-h1 font-semibold">Checkout</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        One page, no steps — everything below is reviewed together when you
        place the order.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-10 border border-border p-6 sm:p-8">
          <ShippingSection
            value={shippingDetails}
            onChange={setShippingDetails}
            errors={shippingErrors}
          />
          <div className="border-t border-border pt-8">
            <PaymentSection
              value={paymentDetails}
              onChange={setPaymentDetails}
              errors={paymentErrors}
            />
          </div>
        </div>

        <div className="lg:sticky lg:top-24 lg:h-fit">
          <OrderSummary lines={lines} subtotal={subtotal} shipping={shipping} tax={tax} total={total}>
            <Button type="submit" size="lg" disabled={isPlacingOrder} className="mt-6 w-full">
              {isPlacingOrder ? "Placing order…" : "Place order"}
            </Button>
          </OrderSummary>
        </div>
      </form>
    </div>
  );
}
