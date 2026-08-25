import type { Metadata } from "next";
import { DupeFinder } from "@/components/dupe-finder/dupe-finder";
import { REFERENCES } from "@/lib/dupes-data";

export const metadata: Metadata = {
  title: "Dupe Finder",
  description:
    "Pick a designer fragrance and see ranked dupe candidates with a visual note comparison, a grouped spec panel, and an honest verdict.",
};

export default function DupeFinderPage({
  searchParams,
}: {
  searchParams: { ref?: string };
}) {
  const initialReferenceSlug = REFERENCES.find((r) => r.slug === searchParams.ref)?.slug;

  return (
    <div className="container py-14 sm:py-16">
      <div className="mb-10 flex flex-col gap-4">
        <h1 className="max-w-[20ch] font-display text-fluid-h1">The Dupe Finder</h1>
        <p className="max-w-[62ch] text-lg text-muted-foreground">
          Pick a fragrance you already know. We rank every candidate we have
          data on, from a formula we publish, then show you exactly where
          each one matches and where it doesn&apos;t.
        </p>
      </div>

      <DupeFinder initialReferenceSlug={initialReferenceSlug} />
    </div>
  );
}
