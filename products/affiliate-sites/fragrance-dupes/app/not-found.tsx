import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-4 py-24 text-center">
      <span className="font-display text-fluid-h2">Nothing at this address.</span>
      <p className="max-w-[42ch] text-muted-foreground">
        The page you&apos;re looking for moved, or never existed. Try the dupe finder instead.
      </p>
      <Button asChild size="lg">
        <Link href="/dupe-finder">Find your dupe</Link>
      </Button>
    </div>
  );
}
