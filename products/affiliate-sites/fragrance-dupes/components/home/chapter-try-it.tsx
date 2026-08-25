import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/site/reveal";
import { AtmosphereVideo } from "@/components/home/atmosphere-video";

/**
 * Chapter 4: the moment that leads into /dupe-finder itself - the second
 * and last video on the homepage (see DESIGN.md's Implementation addendum
 * v2 for why it earns its place: this is the single pivot where the
 * editorial narrative hands off to the interactive tool, the same job
 * video does at a chapter break on the reference site). The clip shows two
 * streams, warm gold and cool green, meeting and swirling without fully
 * mixing - the same Reference/Dupe colors the radar chart and the whole
 * site's chart palette use (see DESIGN.md §3), so the video is quite
 * literally showing the comparison this site is built around, not a mood
 * shot picked for looks alone.
 *
 * Replaces the old featured-comparison.tsx (which promoted one specific
 * article via a photo band) with a chapter that promotes the tool itself -
 * real content pieces get their moment in library-proof.tsx instead.
 */
export function ChapterTryIt() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="relative min-h-[480px] w-full sm:min-h-[560px]">
        <AtmosphereVideo
          src="/generated/chapter-try-it-loop.mp4"
          poster="/generated/dupe-comparison-1-support.png"
          alt=""
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/10"
        />

        <Reveal className="container relative flex min-h-[480px] flex-col justify-end gap-4 py-16 sm:min-h-[560px]">
          <h2 className="max-w-[20ch] font-display text-fluid-h2">
            Pick a fragrance. Watch it get matched.
          </h2>
          <p className="max-w-[48ch] text-lg text-muted-foreground">
            Six references, a dozen ranked candidates, and a radar chart
            that shows exactly where each one lines up.
          </p>
          <Button asChild size="lg" data-cursor="view" className="mt-2 w-fit">
            <Link href="/dupe-finder">
              Find your dupe
              <ArrowRight className="ml-1 h-4 w-4" aria-hidden />
            </Link>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
