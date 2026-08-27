/**
 * The Counterscent mark and wordmark lockup.
 *
 * THE MARK: one facet, split down the middle. The left half is solid, the right
 * is outline only - identical in shape and size, different in substance. That is
 * the site's thesis in one form: an original and its counterpart, held to the
 * same measure and honestly distinguished rather than passed off as the same
 * thing. The gap between the halves is the comparison itself.
 *
 * It is drawn in `currentColor` rather than a fixed brand green, so it inherits
 * the header's colour and works in both themes without a second asset. The
 * favicon at app/icon.svg is the same geometry with fixed colours, because a
 * browser tab has no theme context to inherit.
 *
 * Inline SVG, no image request, no layout shift - this renders in the header on
 * every page, so an <img> would be a render-blocking round trip for ~400 bytes.
 */
export function CounterscentMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M15 6.5 L5.5 16 L15 25.5 Z" fill="currentColor" />
      <path
        d="M17 6.5 L26.5 16 L17 25.5 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Mark plus wordmark, as used in the header.
 *
 * `tagline` is off by default because the header hides it below the `sm`
 * breakpoint - the lockup is also used in places (the footer, the preloader)
 * where the tagline would be repetition rather than orientation.
 */
export function CounterscentLogo({
  className,
  tagline = false,
}: {
  className?: string;
  tagline?: boolean;
}) {
  return (
    <span className={`flex items-center gap-2.5 ${className ?? ""}`}>
      <CounterscentMark className="h-7 w-7 shrink-0 text-primary" />
      <span className="flex flex-col leading-none">
        <span className="font-display text-xl font-semibold tracking-[0.02em]">COUNTERSCENT</span>
        {tagline && (
          <span className="mt-1 hidden text-[10px] uppercase tracking-[0.16em] text-muted-foreground sm:block">
            Independent Fragrance Comparisons
          </span>
        )}
      </span>
    </span>
  );
}
