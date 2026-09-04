import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { AffiliateLink } from "@/components/kit/AffiliateLink";
import { buttonVariants } from "@/components/ui/button";
import { hasRealAffiliateLink } from "@/lib/affiliate-links";
import { isHouseProduct } from "@/lib/catalog";
import { formatPricePerMl } from "@/lib/similarity";
import { cn } from "@/lib/utils";
import type { Currency, DupeCandidate, MerchantOffer, ReferenceFragrance } from "@/lib/types";

/**
 * The buy branch: where a listing can actually be bought, one row per retailer.
 *
 * SHAPE CHANGED 2026-09-01, and the reason is worth keeping. This used to render
 * a single button quoting one retailer's price, followed by a paragraph
 * explaining why that price differed from the per-ml figure in the panel above.
 * That paragraph was a symptom of the data shape: with exactly one retailer on
 * screen, a price that disagreed with the comparison looked like an error and
 * had to be talked away. Several retailers side by side says the same thing
 * without prose — prices obviously differ between retailers, and a buyer
 * reading two of them understands that immediately.
 *
 * Three cases:
 *  - Our own bottle: no checkout exists yet, so it says so plainly.
 *  - Third-party listing with offers: a row per retailer, each with that
 *    retailer's own price and, where we are enrolled, a buy button.
 *  - No offers at all: says so, rather than a divider with nothing under it.
 */
export function BuyActions({
  reference,
  dupe,
}: {
  reference: ReferenceFragrance;
  dupe: DupeCandidate;
}) {
  const house = isHouseProduct(dupe);

  // Offers are NOT sorted. Ranking GBP against USD is an FX claim and we have
  // no sourced rate to make one with, so they render in authored order and
  // nothing is labelled cheapest. See MerchantOffer in lib/types.ts.
  const offers = house ? [] : (dupe.offers ?? []);
  // A buyable offer needs both an enrolled programme AND stock — the row
  // renders either way, but only these produce a button, so only these can be
  // described as affiliate links in the disclosure below.
  const buyable = offers.filter(
    (o) => hasRealAffiliateLink(o.affiliateLinkId) && o.inStock !== false
  );
  const unlinked = offers.filter((o) => !hasRealAffiliateLink(o.affiliateLinkId));
  const soldOut = offers.filter(
    (o) => hasRealAffiliateLink(o.affiliateLinkId) && o.inStock === false
  );
  const referenceLinked = hasRealAffiliateLink(reference.affiliateLinkId);
  // Offers are per PRESENTATION, not per retailer, and the two stopped being
  // the same thing on 2026-09-04: AromaPassions sells one product in 50ml and
  // 100ml, so those listings carry two offers from one shop. The header used to
  // count offers and would have said "2 retailers - prices are each retailer's
  // own", which is simply untrue of one retailer's two bottles. Count distinct
  // merchants and say the other thing when there is only one.
  const merchantCount = new Set(offers.map((o) => o.merchant)).size;

  if (house) {
    return (
      <div className="flex flex-col gap-3 border-t border-border/70 pt-6">
        <span
          className={cn(
            buttonVariants({ variant: "default" }),
            "w-fit cursor-default opacity-60"
          )}
        >
          ${dupe.priceUsd} / {dupe.bottleMl}ml
        </span>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Direct purchase of our own bottles is not live yet - there is no checkout on this
          site. {formatPricePerMl(dupe.priceUsd, dupe.bottleMl)} versus{" "}
          {formatPricePerMl(reference.priceUsd, reference.bottleMl)} for the original.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 border-t border-border/70 pt-6">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="font-display text-lg">Where to buy</h3>
        {offers.length > 1 && (
          <span className="text-xs text-muted-foreground">
            {merchantCount > 1
              ? `${merchantCount} retailers - prices are each retailer's own`
              : `${offers.length} options at one retailer`}
          </span>
        )}
      </div>

      {offers.length > 0 ? (
        <ul className="flex flex-col divide-y divide-border/70 overflow-hidden rounded-frame border border-border">
          {offers.map((offer) => (
            <OfferRow key={`${offer.merchant}-${offer.productName}`} offer={offer} />
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">
          We have not found a retailer for {dupe.name} yet, so there is nothing to buy through
          here. The comparison above does not depend on it.
        </p>
      )}

      {referenceLinked && (
        <AffiliateLink
          id={reference.affiliateLinkId!}
          className={cn(buttonVariants({ variant: "outline" }), "w-fit gap-2")}
        >
          Buy the original - ${reference.priceUsd}
          <ArrowUpRight className="h-4 w-4" aria-hidden />
        </AffiliateLink>
      )}

      {/* The disclosure describes the buttons actually on screen. It previously
          said "Both links are affiliate links ... including the original"
          unconditionally, which was true when written and false the moment one
          side had an enrolled programme and the other did not — the normal case
          here. Overstating what we earn from is a false statement about our own
          incentives, so the count drives the wording. */}
      <p className="text-xs leading-relaxed text-muted-foreground">
        {buyable.length + Number(referenceLinked) === 0 ? (
          <>
            Nothing here is an affiliate link, so we earn nothing whichever retailer you use. We
            list them because knowing where a bottle is stocked is useful either way.
          </>
        ) : (
          <>
            The buy buttons are affiliate links: we may earn a commission if you use one.{" "}
            {unlinked.length > 0 &&
              "Retailers listed without a button are ones we are not enrolled with. "}
            {soldOut.length > 0 &&
              "Where a retailer is marked out of stock we have not linked it, even though we are enrolled. "}
            Which retailers we earn from does not affect the match score, which is computed from
            notes and facets alone.
          </>
        )}
      </p>
    </div>
  );
}

function OfferRow({ offer }: { offer: MerchantOffer }) {
  // Out of stock suppresses the button but keeps the row. A buy button to a
  // sold-out page is a broken promise that earns nothing, and hiding the
  // retailer entirely would lose true information — they do carry it.
  const soldOut = offer.inStock === false;
  const linked = hasRealAffiliateLink(offer.affiliateLinkId) && !soldOut;

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 bg-card p-4">
      <span className="flex min-w-0 flex-col">
        <span className="font-semibold">{offer.merchant}</span>
        {/* The retailer's own title, verbatim. It is what explains the price:
            a limited-edition set and a plain bottle are different products at
            different prices, and tidying both to "Club de Nuit Intense Man"
            would make the gap between them look like an error. */}
        <span className="text-xs text-muted-foreground">{offer.productName}</span>
      </span>

      <span className="flex shrink-0 items-center gap-3">
        <span className="font-display text-lg tabular-nums">
          {formatMerchantPrice(offer.price, offer.currency)}
        </span>
        {linked ? (
          <AffiliateLink
            id={offer.affiliateLinkId!}
            className={cn(buttonVariants({ variant: "default", size: "sm" }), "gap-1.5")}
          >
            Buy
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </AffiliateLink>
        ) : (
          <span className="text-xs text-muted-foreground">
            {soldOut ? "Out of stock" : "No link"}
          </span>
        )}
      </span>
    </li>
  );
}

/**
 * The retailer's price in the retailer's own currency, never converted.
 *
 * A hardcoded FX rate would be unsourced and would go stale silently — and it
 * would be stale in the worst possible place, on a button, where the number is
 * checkable against the page it lands on within one click. Showing GBP to a US
 * reader is a small friction; showing a wrong dollar figure is a false price
 * claim.
 */
function formatMerchantPrice(price: number, currency: Currency): string {
  const symbol = { USD: "$", GBP: "£", EUR: "€", AUD: "A$" }[currency];
  return `${symbol}${price.toFixed(2)}`;
}
