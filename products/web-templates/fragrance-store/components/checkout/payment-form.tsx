"use client";

import { useState, type FormEvent } from "react";
import { Info } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/checkout/form-field";
import type { PaymentDetails } from "@/lib/types";

interface PaymentFormProps {
  value: PaymentDetails;
  onChange: (value: PaymentDetails) => void;
  onNext: () => void;
  onBack: () => void;
}

type FieldErrors = Partial<Record<keyof PaymentDetails, string>>;

function formatCardNumber(input: string) {
  const digits = input.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(input: string) {
  const digits = input.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function PaymentForm({
  value,
  onChange,
  onNext,
  onBack,
}: PaymentFormProps) {
  const [errors, setErrors] = useState<FieldErrors>({});

  function update<K extends keyof PaymentDetails>(
    key: K,
    val: PaymentDetails[K]
  ) {
    onChange({ ...value, [key]: val });
  }

  function validate(): boolean {
    const next: FieldErrors = {};
    if (!value.cardName.trim()) next.cardName = "Enter the name on the card.";
    if (value.cardNumber.replace(/\s/g, "").length < 16)
      next.cardNumber = "Card number looks incomplete.";
    if (!/^\d{2}\/\d{2}$/.test(value.expiry))
      next.expiry = "Use MM/YY format.";
    if (value.cvc.length < 3) next.cvc = "CVC looks incomplete.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (validate()) onNext();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <h2 className="font-serif text-xl">Payment</h2>

      <div className="flex gap-2 rounded-md border border-gold/40 bg-gold/10 p-3 text-xs text-foreground">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
        <p>
          Demo checkout — this template has no payment processor connected.
          These fields are not validated against a real card network,
          transmitted, or stored anywhere. No charge will ever occur here.
        </p>
      </div>

      <FormField label="Name on card" error={errors.cardName}>
        <Input
          value={value.cardName}
          onChange={(e) => update("cardName", e.target.value)}
          error={!!errors.cardName}
          autoComplete="cc-name"
        />
      </FormField>

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

      <div className="grid grid-cols-2 gap-4">
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
            onChange={(e) =>
              update("cvc", e.target.value.replace(/\D/g, "").slice(0, 4))
            }
            error={!!errors.cvc}
            autoComplete="cc-csc"
          />
        </FormField>
      </div>

      <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back to shipping
        </Button>
        <Button type="submit" size="lg">
          Review order
        </Button>
      </div>
    </form>
  );
}
