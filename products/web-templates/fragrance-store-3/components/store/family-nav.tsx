import Link from "next/link";

import { ScrollReveal } from "@/components/store/scroll-reveal";
import { MeridianSweep } from "@/components/store/meridian-sweep";
import { SCENT_FAMILIES, FAMILY_INFO } from "@/lib/products";
import { FAMILY_RAIL_IMAGE } from "@/lib/media";

export function FamilyNav() {
  return (
    <section className="border-y border-border bg-secondary/40 py-16">
      <div className="container">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Shop by olfactive family</p>
        <h2 className="font-display mt-3 max-w-lg text-fluid-h2 font-semibold text-balance">
          Five families, two places each.
        </h2>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {SCENT_FAMILIES.map((family, index) => (
            <ScrollReveal key={family} delay={index * 0.06}>
              <Link
                href={`/products?family=${family}`}
                className="group relative flex aspect-[3/4] w-full flex-col justify-end overflow-hidden border border-border p-4"
              >
                <div className="absolute inset-0">
                  <MeridianSweep
                    family={family}
                    src={FAMILY_RAIL_IMAGE[family]}
                    alt={family}
                    trigger="view"
                    sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
                  />
                </div>
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/5 to-transparent" />
                <div className="relative text-background">
                  <p className="font-display text-lg font-semibold">{family}</p>
                  <p className="mt-1 text-xs text-background/80">{FAMILY_INFO[family].mood}</p>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
