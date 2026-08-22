"use client";

import { useMemo, useState } from "react";

import { JournalCard } from "@/components/journal/journal-card";
import { cn } from "@/lib/utils";
import { JOURNAL_CATEGORIES, getAllJournalPosts, getFeaturedJournalPost } from "@/lib/journal";
import type { JournalPost } from "@/lib/types";

export function JournalGrid() {
  const [category, setCategory] = useState<JournalPost["category"] | "All">("All");
  const posts = useMemo(() => getAllJournalPosts(), []);
  const featured = getFeaturedJournalPost();

  const filtered = useMemo(
    () => (category === "All" ? posts : posts.filter((post) => post.category === category)),
    [posts, category]
  );

  return (
    <div className="container py-14">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Journal</p>
        <h1 className="font-display mt-3 text-fluid-h1 font-semibold text-balance">
          Scent culture, ingredients, and the people who make this collection.
        </h1>
      </div>

      <div className="mt-12">
        <JournalCard post={featured} large />
      </div>

      <div className="mt-14 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        {(["All", ...JOURNAL_CATEGORIES] as const).map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={category === option}
            onClick={() => setCategory(option)}
            className={cn(
              "min-h-[2.5rem] rounded-pill border px-4 text-sm font-medium transition-colors",
              category === option
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-transparent hover:border-foreground/40"
            )}
          >
            {option}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {filtered
          .filter((post) => post.slug !== featured.slug)
          .map((post, index) => (
            <JournalCard key={post.slug} post={post} index={index} />
          ))}
      </div>

      {filtered.filter((post) => post.slug !== featured.slug).length === 0 && (
        <p className="mt-10 text-sm text-muted-foreground">No stories in this category yet.</p>
      )}
    </div>
  );
}
