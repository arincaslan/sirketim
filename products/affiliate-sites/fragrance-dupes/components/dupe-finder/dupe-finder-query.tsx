"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { DupeFinder } from "@/components/dupe-finder/dupe-finder";
import { REFERENCES } from "@/lib/dupes-data";

/**
 * Reads `?ref=<slug>` on the client and seeds the Dupe Finder with it.
 *
 * This used to be done on the server, from `searchParams.ref` in
 * app/dupe-finder/page.tsx. That is a dynamic-rendering feature and cannot
 * exist in a static export - it was the last thing blocking `output: "export"`
 * (Next: "Route /dupe-finder/ with `dynamic = "error"` couldn't be rendered
 * statically because it used `searchParams.ref`").
 *
 * Nothing is lost: /fragrance/[slug] links here with ?ref=, and those links
 * still work. The behaviour difference is that the served HTML now shows the
 * default reference and the ?ref= one is applied on hydration, so there is a
 * brief flash on a cold load. That is invisible to a crawler, which sees the
 * static HTML either way, and the deep links themselves are unaffected.
 *
 * useSearchParams() must sit inside a Suspense boundary or Next refuses to
 * statically render the page at all. The fallback renders the same component
 * with no seed, so the boundary is not visible as a loading state.
 */
function DupeFinderFromQuery() {
  const params = useSearchParams();
  const requested = params.get("ref") ?? undefined;
  // Resolve against the real catalog rather than trusting the query string -
  // an unknown slug falls back to the default instead of rendering nothing.
  const initialReferenceSlug = REFERENCES.find((r) => r.slug === requested)?.slug;

  return <DupeFinder initialReferenceSlug={initialReferenceSlug} />;
}

export function DupeFinderWithQuery() {
  return (
    <Suspense fallback={<DupeFinder />}>
      <DupeFinderFromQuery />
    </Suspense>
  );
}
