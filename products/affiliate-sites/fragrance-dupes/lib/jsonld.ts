/**
 * Shared affiliate-site-kit: JSON-LD builders.
 *
 * Typed helpers populated straight from the frontmatter schema
 * (content/schema.ts) - see the technical plan §3. Composition happens per
 * route: a comparison page renders articleSchema + itemListSchema; a review
 * page renders articleSchema + reviewSchema; a guide page renders
 * articleSchema alone (or + itemListSchema if it features specific
 * products).
 */

export function articleSchema(p: {
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  author: string;
  url: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: p.title,
    description: p.description,
    datePublished: p.publishedAt,
    dateModified: p.updatedAt ?? p.publishedAt,
    author: { "@type": "Organization", name: p.author },
    image: p.image,
    mainEntityOfPage: p.url,
  };
}

export function reviewSchema(p: {
  productName: string;
  brand?: string;
  rating?: number;
  author: string;
  url: string;
}) {
  // NOTE: this is an editorial rating authored by the site, not an
  // AggregateRating - never fabricate a review-count/AggregateRating from
  // reviews that don't exist. Real spam-policy risk for affiliate sites.
  return {
    "@context": "https://schema.org",
    "@type": "Review",
    itemReviewed: { "@type": "Product", name: p.productName, brand: p.brand },
    author: { "@type": "Organization", name: p.author },
    reviewRating: p.rating
      ? { "@type": "Rating", ratingValue: p.rating, bestRating: 5, worstRating: 1 }
      : undefined,
    url: p.url,
  };
}

export function itemListSchema(
  items: { name: string; url: string; position: number }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((i) => ({
      "@type": "ListItem",
      position: i.position,
      name: i.name,
      url: i.url,
    })),
  };
}
