import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { MeridianSweep } from "@/components/store/meridian-sweep";
import { FAMILY_INFO } from "@/lib/products";
import { FAMILY_RAIL_IMAGE } from "@/lib/media";
import type { ScentFamily } from "@/lib/types";

interface CollectionStatementCardProps {
  family: ScentFamily;
  /** Defaults to a 16:9 statement band (grid-rhythm-break usage); pass
   * "h-full" for a slot that should instead fill its grid area (e.g. a
   * row-span-2 feature slot on the homepage). */
  aspectClassName?: string;
}

/**
 * Breaks the offset grid's rhythm every sixth slot with a full-bleed
 * editorial statement instead of another product tile — see DESIGN.md,
 * "Spacious editorial grid — break rhythm occasionally with feature
 * cards/collection statements, not uniform tiles." Now uses that family's
 * real family-rail photograph instead of a generative gradient field.
 */
export function CollectionStatementCard({ family, aspectClassName = "aspect-[16/9]" }: CollectionStatementCardProps) {
  const info = FAMILY_INFO[family];

  return (
    <Link
      href={`/products?family=${family}`}
      className={`group relative flex w-full flex-col justify-end overflow-hidden p-8 ${aspectClassName}`}
    >
      <div className="absolute inset-0">
        <MeridianSweep
          family={family}
          src={FAMILY_RAIL_IMAGE[family]}
          alt={`${family} family`}
          trigger="view"
          sizes="(min-width: 1024px) 60vw, 100vw"
        />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/10 to-transparent" />
      <div className="relative text-background">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-background/80">{info.mood}</p>
        <p className="font-display mt-2 max-w-md text-2xl font-semibold text-balance sm:text-3xl">
          {info.description}
        </p>
        <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide transition-transform group-hover:translate-x-1">
          Shop {family} <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}
