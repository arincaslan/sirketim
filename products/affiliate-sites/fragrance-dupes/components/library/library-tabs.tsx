"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContentCard } from "@/components/content/content-card";
import type { ContentPiece } from "@/content/loader";

export function LibraryTabs({ pieces }: { pieces: ContentPiece[] }) {
  const groups = {
    all: pieces,
    guide: pieces.filter((p) => p.frontmatter.contentType === "guide"),
    comparison: pieces.filter((p) => p.frontmatter.contentType === "comparison"),
    review: pieces.filter((p) => p.frontmatter.contentType === "review"),
  };

  return (
    <Tabs defaultValue="all">
      <TabsList>
        <TabsTrigger value="all">All ({groups.all.length})</TabsTrigger>
        <TabsTrigger value="guide">Guides ({groups.guide.length})</TabsTrigger>
        <TabsTrigger value="comparison">Comparisons ({groups.comparison.length})</TabsTrigger>
        <TabsTrigger value="review">Reviews ({groups.review.length})</TabsTrigger>
      </TabsList>

      {(Object.keys(groups) as (keyof typeof groups)[]).map((key) => (
        <TabsContent key={key} value={key}>
          {groups[key].length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">Nothing here yet.</p>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {groups[key].map((piece) => (
                <ContentCard key={piece.frontmatter.slug} frontmatter={piece.frontmatter} />
              ))}
            </div>
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}
