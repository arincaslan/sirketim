"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContentCard } from "@/components/content/content-card";
import type { ContentPiece } from "@/content/loader";
import type { ContentType } from "@/content/schema";

/**
 * Tabs are derived from what has actually been published, not from the three
 * types the schema allows.
 *
 * The hardcoded version showed "Comparisons (0)" and "Reviews (0)" permanently,
 * because neither type can be written until an affiliate programme is enrolled
 * - content/schema.ts requires a real affiliateLinkId on both - and their
 * routes were deleted in the static-export migration. Two dead tabs on the
 * library page advertised an empty catalog to every visitor and every affiliate
 * reviewer, which is the opposite of what the page is for.
 *
 * Deriving them means the tabs reappear on their own when the first comparison
 * or review lands, with no code change. content/loader.ts separately refuses to
 * build if a piece's route is missing, so a tab can never link to a 404.
 */
const TAB_LABELS: Record<ContentType, string> = {
  guide: "Guides",
  comparison: "Comparisons",
  review: "Reviews",
};

// Fixed order so tabs don't reshuffle as the catalog grows.
const TAB_ORDER: ContentType[] = ["guide", "comparison", "review"];

export function LibraryTabs({ pieces }: { pieces: ContentPiece[] }) {
  const populated = TAB_ORDER.map((type) => ({
    type,
    label: TAB_LABELS[type],
    pieces: pieces.filter((p) => p.frontmatter.contentType === type),
  })).filter((group) => group.pieces.length > 0);

  const grid = (items: ContentPiece[]) => (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((piece) => (
        <ContentCard key={piece.frontmatter.slug} frontmatter={piece.frontmatter} />
      ))}
    </div>
  );

  if (pieces.length === 0) {
    return <p className="py-12 text-center text-muted-foreground">Nothing here yet.</p>;
  }

  // One type published means the tab strip is pure decoration - it would offer
  // "All" and one identical alternative.
  if (populated.length === 1) return grid(pieces);

  return (
    <Tabs defaultValue="all">
      <TabsList>
        <TabsTrigger value="all">All ({pieces.length})</TabsTrigger>
        {populated.map((group) => (
          <TabsTrigger key={group.type} value={group.type}>
            {group.label} ({group.pieces.length})
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="all">{grid(pieces)}</TabsContent>
      {populated.map((group) => (
        <TabsContent key={group.type} value={group.type}>
          {grid(group.pieces)}
        </TabsContent>
      ))}
    </Tabs>
  );
}
