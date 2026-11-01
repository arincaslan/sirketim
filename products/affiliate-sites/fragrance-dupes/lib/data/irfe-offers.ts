/**
 * Maison IRFE's own listed prices, for the eight references it both makes and
 * sells. CJ advertiser 17213922.
 *
 * HAND-WRITTEN, NOT `.generated.ts`, for the same reason as lib/data/irfe-links.ts:
 * nothing writes it. Transcribed from the `PRICE` column of the CJ feed of
 * 2026-10-04 (scripts/feeds/irfe-20261004/, gitignored), full-size rows only.
 *
 * WHY THIS FILE EXISTS AT ALL, when the reference already carries a price.
 * A reference's own `priceUsd` is editorial - the page says so in as many
 * words, "an approximate US retail figure we maintain by hand". For these
 * eight that sentence would be FALSE: the number came off the retailer's own
 * feed, and the retailer is the house itself, so there is no gap between "what
 * IRFE charges" and "what the bottle costs" for a reader to be warned about.
 * Carrying the price here instead is what makes the page say the true thing.
 *
 * THE PRICES ARE THE SAME NUMBERS AS lib/data/houses/irfe.ts AND THAT IS NOT
 * DUPLICATION TO BE TIDIED AWAY. They come from one source and mean two
 * different things: there, the catalogue's own figure for the bottle; here,
 * what this retailer is asking. They will diverge the first time IRFE runs a
 * sale, and at that point this file moves and the house file does not.
 *
 * `priceMl` is the full-size bottle only - 100ml for the Heritage trio, 50ml
 * for the Maison five. IRFE's 10ml, 3ml, coffret and discovery-set rows are
 * deliberately absent: `priceUsd`/`priceMl` feed a per-millilitre figure, and
 * a $10 vial next to a $285 bottle would quietly become the headline price.
 */

export const IRFE_MERCHANT = {
  name: "IRFE",
  network: "cj",
  advertiserId: "17213922",
  publisherId: "101873278",
  domain: "irfe.com",
  trackingLive: true,
} as const;

export interface IrfeOffer {
  /** IRFE's listed price for the full-size bottle, in USD. */
  priceUsd: number;
  /** The volume that price is for. Always the reference's own `bottleMl`. */
  priceMl: number;
  /** Their product title, kept verbatim so a wrong match is visible to a
   *  reader. The `<p>` fragments are IRFE's own - its feed titles carry literal
   *  HTML tags - and are stripped here rather than reproduced. */
  title: string;
}

export const IRFE_OFFERS: Record<string, IrfeOffer> = {
  "ma-france-folie-parisienne": {
    priceUsd: 350,
    priceMl: 100,
    title: "IRFE HERITAGE MA FRANCE FOLIE PARISIENNE Eau de Parfum Spray 100ml",
  },
  "my-st-moritz-lakeside-bliss": {
    priceUsd: 325,
    priceMl: 100,
    title: "IRFE HERITAGE MY ST.MORITZ LAKESIDE BLISS Eau de Parfum Spray 100ml",
  },
  "my-britain-lord-and-lady": {
    priceUsd: 300,
    priceMl: 100,
    title: "IRFE HERITAGE MY BRITAIN LORD & LADY Eau de Parfum Spray 100ml",
  },
  "patchouli-forever-worn": {
    priceUsd: 285,
    priceMl: 50,
    title: "IRFE PATCHOULI FOREVER WORN Eau de Parfum Spray 50ml",
  },
  "marshmallow-musk": {
    priceUsd: 285,
    priceMl: 50,
    title: "IRFE MARSHMALLOW MUSK Eau de Parfum Spray 50ml",
  },
  "smoldering-pepper": {
    priceUsd: 285,
    priceMl: 50,
    title: "IRFE SMOLDERING PEPPER Eau de Parfum Spray 50ml",
  },
  "saffron-leather": {
    priceUsd: 285,
    priceMl: 50,
    title: "IRFE SAFFRON LEATHER Eau de Parfum Spray 50ml",
  },
  "centifolia-rose": {
    priceUsd: 285,
    priceMl: 50,
    title: "IRFE CENTIFOLIA ROSE Eau de Parfum Spray 50ml",
  },
};
