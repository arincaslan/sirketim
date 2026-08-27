import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle, XCircle } from "@phosphor-icons/react/dist/ssr";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "List your fragrance",
  description:
    "How producers list an alternative on Parfumoza: what we ask for, what a subscription does and does not buy, and how listings are reviewed.",
};

/**
 * The producer-facing entry point (PRODUCER-PROGRAM.md §1/§4).
 *
 * The "what a subscription does not buy" block is not modesty - it is the
 * actual product argument. This audience has been burned by pay-to-rank
 * directories, so the fact that rank cannot be bought here is the reason a
 * listing is worth having. See PRODUCER-PROGRAM.md §7.
 */
export default function ProducersPage() {
  return (
    <div className="container py-14 sm:py-16">
      <div className="mb-12 flex max-w-[68ch] flex-col gap-6">
        <div className="flex flex-col gap-4">
          <h1 className="font-display text-fluid-h1">List your fragrance</h1>
          <p className="text-lg text-muted-foreground">
            Parfumoza puts your bottle in front of someone who has already named the expensive
            fragrance they want and is actively looking for an alternative. That is a much later
            moment in the decision than an ad reaches.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/producers/pricing" className={buttonVariants({ variant: "default" })}>
            See plans and pricing
          </Link>
          <Link href="/producers/login" className={buttonVariants({ variant: "outline" })}>
            Producer sign in
          </Link>
        </div>
      </div>

      <div className="mb-14 grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-4 rounded-frame border border-border bg-card p-6">
          <h2 className="font-display text-xl">What a listing buys</h2>
          <ul className="flex flex-col gap-3">
            {[
              "A place in the ranked comparison for that original",
              "Your own producer page, with everything you list",
              "Click data: which originals actually send you traffic",
              "The ability to reply to customer reviews",
            ].map((item) => (
              <li key={item} className="flex gap-2.5 text-sm text-foreground/85">
                <CheckCircle weight="fill" className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-4 rounded-frame border border-border bg-card p-6">
          <h2 className="font-display text-xl">What it does not buy</h2>
          <ul className="flex flex-col gap-3">
            {[
              "A better match score",
              "A higher rank, at any tier",
              "A premium or featured slot in results",
              "Removal of a customer review you dislike",
            ].map((item) => (
              <li key={item} className="flex gap-2.5 text-sm text-foreground/85">
                <XCircle weight="fill" className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            The ranking formula is published in full on our{" "}
            <Link href="/about#methodology" className="underline underline-offset-2 hover:text-primary">
              methodology page
            </Link>
            . It takes no input related to whether you pay us. Our own line is ranked by it too,
            and it does not get floated to the top.
          </p>
        </div>
      </div>

      <div className="max-w-[68ch] rounded-frame border border-border bg-card p-6 sm:p-8">
        <h2 className="font-display text-2xl">How a listing gets published</h2>
        <ol className="mt-6 flex flex-col gap-5">
          {[
            {
              title: "Pick the original and describe your product",
              body: "You choose from our catalog of originals, then declare your own note pyramid, how it wears, and — required — what genuinely differs from the original.",
            },
            {
              title: "We score it against our standard",
              body: "We compute the match from what you declared. A submission that simply restates the original's own notes is held for manual review and does not publish.",
            },
            {
              title: "We review it",
              body: "Within 3 business days. We check the notes are plausible, the link resolves to your product, and the imagery does not copy the original's bottle.",
            },
            {
              title: "It goes live as producer declared",
              body: "Your listing appears in the ranked comparison with its match score capped until we verify your data independently. Verification lifts the cap; paying us never does.",
            },
          ].map((step, i) => (
            <li key={step.title} className="flex gap-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary font-display text-sm text-foreground/80">
                {i + 1}
              </span>
              <span className="flex flex-col gap-1">
                <span className="font-semibold">{step.title}</span>
                <span className="text-sm leading-relaxed text-muted-foreground">{step.body}</span>
              </span>
            </li>
          ))}
        </ol>

        <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-border/70 pt-6">
          <Link href="/producers/submit" className={buttonVariants({ variant: "default" })}>
            Submit a listing
          </Link>
          <span className="text-xs text-muted-foreground">
            Requires a producer account. The free tier covers two listings.
          </span>
        </div>
      </div>
    </div>
  );
}
