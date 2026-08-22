import type { ScentFamily } from "@/lib/types";

/**
 * Single source of truth for every real generated asset actually sitting in
 * `public/generated/` — see DESIGN.md's closing "What changes in code"
 * section for the brief ("a convention for looking up a product's images by
 * productSlug ... a lookup helper, not a data-model change"). Deliberately a
 * separate file from `lib/products.ts` rather than added to it, so the
 * catalog data file stays byte-for-byte untouched per DESIGN.md.
 *
 * This is hand-authored against the *actual* contents of `public/generated/`
 * (cross-checked file-by-file against `generation-log.json`'s `completed`
 * array), not against `asset-manifest.json`'s aspirational shot list or
 * `generation-log.json`'s prose summary — those two disagree with each other
 * in one case (see `dustAndMarbleNote` below), and disk reality is what
 * actually renders.
 */

function asset(id: string, ext: "png" | "mp4" = "png"): string {
  return `/generated/${id}.${ext}`;
}

export type GalleryShotVariant = "still" | "macro" | "detail" | "texture" | "lifestyle";

export interface GalleryImageShot {
  type: "image";
  id: string;
  variant: GalleryShotVariant;
  label: string;
  src: string;
}

export interface GalleryVideoShot {
  type: "video";
  id: string;
  label: string;
  src: string;
  poster?: string;
}

export type GalleryShot = GalleryImageShot | GalleryVideoShot;

const VARIANT_LABEL: Record<GalleryShotVariant, string> = {
  still: "Still",
  macro: "Macro",
  detail: "Detail",
  texture: "Texture",
  lifestyle: "Atmosphere",
};

function shot(productSlug: string, variant: GalleryShotVariant): GalleryImageShot {
  const id = `${productSlug}-${variant}`;
  return { type: "image", id, variant, label: VARIANT_LABEL[variant], src: asset(id) };
}

/**
 * Per-product shot list, exactly matching what's on disk today — NOT a
 * uniform 5-slot assumption. Three tiers actually exist:
 *  - paper-orchid, greenhouse-winter-wing: full 5-shot set (still, macro,
 *    detail, texture, lifestyle).
 *  - dust-and-marble: an irregular 3-shot set (still, macro, detail) — the
 *    generation run's own "scopeChange" note claims this product "has the
 *    full original 5-shot set on disk, same as Paper Orchid," but that's
 *    wrong: its own `completed` array (and the actual files in
 *    `public/generated/`) only ever include 3 of the 5 dust-and-marble
 *    shots. `texture` was deliberately descoped (matches its manifest
 *    entry); `lifestyle` simply never got generated or downloaded, and
 *    isn't marked descoped either — a real gap in that pipeline run, not a
 *    scope decision. Flagged in the README rather than silently patched
 *    over with a fake fallback image.
 *  - The other 7 products: the 2-shot set (still, lifestyle) per the
 *    founder's 2026-08-22 cost-cut decision.
 * The product-gallery and product-card components consume this list
 * directly and render however many entries exist — they never assume a
 * fixed count.
 */
const PRODUCT_GALLERY: Record<string, GalleryShot[]> = {
  "paper-orchid": [
    shot("paper-orchid", "still"),
    shot("paper-orchid", "macro"),
    shot("paper-orchid", "detail"),
    shot("paper-orchid", "texture"),
    shot("paper-orchid", "lifestyle"),
  ],
  "greenhouse-winter-wing": [
    shot("greenhouse-winter-wing", "still"),
    shot("greenhouse-winter-wing", "macro"),
    shot("greenhouse-winter-wing", "detail"),
    shot("greenhouse-winter-wing", "texture"),
    shot("greenhouse-winter-wing", "lifestyle"),
  ],
  // Irregular: no texture (descoped) and no lifestyle (missing from the
  // generation run despite not being marked descoped) — see doc comment.
  "dust-and-marble": [shot("dust-and-marble", "still"), shot("dust-and-marble", "macro"), shot("dust-and-marble", "detail")],
  "coach-house": [shot("coach-house", "still"), shot("coach-house", "lifestyle")],
  "amber-room": [shot("amber-room", "still"), shot("amber-room", "lifestyle")],
  // Copper Coast also carries its campaign film as a bonus gallery entry —
  // the only product with a video shot (see asset-manifest.json's `page`
  // field for campaign-copper-coast-video: it names both the homepage
  // campaign band AND this PDP as placements).
  "copper-coast": [
    shot("copper-coast", "still"),
    shot("copper-coast", "lifestyle"),
    {
      type: "video",
      id: "campaign-copper-coast-video",
      label: "Campaign film",
      src: asset("campaign-copper-coast-video", "mp4"),
      poster: asset("campaign-copper-coast-image"),
    },
  ],
  "low-tide": [shot("low-tide", "still"), shot("low-tide", "lifestyle")],
  "cold-chapel": [shot("cold-chapel", "still"), shot("cold-chapel", "lifestyle")],
  "the-reading-room": [shot("the-reading-room", "still"), shot("the-reading-room", "lifestyle")],
  "fig-and-ember": [shot("fig-and-ember", "still"), shot("fig-and-ember", "lifestyle")],
};

