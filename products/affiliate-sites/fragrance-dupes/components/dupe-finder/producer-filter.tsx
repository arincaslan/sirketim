"use client";

import { getProducer } from "@/lib/producers";
import { cn } from "@/lib/utils";

/**
 * Filter the ranked listings down to a single producer
 * (MARKETPLACE-PLAN.md §2). With several producers listing against the same
 * original, "show me only this house" becomes a real need that the original
 * single-dataset finder had no reason to support.
 *
 * Only producers who actually list something against the current reference
 * are offered, so no option here can return an empty list.
 */
export function ProducerFilter({
  producerSlugs,
  selected,
  onSelect,
}: {
  producerSlugs: string[];
  selected: string;
  onSelect: (slug: string) => void;
}) {
  if (producerSlugs.length < 2) return null;

  const options = [
    { slug: "", name: "All producers", isHouse: false },
    ...producerSlugs.map((slug) => {
      const producer = getProducer(slug);
      return { slug, name: producer?.name ?? slug, isHouse: producer?.isHouse === true };
    }),
  ];

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by producer">
      {options.map((option) => {
        const active = option.slug === selected;
        return (
          <button
            key={option.slug || "all"}
            type="button"
            onClick={() => onSelect(option.slug)}
            aria-pressed={active}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors duration-150",
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground/75 hover:border-primary/50 hover:text-foreground"
            )}
          >
            {option.name}
            {option.isHouse && !active && <span className="ml-1.5 text-primary">•</span>}
          </button>
        );
      })}
    </div>
  );
}
