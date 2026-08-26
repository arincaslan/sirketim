import { NextRequest, NextResponse } from "next/server";
import { resolveAffiliateLink } from "@/lib/affiliate-links";

/**
 * Shared affiliate-site-kit: the single redirect/tracking chokepoint for
 * every outbound affiliate link on the site. See the technical plan §5.
 *
 * Goes through resolveAffiliateLink rather than reading the map directly, so
 * the buy-the-original links added in the marketplace pivot resolve here the
 * same way they do in the components that render them. Reading the raw map
 * meant every original 404'd on click while its button rendered fine.
 *
 * COMPLIANCE RISK, unresolved - read before shipping an Amazon link through
 * here. Amazon's Associates operating agreement bars obscuring the source site
 * "including by use of Redirecting Links" such that Amazon cannot tell which
 * site a click came from. This route is exactly that pattern. It is probably
 * acceptable where attribution is preserved and the destination is plainly
 * Amazon, but "probably" is not good enough for a clause whose penalty is
 * account termination, and this redirect is load-bearing for the whole
 * producer-attribution design (PRODUCER-PROGRAM.md §6). Verify against the
 * live agreement text before the first Amazon link ships; other networks do
 * not necessarily share this restriction. See
 * departments/communication/reports/amazon-associates-application.md §2.
 */
export function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const link = resolveAffiliateLink(params.slug);
  if (!link) return new NextResponse("Not found", { status: 404 });
  // TODO once a real program exists: log the click event here before redirecting
  return NextResponse.redirect(link.destinationUrl, { status: 302 });
}
