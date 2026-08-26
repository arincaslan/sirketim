import type { Metadata } from "next";
import Link from "next/link";
import { LockSimple, Warning } from "@phosphor-icons/react/dist/ssr";
import { SubmissionForm } from "@/components/producers/submission-form";
import { buttonVariants } from "@/components/ui/button";
import { gateProducerAccess, isPreviewMode } from "@/lib/producer-session";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Submit a listing",
  description: "Submit a fragrance alternative for review.",
};

/**
 * The gated surface: only a signed-in producer with an account in good
 * standing may submit a listing.
 *
 * Rendered on the server and gated before the form is ever sent to the
 * client, rather than hidden with CSS or behind a client-side check - the
 * form and its data should not reach an unauthorised visitor at all.
 *
 * Signed-out and signed-in-but-unsubscribed are deliberately different
 * screens: one needs a sign-in link, the other needs a plan. Collapsing both
 * into one "access denied" makes for a dead end.
 */
export default async function SubmitPage() {
  const gate = await gateProducerAccess();

  if (!gate.allowed) {
    return (
      <div className="container py-14 sm:py-20">
        <div className="mx-auto flex max-w-[52ch] flex-col items-center gap-6 rounded-frame border border-border bg-card p-8 text-center sm:p-10">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
            <LockSimple weight="fill" className="h-5 w-5 text-primary" aria-hidden />
          </span>

          {gate.reason === "signed-out" ? (
            <>
              <div className="flex flex-col gap-2">
                <h1 className="font-display text-2xl">Sign in to submit a listing</h1>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Listings are submitted from a producer account, so we know who is making the
                  claim and can come back to you about it.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                <Link href="/producers/login" className={buttonVariants({ variant: "default" })}>
                  Sign in
                </Link>
                <Link href="/producers/pricing" className={buttonVariants({ variant: "outline" })}>
                  See the plans
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-2">
                <h1 className="font-display text-2xl">Choose a plan to start listing</h1>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Your account does not have an active plan. The free tier covers two listings and
                  does not need a card.
                </p>
              </div>
              <Link href="/producers/pricing" className={buttonVariants({ variant: "default" })}>
                See the plans
              </Link>
            </>
          )}

          <p className="text-xs leading-relaxed text-muted-foreground">
            The producer program has not launched yet, so there is no way to sign in at the
            moment. Nothing behind this page is live.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-14 sm:py-16">
      {isPreviewMode() && (
        <div className="mx-auto mb-8 flex max-w-[68ch] gap-3 rounded-frame border border-destructive/50 bg-destructive/10 p-4">
          <Warning weight="fill" className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden />
          <p className="text-sm leading-relaxed text-foreground/85">
            <strong className="font-semibold">Local preview session.</strong> You are seeing this
            page through the development-only preview bypass (<code>PRODUCER_PREVIEW=1</code>), not
            a real signed-in account. It cannot be enabled in a production build.
          </p>
        </div>
      )}

      <div className="mx-auto mb-10 flex max-w-[68ch] flex-col gap-3">
        <h1 className="font-display text-fluid-h2">Submit a listing</h1>
        <p className="text-muted-foreground">
          Signed in as{" "}
          <span className="font-semibold text-foreground/85">{gate.session.producer.name}</span>
          {gate.session.subscription && (
            <>
              {" "}
              on the{" "}
              <span className={cn("font-semibold capitalize text-foreground/85")}>
                {gate.session.subscription.tier}
              </span>{" "}
              plan.
            </>
          )}{" "}
          We score your product against the original from the notes and wear you declare. Until we
          verify those independently, your listing shows as{" "}
          <span className="font-semibold text-foreground/80">producer declared</span> and its match
          score is capped.
        </p>
      </div>

      <div className="mx-auto max-w-[68ch] rounded-frame border border-border bg-card p-6 sm:p-8">
        <SubmissionForm />
      </div>
    </div>
  );
}
