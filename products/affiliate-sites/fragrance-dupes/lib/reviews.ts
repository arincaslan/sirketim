import type { CustomerReview } from "@/lib/types";

/**
 * Customer reviews - buyers rating a specific bottle, distinct from the
 * editorial reviews the content department writes as MDX
 * (content/review/*.mdx). See MARKETPLACE-PLAN.md §2/§3.
 *
 * DELIBERATELY EMPTY. This array previously held six written specimens with
 * invented reviewer names, ratings and dates, attributed to real, named,
 * operating companies - and `review-list.tsx` rendered them with an aggregate
 * star average under a "Reviews from people who bought..." heading, with no
 * on-screen label saying they were fixtures. That is an FTC Fake Reviews Rule
 * problem (16 CFR Part 465) and, because one of them was a negative review of
 * a named third party's product, a trade-libel one. Removed 2026-08-27 at the
 * founder's instruction, before the site was ever publicly reachable.
 *
 * The empty state in `review-list.tsx` renders correctly and honestly ("No
 * customer reviews for this bottle yet"), so nothing needs a placeholder.
 *
 * DO NOT REPOPULATE THIS WITH WRITTEN EXAMPLES, not even labelled ones. Real
 * rows arrive only from a real submission backend with accounts and a
 * moderation queue (MARKETPLACE-PLAN.md §4). `verifiedPurchase` can only ever
 * be true once the site can actually confirm a purchase, which it cannot
 * today - it redirects to someone else's checkout.
 */
export const REVIEWS: CustomerReview[] = [];

/** Only approved reviews are ever shown. */
export function getReviewsFor(targetSlug: string): CustomerReview[] {
  return REVIEWS.filter((r) => r.targetSlug === targetSlug && r.status === "approved").sort(
    (a, b) => b.createdAt.localeCompare(a.createdAt)
  );
}

export interface ReviewSummary {
  count: number;
  average: number;
}

export function getReviewSummary(targetSlug: string): ReviewSummary | null {
  const reviews = getReviewsFor(targetSlug);
  if (reviews.length === 0) return null;
  const total = reviews.reduce((sum, r) => sum + r.rating, 0);
  return {
    count: reviews.length,
    average: Math.round((total / reviews.length) * 10) / 10,
  };
}
