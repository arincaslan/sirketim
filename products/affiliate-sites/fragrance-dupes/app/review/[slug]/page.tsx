import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getContentBySlug, getContentByType } from "@/content/loader";
import { articleSchema, reviewSchema } from "@/lib/jsonld";
import { JsonLd } from "@/components/kit/JsonLd";
import { ArticleHeader } from "@/components/content/article-header";
import { DisclosureBlock } from "@/components/content/disclosure-block";
import { RatingStars } from "@/components/content/rating-stars";
import { mdxComponents } from "@/components/content/mdx-components";

export function generateStaticParams() {
  return getContentByType("review").map((p) => ({ slug: p.frontmatter.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const piece = getContentBySlug("review", params.slug);
  if (!piece) return {};
  return { title: piece.frontmatter.title, description: piece.frontmatter.description };
}

export default function ReviewPage({ params }: { params: { slug: string } }) {
  const piece = getContentBySlug("review", params.slug);
  if (!piece || piece.frontmatter.contentType !== "review") notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example-placeholder.com";
  const url = `${siteUrl}/review/${piece.frontmatter.slug}`;
  const product = piece.frontmatter.product;

  return (
    <article className="container max-w-3xl py-14 sm:py-16">
      <JsonLd
        data={articleSchema({
          title: piece.frontmatter.title,
          description: piece.frontmatter.description,
          publishedAt: piece.frontmatter.publishedAt,
          updatedAt: piece.frontmatter.updatedAt,
          author: piece.frontmatter.author,
          url,
          image: piece.frontmatter.heroImage,
        })}
      />
      <JsonLd
        data={reviewSchema({
          productName: product.name,
          brand: product.brand,
          rating: product.editorialRating,
          author: piece.frontmatter.author,
          url,
        })}
      />

      <ArticleHeader
        contentType="review"
        title={piece.frontmatter.title}
        description={piece.frontmatter.description}
        publishedAt={piece.frontmatter.publishedAt}
        author={piece.frontmatter.author}
      />

      {product.editorialRating && (
        <div className="mt-4">
          <RatingStars rating={product.editorialRating} />
        </div>
      )}

      {piece.frontmatter.disclosure && (
        <div className="mt-6">
          <DisclosureBlock />
        </div>
      )}

      <div className="prose prose-lg mt-10 max-w-none">
        <MDXRemote source={piece.body} components={mdxComponents} />
      </div>
    </article>
  );
}
