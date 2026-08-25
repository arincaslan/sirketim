import { Star, StarHalf } from "@phosphor-icons/react/dist/ssr";

export function RatingStars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;

  return (
    <span className="inline-flex items-center gap-1" role="img" aria-label={`Rated ${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => {
        if (i < full) return <Star key={i} weight="fill" className="h-4 w-4 text-primary" aria-hidden />;
        if (i === full && hasHalf)
          return <StarHalf key={i} weight="fill" className="h-4 w-4 text-primary" aria-hidden />;
        return <Star key={i} weight="regular" className="h-4 w-4 text-muted-foreground" aria-hidden />;
      })}
      <span className="ml-1 text-sm font-semibold tabular-nums text-foreground/80">{rating.toFixed(1)}</span>
    </span>
  );
}
