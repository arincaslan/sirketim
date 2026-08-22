import { BadgeCheck, Star } from "lucide-react";

import { estimateRatingBreakdown, formatRating } from "@/lib/utils";
import type { Product } from "@/lib/types";

interface ReviewsProps {
  product: Product;
}

function Stars({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const dimension = size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5";
  return (
    <div className="flex items-center gap-0.5" role="img" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`${dimension} ${i < Math.round(rating) ? "fill-primary text-primary" : "text-border"}`}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

export function Reviews({ product }: ReviewsProps) {
  const breakdown = estimateRatingBreakdown(product.rating, product.reviewCount);
  const maxCount = Math.max(...breakdown, 1);

  return (
    <div>
      <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:gap-16">
        <div className="shrink-0 text-center sm:text-left">
          <p className="font-display text-5xl font-semibold">{formatRating(product.rating)}</p>
          <div className="mt-2 flex justify-center sm:justify-start">
            <Stars rating={product.rating} size="md" />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{product.reviewCount} reviews</p>
        </div>

        <div className="flex-1 space-y-1.5">
          {breakdown.map((count, index) => {
            const star = 5 - index;
            const percent = (count / maxCount) * 100;
            return (
              <div key={star} className="flex items-center gap-3 text-xs">
                <span className="w-10 shrink-0 text-muted-foreground">{star} star</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-pill bg-secondary">
                  <div className="h-full rounded-pill bg-primary" style={{ width: `${percent}%` }} />
                </div>
                <span className="w-8 shrink-0 text-right tabular-nums text-muted-foreground">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      <ul className="mt-10 flex flex-col divide-y divide-border border-t border-border">
        {product.reviews.map((review) => (
          <li key={review.id} className="py-6">
            <div className="flex items-center justify-between gap-3">
              <Stars rating={review.rating} />
              <time dateTime={review.date} className="text-xs text-muted-foreground">
                {new Date(review.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </time>
            </div>
            <p className="font-display mt-2 text-base font-semibold">{review.title}</p>
            <p className="mt-1.5 text-sm text-muted-foreground">{review.body}</p>
            <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-foreground">
              {review.author}
              {review.verified && (
                <span className="flex items-center gap-1 text-success">
                  <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" /> Verified purchase
                </span>
              )}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
