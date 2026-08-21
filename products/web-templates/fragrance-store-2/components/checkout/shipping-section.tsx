"use client";

import { Input } from "@/components/ui/input";
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

interface ShippingSectionProps {
  value: ShippingDetails;
  onChange: (value: ShippingDetails) => void;
  errors: Partial<Record<keyof ShippingDetails, string>>;
}

/** Contact + shipping fields — part of one continuous checkout scroll, not
 * a separate wizard step (see DESIGN.md). */
export function ShippingSection({ value, onChange, errors }: ShippingSectionProps) {
  function update<K extends keyof ShippingDetails>(key: K, val: ShippingDetails[K]) {
    onChange({ ...value, [key]: val });
  }

  return (
    <section>
      <h2 className="font-display text-xl font-semibold">Contact & shipping</h2>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
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

      <div className="mt-4">
        <FormField label="Phone (optional)">
          <Input
            type="tel"
            value={value.phone}
            onChange={(e) => update("phone", e.target.value)}
            autoComplete="tel"
          />
        </FormField>
      </div>

      <div className="mt-4">
        <FormField label="Address" error={errors.address1}>
          <Input
            value={value.address1}
            onChange={(e) => update("address1", e.target.value)}
            error={!!errors.address1}
            placeholder="Street address"
            autoComplete="address-line1"
          />
        </FormField>
      </div>

      <div className="mt-4">
        <FormField label="Apartment, suite, etc. (optional)">
          <Input
            value={value.address2}
            onChange={(e) => update("address2", e.target.value)}
            autoComplete="address-line2"
          />
        </FormField>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
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

      <div className="mt-4">
        <FormField label="Country" error={errors.country}>
          <select
            value={value.country}
            onChange={(e) => update("country", e.target.value)}
            className={cn(
              "flex h-11 w-full rounded-sm border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
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
      </div>
    </section>
  );
}
