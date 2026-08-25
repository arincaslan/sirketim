import Link from "next/link";
import { Info } from "@phosphor-icons/react/dist/ssr";

/**
 * FTC affiliate-disclosure block. Rendered whenever a content piece's
 * frontmatter `disclosure` field is true (default) - see the shared kit's
 * content/schema.ts. Not optional boilerplate: every piece that carries an
 * AffiliateLink gets this, per departments/content/CLAUDE.md.
 */
export function DisclosureBlock() {
  return (
    <div className="flex items-start gap-3 rounded-frame border border-border bg-secondary/50 p-4 text-sm text-foreground/80">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
      <p>
        This piece contains affiliate links. If you buy through one, we may earn a
        commission at no extra cost to you. It never changes which product we rank
        first.{" "}
        <Link href="/disclosure" className="underline underline-offset-2 hover:text-primary">
          Read our full policy
        </Link>
        .
      </p>
    </div>
  );
}
