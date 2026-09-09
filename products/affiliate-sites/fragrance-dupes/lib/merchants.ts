import { affiliateLinks, hasRealAffiliateLink } from "@/lib/affiliate-links";

/**
 * The retailers we are enrolled with, and the only place their names are
 * written for display.
 *
 * WHY THIS IS DERIVED AND NOT A HAND-TYPED LIST. Anything that names our
 * commercial relationships on a public page is a factual claim about other
 * companies, and a hand-typed list goes stale in the direction that flatters
 * us - a programme closes and the site keeps advertising it. `getLiveMerchants()`
 * reads the shipped link map instead, so a merchant appears only while at least
 * one link to it actually resolves. My Perfume Shop (Awin 106089) is the reason
 * this matters: it is still enrolled, still supplies a feed, and every one of
 * its links is dead, so it must never appear here.
 *
 * THESE ARE RETAILERS, NOT PARTNERS. Nothing on this site may present them as
 * partners, sponsors, endorsers or clients - no such relationship exists in
 * either direction. We send them traffic and they pay a commission; they have
 * not reviewed, approved or endorsed anything here. Their brand marks are their
 * own, which is also why this file carries names and not logos: displaying a
 * merchant's logo implies an association that an affiliate agreement does not
 * grant.
 */
export interface Merchant {
  /** The network's advertiser id — Awin `m=`, CJ advertiser id. */
  id: string;
  /** Exactly how the retailer writes its own name. */
  name: string;
  network: "awin" | "cj";
  /**
   * Which side of the comparison this retailer sits on. Disclosed because it
   * is the honest answer to "why is a dupe site linking a dupe seller AND the
   * house that makes the original" — we link both, and earn from both.
   */
  side: "dupe" | "originals";
}

const REGISTRY: Record<string, Merchant> = {
  "123248": { id: "123248", name: "Opulensi", network: "awin", side: "dupe" },
  "117395": { id: "117395", name: "Clone of Perfume", network: "awin", side: "dupe" },
  "34989": { id: "34989", name: "AromaPassions", network: "awin", side: "dupe" },
  "16941446": { id: "16941446", name: "FragranceShop.com", network: "cj", side: "originals" },
  "17335854": { id: "17335854", name: "Perfumania.com", network: "cj", side: "originals" },
};

/**
 * Retailers with at least one link that actually resolves, in a fixed order:
 * dupe-side first, then originals, alphabetical within each. NOT ordered by
 * how much they pay, and nothing here is ranked or featured — the order is
 * alphabetical precisely so it cannot be read as a recommendation.
 *
 * An id in the link map with no REGISTRY entry is a mistake worth failing on
 * rather than quietly hiding: it means a merchant was wired without being
 * named, and this list would then under-report who we earn from.
 */
export function getLiveMerchants(): Merchant[] {
  const live = new Set<string>();
  for (const [id, entry] of Object.entries(affiliateLinks)) {
    if (hasRealAffiliateLink(id)) live.add(entry.merchantId);
  }

  const unknown = [...live].filter((id) => !REGISTRY[id]);
  if (unknown.length) {
    throw new Error(
      `lib/merchants.ts: live links point at unregistered merchant id(s) ${unknown.join(", ")}. ` +
        `Add them to REGISTRY — a retailer we earn from must be nameable on /disclosure.`
    );
  }

  return [...live]
    .map((id) => REGISTRY[id])
    .sort(
      (a, b) =>
        Number(a.side === "originals") - Number(b.side === "originals") ||
        a.name.localeCompare(b.name)
    );
}
