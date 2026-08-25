import { z } from "zod";

/**
 * Shared affiliate-site-kit: frontmatter schema.
 *
 * This is the coordination contract between web-development and content
 * (see departments/content/CLAUDE.md and
 * departments/web-development/reports/affiliate-sites-technical-plan.md §1).
 * Niche-agnostic on purpose - copy this whole kit folder into a new
 * affiliate site's `content/`, `lib/`, and `components/` folders rather than
 * importing it as a live package (see the technical plan §6 for why: no
 * monorepo tooling in this repo yet, so this is a copied starter kit, not a
 * workspace dependency).
 */

export const productRef = z.object({
  name: z.string(),
  brand: z.string().optional(),
  image: z.string().optional(), // path under /public/images/<niche>/...
  priceApprox: z.string().optional(), // display string only, e.g. "~$45" - not a live price feed
  affiliateLinkId: z.string(), // resolves via lib/affiliate-links.ts - never a raw URL in content
  editorialRating: z.number().min(1).max(5).optional(),
  pros: z.array(z.string()).optional(),
  cons: z.array(z.string()).optional(),
});
export type ProductRef = z.infer<typeof productRef>;

const base = z.object({
  title: z.string(),
  description: z.string(), // meta description, ~150-160 chars
  slug: z.string(),
  publishedAt: z.string(), // ISO date
  updatedAt: z.string().optional(),
  author: z.string().default("Editorial Team"),
  heroImage: z.string().optional(),
  categories: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([]), // target keyword cluster
  disclosure: z.boolean().default(true), // forces the FTC disclosure block to render
});

export const guideFrontmatter = base.extend({
  contentType: z.literal("guide"),
  featuredProducts: z.array(productRef).optional(),
});
export type GuideFrontmatter = z.infer<typeof guideFrontmatter>;

export const comparisonFrontmatter = base.extend({
  contentType: z.literal("comparison"),
  products: z.array(productRef).min(2),
});
export type ComparisonFrontmatter = z.infer<typeof comparisonFrontmatter>;

export const reviewFrontmatter = base.extend({
  contentType: z.literal("review"),
  product: productRef,
});
export type ReviewFrontmatter = z.infer<typeof reviewFrontmatter>;

export const contentFrontmatter = z.discriminatedUnion("contentType", [
  guideFrontmatter,
  comparisonFrontmatter,
  reviewFrontmatter,
]);
export type ContentFrontmatter = z.infer<typeof contentFrontmatter>;

export type ContentType = ContentFrontmatter["contentType"];
