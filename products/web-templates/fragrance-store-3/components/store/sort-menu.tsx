"use client";

import type { SortOption } from "@/lib/products";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "bestsellers", label: "Bestsellers" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Rating" },
];

interface SortMenuProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

export function SortMenu({ value, onChange }: SortMenuProps) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort-select" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Sort
      </label>
      <select
        id="sort-select"
        value={value}
        onChange={(event) => onChange(event.target.value as SortOption)}
        className="h-11 border border-border bg-card px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
