import { NextRequest, NextResponse } from "next/server";
import { affiliateLinks } from "@/lib/affiliate-links";

/**
 * Shared affiliate-site-kit: the single redirect/tracking chokepoint for
 * every outbound affiliate link on the site. See the technical plan §5.
 */
export function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const link = affiliateLinks[params.slug];
  if (!link) return new NextResponse("Not found", { status: 404 });
  // TODO once a real program exists: log the click event here before redirecting
  return NextResponse.redirect(link.destinationUrl, { status: 302 });
}
