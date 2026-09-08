import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Reveal } from "@/components/site/reveal";

export const metadata: Metadata = {
  title: "Our Standards",
  description:
    "How Counterscent tests fragrances, calculates similarity scores, and keeps affiliate revenue from influencing a single rating.",
};

export default function AboutPage() {
  return (
    <div>
      <section className="border-b border-border">
        <div className="container grid gap-10 py-14 sm:py-16 lg:grid-cols-[1fr_0.8fr] lg:items-center">
          <div className="flex flex-col gap-5">
            <h1 className="max-w-[18ch] font-display text-fluid-h1">Our standards</h1>
            <p className="max-w-[56ch] text-lg text-muted-foreground">
              Every score on this site comes from a formula we&apos;re about to
              show you, applied the same way to every bottle. Nothing here is
              ranked by who pays the highest commission.
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
            from up to four measured components, weighted and added together.
            The fourth only counts when both the original and the alternative
            have a published ingredient list; when either doesn&apos;t, the
            first three carry their full original weight (50/35/15) rather
            than the missing list being scored as a mismatch.
          </p>

          <div className="mt-8 flex flex-col gap-6">
            <ScoreComponent
              weight="40%"
              title="Note overlap"
              body="How much a fragrance's top, heart, and base notes overlap with the reference, weighted 20/35/45 toward the base. Base notes count most because they're the drydown, the part that lasts. Carries 50% where no ingredient comparison is possible."
            />
            <ScoreComponent
              weight="30%"
              title="Facet closeness"
              body="The average difference across six rated facets (freshness, sweetness, warmth, woody depth, longevity, sillage), each scored 0 to 10. Carries 35% where no ingredient comparison is possible."
            />
            <ScoreComponent
              weight="15%"
              title="Family match"
              body="Whether both fragrances share the same olfactive family (for example, Amber Woody or Chypre Floral). Full credit when they match, partial credit when they don't — a cross-family alternative is still a comparison worth making, it just isn't the same kind of scent."
            />
            <ScoreComponent
              weight="15%"
              title="Ingredient overlap"
              body="Published ingredient (INCI) lists, compared as one flat list rather than split into top, heart and base — an ingredient list isn't ordered by when you smell it. Inactive unless both sides publish one, and today no listing does, so it currently affects no published score."
            />
          </div>

          <p className="mt-8 text-sm text-muted-foreground">
            Facet ratings are an editorial judgment, not a lab measurement. We
            say so explicitly rather than dressing up an estimate as
            instrument data.
          </p>

          <p className="mt-4 text-sm text-muted-foreground">
            <strong className="font-semibold text-foreground/85">
              No score can publish above 95%, whatever the calculation returns.
            </strong>{" "}
            Two fragrances can share every declared note and still not contain
            those materials in the same proportions — a note list says what
            went in, never how much — so a formula built on declared notes
            cannot certify that two bottles smell identical, and our number
            should not pretend otherwise. Separately, where a seller publishes
            only a flat note list and we had to decide ourselves which notes
            are top, heart and base, 10 points are subtracted before that
            ceiling applies: our own split can be arranged to flatter a score
            in a way a seller&apos;s own published pyramid cannot.
          </p>

          <h3 className="mt-12 font-display text-2xl">Where the data comes from</h3>
          <p className="mt-4 text-muted-foreground">
            A match score is only as good as what goes into it, so it matters
            who supplied the notes and ratings being compared. Producers who
            list an alternative here declare their own. That is normal, and it
            is also the obvious place for a listing to flatter itself, so we
            treat it as a claim rather than a fact.
          </p>

          <div className="mt-8 flex flex-col gap-6">
            <ScoreComponent
              weight="Declared"
              title="Producer declared"
              body="The notes and facet ratings came from the producer and we have not checked them independently yet. These listings show a 'producer declared' badge, and their match score is capped at 90%, however high the raw calculation runs."
            />
            <ScoreComponent
              weight="Verified"
              title="Editorially verified"
              body="We have checked the declared data against independent sources. That lifts the 90% cap, but not the 95% ceiling above — verification tells you the declared data is real, not that two formulations are identical. Verification is never granted by paying us."
            />
            <ScoreComponent
              weight="Held"
              title="Flagged, not published"
              body="If a submission's notes and facet ratings are simply the original's own, restated, we hold it for manual review and it does not appear in comparisons at all. Copying the reference is not evidence of a close match, and our formula on its own cannot tell the two apart."
            />
            <ScoreComponent
              weight="Founder"
              title="Founder's personal assessment"
              body="The one exception to the 95% ceiling: our founder has worn both and states a figure personally, with the reason written on the listing. It is a named human opinion, not an independent check and not a measurement — which is exactly why it carries its own badge instead of borrowing the 'verified' one. It can never be applied to our own fragrance line, and it cannot rescue a listing flagged above. No listing currently uses it."
            />
          </div>

          <p className="mt-8 text-sm text-muted-foreground">
            This applies to our own fragrance line exactly as it applies to
            everyone else&apos;s.
          </p>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="container max-w-3xl py-14 sm:py-16">
          <h2 className="font-display text-fluid-h2">Independence and revenue</h2>
          <Accordion type="single" collapsible className="mt-6">
            <AccordionItem value="revenue">
              <AccordionTrigger>How does Counterscent make money?</AccordionTrigger>
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
