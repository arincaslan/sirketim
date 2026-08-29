import Link from "next/link";

/**
 * Shared affiliate-site-kit: visible breadcrumb nav.
 *
 * Takes the same `{ name, path }` list a page also passes to
 * `lib/jsonld.ts`'s `breadcrumbSchema` (via `absoluteUrl`), so the visible
 * trail and the BreadcrumbList JSON-LD are built from one array rather than
 * two hand-kept copies that can drift apart.
 */
export interface BreadcrumbItem {
  name: string;
  /** Relative path, e.g. "/", "/fragrance", "/fragrance/aventus". */
  path: string;
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-8 text-sm text-muted-foreground">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={item.path}>
            {isLast ? (
              <span className="text-foreground">{item.name}</span>
            ) : (
              <Link href={item.path} className="underline-offset-4 hover:underline">
                {item.name}
              </Link>
            )}
            {!isLast && <span aria-hidden> / </span>}
          </span>
        );
      })}
    </nav>
  );
}
