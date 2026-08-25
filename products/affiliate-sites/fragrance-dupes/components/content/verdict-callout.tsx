import type { ReactNode } from "react";
import { Quotes } from "@phosphor-icons/react/dist/ssr";

/**
 * Typography polish pass (Implementation addendum v2): matches
 * comparison-detail.tsx's verdict treatment (display serif at pull-quote
 * scale, not small sans body text) so the same kind of moment - a human,
 * editorial conclusion - reads the same way whether it's inside the Dupe
 * Finder tool or a written article.
 */
export function VerdictCallout({ children }: { children: ReactNode }) {
  return (
    <div className="not-prose my-8 flex gap-4 rounded-frame border border-primary/30 bg-secondary/50 p-6 sm:p-8">
      <Quotes weight="fill" className="mt-1 h-5 w-5 shrink-0 text-primary" aria-hidden />
      <div className="font-display text-xl leading-relaxed text-foreground/90 sm:text-2xl [&>p]:m-0">
        {children}
      </div>
    </div>
  );
}
