import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-40 -z-10 flex justify-center blur-3xl"
      >
        <div className="h-[420px] w-[420px] rounded-full bg-primary/20" />
      </div>

      <div className="container flex flex-col items-center text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5 text-xs font-medium text-muted-foreground">
          <Star className="h-3.5 w-3.5 fill-primary text-primary" />
          Trusted by 40+ small businesses and startups
        </div>

        <h1 className="max-w-3xl text-balance text-4xl font-bold tracking-tight sm:text-6xl">
          We design and build brands that{" "}
          <span className="text-primary">actually grow</span>
        </h1>

        <p className="mt-6 max-w-xl text-balance text-lg text-muted-foreground">
          A full-service studio for branding, web design, and digital
          strategy. Replace this copy with your own agency&apos;s pitch — the
          layout does the heavy lifting.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="#contact">
              Get a proposal
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="#work">See our work</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
