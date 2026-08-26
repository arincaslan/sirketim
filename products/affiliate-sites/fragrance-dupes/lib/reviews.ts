import type { CustomerReview } from "@/lib/types";

/**
 * Customer reviews - buyers rating a specific bottle, distinct from the
 * editorial reviews the content department writes as MDX
 * (content/review/*.mdx). See MARKETPLACE-PLAN.md §2/§3.
 *
 * FIXTURE DATA, and unusually important to be clear about: these are written
 * specimens, not real customer feedback. There is no review submission
 * backend, no accounts, and no moderation queue yet (MARKETPLACE-PLAN.md §4),
 * so nothing a visitor types into the review form is stored anywhere. Every
 * `verifiedPurchase` is false because the site currently only redirects to
 * someone else's checkout and therefore cannot confirm any purchase happened.
 *
 * Do not present these as genuine customer reviews on a live site. Fabricated
 * reviews shown as real are both an FTC problem and the exact credibility
 * failure this site's "independent" positioning cannot survive - they exist
 * purely so the components have realistic shape to render during the build.
 */
export const REVIEWS: CustomerReview[] = [
  {
    id: "rev-001",
    targetSlug: "dossier-ambrosia",
    author: "Selin K.",
    rating: 4,
    body: "Opening is genuinely close to the original, close enough that nobody at work could tell. It does fade on me around hour five, so I keep the bottle in my bag for a re-spray. For the price I am not complaining.",
    createdAt: "2026-07-14",
    verifiedPurchase: false,
    status: "approved",
  },
  {
    id: "rev-002",
    targetSlug: "dossier-ambrosia",
    author: "Marcus T.",
    rating: 3,
    body: "Good but oversold in the listing. The saffron is right, the base is thinner than the original and goes a bit soapy on my skin after a couple of hours. Fine for the money, not a replacement.",
    createdAt: "2026-07-28",
    verifiedPurchase: false,
    status: "approved",
  },
  {
    id: "rev-003",
    targetSlug: "alt-blue-cedar",
    author: "Deniz A.",
    rating: 5,
    body: "Wore this three days straight to be sure. The citrus-cedar arc really does track and the extrait concentration means it actually lasts through a workday. My most-repurchased bottle this year.",
    createdAt: "2026-08-02",
    verifiedPurchase: false,
    status: "approved",
  },
  {
    id: "rev-004",
    targetSlug: "drydown-no-01-ember",
    author: "Priya R.",
    rating: 4,
    body: "The resin note in the base is the part that sold me, most alternatives skip it entirely and end up smelling like generic sweet amber. Projection is honest-to-moderate as described rather than overstated.",
    createdAt: "2026-08-11",
    verifiedPurchase: false,
    status: "approved",
  },
  {
    id: "rev-005",
    targetSlug: "alt-bright",
    author: "Jonas W.",
    rating: 4,
    body: "Coffee and vanilla are spot on. Sweeter than the original for sure, which suits me but would annoy someone wanting the sharper version. Bottle feels cheap, the juice does not.",
    createdAt: "2026-08-19",
    verifiedPurchase: false,
    status: "approved",
  },
  {
    id: "rev-006",
    targetSlug: "microperfumes-amber-nights",
    author: "Elif Y.",
    rating: 2,
    body: "Wanted to like it. The amber direction is there but the whole thing collapses after ninety minutes and there is none of the resin the original is known for. The decant size makes it a cheap way to find that out, at least.",
    createdAt: "2026-08-21",
    verifiedPurchase: false,
    status: "approved",
  },
];

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
