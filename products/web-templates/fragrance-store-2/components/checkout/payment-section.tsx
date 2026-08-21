"use client";

import { Info } from "lucide-react";

import { Input } from "@/components/ui/input";
import { FormField } from "@/components/checkout/form-field";
import type { PaymentDetails } from "@/lib/types";

interface PaymentSectionProps {
  value: PaymentDetails;
  onChange: (value: PaymentDetails) => void;
  errors: Partial<Record<keyof PaymentDetails, string>>;
}

function formatCardNumber(input: string) {
  const digits = input.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(input: string) {
  const digits = input.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function PaymentSection({ value, onChange, errors }: PaymentSectionProps) {
  function update<K extends keyof PaymentDetails>(key: K, val: PaymentDetails[K]) {
    onChange({ ...value, [key]: val });
  }

  return (
    <section>
      <h2 className="font-display text-xl font-semibold">Payment</h2>

      <div className="mt-4 flex gap-2 border border-primary/30 bg-primary/10 p-3 text-xs text-foreground">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <p>
          Demo checkout — this template has no payment processor connected.
          These fields are not validated against a real card network,
          transmitted, or stored anywhere. No charge will ever occur here.
        </p>
      </div>

      <div className="mt-4">
        <FormField label="Name on card" error={errors.cardName}>
          <Input
            value={value.cardName}
            onChange={(e) => update("cardName", e.target.value)}
            error={!!errors.cardName}
            autoComplete="cc-name"
          />
        </FormField>
      </div>

      <div className="mt-4">
        <FormField label="Card number" error={errors.cardNumber}>
          <Input
            inputMode="numeric"
            placeholder="0000 0000 0000 0000"
            value={value.cardNumber}
            onChange={(e) => update("cardNumber", formatCardNumber(e.target.value))}
            error={!!errors.cardNumber}
            autoComplete="cc-number"
          />
        </FormField>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <FormField label="Expiry" error={errors.expiry}>
          <Input
            inputMode="numeric"
            placeholder="MM/YY"
            value={value.expiry}
            onChange={(e) => update("expiry", formatExpiry(e.target.value))}
            error={!!errors.expiry}
            autoComplete="cc-exp"
          />
        </FormField>
        <FormField label="CVC" error={errors.cvc}>
          <Input
            inputMode="numeric"
            placeholder="123"
            value={value.cvc}
            onChange={(e) => update("cvc", e.target.value.replace(/\D/g, "").slice(0, 4))}
            error={!!errors.cvc}
            autoComplete="cc-csc"
          />
        </FormField>
      </div>
    </section>
  );
}
