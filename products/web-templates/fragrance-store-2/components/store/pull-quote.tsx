export function PullQuote() {
  return (
    <section className="border-b border-border py-20">
      <div className="container grid gap-10 md:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            The ritual
          </p>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            Nocturne started as a rejection of the forty-note pyramid — the
            idea that more notes make a better fragrance. Every scent here
            is built around one idea, worn once the sun is down.
          </p>
        </div>
        <blockquote className="font-display text-balance text-fluid-h1 font-medium leading-[1.05]">
          &ldquo;A fragrance should announce itself once,{" "}
          <span className="text-primary">not explain itself all night.</span>&rdquo;
        </blockquote>
      </div>
    </section>
  );
}