export const dustAndMarbleNote =
  "dust-and-marble ships with 3 of its intended 5 gallery shots (still, macro, detail) — texture was deliberately descoped, lifestyle is a genuine gap in the OpenArt generation run, not a scope decision.";

export function getProductGallery(slug: string): GalleryShot[] {
  return PRODUCT_GALLERY[slug] ?? [];
}

function findImage(slug: string, variant: GalleryShotVariant): GalleryImageShot | undefined {
  const found = PRODUCT_GALLERY[slug]?.find((s): s is GalleryImageShot => s.type === "image" && s.variant === variant);
  return found;
}

/** The resting/primary image for a product — used on grid cards, rails, cart lines, toasts. Every product has a still. */
export function getProductStill(slug: string): string | undefined {
  return findImage(slug, "still")?.src;
}

/** The Meridian Sweep hover-reveal image on grid cards. Undefined for dust-and-marble (see note above) — callers must handle that gracefully rather than assuming it always exists. */
export function getProductLifestyle(slug: string): string | undefined {
  return findImage(slug, "lifestyle")?.src;
}

// ---------------------------------------------------------------------------
// Home / marketing surfaces
// ---------------------------------------------------------------------------

export const HERO_IMAGE = asset("home-hero-image");
export const HERO_VIDEO = asset("home-hero-video", "mp4");

export interface CuratedTheme {
  slug: string;
  title: string;
  description: string;
  image: string;
  /** Comma-joined family list — read by ProductsCatalog's family query param parsing. */
  families: ScentFamily[];
  /** Set for the one theme that isn't a family grouping (the four Signature-badged bestsellers). */
  badge?: "Signature";
}

/**
 * Three cross-family homepage theme cards — replaces v1's single-family
 * CollectionStatementCard reuse on the homepage (see DESIGN.md's Home
 * artboard: "deliberately distinct content from the family rail so the two
 * sections don't repeat").
 */
export const CURATED_THEMES: CuratedTheme[] = [
  {
    slug: "warm-hours",
    title: "Warm Hours",
    description: "Resinous, dense, evening-leaning — Oriental and Gourmand, together.",
    image: asset("curated-warm-hours"),
    families: ["Oriental", "Gourmand"],
  },
  {
    slug: "cold-air",
    title: "Cold Air",
    description: "Bright, mineral, daytime-leaning — Fresh and Floral, together.",
    image: asset("curated-cold-air"),
    families: ["Fresh", "Floral"],
  },
  {
    slug: "the-signature-line",
    title: "The Signature Line",
    description: "Four bestsellers, one from nearly every family, all badged Signature.",
    image: asset("curated-signature-line"),
    families: [],
    badge: "Signature",
  },
];

export const FAMILY_RAIL_IMAGE: Record<ScentFamily, string> = {
  Floral: asset("family-rail-floral"),
  Woody: asset("family-rail-woody"),
  Oriental: asset("family-rail-oriental"),
  Fresh: asset("family-rail-fresh"),
  Gourmand: asset("family-rail-gourmand"),
};

export const EDITORIAL_SHOWCASE_IMAGE = asset("home-editorial-showcase");

export const CAMPAIGN_COPPER_COAST_IMAGE = asset("campaign-copper-coast-image");
export const CAMPAIGN_COPPER_COAST_VIDEO = asset("campaign-copper-coast-video", "mp4");

// ---------------------------------------------------------------------------
// About / Atelier
// ---------------------------------------------------------------------------

export const ABOUT_OPENING_IMAGE = asset("about-opening");
export const ABOUT_SOURCING_IMAGE = asset("about-sourcing");
export const ABOUT_CRAFTSMANSHIP_IMAGE = asset("about-craftsmanship");
export const ABOUT_PROCESS_VIDEO = asset("about-atelier-process-video", "mp4");

// ---------------------------------------------------------------------------
// Journal
// ---------------------------------------------------------------------------

/** Journal post slugs (lib/journal.ts) don't share a naming convention with
 * their manifest asset ids, so this is an explicit map rather than a string
 * template. */
const JOURNAL_IMAGE_ID: Record<string, string> = {
  "why-scent-remembers-places": "journal-why-scent-remembers-places",
  "sourcing-iris-root": "journal-sourcing-iris-root",
  "how-a-note-pyramid-actually-works": "journal-how-a-note-pyramid-works",
  "the-two-spray-rule": "journal-the-two-spray-rule",
  "interview-the-nose-behind-amber-room": "journal-interview-amber-room",
  "dressing-a-fragrance-for-winter": "journal-dressing-for-winter",
};

export function getJournalImage(slug: string): string {
  const id = JOURNAL_IMAGE_ID[slug];
  return id ? asset(id) : asset("home-editorial-showcase");
}

// ---------------------------------------------------------------------------
// Site-wide
// ---------------------------------------------------------------------------

export const OG_DEFAULT_IMAGE = asset("og-default-image");
