import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ChevronRight, Clock } from "lucide-react";

import { JournalCard } from "@/components/journal/journal-card";
import { getJournalImage } from "@/lib/media";
import { getAllJournalPosts, getJournalPostBySlug, getRelatedJournalPosts } from "@/lib/journal";

interface JournalPostPageProps {
  params: { slug: string };
}

export function generateStaticParams() {
  return getAllJournalPosts().map((post) => ({ slug: post.slug }));
}

export function generateMetadata({ params }: JournalPostPageProps): Metadata {
  const post = getJournalPostBySlug(params.slug);
  if (!post) return {};
  return { title: post.title, description: post.excerpt };
}

export default function JournalPostPage({ params }: JournalPostPageProps) {
  const post = getJournalPostBySlug(params.slug);
  if (!post) notFound();

  const related = getRelatedJournalPosts(post.slug, 3);

  return (
    <article>
      <div className="container pt-6">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/journal" className="transition-colors hover:text-foreground">
            Journal
          </Link>
          <ChevronRight className="h-3 w-3" aria-hidden="true" />
          <span aria-current="page" className="text-foreground">
            {post.category}
          </span>
        </nav>
      </div>

      <header className="container max-w-2xl py-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">{post.category}</p>
        <h1 className="font-display mt-3 text-fluid-h1 font-semibold text-balance">{post.title}</h1>
        <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
          {post.readingTimeMinutes} min read
          <span aria-hidden="true">&middot;</span>
          <time dateTime={post.publishedAt}>
            {new Date(post.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </time>
        </p>
      </header>

      <div className="container">
        <div className="relative aspect-[16/7] w-full overflow-hidden border border-border">
          <Image
            src={getJournalImage(post.slug)}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
      </div>

      <div className="container max-w-2xl py-10">
        {post.body.map((paragraph, index) => (
          <p key={index} className="mt-5 text-base leading-relaxed text-foreground/90 first:mt-0">
            {paragraph}
          </p>
        ))}
      </div>

      {related.length > 0 && (
        <div className="border-t border-border">
          <div className="container py-14">
            <h2 className="font-display text-lg font-semibold">Keep reading</h2>
            <div className="mt-6 grid gap-x-6 gap-y-10 sm:grid-cols-3">
              {related.map((relatedPost, index) => (
                <JournalCard key={relatedPost.slug} post={relatedPost} index={index} />
              ))}
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
