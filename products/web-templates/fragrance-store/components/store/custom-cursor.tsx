"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

type CursorVariant = "default" | "link" | "view" | "text";

/**
 * Signature interaction: replaces the native pointer with a two-part
 * dot + ring that trails the real cursor on a spring. Both read off the same
 * raw `useMotionValue` x/y, each through its own `useSpring` — the dot's
 * spring is tight (near-instant), the ring's is looser, so the ring visibly
 * lags a beat behind the dot as you move (the reference: daynight.co.uk).
 *
 * State changes on hover:
 * - links/buttons -> ring grows, picks up a gold tint
 * - product cards (`data-cursor="view"`) -> ring grows further, inverts to
 *   the dark `--primary` fill, and shows a serif-italic "View" label —
 *   matching the italic accent already used in the hero headline
 * - text inputs -> custom cursor hides so the native text caret shows
 *
 * Desktop-only by design: gated on `(pointer: fine)` so it never mounts on
 * touch devices (and `cursor: none` never applies there either), and skipped
 * entirely under `prefers-reduced-motion`, since a lagging pointer is itself
 * a motion effect.
 */
export function CustomCursor() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [variant, setVariant] = useState<CursorVariant>("default");
  const [visible, setVisible] = useState(false);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const dotX = useSpring(mouseX, { stiffness: 900, damping: 45, mass: 0.2 });
  const dotY = useSpring(mouseY, { stiffness: 900, damping: 45, mass: 0.2 });
  const ringX = useSpring(mouseX, { stiffness: 220, damping: 26, mass: 0.6 });
  const ringY = useSpring(mouseY, { stiffness: 220, damping: 26, mass: 0.6 });

  useEffect(() => {
    if (prefersReducedMotion) {
      setEnabled(false);
      return;
    }
    const mql = window.matchMedia("(pointer: fine)");
    const update = () => setEnabled(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (!enabled) {
      document.documentElement.classList.remove("custom-cursor-active");
      return;
    }

    document.documentElement.classList.add("custom-cursor-active");

    const handleMove = (event: MouseEvent) => {
      mouseX.set(event.clientX);
      mouseY.set(event.clientY);
      setVisible(true);
    };

    const handleLeave = () => setVisible(false);

    const handleOver = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      if (target.closest("input, textarea, select, [contenteditable='true']")) {
        setVariant("text");
        return;
      }
      if (target.closest('[data-cursor="view"]')) {
        setVariant("view");
        return;
      }
      const interactive = target.closest(
        "a, button, [role='button'], summary, label"
      );
      setVariant(interactive ? "link" : "default");
    };

    window.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseover", handleOver);
    document.addEventListener("mouseleave", handleLeave);

    return () => {
      document.documentElement.classList.remove("custom-cursor-active");
      window.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseover", handleOver);
      document.removeEventListener("mouseleave", handleLeave);
    };
  }, [enabled, mouseX, mouseY]);

  if (!enabled) return null;

  const isView = variant === "view";
  const isLink = variant === "link";
  const isText = variant === "text";

  const ringColor = isView
    ? "border-transparent bg-primary"
    : isLink
      ? "border-gold/60 bg-gold/10"
      : "border-foreground/25 bg-transparent";

  const dotOpacity = !visible ? 0 : isView || isText ? 0 : 1;
  const ringOpacity = !visible ? 0 : isText ? 0 : 1;

  return (
    <>
      <motion.div
        aria-hidden="true"
        className={cn(
          "pointer-events-none fixed left-0 top-0 z-[10060] flex items-center justify-center rounded-full border transition-colors duration-300",
          ringColor
        )}
        style={{ x: ringX, y: ringY, translateX: "-50%", translateY: "-50%" }}
        animate={{
          width: isView ? 88 : isLink ? 56 : 34,
          height: isView ? 88 : isLink ? 56 : 34,
          opacity: ringOpacity,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 26 }}
      >
        {isView && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="font-serif text-xs italic tracking-wide text-primary-foreground"
          >
            View
          </motion.span>
        )}
      </motion.div>

      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[10060] h-1.5 w-1.5 rounded-full bg-gold transition-opacity duration-200"
        style={{
          x: dotX,
          y: dotY,
          translateX: "-50%",
          translateY: "-50%",
          opacity: dotOpacity,
        }}
      />
    </>
  );
}
