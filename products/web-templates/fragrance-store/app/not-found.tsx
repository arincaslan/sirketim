import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container flex flex-col items-center justify-center gap-4 py-32 text-center">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-gold">
        404
      </p>
      <h1 className="font-serif text-3xl">We couldn&apos;t find that page.</h1>
      <p className="max-w-sm text-muted-foreground">
        The fragrance or page you&apos;re looking for may have moved.
      </p>
      <Button asChild size="lg">
        <Link href="/products">Back to the collection</Link>
      </Button>
    </div>
  );
}
