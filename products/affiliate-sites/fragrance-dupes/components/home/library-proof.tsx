import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { ContentCard } from "@/components/content/content-card";
import { Reveal } from "@/components/site/reveal";
import type { ContentPiece } from "@/content/loader";

/**
 * Closing proof: real editorial output, not just the tool. Evolved from the
 * old latest-library.tsx - same content and same "View all" link into
 * /library, restyled to read as the quiet tail of the narrative rather than
 * another bordered block (no border-b of its own; the footer's existing
 * border-t is the page's last divider).
 */
export function LibraryProof({ pieces }: { pieces: ContentPiece[] }) {
  if (pieces.length === 0) return null;

  return (
    <section>
      <div className="container py-20 sm:py-24">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-fluid-h2">From the library</h2>
          <Link
            href="/library"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {pieces.map((piece, i) => (
            <Reveal key={piece.frontmatter.slug} delay={i * 0.06}>
              <ContentCard frontmatter={piece.frontmatter} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
