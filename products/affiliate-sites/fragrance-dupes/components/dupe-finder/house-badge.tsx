import { Storefront } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";

/**
 * Marks a listing as PARFUMOZA's own product.
 *
 * This is a disclosure, not a promotional badge. The site is branded
 * "Independent Fragrance Comparisons" and ranks its own bottles with its own
 * similarity formula alongside listings from producers who pay to be here -
 * a reader cannot judge that comparison fairly without being told which one
 * is ours. It appears everywhere a house product does, and it is intentionally
 * plain rather than styled to look like a promotion or an award.
 *
 * See MARKETPLACE-PLAN.md §5.
 */
export function HouseBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-secondary/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-foreground/80",
        className
      )}
    >
      <Storefront weight="fill" className="h-3 w-3 text-primary" aria-hidden />
      Our own product
    </span>
  );
}
