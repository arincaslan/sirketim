import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getContentBySlug, getContentByType } from "@/content/loader";
import { articleSchema, itemListSchema } from "@/lib/jsonld";
import { JsonLd } from "@/components/kit/JsonLd";
import { ArticleHeader } from "@/components/content/article-header";
import { ArticleHeroImage } from "@/components/content/article-hero-image";
import { DisclosureBlock } from "@/components/content/disclosure-block";
import { mdxComponents } from "@/components/content/mdx-components";

export function generateStaticParams() {
  return getContentByType("comparison").map((p) => ({ slug: p.frontmatter.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const piece = getContentBySlug("comparison", params.slug);
  if (!piece) return {};
  return { title: piece.frontmatter.title, description: piece.frontmatter.description };
}

export default function ComparisonPage({ params }: { params: { slug: string } }) {
  const piece = getContentBySlug("comparison", params.slug);
  if (!piece || piece.frontmatter.contentType !== "comparison") notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example-placeholder.com";
  const url = `${siteUrl}/comparison/${piece.frontmatter.slug}`;

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
        data={itemListSchema(
          piece.frontmatter.products.map((product, i) => ({
            name: product.name,
            url: `${url}#${product.name.toLowerCase().replace(/\s+/g, "-")}`,
            position: i + 1,
          }))
        )}
      />

      <ArticleHeader
        contentType="comparison"
        title={piece.frontmatter.title}
        description={piece.frontmatter.description}
        publishedAt={piece.frontmatter.publishedAt}
        author={piece.frontmatter.author}
      />

      {piece.frontmatter.heroImage && (
        <ArticleHeroImage src={piece.frontmatter.heroImage} alt={piece.frontmatter.title} />
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
