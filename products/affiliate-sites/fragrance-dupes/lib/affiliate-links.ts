/**
 * From departments/web-development/lib/affiliate-site-kit/lib/affiliate-links.ts
 * (see that kit's README for the pattern this file follows).
 *
 * NO AFFILIATE PROGRAMME IS ENROLLED YET, so this map is empty and every id
 * resolves to a clearly-marked placeholder via the fallback below.
 *
 * It previously held 18 explicit entries. Twelve of them named producer
 * products that do not exist - "Dossier Ambrosia", "ALT. Bright",
 * "ALT. Blue Cedar" and so on - invented names attributed to real,
 * currently-operating companies. They were removed 2026-08-27 along with the
 * listings themselves; see lib/dupes-data.ts for the verification that
 * prompted it. The remaining six were `original-*` placeholders that the
 * fallback already covers.
 *
 * Content never embeds a raw destination URL - it references an id via
 * <AffiliateLink id="...">, which resolves here, and app/go/[slug]/route.ts is
 * the single redirect chokepoint. That indirection is what makes swapping in
 * real programme URLs a data change rather than a content rewrite.
 */

export type AffiliateNetwork = "awin" | "cj" | "placeholder";

/**
 * The query parameter each network reads our sub-ID from. Getting this wrong
 * is silent: the click still works, the commission still pays, and the report
 * simply has no idea which page earned it.
 */
export const SUB_ID_PARAM: Record<AffiliateNetwork, string> = {
  awin: "clickref",
  cj: "sid",
  placeholder: "subid",
};

export interface AffiliateLinkEntry {
  network: AffiliateNetwork;
  /** The network's id for the merchant — Awin `m=`, CJ advertiser id. */
  merchantId: string;
  /**
   * The network click URL, WITHOUT our sub-ID. Never link to this directly;
   * go through affiliateDestination() so attribution is never dropped.
   */
  deepLink: string;
  /**
   * Sub-ID, per FINALIZATION-GUIDE.md §3.5: `<listingSlug>__<referenceSlug>`.
   *
   * The guide's scheme has a third `__<surface>` segment, which is NOT used
   * here and the reason is structural rather than an oversight. This site is a
   * static export, so `/go/<id>` is a build-time redirect — one destination
   * per id. A surface segment would therefore need a separate link id per
   * surface (catalog page, guide, dupe finder), multiplying the map for a
   * breakdown that GA4 outbound-click events already give us against the page
   * that fired them. Revisit if a `main` Worker ever handles /go/* per-request.
   */
  subId: string;
  label: string;
}

/**
 * The URL `/go/<id>` actually redirects to: the network click URL with our
 * sub-ID attached.
 *
 * Composed here rather than stored, so a hand-edited entry cannot end up with
 * a destination that disagrees with its own deepLink and subId. **Untagged
 * traffic is unattributable forever** — there is no way to work out after the
 * fact which listing earned a commission — so this must be the only way a
 * destination is built.
 */
export function affiliateDestination(entry: AffiliateLinkEntry): string {
  const param = SUB_ID_PARAM[entry.network];
  const joiner = entry.deepLink.includes("?") ? "&" : "?";
  return `${entry.deepLink}${joiner}${param}=${encodeURIComponent(entry.subId)}`;
}

/**
 * Real, enrolled programme links. Empty until FINALIZATION-GUIDE.md phase 3.
 *
 * When populating this, note the shape has to grow: Awin and CJ both need a
 * network click URL with the destination URL-encoded inside it, so a real
 * entry needs `network` + a merchant id + the deep link, not one bare string.
 */
