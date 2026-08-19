"use client";

import { useState, type FormEvent } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/checkout/form-field";
import { cn } from "@/lib/utils";
import type { ShippingDetails } from "@/lib/types";

const COUNTRIES = [
  "United States",
  "Canada",
  "United Kingdom",
  "Germany",
  "France",
  "Turkiye",
  "Australia",
];

interface ShippingFormProps {
  value: ShippingDetails;
  onChange: (value: ShippingDetails) => void;
  onNext: () => void;
}

type FieldErrors = Partial<Record<keyof ShippingDetails, string>>;

export function ShippingForm({ value, onChange, onNext }: ShippingFormProps) {
  const [errors, setErrors] = useState<FieldErrors>({});

  function update<K extends keyof ShippingDetails>(
    key: K,
    val: ShippingDetails[K]
  ) {
    onChange({ ...value, [key]: val });
  }

  function validate(): boolean {
    const next: FieldErrors = {};
    if (!value.fullName.trim()) next.fullName = "Enter your full name.";
    if (!/^\S+@\S+\.\S+$/.test(value.email))
      next.email = "Enter a valid email address.";
    if (!value.address1.trim()) next.address1 = "Enter your street address.";
    if (!value.city.trim()) next.city = "Enter your city.";
    if (!value.region.trim()) next.region = "Enter your state or region.";
    if (!value.postalCode.trim())
      next.postalCode = "Enter your postal code.";
    if (!value.country.trim()) next.country = "Choose a country.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (validate()) onNext();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <h2 className="font-serif text-xl">Shipping details</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Full name" error={errors.fullName}>
          <Input
            value={value.fullName}
            onChange={(e) => update("fullName", e.target.value)}
            error={!!errors.fullName}
            autoComplete="name"
          />
        </FormField>
        <FormField label="Email" error={errors.email}>
          <Input
            type="email"
            value={value.email}
            onChange={(e) => update("email", e.target.value)}
            error={!!errors.email}
            autoComplete="email"
          />
        </FormField>
      </div>

      <FormField label="Phone (optional)">
        <Input
          type="tel"
          value={value.phone}
          onChange={(e) => update("phone", e.target.value)}
          autoComplete="tel"
        />
      </FormField>

      <FormField label="Address" error={errors.address1}>
        <Input
          value={value.address1}
          onChange={(e) => update("address1", e.target.value)}
          error={!!errors.address1}
          placeholder="Street address"
          autoComplete="address-line1"
        />
      </FormField>

      <FormField label="Apartment, suite, etc. (optional)">
        <Input
          value={value.address2}
          onChange={(e) => update("address2", e.target.value)}
          autoComplete="address-line2"
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-3">
        <FormField label="City" error={errors.city}>
          <Input
            value={value.city}
            onChange={(e) => update("city", e.target.value)}
            error={!!errors.city}
            autoComplete="address-level2"
          />
        </FormField>
        <FormField label="State / Region" error={errors.region}>
          <Input
            value={value.region}
            onChange={(e) => update("region", e.target.value)}
            error={!!errors.region}
            autoComplete="address-level1"
          />
        </FormField>
        <FormField label="Postal code" error={errors.postalCode}>
          <Input
            value={value.postalCode}
            onChange={(e) => update("postalCode", e.target.value)}
            error={!!errors.postalCode}
            autoComplete="postal-code"
          />
        </FormField>
      </div>

      <FormField label="Country" error={errors.country}>
        <select
          value={value.country}
          onChange={(e) => update("country", e.target.value)}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            errors.country && "border-destructive"
          )}
        >
          <option value="">Select a country</option>
          {COUNTRIES.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
      </FormField>

      <Button
        type="submit"
        size="lg"
        className="mt-2 w-full sm:w-auto sm:self-end"
      >
        Continue to payment
      </Button>
    </form>
  );
}
