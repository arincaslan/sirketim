import Link from "next/link";
import { Compass } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * No asset exists for a 404 (nor should one need to be generated for it —
 * see asset-manifest.json, which has nothing named "404"). Uses a compass
 * icon instead of a photograph, which fits the brand's own cartographic
 * motif ("a meridian is a line used to locate a place on a map") better
 * than inventing a stock image for a page that's explicitly about a place
 * that doesn't exist.
 */
export default function NotFound() {
  return (
    <div className="container flex flex-col items-center justify-center gap-6 py-32 text-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-pill bg-secondary">
        <Compass className="h-9 w-9 text-primary" aria-hidden="true" />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">404</p>
        <h1 className="font-display mt-3 text-fluid-h1 font-semibold">This place doesn&apos;t exist yet.</h1>
        <p className="mt-3 max-w-sm text-muted-foreground">
          The page you&apos;re looking for isn&apos;t part of the collection. Try the full catalog instead.
        </p>
      </div>
      <Button asChild size="lg">
        <Link href="/products">Shop fragrances</Link>
      </Button>
    </div>
  );
}
