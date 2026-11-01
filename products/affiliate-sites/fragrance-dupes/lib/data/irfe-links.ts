import type { AffiliateLinkEntry } from "@/lib/affiliate-links";

/**
 * Maison IRFE buy links - CJ advertiser 17213922, publisher 101873278.
 *
 * HAND-WRITTEN, AND DELIBERATELY NOT `.generated.ts`. Every other link file
 * here is written by an ingest script and says so; this one is not, so it does
 * not borrow that suffix. Eight rows out of a twenty-row feed, transcribed
 * from the `LINK` column of scripts/feeds/irfe-20261004/ on 2026-10-04. A
 * generator for eight links would be a script to maintain in place of eight
 * lines to read. If the fragrance line grows, generate it then - and the
 * transcription is auditable because the full-size row ids are recorded below.
 *
 * LINKS ARE DELIVERED, NOT BUILT. CJ pre-wraps the click URL inside this feed,
 * so nothing here is assembled from an advertiser id and a product URL the way
 * the Perfumania links are. Taken verbatim.
 *
 * THE HOST VARIES AND THAT IS NORMAL. These eight carry four different click
 * domains - anrdoezrs.net, kqzyfj.com, tkqlhce.com, jdoqocy.com, dpbolvw.net -
 * because CJ rotates them. The publisher and advertiser ids live in the PATH
 * (`/click-101873278-17213922`), which is what identifies the programme; never
 * key anything on the hostname.
 *
 * ONE HOP WAS TRACED, NOT EIGHT. `irfe-ma-france-folie-parisienne` was called
 * once on 2026-10-05 and answered 302 to cj.dotomi.com, so attribution is live
 * and ours. The rest are unclicked on purpose: every check here is a real
 * affiliate click, and a burst of them from one IP is a pattern a network can
 * read as fraud, with termination rather than a warning as the penalty.
 *
 * KEYED `irfe-<slug>`, which this file owns alone. The prefix is registered in
 * scripts/lib/affiliate-link-sources.mjs - the only registry of them - and
 * `assertNoDuplicateLinkIds` enforces it over the ids actually emitted. Three
 * retailers already share 91 reference slugs between them; when two of them
 * shared a prefix, 91 of 123 links vanished with no error anywhere.
 */
export const IRFE_LINKS: Record<string, AffiliateLinkEntry> = {
  // feed row 100FRN-IRFE, 100ml, $350.00
  "irfe-ma-france-folie-parisienne": {
    network: "cj",
    merchantId: "17213922",
    deepLink:
      "https://www.anrdoezrs.net/click-101873278-17213922?url=https%3A%2F%2Firfe.com%2Fproduct%2Firfe-ma-france-folie-parisienne-eau-de-parfum-spray-100ml%2F",
    subId: "irfe__ma-france-folie-parisienne",
    label: "Maison IRFE - Ma France Folie Parisienne Eau de Parfum 100ml",
  },
  // feed row 100STM-IRFE, 100ml, $325.00
  "irfe-my-st-moritz-lakeside-bliss": {
    network: "cj",
    merchantId: "17213922",
    deepLink:
      "https://www.kqzyfj.com/click-101873278-17213922?url=https%3A%2F%2Firfe.com%2Fproduct%2Firfe-heritage-my-st-moritz-lakeside-bliss-eau-de-parfum-spray-100ml%2F",
    subId: "irfe__my-st-moritz-lakeside-bliss",
    label: "Maison IRFE - My St. Moritz Lakeside Bliss Eau de Parfum 100ml",
  },
  // feed row 100BRIT-IRFE, 100ml, $300.00
  "irfe-my-britain-lord-and-lady": {
    network: "cj",
    merchantId: "17213922",
    deepLink:
      "https://www.tkqlhce.com/click-101873278-17213922?url=https%3A%2F%2Firfe.com%2Fproduct%2Firfe-heritage-my-britain-lord-lady-eau-de-parfum-spray-100ml%2F",
    subId: "irfe__my-britain-lord-and-lady",
    label: "Maison IRFE - My Britain Lord & Lady Eau de Parfum 100ml",
  },
  // feed row 50FREV-IRFE, 50ml, $285.00
  "irfe-patchouli-forever-worn": {
    network: "cj",
    merchantId: "17213922",
    deepLink:
      "https://www.jdoqocy.com/click-101873278-17213922?url=https%3A%2F%2Firfe.com%2Fproduct%2Fpatchouli-forever%2F",
    subId: "irfe__patchouli-forever-worn",
    label: "Maison IRFE - Patchouli Forever Worn Eau de Parfum 50ml",
  },
  // feed row 50MUSK-IRFE, 50ml, $285.00
  "irfe-marshmallow-musk": {
    network: "cj",
    merchantId: "17213922",
    deepLink:
      "https://www.jdoqocy.com/click-101873278-17213922?url=https%3A%2F%2Firfe.com%2Fproduct%2Fmarshmallow-musk%2F",
    subId: "irfe__marshmallow-musk",
    label: "Maison IRFE - Marshmallow Musk Eau de Parfum 50ml",
  },
  // feed row 50PEP-IRFE, 50ml, $285.00
  "irfe-smoldering-pepper": {
    network: "cj",
    merchantId: "17213922",
    deepLink:
      "https://www.dpbolvw.net/click-101873278-17213922?url=https%3A%2F%2Firfe.com%2Fproduct%2Fsmoldering-pepper%2F",
    subId: "irfe__smoldering-pepper",
    label: "Maison IRFE - Smoldering Pepper Eau de Parfum 50ml",
  },
  // feed row 50LETR-IRFE, 50ml, $285.00
  "irfe-saffron-leather": {
    network: "cj",
    merchantId: "17213922",
    deepLink:
      "https://www.jdoqocy.com/click-101873278-17213922?url=https%3A%2F%2Firfe.com%2Fproduct%2Fsaffron-leather%2F",
    subId: "irfe__saffron-leather",
    label: "Maison IRFE - Saffron Leather Eau de Parfum 50ml",
  },
  // feed row 50ROSE-IRFE, 50ml, $285.00
  "irfe-centifolia-rose": {
    network: "cj",
    merchantId: "17213922",
    deepLink:
      "https://www.jdoqocy.com/click-101873278-17213922?url=https%3A%2F%2Firfe.com%2Fproduct%2Fcentifolia-rose%2F",
    subId: "irfe__centifolia-rose",
    label: "Maison IRFE - Centifolia Rose Eau de Parfum 50ml",
  },
};
