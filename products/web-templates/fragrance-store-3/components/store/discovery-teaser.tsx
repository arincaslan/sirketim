import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/store/scroll-reveal";

const PREVIEW_AXES = ["Mood", "Notes", "Intensity", "Occasion", "Season", "Style"];

export function DiscoveryTeaser() {
  return (
    <section className="border-y border-border bg-foreground py-16 text-background">
      <div className="container">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <Compass className="mx-auto h-8 w-8 text-primary" aria-hidden="true" />
          <h2 className="font-display mt-4 text-fluid-h2 font-semibold text-balance">Not sure where to start?</h2>
          <p className="mt-4 text-background/70">
            Six short questions — mood, notes, intensity, occasion, season,
            style — and a curated recommendation at the end. Feels like a
            consultation, not a clinical quiz.
          </p>

          <ul className="mt-6 flex flex-wrap justify-center gap-2">
            {PREVIEW_AXES.map((axis) => (
              <li
                key={axis}
                className="rounded-pill border border-background/25 px-3 py-1.5 text-xs uppercase tracking-wide text-background/80"
              >
                {axis}
              </li>
            ))}
          </ul>

          <Button asChild size="lg" className="mt-8">
            <Link href="/discover">
              Find your scent <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </ScrollReveal>
      </div>
    </section>
  );
}
