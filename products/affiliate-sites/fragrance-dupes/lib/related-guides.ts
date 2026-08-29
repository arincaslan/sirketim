import { getContentByType } from "@/content/loader";

/**
 * Reverse-index of the "Related reading" module on a fragrance page.
 *
 * Guides already link FORWARD into `/fragrance/<slug>` pages by name (e.g.
 * "[Aventus](/fragrance/aventus/)" inside aventus-alternatives.mdx) - 49 such
 * links exist across the 12 published guides, into 31 of the 68-then-111
 * references. Nothing linked back: a visitor who lands on a fragrance page
 * from search had no way to discover the guide that discusses it, even
 * though the guide traffic exists today. This module builds that reverse
 * map from the links guides already contain, rather than hand-maintaining a
 * second list that would drift the moment a guide's links change.
 *
 * Deliberately fragrance-specific (the regex targets /fragrance/<slug>), so
 * it lives in lib/ rather than content/ - content/loader.ts and schema.ts
 * are the niche-agnostic "affiliate-site-kit" meant to be copied wholesale
 * into a different affiliate site's content/ folder (see content/schema.ts's
 * module doc), and this reverse-index would not make sense there.
 */

export interface RelatedGuide {
  slug: string;
  title: string;
}

// Matches both Markdown `(/fragrance/slug/)` and MDX `<a href="/fragrance/slug">`
// links - both forms appear across the 12 guides. Requires a slug segment
// after /fragrance/, so a bare `/fragrance` (the catalog index, once it
// exists) is never mistaken for a fragrance-page link.
const FRAGRANCE_LINK_PATTERN = /\/fragrance\/([a-z0-9-]+)\/?/g;

let index: Map<string, RelatedGuide[]> | null = null;

function buildIndex(): Map<string, RelatedGuide[]> {
  const map = new Map<string, RelatedGuide[]>();

  for (const piece of getContentByType("guide")) {
    const slugsInPiece = new Set<string>();
    for (const match of piece.body.matchAll(FRAGRANCE_LINK_PATTERN)) {
      slugsInPiece.add(match[1]);
    }

    for (const fragranceSlug of slugsInPiece) {
      const existing = map.get(fragranceSlug);
      const entry: RelatedGuide = { slug: piece.frontmatter.slug, title: piece.frontmatter.title };
      if (existing) existing.push(entry);
      else map.set(fragranceSlug, [entry]);
    }
  }

  return map;
}

/** Guides (by slug/title) that link to `/fragrance/<fragranceSlug>` in their
 *  body. Empty for the majority of the catalog - only 31 of 111 references
 *  are mentioned by a guide today, and that is real information (it is the
 *  same gap the "Related originals" module cannot fill, since that one
 *  ranks by scent similarity, not by what's been written about). */
export function getGuidesLinkingTo(fragranceSlug: string): RelatedGuide[] {
  if (!index) index = buildIndex();
  return index.get(fragranceSlug) ?? [];
}
