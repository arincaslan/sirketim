"use client";

import Image from "next/image";
import { useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

/**
 * Full-bleed looping background video, shared by the hero (chapter 0) and
 * the "Try it" chapter break (see DESIGN.md's Implementation addendum v2)
 * - the only two video moments on the homepage, deliberately, per the
 * brief's "a hero loop, maybe one chapter-break moment" ceiling.
 *
 * Under `prefers-reduced-motion`, renders the poster frame as a plain
 * `next/image` instead and never mounts a `<video>` element at all, so
 * nothing autoplays for a motion-sensitive visitor - a stronger guarantee
 * than a manual pause control, matching how preloader.tsx and
 * custom-cursor.tsx also gate on the same signal rather than adding an
 * on-page toggle. `aria-hidden` throughout: this is atmosphere, not content
 * a screen reader needs to announce.
 */
export function AtmosphereVideo({
  src,
  poster,
  alt,
  className,
}: {
  src: string;
  poster: string;
  alt: string;
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <Image
        src={poster}
        alt={alt}
        fill
        priority
        sizes="100vw"
        className={cn("object-cover", className)}
      />
    );
  }

  return (
    <video
      autoPlay
      loop
      muted
      playsInline
      poster={poster}
      aria-hidden="true"
      className={cn("absolute inset-0 h-full w-full object-cover", className)}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
