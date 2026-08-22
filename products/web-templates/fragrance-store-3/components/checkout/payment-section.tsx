"use client";

import type { FormEvent } from "react";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/checkout/form-field";
import { PRODUCTS } from "@/lib/products";
import { cn } from "@/lib/utils";
import type { PaymentDetails } from "@/lib/types";

type PaymentErrors = Partial<Record<keyof PaymentDetails, string>>;

interface PaymentSectionProps {
  value: PaymentDetails;
  onChange: (value: PaymentDetails) => void;
  errors: PaymentErrors;
  sampleSlug: string;
  onSampleChange: (slug: string) => void;
  onContinue: () => void;
}

const SAMPLE_CHOICES = PRODUCTS.slice(0, 6);

export function PaymentSection({
  value,
  onChange,
  errors,
  sampleSlug,
  onSampleChange,
  onContinue,
}: PaymentSectionProps) {
  function set<K extends keyof PaymentDetails>(key: K, fieldValue: PaymentDetails[K]) {
    onChange({ ...value, [key]: fieldValue });
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onContinue();
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <div className="flex gap-3 border border-dashed border-border bg-secondary/50 p-4 text-sm text-muted-foreground">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        <p>
          This is a demo checkout. Card fields are validated for format only —
          nothing is charged, transmitted, or stored. See the README for what
          a real integration needs.
        </p>
      </div>

      <div className="flex flex-col gap-5">
        <FormField
          label="Name on card"
          name="cardName"
          required
          autoComplete="cc-name"
          value={value.cardName}
          onChange={(e) => set("cardName", e.target.value)}
          error={errors.cardName}
        />
        <FormField
          label="Card number"
          name="cardNumber"
          required
          inputMode="numeric"
          autoComplete="cc-number"
          placeholder="4242 4242 4242 4242"
          value={value.cardNumber}
          onChange={(e) => set("cardNumber", e.target.value)}
          error={errors.cardNumber}
        />
        <div className="grid grid-cols-2 gap-5">
          <FormField
            label="Expiry"
            name="expiry"
            required
            placeholder="MM/YY"
            autoComplete="cc-exp"
            value={value.expiry}
            onChange={(e) => set("expiry", e.target.value)}
            error={errors.expiry}
          />
          <FormField
            label="CVC"
            name="cvc"
            required
            inputMode="numeric"
            autoComplete="cc-csc"
            value={value.cvc}
            onChange={(e) => set("cvc", e.target.value)}
            error={errors.cvc}
          />
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold">Choose your free sample</p>
        <p className="mt-1 text-xs text-muted-foreground">One 2ml vial included with every order.</p>
        <div role="radiogroup" aria-label="Free sample" className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {SAMPLE_CHOICES.map((product) => {
            const active = sampleSlug === product.slug;
            return (
              <button
                key={product.slug}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onSampleChange(product.slug)}
                className={cn(
                  "min-h-[2.75rem] border px-3 py-2 text-left text-xs font-medium transition-colors",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:border-foreground/40"
                )}
              >
                {product.name}
              </button>
            );
          })}
        </div>
      </div>

      <Button type="submit" size="lg" className="w-fit">
        Review order
      </Button>
    </form>
  );
}
