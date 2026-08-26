import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { RatingStars } from "@/components/content/rating-stars";
import { getReviewsFor, getReviewSummary } from "@/lib/reviews";

/**
 * Customer reviews for one listing (MARKETPLACE-PLAN.md §2). Distinct from
 * the editorial reviews under content/review/*.mdx: those are ours, these are
 * buyers'. On a marketplace where several unfamiliar producers all claim to
 * match the same original, other buyers vouching is doing more conversion
 * work than the site vouching for itself.
 *
 * Reviews here come from a fixture array - there is no submission backend
 * yet, so the disclaimer beneath the form is literally true and must stay
 * until one exists.
 */
export function ReviewList({ targetSlug }: { targetSlug: string }) {
  const reviews = getReviewsFor(targetSlug);
  const summary = getReviewSummary(targetSlug);

  if (!summary) {
    return (
      <p className="text-sm text-muted-foreground">
        No customer reviews for this bottle yet. If you have worn it, yours would be the first.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <RatingStars rating={summary.average} />
        <span className="text-sm text-muted-foreground">
          {summary.count} {summary.count === 1 ? "review" : "reviews"}
        </span>
      </div>

      <ul className="flex flex-col gap-5">
        {reviews.map((review) => (
          <li key={review.id} className="border-t border-border/70 pt-5 first:border-t-0 first:pt-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="text-sm font-semibold">{review.author}</span>
              <RatingStars rating={review.rating} />
              {review.verifiedPurchase && (
                <span className="inline-flex items-center gap-1 text-xs text-primary">
                  <CheckCircle weight="fill" className="h-3.5 w-3.5" aria-hidden />
                  Verified purchase
                </span>
              )}
              <time dateTime={review.createdAt} className="ml-auto text-xs text-muted-foreground">
                {new Date(review.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </time>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-foreground/80">{review.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
