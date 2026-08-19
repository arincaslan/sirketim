"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CheckoutStepper } from "@/components/checkout/checkout-stepper";
import { ShippingForm } from "@/components/checkout/shipping-form";
import { PaymentForm } from "@/components/checkout/payment-form";
import { ReviewStep } from "@/components/checkout/review-step";
import { ConfirmationStep } from "@/components/checkout/confirmation-step";
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

function generateOrderNumber() {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `AMB-${random}`;
}

export default function CheckoutPage() {
  const lines = useCartStore((state) => state.lines);
  const clearCart = useCartStore((state) => state.clearCart);
  const subtotal = useCartStore(selectCartSubtotal);
  const hasHydrated = useCartStore((state) => state.hasHydrated);
  const { shipping, tax, total } = computeOrderTotals(subtotal);

  const [step, setStep] = useState(0);
  const [shippingDetails, setShippingDetails] =
    useState<ShippingDetails>(EMPTY_SHIPPING);
  const [paymentDetails, setPaymentDetails] =
    useState<PaymentDetails>(EMPTY_PAYMENT);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [placedTotal, setPlacedTotal] = useState(0);

  function handlePlaceOrder() {
    setIsPlacingOrder(true);
    // Simulated latency only — there is no server request here. See the
    // README: nothing is sent anywhere, this just mimics a processing step.
    window.setTimeout(() => {
      setOrderNumber(generateOrderNumber());
      setPlacedTotal(total);
      setIsPlacingOrder(false);
      clearCart();
    }, 900);
  }

  if (orderNumber) {
    return (
      <div className="container">
        <ConfirmationStep
          orderNumber={orderNumber}
          email={shippingDetails.email}
          total={placedTotal}
        />
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
        <h1 className="font-serif text-2xl">Your bag is empty</h1>
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
      <h1 className="text-center font-serif text-3xl sm:text-4xl">
        Checkout
      </h1>
      <div className="mt-8">
        <CheckoutStepper currentStep={step} />
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr,380px]">
        <div className="rounded-lg border border-border p-6">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="shipping"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.25 }}
              >
                <ShippingForm
                  value={shippingDetails}
                  onChange={setShippingDetails}
                  onNext={() => setStep(1)}
                />
              </motion.div>
            )}
            {step === 1 && (
              <motion.div
                key="payment"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.25 }}
              >
                <PaymentForm
                  value={paymentDetails}
                  onChange={setPaymentDetails}
                  onNext={() => setStep(2)}
                  onBack={() => setStep(0)}
                />
              </motion.div>
            )}
            {step === 2 && (
              <motion.div
                key="review"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.25 }}
              >
                <ReviewStep
                  lines={lines}
                  subtotal={subtotal}
                  shipping={shipping}
                  tax={tax}
                  total={total}
                  shippingDetails={shippingDetails}
                  paymentDetails={paymentDetails}
                  onBack={() => setStep(1)}
                  onPlaceOrder={handlePlaceOrder}
                  isPlacingOrder={isPlacingOrder}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {step < 2 && (
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <OrderSummary
                lines={lines}
                subtotal={subtotal}
                shipping={shipping}
                tax={tax}
                total={total}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
