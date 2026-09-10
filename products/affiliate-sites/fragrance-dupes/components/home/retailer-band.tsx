import Link from "next/link";
import { getLiveMerchants } from "@/lib/merchants";

/**
 * The retailers we earn a commission from, as a slow continuous band.
 *
 * WHAT THIS IS NOT, AND THE HEADING IS DOING THE WORK. This is not a partners,
 * sponsors or "as featured in" strip. No such relationship exists: these
 * companies have not reviewed, approved or endorsed anything here, and several
 * of them sell products this site rates against each other. A band under a word
 * like "Partners" would assert an association we do not have, so the heading
 * says exactly what the relationship is - we send them traffic, they pay a
 * commission.
 *
 * THE NAME STAYS ABOVE THE MARK, and that ordering is not decoration. This
 * section's job is to DISCLOSE who pays us, which a logo alone does not do -
 * AromaPassions' mark is a lowercase "a" in a circle and names nobody. So the
 * name is the disclosure and the mark is recognition, in that order. Four of
 * the five marks are wordmarks, so the name does appear twice for those; that
 * redundancy is the accepted cost of the mark never being the only thing
 * carrying the disclosure. Dropping the names to fix it would break the point
 * of the section.
 *
 * Marks are painted in the surrounding text colour through a CSS mask, so they
 * read on both themes without being inverted or set on a white plate. Where
 * they came from, and why they are self-hosted rather than hot-linked from the
 * networks' impression-tracking creative URLs: lib/merchants.ts.
 *
 * Framed that way it is not decoration but disclosure, which is what lets it
 * sit on the home page of a site that brands itself independent: the strongest
 * version of "we are independent" is naming who pays us, in public, unprompted.
 *
 * The list comes from `getLiveMerchants()`, i.e. from links that actually
 * resolve - never a hand-typed list, which would keep advertising a programme
 * after it closed. See lib/merchants.ts.
 *
 * REDUCED MOTION IS NOT COVERED BY THE GLOBAL RULE HERE. app/globals.css sets
 * `animation-iteration-count: 1` and a ~0ms duration under
 * `prefers-reduced-motion`, which for a looping marquee means it completes
 * instantly and parks the track at -50% - half the names shoved off-screen and
 * no motion to explain why. So `.marquee-track` gets its own reduced-motion
 * rule in globals.css that kills the animation AND resets the transform, and
 * the track wraps instead. Verify by toggling the OS setting, not by trusting
 * the global reset.
 */
export function RetailerBand() {
  const merchants = getLiveMerchants();
  if (merchants.length === 0) return null;

  return (
    <section aria-labelledby="retailer-band-heading">
      <div className="container pb-20 pt-4 sm:pb-24">
        <div className="flex flex-col gap-6 overflow-hidden rounded-frame border border-border bg-card/60 py-8">
          <div className="flex flex-col gap-1.5 px-6 sm:px-8">
            <h2
              id="retailer-band-heading"
              className="font-display text-sm uppercase tracking-[0.14em] text-muted-foreground"
            >
              We earn a commission from these retailers
            </h2>
            <p className="max-w-[64ch] text-sm text-muted-foreground">
              They are not partners or sponsors, and none of them has reviewed anything on
              this site. Which retailer stocks a bottle has no effect on its match score.{" "}
              <Link href="/disclosure" className="text-primary underline underline-offset-4">
                How this works
              </Link>
            </p>
          </div>

          {/* Fades both ends so names enter and leave rather than being clipped
              mid-letter at the edge. */}
          <div className="marquee-mask overflow-hidden">
            <div className="marquee-track flex w-max">
              <RetailerRun merchants={merchants} />
              {/* The second run is what makes the loop seamless: the track
                  translates by exactly -50%, so run two lands where run one
                  started. Hidden from the accessibility tree so a screen reader
                  hears each retailer once - and hidden from SIGHT too under
                  reduced motion, where there is no loop for it to serve and it
                  would otherwise print every retailer twice. That is not
                  hypothetical: it shipped that way until a reduced-motion
                  screenshot caught it. */}
              <RetailerRun merchants={merchants} aria-hidden className="marquee-dup" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function RetailerRun({
  merchants,
  className,
  ...rest
}: {
  merchants: ReturnType<typeof getLiveMerchants>;
} & React.HTMLAttributes<HTMLUListElement>) {
  return (
    <ul
      className={`flex shrink-0 items-center gap-10 pr-10 sm:gap-14 sm:pr-14${
        className ? ` ${className}` : ""
      }`}
      {...rest}
    >
      {merchants.map((m) => (
        <li key={m.id} className="flex shrink-0 flex-col items-center gap-2.5 text-foreground/70">
          <span className="whitespace-nowrap font-display text-xl leading-none sm:text-2xl">
            {m.name}
          </span>
          {/* Decorative: the name above already says who this is, so the mark
              is hidden from the accessibility tree rather than announced a
              second time. */}
          <span
            aria-hidden
            className="retailer-mark"
            style={
              {
                width: m.logo.w,
                height: m.logo.h,
                "--retailer-mark": `url("${m.logo.src}")`,
              } as React.CSSProperties
            }
          />
        </li>
      ))}
    </ul>
  );
}
