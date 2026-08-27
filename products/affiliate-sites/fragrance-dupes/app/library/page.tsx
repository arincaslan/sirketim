import type { Metadata } from "next";
import { LibraryTabs } from "@/components/library/library-tabs";
import { getAllContent } from "@/content/loader";

export const metadata: Metadata = {
  title: "Library",
  description: "Every guide, comparison, and review published on Counterscent.",
};

export default function LibraryPage() {
  const pieces = getAllContent();

  return (
    <div className="container py-14 sm:py-16">
      <div className="mb-10 flex flex-col gap-4">
        <h1 className="font-display text-fluid-h1">Library</h1>
        <p className="max-w-[60ch] text-lg text-muted-foreground">
          Every guide, comparison, and review we&apos;ve published, in one place.
        </p>
      </div>

      <LibraryTabs pieces={pieces} />
    </div>
  );
}
