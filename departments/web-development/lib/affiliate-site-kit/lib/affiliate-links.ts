/**
 * Shared affiliate-site-kit: affiliate-link registry shape.
 *
 * PLACEHOLDER DATA ONLY in this kit file - a real per-site copy populates
 * this with its own entries. Content never embeds a raw destination URL; it
 * references an id that resolves here, and app/go/[slug]/route.ts is the
 * single interception point for both cloaking and (eventually) click
 * tracking. See the technical plan §5.
 */

export interface AffiliateLinkEntry {
  destinationUrl: string;
  network: string;
  label: string;
}

export const affiliateLinks: Record<string, AffiliateLinkEntry> = {
  "example-widget-500": {
    destinationUrl: "https://example.com/aff?tag=REPLACE_ME", // never a real program until one exists
    network: "placeholder",
    label: "Example Widget 500",
  },
};

export function resolveAffiliateLink(id: string): AffiliateLinkEntry | undefined {
  return affiliateLinks[id];
}
