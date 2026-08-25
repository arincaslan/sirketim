import { AffiliateLink } from "@/components/kit/AffiliateLink";
import { EmbeddedComparison } from "@/components/content/embedded-comparison";
import { ProsCons } from "@/components/content/pros-cons";
import { VerdictCallout } from "@/components/content/verdict-callout";
import { RatingStars } from "@/components/content/rating-stars";

/**
 * Component map passed to <MDXRemote components={mdxComponents} />. Standard
 * markdown elements (headings, paragraphs, lists, blockquotes) are styled by
 * the `prose` typography wrapper around the rendered body instead of being
 * overridden here one by one - only genuinely custom, content-authorable
 * components live in this map.
 */
export const mdxComponents = {
  AffiliateLink,
  EmbeddedComparison,
  ProsCons,
  VerdictCallout,
  RatingStars,
};