export const affiliateLinks: Record<string, AffiliateLinkEntry> = {
  // FIRST REAL ENTRIES, 2026-09-01 — Opulensi Perfumes, Awin advertiser 123248.
  //
  // Verified working end to end before being added, which matters because the
  // other merchant we are joined to is not: My Perfume Shop (Awin 106089) is
  // approved, feeds us product data, and every one of its links redirects to
  // awin1.com/closedMerchant.html. Being "joined" is not being able to earn.
  //
  // The check any future entry must pass — the redirect has to end on the
  // merchant's own domain with our sub-ID intact:
  //
  //   curl -s -o /dev/null -w '%{url_effective}\n' -L "<deepLink>&clickref=probe"
  //
  // For these two it returns opulensi.com/products/... carrying
  // utm_id=3064149_probe and an awc= cookie. Deep links come from the
  // Opulensi product feed (scripts/feeds/opulensi.csv, 610 rows).
  "dupe-lattafa-khamrah": {
    network: "awin",
    merchantId: "123248",
    deepLink: "https://www.awin1.com/pclick.php?p=43494950528&a=3064149&m=123248",
    subId: "lattafa-khamrah__angels-share",
    label: "Lattafa Khamrah EDP 100ml at Opulensi",
  },
  "dupe-lattafa-asad": {
    network: "awin",
    merchantId: "123248",
    deepLink: "https://www.awin1.com/pclick.php?p=43494950525&a=3064149&m=123248",
    subId: "lattafa-asad__aventus",
    label: "Lattafa Asad EDP 100ml at Opulensi",
  },
  // Opulensi's only Armaf row — the 105ml Club de Nuit Intense Man, in the
  // limited-edition cufflinks presentation. That variant IS what the link
  // lands on and it is priced accordingly (£68.99 against a street price near
  // $40), which is why the buy button quotes the merchant's own figure rather
  // than the listing's street price. The other two Armaf listings
  // (Sillage, Urban Man) are carried ONLY by My Perfume Shop, whose programme
  // is closed for tracking, so they stay unlinked rather than getting an
  // untracked link that earns nothing.
  "dupe-armaf-club-de-nuit-intense-man": {
    network: "awin",
    merchantId: "123248",
    deepLink: "https://www.awin1.com/pclick.php?p=43494950249&a=3064149&m=123248",
    subId: "armaf-club-de-nuit-intense-man__aventus",
    label: "Armaf Club de Nuit Intense Man 105ml (limited edition) at Opulensi",
  },

  // ── Added 2026-09-02 ────────────────────────────────────────────────────
  // Five more, all Opulensi. Each was traced AND stock-checked before landing
  // here (`npm run check:links`), which mattered: of thirteen candidates with a
  // documented pairing, eight were out of stock despite the feed marking every
  // one of them `in_stock=1`. These five are the ones that were actually
  // buyable. See lib/dupes-data.ts for the pairing evidence.
  "dupe-lattafa-oud-for-glory": {
    network: "awin",
    merchantId: "123248",
    deepLink: "https://www.awin1.com/pclick.php?p=43494950479&a=3064149&m=123248",
    subId: "lattafa-oud-for-glory__oud-for-greatness",
    label: "Lattafa Bade'e Al Oud Oud For Glory EDP 100ml at Opulensi",
  },
  "dupe-fragrance-world-barakkat-rouge-540": {
    network: "awin",
    merchantId: "123248",
    deepLink: "https://www.awin1.com/pclick.php?p=43494950481&a=3064149&m=123248",
    subId: "fragrance-world-barakkat-rouge-540__baccarat-rouge-540",
    label: "Fragrance World Barakkat Rouge 540 EDP 100ml at Opulensi",
  },
  "dupe-lattafa-ana-abiyedh-rouge": {
    network: "awin",
    merchantId: "123248",
    deepLink: "https://www.awin1.com/pclick.php?p=43494950688&a=3064149&m=123248",
    subId: "lattafa-ana-abiyedh-rouge__baccarat-rouge-540",
    label: "Lattafa Ana Abiyedh Rouge EDP 60ml at Opulensi",
  },
  "dupe-ard-al-zaafaran-bint-hooran": {
    network: "awin",
    merchantId: "123248",
    deepLink: "https://www.awin1.com/pclick.php?p=43494950527&a=3064149&m=123248",
    subId: "ard-al-zaafaran-bint-hooran__good-girl",
    label: "Ard Al Zaafaran Bint Hooran EDP 100ml at Opulensi",
  },
  "dupe-maison-alhambra-leonie": {
    network: "awin",
    merchantId: "123248",
    deepLink: "https://www.awin1.com/pclick.php?p=43494950698&a=3064149&m=123248",
    subId: "maison-alhambra-leonie__libre",
    label: "Maison Alhambra Léonie EDP 100ml at Opulensi",
  },

  // Editorially-paired batch, 2026-09-02. The links are exactly as real as
  // every other entry — traced and stock-checked — it is the *pairing* behind
  // them that is our judgement rather than the retailer's. See lib/dupes-data.ts.
  "dupe-lattafa-khamrah-qahwa": {
    network: "awin",
    merchantId: "123248",
    deepLink: "https://www.awin1.com/pclick.php?p=43494950597&a=3064149&m=123248",
    subId: "lattafa-khamrah-qahwa__angels-share",
    label: "Lattafa Khamrah Qahwa EDP 100ml at Opulensi",
  },
  "dupe-maison-alhambra-maitre-de-blue": {
    network: "awin",
    merchantId: "123248",
    deepLink: "https://www.awin1.com/pclick.php?p=43494950729&a=3064149&m=123248",
    subId: "maison-alhambra-maitre-de-blue__bleu-de-chanel",
    label: "Maison Alhambra Maitre De Blue EDP 100ml at Opulensi",
  },
  "dupe-lattafa-velvet-oud": {
    network: "awin",
    merchantId: "123248",
    deepLink: "https://www.awin1.com/pclick.php?p=43494950501&a=3064149&m=123248",
    subId: "lattafa-velvet-oud__ombre-leather",
    label: "Lattafa Velvet Oud EDP 100ml at Opulensi",
  },
  "dupe-lattafa-qaed-al-fursan-unlimited": {
    network: "awin",
    merchantId: "123248",
    deepLink: "https://www.awin1.com/pclick.php?p=43494950532&a=3064149&m=123248",
    subId: "lattafa-qaed-al-fursan-unlimited__aventus",
    label: "Lattafa Qaed Al Fursan Unlimited EDP 90ml at Opulensi",
  },
  "dupe-lattafa-mayar-cherry-intense": {
    network: "awin",
    merchantId: "123248",
    deepLink: "https://www.awin1.com/pclick.php?p=43494950258&a=3064149&m=123248",
    subId: "lattafa-mayar-cherry-intense__lost-cherry",
    label: "Lattafa Mayar Cherry Intense EDP 100ml at Opulensi",
  },

  // The two deliberately-low-scoring listings, 2026-09-02. Nothing about the
  // LINK is weaker here — both traced and in stock. It is the match that is
  // loose, which is a thing the site reports rather than a reason to omit it.
  "dupe-maison-alhambra-jean-lowe-matiere": {
    network: "awin",
    merchantId: "123248",
    deepLink: "https://www.awin1.com/pclick.php?p=43494950201&a=3064149&m=123248",
    subId: "maison-alhambra-jean-lowe-matiere__oud-wood",
    label: "Maison Alhambra Jean Lowe Matiere EDP 100ml at Opulensi",
  },
  "dupe-lattafa-maahir-black-edition": {
    network: "awin",
    merchantId: "123248",
    deepLink: "https://www.awin1.com/pclick.php?p=43494950568&a=3064149&m=123248",
    subId: "lattafa-maahir-black-edition__layton",
    label: "Lattafa Maahir Black Edition EDP 100ml at Opulensi",
  },

  // Coverage batch, 2026-09-02 — chosen to widen which ORIGINALS have an
  // alternative rather than to deepen the ones already covered.
  "dupe-afnan-embassy-royal-extrait": {
    network: "awin",
    merchantId: "123248",
    deepLink: "https://www.awin1.com/pclick.php?p=43494950604&a=3064149&m=123248",
    subId: "afnan-embassy-royal-extrait__sauvage-elixir",
    label: "Afnan Embassy Royal Extrait 100ml at Opulensi",
  },
  "dupe-french-avenue-royal-blend-extrait": {
    network: "awin",
    merchantId: "123248",
    deepLink: "https://www.awin1.com/pclick.php?p=43494950211&a=3064149&m=123248",
    subId: "french-avenue-royal-blend-extrait__angels-share",
    label: "French Avenue Royal Blend Extrait 100ml at Opulensi",
  },
  "dupe-fragrance-world-mocha-wood": {
    network: "awin",
    merchantId: "123248",
    deepLink: "https://www.awin1.com/pclick.php?p=43494950722&a=3064149&m=123248",
    subId: "fragrance-world-mocha-wood__intense-cafe",
    label: "Fragrance World Mocha Wood EDP 100ml at Opulensi",
  },
  "dupe-lattafa-al-areeq-gold": {
    network: "awin",
    merchantId: "123248",
    deepLink: "https://www.awin1.com/pclick.php?p=43494950601&a=3064149&m=123248",
    subId: "lattafa-al-areeq-gold__tuscan-leather",
    label: "Lattafa Al Areeq Gold EDP 100ml at Opulensi",
  },
  "dupe-maison-alhambra-sceptre-amazonite": {
    network: "awin",
    merchantId: "123248",
    deepLink: "https://www.awin1.com/pclick.php?p=43494950225&a=3064149&m=123248",
    subId: "maison-alhambra-sceptre-amazonite__interlude-man",
    label: "Maison Alhambra Sceptre Amazonite EDP 100ml at Opulensi",
  },
  "dupe-lattafa-velvet-rose": {
    network: "awin",
    merchantId: "123248",
    deepLink: "https://www.awin1.com/pclick.php?p=43494950547&a=3064149&m=123248",
    subId: "lattafa-velvet-rose__rose-31",
    label: "Lattafa Velvet Rose EDP 100ml at Opulensi",
  },
  "dupe-rasasi-hawas-black": {
    network: "awin",
    merchantId: "123248",
    deepLink: "https://www.awin1.com/pclick.php?p=44072471577&a=3064149&m=123248",
    subId: "rasasi-hawas-black__aventus",
    label: "Rasasi Hawas Black EDP 100ml at Opulensi",
  },
  "dupe-afnan-supremacy-not-only-intense": {
    network: "awin",
    merchantId: "123248",
    deepLink: "https://www.awin1.com/pclick.php?p=43494950550&a=3064149&m=123248",
    subId: "afnan-supremacy-not-only-intense__aventus",
    label: "Afnan Supremacy Not Only Intense 100ml at Opulensi",
  },
};

