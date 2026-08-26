"use client";

import { useState } from "react";
import { Star, Info } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * "Add a review" (MARKETPLACE-PLAN.md §2).
 *
 * Deliberately does NOT fake a successful submission. There is no reviews
 * backend, no accounts, and no moderation queue (MARKETPLACE-PLAN.md §4), so
 * on submit this says exactly that rather than showing a "thanks, posted!"
 * confirmation for something that went nowhere. The repo convention is not to
 * claim an action happened when the thing behind it is not configured, and a
 * review form that silently discards what someone wrote is the user-facing
 * version of that same lie.
 *
 * When the backend lands, replace `handleSubmit` with a real Server Action
 * and drop the notice.
 */
export function AddReviewForm({ productName }: { productName: string }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [author, setAuthor] = useState("");
  const [body, setBody] = useState("");
  const [attempted, setAttempted] = useState(false);

  const shown = hovered || rating;
  const canSubmit = rating > 0 && author.trim().length > 0 && body.trim().length >= 20;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAttempted(true);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <span className="text-sm font-semibold">Your rating</span>
        <div className="flex items-center gap-1" onMouseLeave={() => setHovered(0)}>
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              onMouseEnter={() => setHovered(value)}
              aria-label={`${value} ${value === 1 ? "star" : "stars"}`}
              aria-pressed={rating === value}
              className="rounded p-0.5 transition-transform duration-150 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <Star
                weight={value <= shown ? "fill" : "regular"}
                className={cn(
                  "h-6 w-6 transition-colors",
                  value <= shown ? "text-primary" : "text-muted-foreground"
                )}
                aria-hidden
              />
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="review-author" className="text-sm font-semibold">
          Your name
        </label>
        <input
          id="review-author"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="How you want to be credited"
          className="w-full rounded-frame border border-border bg-card px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="review-body" className="text-sm font-semibold">
          Your review of {productName}
        </label>
        <textarea
          id="review-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={5}
          placeholder="How does it actually wear? Longevity, projection, how close it really is to the original, anything the listing oversells."
          className="w-full resize-y rounded-frame border border-border bg-card px-3 py-2.5 text-sm leading-relaxed outline-none transition-colors placeholder:text-muted-foreground/70 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25"
        />
        <p className="text-xs text-muted-foreground">
          {body.trim().length < 20
            ? `At least 20 characters (${body.trim().length} so far).`
            : "Ready to submit."}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={!canSubmit}>
          Submit review
        </Button>
        <span className="text-xs text-muted-foreground">
          Reviews are checked before they appear.
        </span>
      </div>

      {attempted && (
        <div
          role="status"
          className="flex gap-3 rounded-frame border border-primary/30 bg-secondary/50 p-4"
        >
          <Info weight="fill" className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
          <p className="text-sm leading-relaxed text-foreground/85">
            Review submission is not live yet. This site has no account system or review
            database behind it, so nothing you typed has been saved or sent anywhere. The form
            is here so the flow can be reviewed before the backend that would store it gets
            built.
          </p>
        </div>
      )}
    </form>
  );
}
