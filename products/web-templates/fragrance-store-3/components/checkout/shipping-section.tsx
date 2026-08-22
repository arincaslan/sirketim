"use client";

import type { FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/checkout/form-field";
import type { ShippingDetails } from "@/lib/types";

type ShippingErrors = Partial<Record<keyof ShippingDetails, string>>;

interface ShippingSectionProps {
  value: ShippingDetails;
  onChange: (value: ShippingDetails) => void;
  errors: ShippingErrors;
  onContinue: () => void;
}

export function ShippingSection({ value, onChange, errors, onContinue }: ShippingSectionProps) {
  function set<K extends keyof ShippingDetails>(key: K, fieldValue: ShippingDetails[K]) {
    onChange({ ...value, [key]: fieldValue });
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onContinue();
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          label="Full name"
          name="fullName"
          required
          autoComplete="name"
          value={value.fullName}
          onChange={(e) => set("fullName", e.target.value)}
          error={errors.fullName}
        />
        <FormField
          label="Email"
          name="email"
          type="email"
          required
          autoComplete="email"
          value={value.email}
          onChange={(e) => set("email", e.target.value)}
          error={errors.email}
        />
      </div>
      <FormField
        label="Phone (optional)"
        name="phone"
        type="tel"
        autoComplete="tel"
        value={value.phone}
        onChange={(e) => set("phone", e.target.value)}
      />
      <FormField
        label="Address"
        name="address1"
        required
        autoComplete="address-line1"
        value={value.address1}
        onChange={(e) => set("address1", e.target.value)}
        error={errors.address1}
      />
      <FormField
        label="Apartment, suite, etc. (optional)"
        name="address2"
        autoComplete="address-line2"
        value={value.address2}
        onChange={(e) => set("address2", e.target.value)}
      />
      <div className="grid gap-5 sm:grid-cols-3">
        <FormField
          label="City"
          name="city"
          required
          autoComplete="address-level2"
          value={value.city}
          onChange={(e) => set("city", e.target.value)}
          error={errors.city}
        />
        <FormField
          label="State / region"
          name="region"
          required
          autoComplete="address-level1"
          value={value.region}
          onChange={(e) => set("region", e.target.value)}
          error={errors.region}
        />
        <FormField
          label="Postal code"
          name="postalCode"
          required
          autoComplete="postal-code"
          value={value.postalCode}
          onChange={(e) => set("postalCode", e.target.value)}
          error={errors.postalCode}
        />
      </div>
      <FormField
        label="Country"
        name="country"
        required
        autoComplete="country-name"
        placeholder="United States"
        value={value.country}
        onChange={(e) => set("country", e.target.value)}
        error={errors.country}
      />

      <Button type="submit" size="lg" className="mt-2 w-fit">
        Continue to payment
      </Button>
    </form>
  );
}
