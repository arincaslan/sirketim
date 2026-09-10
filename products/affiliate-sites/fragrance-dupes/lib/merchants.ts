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
 * not reviewed, approved or endorsed anything here.
 *
 * Their brand marks are their own. We show them to IDENTIFY the retailer under
 * a heading that states the commercial relationship outright, which is what
 * keeps the use referential rather than an implied endorsement - and it is why
 * the name is never dropped in favour of the mark, and why no mark is ever
 * restyled to fit the design. Move these marks under a word like "Partners",
 * or let one stand alone without its name, and both of those defences go.
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
  /**
   * The retailer's own mark, as an ALPHA MASK painted in the surrounding text
   * colour — see `.retailer-mark` in app/globals.css and the note below on why
   * these are masks rather than images.
   *
   * `w`/`h` are CSS pixels at display size, and they are NOT uniform on
   * purpose: these marks range from a square icon (AromaPassions, ratio 1.0)
   * to a wordmark six times wider than it is tall (Perfumania, 5.97). Giving
   * them all one height would make the wide ones tower over the row and the
   * square one vanish, so wider marks are set shorter — the usual optical
   * balancing for a logo row. The PNGs are 96px tall, i.e. at least 2x every
   * display height here.
   */
  logo: { src: string; w: number; h: number };
}

/**
 * WHERE EACH MARK CAME FROM, because provenance is the whole question with a
 * third party's trademark and a future session will otherwise re-guess it.
 *
 * The two networks publish advertiser creatives for publishers to use, and
 * that is the cleanest licence position, so it wins where the creative is
 * actually a logo. It often is not: Opulensi's Awin creative (s=4665641) is a
 * product-photo promo banner, not a mark, so its own site logo is used instead.
 *
 *   opulensi         opulensi.com header logo (Awin creative is a promo banner)
 *   clone-of-perfume cloneofperfume.com logo, higher-res than — and identical
 *                    to — the Awin creative s=4029065, which confirms the mark
 *   aromapassions    aromapassions.com ICON_LOGO_NOBCKRND
 *   fragranceshop    CJ creative ftjcfx.com/image-101873278-16942198. The ONLY
 *                    source: fragranceshop.com is behind a bot challenge that
 *                    403s every path including robots.txt, and it is not to be
 *                    worked around.
 *   perfumania       perfumania.com new-updated-logo.svg (the header logo is a
 *                    seasonal variant — do not use that one)
 *
 * All five are SELF-HOSTED rather than hot-linked from the networks. Their
 * creative URLs (`cshow.php`, `image-<pid>-<aid>`) are impression trackers as
 * much as images, so embedding them would put a third-party request carrying
 * every visitor's IP and UA on the home page — precisely the thing this site
 * avoids by staying cookieless and refusing CJ's am.js. We are paid on sales,
 * not impressions, so nothing is lost by not calling them.
 *
 * The PNGs are alpha masks built from the monochrome sources: alpha is derived
 * from each pixel's own luminance, so shape and antialiasing survive exactly
 * and only the white paper behind the mark is dropped. No mark was recoloured,
 * redrawn, restyled or AI-generated — an altered logo misrepresents a real
 * company, and an invented one is worse.
 */
const REGISTRY: Record<string, Merchant> = {
  "123248": {
    id: "123248", name: "Opulensi", network: "awin", side: "dupe",
    logo: { src: "/images/retailers/opulensi.png", w: 61, h: 34 },
  },
  "117395": {
    id: "117395", name: "Clone of Perfume", network: "awin", side: "dupe",
    logo: { src: "/images/retailers/clone-of-perfume.png", w: 64, h: 30 },
  },
  "34989": {
    id: "34989", name: "AromaPassions", network: "awin", side: "dupe",
    logo: { src: "/images/retailers/aromapassions.png", w: 30, h: 30 },
  },
  "16941446": {
    id: "16941446", name: "FragranceShop.com", network: "cj", side: "originals",
    logo: { src: "/images/retailers/fragranceshop.png", w: 100, h: 26 },
  },
  "17335854": {
    id: "17335854", name: "Perfumania.com", network: "cj", side: "originals",
    logo: { src: "/images/retailers/perfumania.png", w: 131, h: 22 },
  },
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
