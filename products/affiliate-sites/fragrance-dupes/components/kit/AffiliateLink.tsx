import type { ReactNode } from "react";

/**
 * Shared affiliate-site-kit: content uses this, never a raw <a> tag, for any
 * outbound affiliate link. `rel="sponsored nofollow noopener"` is baked in
 * by default per Google's affiliate-link guidance - not left for content
 * authors to remember per link. See the technical plan §5.
 */
export function AffiliateLink({
  id,
  children,
  className,
}: {
  id: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a
      href={`/go/${id}`}
      rel="sponsored nofollow noopener"
      target="_blank"
      className={className}
    >
      {children}
    </a>
  );
}
