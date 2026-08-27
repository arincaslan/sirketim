import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { AffiliateLink } from "@/components/kit/AffiliateLink";
import { buttonVariants } from "@/components/ui/button";
import { hasRealAffiliateLink } from "@/lib/affiliate-links";
import { isHouseProduct } from "@/lib/catalog";
import { formatPricePerMl } from "@/lib/similarity";
import { cn } from "@/lib/utils";
import type { DupeCandidate, ReferenceFragrance } from "@/lib/types";

/**
 * The buy branch (MARKETPLACE-PLAN.md §1): whichever way the visitor goes, the
 * site earns - so the original gets a real outbound link too, not just the
 * dupe it is being compared against. Previously only dupes were linkable.
 *
 * Three cases:
 *  - Third-party dupe: affiliate redirect through /go/[slug].
 *  - The original: its own affiliate redirect, when a program is configured.
 *  - Our own bottle: no affiliate link and no checkout exists yet, so it says
 *    so plainly instead of rendering a button that goes nowhere.
 */
export function BuyActions({
  reference,
  dupe,
}: {
  reference: ReferenceFragrance;
  dupe: DupeCandidate;
}) {
  const house = isHouseProduct(dupe);

  return (
    <div className="flex flex-col gap-3 border-t border-border/70 pt-6">
      <div className="flex flex-wrap items-center gap-3">
        {house ? (
          <span
            className={cn(
              buttonVariants({ variant: "default" }),
              "pointer-events-none cursor-default opacity-60"
            )}
          >
            ${dupe.priceUsd} / {dupe.bottleMl}ml
          </span>
        ) : hasRealAffiliateLink(dupe.affiliateLinkId) ? (
          <AffiliateLink
            id={dupe.affiliateLinkId!}
            className={cn(buttonVariants({ variant: "default" }), "gap-2")}
          >
            Buy {dupe.name} - ${dupe.priceUsd}
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </AffiliateLink>
        ) : null}

        {hasRealAffiliateLink(reference.affiliateLinkId) && (
          <AffiliateLink
            id={reference.affiliateLinkId!}
            className={cn(buttonVariants({ variant: "outline" }), "gap-2")}
          >
            Buy the original - ${reference.priceUsd}
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </AffiliateLink>
        )}
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground">
        {house ? (
          <>
            Direct purchase of our own bottles is not live yet - there is no checkout on this
            site. {formatPricePerMl(dupe.priceUsd, dupe.bottleMl)} versus{" "}
            {formatPricePerMl(reference.priceUsd, reference.bottleMl)} for the original.
          </>
        ) : (
          <>
            Both links are affiliate links: we may earn a commission whichever one you use,
            including the original. That is disclosed on every page and it does not change the
            match score, which is computed from notes and facets alone.
          </>
        )}
      </p>
    </div>
  );
}
