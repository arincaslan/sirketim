interface MarqueeProps {
  items: string[];
}

/** Auto-scrolling ticker strip — one of NOCTURNE's signature interaction
 * beats (see DESIGN.md). Duplicated content + `animate-marquee` (a 50%
 * translateX loop) creates a seamless infinite scroll; paused entirely
 * under `prefers-reduced-motion` via the CSS media query in globals.css. */
export function Marquee({ items }: MarqueeProps) {
  const content = [...items, ...items];

  return (
    <div className="overflow-hidden border-y border-border bg-primary py-3">
      <div
        className="animate-marquee flex w-max shrink-0 items-center gap-8 whitespace-nowrap"
        aria-hidden="true"
      >
        {content.map((item, index) => (
          <span
            key={index}
            className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-foreground"
          >
            {item} <span className="mx-8 opacity-50">&middot;</span>
          </span>
        ))}
      </div>
      <span className="sr-only">{items.join(", ")}</span>
    </div>
  );
}
