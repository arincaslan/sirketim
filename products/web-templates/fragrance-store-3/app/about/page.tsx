import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/store/scroll-reveal";
import { MeridianSweep } from "@/components/store/meridian-sweep";
import {
  ABOUT_CRAFTSMANSHIP_IMAGE,
  ABOUT_OPENING_IMAGE,
  ABOUT_PROCESS_VIDEO,
  ABOUT_SOURCING_IMAGE,
} from "@/lib/media";

export const metadata: Metadata = {
  title: "Atelier",
  description: "Creative philosophy, ingredients, craftsmanship, and sustainability behind Meridian.",
};

const PROCESS_STEPS = [
  {
    step: "01",
    title: "Start with a place, not a brief",
    body: "Every formula begins as a single written paragraph describing a specific remembered place — never an ingredient list, never a mood word. The perfumer's first job is translating that place into materials, not the reverse.",
  },
  {
    step: "02",
    title: "Build, wear, and reject",
    body: "Formulas go through six to eleven revisions on average, each one worn on skin for a full day before the next round of notes. We reject anything that reads as 'a nice fragrance' instead of 'that specific place.'",
  },
  {
    step: "03",
    title: "Batch small, on purpose",
    body: "Every fragrance is produced in small, dated batches rather than one continuous production run — it costs more per bottle, and it means a formula never quietly drifts because a raw material got substituted somewhere upstream.",
  },
];

export default function AboutPage() {
  return (
    <div>
      <section className="container py-16 sm:py-24">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-16">
          <ScrollReveal className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Atelier</p>
            <h1 className="font-display mt-4 text-fluid-hero font-semibold leading-[0.98] text-balance">
              We don&apos;t design scents. We design rooms you can carry with you.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              Meridian exists on a single premise: that a fragrance is more
              useful, and more honest, when it&apos;s built around a specific
              place than around an adjective. Every bottle in the collection
              started as a paragraph describing somewhere real before it
              became a formula.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <div className="relative aspect-[4/5] w-full overflow-hidden border border-border">
              <MeridianSweep
                family="Oriental"
                src={ABOUT_OPENING_IMAGE}
                alt="A quiet, north-lit workroom with sample vials on a wooden bench"
                trigger="view"
                priority
                sizes="(min-width: 1024px) 45vw, 100vw"
              />
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="border-y border-border bg-secondary/40 py-16">
        <div className="container grid gap-10 lg:grid-cols-2 lg:gap-16">
          <ScrollReveal>
            <h2 className="font-display text-fluid-h2 font-semibold text-balance">Creative philosophy</h2>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <p className="text-muted-foreground">
              Most fragrance marketing describes a formula after the fact —
              &ldquo;notes of bergamot and cedar&rdquo; tells you what&apos;s in the bottle,
              not what it&apos;s for. We work backward from a specific place
              instead, because place carries memory and mood in a way an
              ingredient list can&apos;t. It&apos;s a harder brief to write to, and a
              slower one — several formulas in this collection took the
              better part of a year to settle. We think the result is worth
              the extra time, and we&apos;d rather ship fewer, more considered
              fragrances than a wide catalog of adjacent options.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <section className="container py-16">
        <div className="grid gap-6 sm:grid-cols-3">
          {PROCESS_STEPS.map((item, index) => (
            <ScrollReveal key={item.step} delay={index * 0.1}>
              <p className="font-display text-4xl font-semibold text-primary">{item.step}</p>
              <h3 className="font-display mt-3 text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-secondary/40 py-16">
        <div className="container">
          <ScrollReveal>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Craftsmanship</p>
            <h2 className="font-display mt-3 max-w-xl text-fluid-h2 font-semibold text-balance">
              The same steel bench, the same steady hand, every batch.
            </h2>
          </ScrollReveal>
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <ScrollReveal delay={0.1}>
              <div className="relative aspect-[4/5] w-full overflow-hidden border border-border">
                <MeridianSweep
                  family="Woody"
                  src={ABOUT_CRAFTSMANSHIP_IMAGE}
                  alt="A gloved hand pipetting concentrate into a beaker on a steel workbench"
                  trigger="view"
                  sizes="(min-width: 1024px) 45vw, 100vw"
                />
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <div className="relative aspect-[16/9] w-full overflow-hidden border border-border lg:aspect-[4/5]">
                <video
                  className="h-full w-full object-cover"
                  src={ABOUT_PROCESS_VIDEO}
                  poster={ABOUT_CRAFTSMANSHIP_IMAGE}
                  autoPlay
                  muted
                  loop
                  playsInline
                  aria-label="A short process film: unstopping a tincture bottle, measuring a formula into a beaker"
                />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section className="border-y border-border py-24">
        <div className="container">
          <ScrollReveal className="mx-auto max-w-3xl text-center">
            <p className="font-display text-2xl font-semibold leading-snug text-balance sm:text-4xl">
              &ldquo;A brief like this is easier than an ingredient list, once you
              get past the discomfort of not having one.&rdquo;
            </p>
            <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-foreground/70">
              — Independent perfumer, on developing Amber Room
            </p>
          </ScrollReveal>
        </div>
      </section>

      <section className="container py-16">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
          <ScrollReveal>
            <h2 className="font-display text-fluid-h2 font-semibold text-balance">Ingredients &amp; sustainability</h2>
            <p className="mt-4 text-muted-foreground">
              Every product page lists exactly where the formula&apos;s key
              materials come from — a Grasse geranium grower, a direct-trade
              Madagascar vanilla cooperative, a plantation-grown oud
              supplier instead of wild-harvested Agarwood. We&apos;d rather name
              the specific tradeoff on each fragrance than make one blanket
              sustainability claim across a collection with genuinely
              different sourcing stories.
            </p>
            <p className="mt-4 text-muted-foreground">
              Bottles use 40% post-consumer recycled glass across the
              collection; cartons are FSC-certified stock printed with soy
              ink. None of this is presented as a finished, closed case —
              it&apos;s the current state of a supply chain we keep working on.
            </p>
            <Button asChild variant="outline" className="mt-6">
              <Link href="/products">See sourcing per fragrance</Link>
            </Button>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            {/* Plain <Image>, not MeridianSweep — this is the one asset in
                the manifest deliberately generated without the Meridian
                Cobalt accent ("materials-focused, not brand-focused"), so a
                family-color duotone treatment would fight its own brief. */}
            <div className="relative aspect-square w-full overflow-hidden border border-border">
              <Image
                src={ABOUT_SOURCING_IMAGE}
                alt="Dried iris rhizomes, labdanum resin, and tonka beans laid out for inspection"
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover"
              />
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
