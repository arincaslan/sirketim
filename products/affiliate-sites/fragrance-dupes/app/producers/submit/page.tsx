import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { PRODUCER_CONSOLE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Submit a listing",
  description: "Submitting a listing has moved to producers.counterscent.com.",
};

/**
 * SUBMISSION HAS MOVED OFF THIS SITE. This page is the hand-off that keeps
 * the URL alive. Same reasoning as ../login/page.tsx.
 *
 * What was here: a server-side gate (`gateProducerAccess()` in
 * lib/producer-session.ts) in front of `components/producers/
 * submission-form.tsx`. The gate was honest - it always returned signed-out,
 * because there is no session - but the surface belongs on the origin that
 * will actually have one. Both modules are left in place and unreferenced;
 * the form in particular is the specification the console's submit screen
 * gets built from, including the facet sliders that were deliberately
 * removed from it (PRODUCER-TERMS §4: we derive the profile scores, because
 * the copy-detection check compares a producer's notes against them and
 * only works while we author one side).
 *
 * ONE CONSEQUENCE WORTH KNOWING. lib/producer-session.ts now has no call
 * sites, which also means `PRODUCER_PREVIEW=1` has nothing to preview. That
 * file carries a `TODO(auth)` that HANDOFF.md lists under "What must NOT be
 * built" - implementing `auth()` there breaks the static export at deploy
 * time rather than at review time. An unreferenced module with a dangerous
 * invitation in it should be narrowed or removed, but lib/ was owned by
 * another session when this landed, so it is flagged rather than changed.
 */
export default function SubmitPage() {
  return (
    <div className="container py-14 sm:py-20">
      <div className="mx-auto flex max-w-[52ch] flex-col gap-6">
        <div className="flex flex-col gap-3">
          <h1 className="font-display text-fluid-h2">Submitting has moved</h1>
          <p className="text-muted-foreground">
            Listings are submitted from the producer console at{" "}
            <span className="font-semibold text-foreground/85">producers.counterscent.com</span>
            , which is a separate application with its own accounts. This site is the
            public catalogue and cannot accept a submission.
          </p>
        </div>

        <div className="rounded-frame border border-dashed border-border p-6">
          <h2 className="font-display text-lg">Nothing can be submitted yet, there either</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            There are no producer accounts and no way to store a submission. The console
            shows the submission screen and the listing states it moves through, with
            every field disabled and the reason given. Nothing you type anywhere on this
            site or that one is kept.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <a
            href={`${PRODUCER_CONSOLE}/console`}
            className={buttonVariants({ variant: "default" })}
          >
            Open the producer console
          </a>
          <Link href="/producers" className={buttonVariants({ variant: "outline" })}>
            What we ask for
          </Link>
        </div>

        <p className="text-sm text-muted-foreground">
          Before you write anything: we score a listing against an original already in our
          catalogue, using a{" "}
          <Link
            href="/about#methodology"
            className="underline underline-offset-2 hover:text-primary"
          >
            published formula
          </Link>
          , and we write the comparison ourselves. Neither is negotiable and no plan
          changes either.
        </p>
      </div>
    </div>
  );
}
