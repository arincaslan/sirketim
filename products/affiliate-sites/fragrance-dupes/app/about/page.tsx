import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Reveal } from "@/components/site/reveal";

export const metadata: Metadata = {
  title: "Our Standards",
  description:
    "How Drydown tests fragrances, calculates similarity scores, and keeps affiliate revenue from influencing a single rating.",
};

export default function AboutPage() {
  return (
    <div>
      <section className="border-b border-border">
        <div className="container grid gap-10 py-14 sm:py-16 lg:grid-cols-[1fr_0.8fr] lg:items-center">
          <div className="flex flex-col gap-5">
            <h1 className="max-w-[18ch] font-display text-fluid-h1">Our standards</h1>
            <p className="max-w-[56ch] text-lg text-muted-foreground">
              Every score on this site comes from a bottle we bought and a
              formula we&apos;re about to show you. Nothing here is ranked by
              who pays the highest commission.
            </p>
          </div>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-frame border border-border">
            <Image
              src="/generated/about-standards-atmosphere.png"
              alt="A fan of blotter strips beside an open notebook, used for side-by-side scent testing"
              fill
              sizes="(min-width: 1024px) 35vw, 90vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section id="methodology" className="border-b border-border">
        <div className="container max-w-3xl py-14 sm:py-16">
          <h2 className="font-display text-fluid-h2">How we calculate a match score</h2>
          <p className="mt-4 text-muted-foreground">
            The percentage shown on every comparison is not a vibe. It comes
            from three measured components, weighted and added together.
          </p>

          <div className="mt-8 flex flex-col gap-6">
            <ScoreComponent
              weight="50%"
              title="Note overlap"
              body="How much a fragrance's top, heart, and base notes overlap with the reference, weighted 20/35/45 toward the base. Base notes count most because they're the drydown, the part that lasts."
            />
            <ScoreComponent
              weight="35%"
              title="Facet closeness"
              body="The average difference across six rated facets (freshness, sweetness, warmth, woody depth, longevity, sillage), each scored 0 to 10."
            />
            <ScoreComponent
              weight="15%"
              title="Family match"
              body="Whether both fragrances share the same olfactive family (for example, Amber Woody or Chypre Floral)."
            />
          </div>

          <p className="mt-8 text-sm text-muted-foreground">
            Facet ratings are an editorial judgment made while wearing each
            fragrance side by side, not a lab measurement. We say so
            explicitly rather than dressing up an estimate as instrument
            data.
          </p>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="container max-w-3xl py-14 sm:py-16">
          <h2 className="font-display text-fluid-h2">Independence and revenue</h2>
          <Accordion type="single" collapsible className="mt-6">
            <AccordionItem value="revenue">
              <AccordionTrigger>How does Drydown make money?</AccordionTrigger>
              <AccordionContent>
                Through affiliate commissions when a reader buys through one
                of our links. It costs you nothing extra, and it never moves
                a product up or down our ranking.{" "}
                <Link href="/disclosure" className="underline underline-offset-2 hover:text-primary">
                  Read the full disclosure policy
                </Link>
                .
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="ranking">
              <AccordionTrigger>Can a brand pay for a better rank?</AccordionTrigger>
              <AccordionContent>
                No. Commission rate has no input into the similarity formula
                above. A dupe with a lower commission can rank above one with
                a higher commission if the notes and facets say so.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="updates">
              <AccordionTrigger>What happens when a formula changes?</AccordionTrigger>
              <AccordionContent>
                Fragrance houses reformulate without announcing it. When we
                notice a meaningful shift, we update the rating and note the
                change rather than leaving a stale score in place.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      <Reveal className="container max-w-3xl py-14 text-center sm:py-16">
        <p className="text-lg text-muted-foreground">
          Questions about a specific rating?{" "}
          <Link href="/library" className="text-primary underline underline-offset-2">
            Browse the library
          </Link>{" "}
          or start with the{" "}
          <Link href="/dupe-finder" className="text-primary underline underline-offset-2">
            dupe finder
          </Link>
          .
        </p>
      </Reveal>
    </div>
  );
}

function ScoreComponent({ weight, title, body }: { weight: string; title: string; body: string }) {
  return (
    <div className="flex gap-4 rounded-frame border border-border p-5">
      <span className="font-display text-2xl leading-none text-primary">{weight}</span>
      <div className="flex flex-col gap-1">
        <span className="font-semibold">{title}</span>
        <span className="text-sm text-muted-foreground">{body}</span>
      </div>
    </div>
  );
}
