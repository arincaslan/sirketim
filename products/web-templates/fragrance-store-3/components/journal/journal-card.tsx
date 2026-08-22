"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";

import { getJournalImage } from "@/lib/media";
import type { JournalPost } from "@/lib/types";

interface JournalCardProps {
  post: JournalPost;
  large?: boolean;
  index?: number;
}

export function JournalCard({ post, large = false, index = 0 }: JournalCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, delay: large ? 0 : Math.min(index, 8) * 0.05 }}
      className="h-full"
    >
      <Link href={`/journal/${post.slug}`} className="group flex h-full flex-col">
      <div className={`relative w-full overflow-hidden bg-secondary ${large ? "aspect-[16/9]" : "aspect-[4/3]"}`}>
        <Image
          src={getJournalImage(post.slug)}
          alt=""
          fill
          sizes={large ? "(min-width: 1024px) 60vw, 100vw" : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"}
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <span className="absolute left-3 top-3 rounded-pill bg-card/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide backdrop-blur">
          {post.category}
        </span>
      </div>
      <div className="mt-4 flex-1">
        <h3 className={`font-display font-semibold leading-tight text-balance ${large ? "text-2xl" : "text-lg"}`}>
          {post.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>
        <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
          {post.readingTimeMinutes} min read
          <span aria-hidden="true">&middot;</span>
          <time dateTime={post.publishedAt}>
            {new Date(post.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </time>
        </p>
      </div>
      </Link>
    </motion.div>
  );
}
