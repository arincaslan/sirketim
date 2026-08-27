import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getContentBySlug, getContentByType } from "@/content/loader";
import { articleSchema } from "@/lib/jsonld";
import { JsonLd } from "@/components/kit/JsonLd";
import { ArticleHeader } from "@/components/content/article-header";
import { DisclosureBlock } from "@/components/content/disclosure-block";
import { mdxComponents } from "@/components/content/mdx-components";
import { absoluteUrl } from "@/lib/site";

export function generateStaticParams() {
  return getContentByType("guide").map((p) => ({ slug: p.frontmatter.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const piece = getContentBySlug("guide", params.slug);
  if (!piece) return {};
  const path = `/guide/${piece.frontmatter.slug}`;
  const { title, description, publishedAt, updatedAt, author } = piece.frontmatter;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      title,
      description,
      url: path,
      publishedTime: publishedAt,
      modifiedTime: updatedAt,
      authors: [author],
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default function GuidePage({ params }: { params: { slug: string } }) {
  const piece = getContentBySlug("guide", params.slug);
  if (!piece || piece.frontmatter.contentType !== "guide") notFound();

  const url = absoluteUrl(`/guide/${piece.frontmatter.slug}`);

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

      <ArticleHeader
        contentType="guide"
        title={piece.frontmatter.title}
        description={piece.frontmatter.description}
        publishedAt={piece.frontmatter.publishedAt}
        author={piece.frontmatter.author}
      />

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
