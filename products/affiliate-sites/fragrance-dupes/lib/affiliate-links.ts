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

  // Added 2026-09-03. All four traced end to end (curl -L with clickref=probe
  // lands on opulensi.com carrying utm_id=..._probe) before being added. Three
  // of the four are OUT OF STOCK on the merchant's own page as of this date,
  // despite the Awin feed marking every row `in_stock=1` — the by-now-expected
  // pattern (see the Armaf entry, and the header comment on this file). The
  // links are kept anyway: they track, and they start earning the moment
  // stock returns. See lib/dupes-data.ts for the corresponding `inStock` flags.
  "dupe-fragrance-world-neroli-riviera": {
    network: "awin",
    merchantId: "123248",
    deepLink: "https://www.awin1.com/pclick.php?p=43494950190&a=3064149&m=123248",
    subId: "fragrance-world-neroli-riviera__neroli-portofino",
    label: "Fragrance World Neroli Riviera EDP 80ml at Opulensi",
  },
  "dupe-ard-al-zaafaran-oud-orchid": {
    network: "awin",
    merchantId: "123248",
    deepLink: "https://www.awin1.com/pclick.php?p=43494950500&a=3064149&m=123248",
    subId: "ard-al-zaafaran-oud-orchid__black-orchid",
    label: "Ard Al Zaafaran Oud Orchid EDP 100ml at Opulensi",
  },
  "dupe-lattafa-qaed": {
    network: "awin",
    merchantId: "123248",
    deepLink: "https://www.awin1.com/pclick.php?p=43494950511&a=3064149&m=123248",
    subId: "lattafa-qaed__oud-wood",
    label: "Lattafa Qaa'ed EDP 100ml at Opulensi",
  },
  "dupe-lattafa-mohra": {
    network: "awin",
    merchantId: "123248",
    deepLink: "https://www.awin1.com/pclick.php?p=43494950593&a=3064149&m=123248",
    subId: "lattafa-mohra__oud-wood",
    label: "Lattafa Mohra EDP 100ml at Opulensi",
  },
  // Added 2026-09-03, the final batch from this feed — see the header comment
  // in lib/dupes-data.ts for why the feed does not support more than this.
  "dupe-fragrance-world-vanille-en-tobacco": {
    network: "awin",
    merchantId: "123248",
    deepLink: "https://www.awin1.com/pclick.php?p=43494950250&a=3064149&m=123248",
    subId: "fragrance-world-vanille-en-tobacco__tobacco-vanille",
    label: "Fragrance World Vanille En Tobacco EDP 80ml at Opulensi",
  },
  "dupe-lattafa-ameer-al-oudh-intense-oud": {
    network: "awin",
    merchantId: "123248",
    deepLink: "https://www.awin1.com/pclick.php?p=43494950497&a=3064149&m=123248",
    subId: "lattafa-ameer-al-oudh-intense-oud__by-the-fireplace",
    label: "Lattafa Ameer Al Oudh Intense Oud EDP 100ml at Opulensi",
  },
  "dupe-zimaya-oud-is-great": {
    network: "awin",
    merchantId: "123248",
    deepLink: "https://www.awin1.com/pclick.php?p=43494950652&a=3064149&m=123248",
    subId: "zimaya-oud-is-great__oud-for-greatness",
    label: "Zimaya Oud Is Great Extrait 100ml at Opulensi",
  },

  /* ── SECOND MERCHANT, 2026-09-03 — Clone of Perfume, Awin advertiser 117395.
   *
   * Every entry above this line is Opulensi (123248). These nine are the first
   * links to a different advertiser that actually earns, and the first to a
   * DUPE HOUSE SELLING DIRECT rather than to a reseller — the storefront is
   * the brand's own (cloneofperfume.com, branded "The CLONE").
   *
   * Traced end to end before being added, the same gate every entry above
   * passed. All nine land on cloneofperfume.com with HTTP 200 and an
   * `awc=117395_<ts>_<hash>` on the destination URL.
   *
   * ONE DIFFERENCE FROM OPULENSI, AND IT IS NOT A DEFECT. This merchant does
   * NOT echo our sub-ID into the destination URL. Opulensi does, as
   * `utm_id=3064149_<subId>`, but that is its Shopify theme's own behaviour and
   * was never an Awin guarantee — reading it as one is what made
   * scripts/check-affiliate-links.mjs report these nine as unattributable.
   *
   * The sub-ID does survive, in the channel that actually decides attribution:
   * Awin's own click cookie, set on `.awin1.com` at the first hop of the chain.
   *
   *   aw117395=3064149|0|0|<timestamp>|<our clickref>|aw|<aw_product_id>
   *
   * Opulensi sets the identical cookie shape (`aw123248=...`), so this is the
   * network-level record and the URL echo is the merchant-specific extra.
   * Confirmed independently by the founder in the Awin Click Report, which
   * recorded our `clickref=probe` against 117395 on 2026-09-03. The checker was
   * fixed to read the cookie rather than to exempt this merchant — see the
   * MERCHANT_NOTES block and traceChain() in that script.
   *
   * Deep links are the feed's own `aw_deep_link` (scripts/feeds/clone-of-perfume.csv,
   * 11 rows). Each `p=` is the same aw_product_id used in scripts/fetch-dupe-images.mjs,
   * so a buy button and a photograph cannot silently refer to different products.
   *
   * All nine are 50ml extrait — this merchant's only size for eight of them, and
   * the cheaper of two for Rouge Veil (a 100ml exists at $54.99; the feed row,
   * and therefore this link, is the 50ml).
   */
  "dupe-the-clone-rouge-veil-no-13": {
    network: "awin",
    merchantId: "117395",
    deepLink: "https://www.awin1.com/pclick.php?p=44269697233&a=3064149&m=117395",
    subId: "the-clone-rouge-veil-no-13__baccarat-rouge-540",
    label: "The CLONE No. 13 Rouge Veil Extrait 50ml at Clone of Perfume",
  },
  "dupe-the-clone-thunderstorm-no-93": {
    network: "awin",
    merchantId: "117395",
    deepLink: "https://www.awin1.com/pclick.php?p=44269697235&a=3064149&m=117395",
    subId: "the-clone-thunderstorm-no-93__aventus",
    label: "The CLONE No. 93 Thunderstorm Extrait 50ml at Clone of Perfume",
  },
  "dupe-the-clone-ultimatum-no-53": {
    network: "awin",
    merchantId: "117395",
    deepLink: "https://www.awin1.com/pclick.php?p=44269697236&a=3064149&m=117395",
    subId: "the-clone-ultimatum-no-53__oud-wood",
    label: "The CLONE No. 53 Ultimatum Extrait 50ml at Clone of Perfume",
  },
  "dupe-the-clone-naked-cherry-no-33": {
    network: "awin",
    merchantId: "117395",
    deepLink: "https://www.awin1.com/pclick.php?p=44269697231&a=3064149&m=117395",
    subId: "the-clone-naked-cherry-no-33__lost-cherry",
    label: "The CLONE No. 33 Naked Cherry Extrait 50ml at Clone of Perfume",
  },
  "dupe-the-clone-whisper-no-43": {
    network: "awin",
    merchantId: "117395",
    deepLink: "https://www.awin1.com/pclick.php?p=44269697237&a=3064149&m=117395",
    subId: "the-clone-whisper-no-43__sauvage",
    label: "The CLONE No. 43 Whisper Extrait 50ml at Clone of Perfume",
  },
  "dupe-the-clone-lady-on-fire-no-23": {
    network: "awin",
    merchantId: "117395",
    deepLink: "https://www.awin1.com/pclick.php?p=44269697229&a=3064149&m=117395",
    subId: "the-clone-lady-on-fire-no-23__black-opium",
    label: "The CLONE No. 23 Lady on Fire Extrait 50ml at Clone of Perfume",
  },
  "dupe-the-clone-pleasure-noir-no-63": {
    network: "awin",
    merchantId: "117395",
    deepLink: "https://www.awin1.com/pclick.php?p=44269697232&a=3064149&m=117395",
    subId: "the-clone-pleasure-noir-no-63__santal-33",
    label: "The CLONE No. 63 Pleasure Noir Extrait 50ml at Clone of Perfume",
  },
  "dupe-the-clone-brave-in-love-no-37": {
    network: "awin",
    merchantId: "117395",
    deepLink: "https://www.awin1.com/pclick.php?p=44269697227&a=3064149&m=117395",
    subId: "the-clone-brave-in-love-no-37__love-dont-be-shy",
    label: "The CLONE No. 37 Brave in Love Extrait 50ml at Clone of Perfume",
  },
  "dupe-the-clone-brutal-story-no-73": {
    network: "awin",
    merchantId: "117395",
    deepLink: "https://www.awin1.com/pclick.php?p=44269697228&a=3064149&m=117395",
    subId: "the-clone-brutal-story-no-73__fucking-fabulous",
    label: "The CLONE No. 73 Brutal Story Extrait 50ml at Clone of Perfume",
  },

  // ── Added 2026-09-04 ────────────────────────────────────────────────────
  // AromaPassions, Awin advertiser 34989. A third merchant, and the second
  // dupe house selling its own line direct.
  //
  // ONE LINK PER LISTING, NOT ONE PER SIZE — and that is a decision, not an
  // omission. Each of these listings carries TWO offers (50ml and 100ml), and
  // the feed does hold a separate row with its own aw_product_id for each. It
  // would therefore be easy to mint two ids per product. It would also be
  // misleading: **this merchant's pclick link is PRODUCT-level, not
  // variant-level** — verified, and recorded in MERCHANT_NOTES in
  // scripts/check-affiliate-links.mjs — so both ids land on the identical page
  // with the identical default variant selected. Two link ids for one
  // destination would imply a variant-level link we do not have, in exchange
  // for a click breakdown Awin cannot honour. The buyer picks the size on the
  // merchant's page; the offer row on ours says which price is which.
  //
  // The id used is the 50ml row's, because that is the size each listing's
  // own `priceUsd`/`bottleMl` describes.
  //
  // TWO MERCHANT-SPECIFIC FACTS, both observed rather than assumed:
  //  - 34989 does NOT echo our clickref into the destination URL. It appends
  //    its own `sv1`/`sscid`/`awc` query params, which look like attribution
  //    and are not ours. Our sub-ID arrives only in Awin's own click cookie
  //    (`aw34989=…`) at hop 0, which is the channel that actually decides
  //    attribution — same situation as Clone of Perfume, see the header of
  //    scripts/feeds/README.md.
  //  - It sets no `awc` COOKIE at all (it puts awc in the query string). That
  //    absence is expected here and is not a broken link.
  "dupe-aromapassions-spark": {
    network: "awin",
    merchantId: "34989",
    deepLink: "https://www.awin1.com/pclick.php?p=41943775349&a=3064149&m=34989",
    subId: "aromapassions-spark__allure-homme-sport",
    label: "AromaPassions SPARK, inspired by Chanel Allure Homme Sport",
  },
  "dupe-aromapassions-heavenly": {
    network: "awin",
    merchantId: "34989",
    deepLink: "https://www.awin1.com/pclick.php?p=41943775170&a=3064149&m=34989",
    subId: "aromapassions-heavenly__angel",
    label: "AromaPassions HEAVENLY, inspired by Mugler Angel",
  },
  "dupe-aromapassions-freedom": {
    network: "awin",
    merchantId: "34989",
    deepLink: "https://www.awin1.com/pclick.php?p=41943775182&a=3064149&m=34989",
    subId: "aromapassions-freedom__another-13",
    label: "AromaPassions FREEDOM, inspired by Le Labo Another 13",
  },
  "dupe-aromapassions-virility": {
    network: "awin",
    merchantId: "34989",
    deepLink: "https://www.awin1.com/pclick.php?p=41943775222&a=3064149&m=34989",
    subId: "aromapassions-virility__antaeus",
    label: "AromaPassions VIRILITY, inspired by Chanel Antaeus",
  },
  "dupe-aromapassions-bittersweet": {
    network: "awin",
    merchantId: "34989",
    deepLink: "https://www.awin1.com/pclick.php?p=41943775168&a=3064149&m=34989",
    subId: "aromapassions-bittersweet__bitter-peach",
    label: "AromaPassions BITTERSWEET, inspired by Tom Ford Bitter Peach",
  },
  "dupe-aromapassions-glamorous": {
    network: "awin",
    merchantId: "34989",
    deepLink: "https://www.awin1.com/pclick.php?p=41943775355&a=3064149&m=34989",
    subId: "aromapassions-glamorous__bright-crystal",
    label: "AromaPassions GLAMOROUS, inspired by Versace Bright Crystal",
  },
  "dupe-aromapassions-sparkle": {
    network: "awin",
    merchantId: "34989",
    deepLink: "https://www.awin1.com/pclick.php?p=41943775224&a=3064149&m=34989",
    subId: "aromapassions-sparkle__cedrat-boise",
    label: "AromaPassions SPARKLE, inspired by Mancera Cedrat Boise",
  },
  "dupe-aromapassions-admire": {
    network: "awin",
    merchantId: "34989",
    deepLink: "https://www.awin1.com/pclick.php?p=41943775346&a=3064149&m=34989",
    subId: "aromapassions-admire__chance-eau-tendre",
    label: "AromaPassions ADMIRE, inspired by Chanel Chance Eau Tendre",
  },
  "dupe-aromapassions-sensual": {
    network: "awin",
    merchantId: "34989",
    deepLink: "https://www.awin1.com/pclick.php?p=41943775156&a=3064149&m=34989",
    subId: "aromapassions-sensual__costa-azzurra",
    label: "AromaPassions SENSUAL, inspired by Tom Ford Costa Azzurra",
  },
  "dupe-aromapassions-erotic": {
    network: "awin",
    merchantId: "34989",
    deepLink: "https://www.awin1.com/pclick.php?p=41943775352&a=3064149&m=34989",
    subId: "aromapassions-erotic__eros",
    label: "AromaPassions EROTIC, inspired by Versace Eros",
  },
  // THE ONE EXCEPTION TO "the id is the 50ml row's": AromaPassions' Eros Flame
  // product has exactly one row in the feed, `VRF-093` — the 30ml, which the
  // store discontinued along with every other 30ml. There is no 50ml row to
  // point at. Because the deep link is product-level (above), this id still
  // lands on the live product page offering 50ml and 100ml, which is why the
  // listing ships at all. **Do not read a working link as proof its variant
  // still exists** — here it provably does not.
  "dupe-aromapassions-masculinity": {
    network: "awin",
    merchantId: "34989",
    deepLink: "https://www.awin1.com/pclick.php?p=41943775357&a=3064149&m=34989",
    subId: "aromapassions-masculinity__eros-flame",
    label: "AromaPassions MASCULINITY, inspired by Versace Eros Flame",
  },
  "dupe-aromapassions-mystical": {
    network: "awin",
    merchantId: "34989",
    deepLink: "https://www.awin1.com/pclick.php?p=41943775371&a=3064149&m=34989",
    subId: "aromapassions-mystical__flora-gorgeous-gardenia",
    label: "AromaPassions MYSTICAL, inspired by Gucci Flora Gorgeous Gardenia",
  },
  "dupe-aromapassions-blooming": {
    network: "awin",
    merchantId: "34989",
    deepLink: "https://www.awin1.com/pclick.php?p=41943775162&a=3064149&m=34989",
    subId: "aromapassions-blooming__flowerbomb",
    label: "AromaPassions BLOOMING, inspired by Viktor & Rolf Flowerbomb",
  },
  "dupe-aromapassions-revive": {
    network: "awin",
    merchantId: "34989",
    deepLink: "https://www.awin1.com/pclick.php?p=41943775220&a=3064149&m=34989",
    subId: "aromapassions-revive__green-irish-tweed",
    label: "AromaPassions REVIVE, inspired by Creed Green Irish Tweed",
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
