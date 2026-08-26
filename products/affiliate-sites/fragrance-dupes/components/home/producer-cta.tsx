import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * The one place on the homepage addressed to fragrance houses rather than
 * buyers.
 *
 * Placed last, after the library-proof strip, deliberately: the homepage is a
 * scroll narrative written for someone deciding what to buy, and interrupting
 * that with a B2B pitch halfway down would break it for the larger audience.
 * A producer who scrolls the whole page is exactly the one worth catching.
 *
 * Visually a quiet band rather than another full chapter, so it reads as a
 * footer-adjacent aside rather than a seventh chapter competing with the six
 * that carry the actual argument (DESIGN.md's Implementation addendum v2).
 */
export function ProducerCta() {
  return (
    <section className="border-t border-border bg-secondary/30">
      <div className="container flex flex-col items-start gap-6 py-14 sm:flex-row sm:items-center sm:justify-between sm:py-16">
        <div className="flex max-w-[52ch] flex-col gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Make fragrances?
          </span>
          <h2 className="font-display text-2xl leading-tight sm:text-3xl">
            List your alternative where people are already comparing
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Your bottle, in front of someone who has already named the expensive fragrance they
            want. Ranked by a formula we publish, that no plan can buy its way up.
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-3">
          <Link href="/producers" className={cn(buttonVariants({ variant: "default" }), "gap-2")}>
            For producers
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <Link href="/producers/pricing" className={buttonVariants({ variant: "outline" })}>
            See plans
          </Link>
        </div>
      </div>
    </section>
  );
}