/**
 * Resolve a link id to its destination.
 *
 * While no programme is enrolled, unknown ids fall back to a generated
 * placeholder of an obviously-fake shape (`example.com`, `tag=REPLACE_ME`) so
 * that /go/[slug] still 302s somewhere inspectable during development instead
 * of 404ing.
 *
 * This is a build-time convenience, not shipping behaviour. Once real
 * programmes are enrolled this fallback must become a hard failure, so a
 * missing programme is loud rather than silently sending a buyer - and our
 * commission - to nowhere. `network: "placeholder"` is the flag to key that
 * check off, and `hasRealAffiliateLink()` below is what the UI uses meanwhile.
 */
export function resolveAffiliateLink(id: string): AffiliateLinkEntry | undefined {
  const explicit = affiliateLinks[id];
  if (explicit) return explicit;

  if (/^[a-z0-9-]+$/.test(id)) {
    const isOriginal = id.startsWith("original-");
    const slug = isOriginal ? id.slice("original-".length) : id;
    return {
      network: "placeholder",
      merchantId: "none",
      deepLink: `https://example.com/aff/${isOriginal ? "original" : "listing"}/${slug}?tag=REPLACE_ME`,
      subId: slug,
      label: slug,
    };
  }

  return undefined;
}

/**
 * Whether an id resolves to a real, enrolled programme link.
 *
 * The UI calls this before rendering any buy button. A button that leads to
 * `example.com` is worse than no button on a public site: it reads as broken
 * to a visitor and as low quality to the merchant reviewing our affiliate
 * application. Components render an honest "not available yet" state instead.
 *
 * This becomes meaningful on its own the moment the first real entry lands -
 * enrolled merchants get buttons, un-enrolled ones stay quiet, with no further
 * code change.
 */
export function hasRealAffiliateLink(id: string | undefined): boolean {
  if (!id) return false;
  const link = resolveAffiliateLink(id);
  return Boolean(link) && link!.network !== "placeholder";
}
