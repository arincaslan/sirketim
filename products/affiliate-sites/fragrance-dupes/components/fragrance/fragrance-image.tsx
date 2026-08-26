/* eslint-disable @next/next/no-img-element */
import { getFragranceVisual } from "@/lib/fragrance-visual";
import { cn } from "@/lib/utils";
import type { ReferenceFragrance } from "@/lib/types";

/**
 * Renders a fragrance's product photograph where one is licensed, and a
 * generated note signature everywhere else.
 *
 * Every call site goes through this component rather than reading `imageUrl`
 * directly, so the day affiliate product feeds land, filling in `imageUrl`
 * lights up the whole site with no component changes and no half-migrated
 * surfaces showing placeholders next to real photos.
 *
 * A plain <img> rather than next/image: these will be remote affiliate-CDN
 * URLs on arbitrary hosts, which next/image would need per-host
 * `remotePatterns` config for. Revisit once the actual image host is known.
 */
export function FragranceImage({
  fragrance,
  className,
  rounded = "md",
}: {
  fragrance: Pick<ReferenceFragrance, "name" | "family" | "facets" | "imageUrl" | "brand">;
  className?: string;
  rounded?: "md" | "full";
}) {
  const radius = rounded === "full" ? "rounded-full" : "rounded-[0.375rem]";

  if (fragrance.imageUrl) {
    return (
      <img
        src={fragrance.imageUrl}
        alt={`${fragrance.name} by ${fragrance.brand}`}
        loading="lazy"
        className={cn("object-cover", radius, className)}
      />
    );
  }

  const visual = getFragranceVisual(fragrance);

  return (
    <span
      role="img"
      aria-label={visual.label}
      style={{ backgroundImage: visual.background }}
      className={cn(
        "inline-flex shrink-0 items-center justify-center font-display text-[0.65em] font-semibold tracking-wide text-white/90 shadow-inner",
        radius,
        className
      )}
    >
      {visual.initials}
    </span>
  );
}
