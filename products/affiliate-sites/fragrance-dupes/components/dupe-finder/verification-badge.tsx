import { Certificate, Warning, WarningOctagon } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";
import type { VerificationBadgeInfo } from "@/lib/verification";

/**
 * Discloses how much independent checking stands behind a listing, the same
 * way HouseBadge discloses when a listing is our own product - both are
 * "tell the reader where to be skeptical" markers, not promotional badges.
 *
 * See lib/verification.ts for what each status means and why it exists: the
 * anti-copy-cheat standard caps what an unverified ("declared") listing can
 * publish, and this badge is the visible half of that - a buyer should be
 * able to tell a checked match from a producer's own claim at a glance, not
 * have to read a methodology page to find out.
 */
export function VerificationBadge({
  info,
  compact = false,
  className,
}: {
  info: VerificationBadgeInfo;
  compact?: boolean;
  className?: string;
}) {
  const Icon = info.status === "verified" ? Certificate : info.status === "flagged" ? WarningOctagon : Warning;

  return (
    <span
      title={info.description}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide",
        info.status === "verified" && "border-primary/40 bg-secondary/60 text-foreground/80",
        info.status === "declared" && "border-border bg-card text-muted-foreground",
        info.status === "flagged" && "border-destructive/50 bg-destructive/10 text-destructive",
        className
      )}
    >
      <Icon
        weight="fill"
        className={cn("h-3 w-3", info.status === "verified" ? "text-primary" : "")}
        aria-hidden
      />
      {compact ? info.status[0].toUpperCase() + info.status.slice(1) : info.label}
    </span>
  );
}
