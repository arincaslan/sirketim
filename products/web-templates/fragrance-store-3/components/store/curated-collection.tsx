import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { MeridianSweep } from "@/components/store/meridian-sweep";
import { ScrollReveal } from "@/components/store/scroll-reveal";
import { CURATED_THEMES } from "@/lib/media";

function themeHref(theme: (typeof CURATED_THEMES)[number]): string {
  if (theme.badge) return `/products?badge=${theme.badge}`;
  return `/products?family=${theme.families.join(",")}`;
}

/**
 * Three cross-family theme cards — deliberately distinct content from the
 * family rail below so the two homepage sections don't repeat (see
 * DESIGN.md's Home artboard). Replaces v1's reuse of single-family
 * CollectionStatementCard on the homepage.
 */
export function CuratedCollection() {
  return (
    <section className="container py-16">
      <div className="max-w-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Curated collection</p>
        <h2 className="font-display mt-3 text-fluid-h2 font-semibold text-balance">
          Three places to start, if you&apos;re not sure where.
        </h2>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <ScrollReveal className="lg:row-span-2">
          <Link
            href={themeHref(CURATED_THEMES[0])}
            className="group relative flex h-full min-h-[22rem] w-full flex-col justify-end overflow-hidden p-8"
          >
            <div className="absolute inset-0">
              <MeridianSweep
                family="Oriental"
                src={CURATED_THEMES[0].image}
                alt={CURATED_THEMES[0].title}
                trigger="view"
                sizes="(min-width: 1024px) 50vw, 100vw"
              />
            </div>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground/75 via-foreground/15 to-transparent" />
            <div className="relative text-background">
              <p className="font-display text-2xl font-semibold sm:text-3xl">{CURATED_THEMES[0].title}</p>
              <p className="mt-2 max-w-xs text-sm text-background/85">{CURATED_THEMES[0].description}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide transition-transform group-hover:translate-x-1">
                Shop the theme <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </Link>
        </ScrollReveal>

        {CURATED_THEMES.slice(1).map((theme, index) => (
          <ScrollReveal key={theme.slug} delay={(index + 1) * 0.1}>
            <Link
              href={themeHref(theme)}
              className="group relative flex aspect-[4/5] w-full flex-col justify-end overflow-hidden p-8 sm:aspect-[16/9] lg:aspect-[4/5]"
            >
              <div className="absolute inset-0">
                <MeridianSweep
                  family={theme.badge ? "Woody" : "Fresh"}
                  src={theme.image}
                  alt={theme.title}
                  trigger="view"
                  sizes="(min-width: 1024px) 25vw, 50vw"
                />
              </div>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground/75 via-foreground/15 to-transparent" />
              <div className="relative text-background">
                <p className="font-display text-xl font-semibold sm:text-2xl">{theme.title}</p>
                <p className="mt-2 max-w-xs text-sm text-background/85">{theme.description}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide transition-transform group-hover:translate-x-1">
                  Shop the theme <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
