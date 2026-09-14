/**
 * GENERATED FILE — do not edit by hand.
 *
 * Outbound links for approved PRODUCER listings, written by the export step of
 * the producer console. Empty until that console exists and a producer has been
 * approved — see HANDOFF.md, "The producer subscription programme", build steps
 * 2 and 8.
 *
 * WHY IT EXISTS ALREADY, EMPTY. The link map is assembled from the list in
 * scripts/lib/affiliate-link-sources.mjs, and both the redirect generator and the
 * link checker read that one list. Wiring the fifth source now — while it is
 * empty and harmless — means the day a producer is approved, publishing is an
 * export rather than an export plus remembering to teach two scripts about a new
 * file. The last time a source was added and only one script learned about it,
 * 368 live links shipped unchecked for two days.
 *
 * NAMESPACE: `producer-<producerSlug>-<listingSlug>`, from producerLinkId() in
 * lib/producer-link.ts. Both segments are needed because a listing slug is unique
 * only per producer.
 *
 * NETWORK: these are `direct`, not an affiliate network. A paid tier takes no
 * commission (lib/plans.ts `takesCommission`), so the destination is the seller's
 * own product URL, unmodified — see affiliateDestination() in lib/affiliate-links.ts
 * for why no sub-ID is appended. A free-tier listing carries a real affiliate
 * entry instead and does not belong in this file.
 *
 * Every entry here must have passed validateProducerLink() at export time, not
 * only at submit time: generate-redirects.mjs runs in the PUBLIC site's prebuild,
 * so one malformed link would fail the deploy of the whole catalogue.
 */

import type { AffiliateLinkEntry } from "@/lib/affiliate-links";

export const PRODUCER_LINKS: Record<string, AffiliateLinkEntry> = {};
