"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

type CursorVariant = "default" | "link" | "view" | "text";

const MAX_PARTICLES = 90;
const PARTICLE_LIFE_MS = 620;
/** Base ms between spawned particles while the pointer is moving; hover
 *  states shorten this (see SPAWN_INTERVAL_BY_VARIANT) for a fuller "spritz." */
const SPAWN_INTERVAL_MS = 22;
const SPAWN_INTERVAL_BY_VARIANT: Record<CursorVariant, number> = {
  default: SPAWN_INTERVAL_MS,
  link: SPAWN_INTERVAL_MS * 0.7,
  view: SPAWN_INTERVAL_MS * 0.5,
  text: Number.POSITIVE_INFINITY, // never reached - spawning is skipped outright over text
};
/** --primary (Drydown Green) as an rgb triplet, for canvas fillStyle -
 *  the mist stays the site's one accent color, never a second hue. */
const DRYDOWN_GREEN = "21, 94, 68";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  bornAt: number;
}

/**
 * The Atomizer: this site's actual signature system (see DESIGN.md's
 * Implementation addendum v3), replacing the dot+ring spring cursor that
 * was directly adapted from fragrance-store's precedent component - that
 * borrowed piece read as generic, so it's retired outright here rather
 * than restyled again.
 *
 * A canvas-based mist trail: a small precision dot sits exactly at the
 * real pointer position (so the cursor stays usable for actual clicking),
 * trailed by a stream of particles that release, decelerate, expand, and
 * fade - atomized spray dispersing, not a pointer being tracked on a
 * spring. Canvas, not DOM/Motion, is the deliberate tool choice for this
 * one piece (`animate` skill's "cheapest tool that works," applied to a
 * continuous high-frequency emitter): up to ~90 live particles redrawn
 * every frame would mean up to 90 DOM nodes recalculating style/layout/
 * paint each frame if built with `motion.div`s; one canvas draws that many
 * circles for a fraction of the cost, entirely off the DOM.
 *
 * Physics, deliberately: every particle decelerates every frame (`vx`/`vy`
 * multiplied by a drag factor below 1, never accelerated) and only fades,
 * never bounces or overshoots - "Settle," this site's motion philosophy
 * (DESIGN.md §5), applied literally: mist doesn't spring back, it slows
 * down and dissipates. The one spring/bounce exception on this whole site
 * stays exactly where it was (the Dupe Finder's Match Reveal) - this
 * system doesn't add a second one.
 *
 * Hover states change the emission itself (spawn rate, anchor size/fill),
 * not a separate ring element - this cursor has no ring:
 * - link/button -> anchor grows, spawn rate increases slightly
 * - `data-cursor="view"` targets -> anchor grows further and fills solid,
 *   spawn rate increases further (a fuller "spritz")
 * - text inputs -> spawning stops and the anchor hides so the native
 *   caret shows
 *
 * Two effects, matching the component it replaces: one gates mounting on
 * `(pointer: fine)` and `prefers-reduced-motion` (reacts to either
 * changing mid-session), the other owns the actual rAF draw loop, split
 * so the hot path never touches React state. Position updates come from
 * `mousemove` (cheap, high-frequency); hover-variant detection comes from
 * a separate `mouseover` listener (`.closest()` walks are real work, but
 * that event only fires when the hovered element changes, not on every
 * pixel of movement) - the same split the original component used, kept
 * here for the same performance reason. Also pauses its own rAF loop when
 * the tab is hidden (`visibilitychange`), so it never burns CPU
 * off-screen.
 */
export function CustomCursor() {
  const prefersReducedMotion = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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
    if (!enabled) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    document.documentElement.classList.add("custom-cursor-active");

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const pointer = { x: -100, y: -100, visible: false };
    let variant: CursorVariant = "default";
    let particles: Particle[] = [];
    let lastSpawn = 0;
    let running = document.visibilityState === "visible";
    let raf = 0;

    const handleMove = (event: MouseEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.visible = true;
    };

    const handleOver = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (target.closest("input, textarea, select, [contenteditable='true']")) {
        variant = "text";
      } else if (target.closest('[data-cursor="view"]')) {
        variant = "view";
      } else if (target.closest("a, button, [role='button'], summary, label")) {
        variant = "link";
      } else {
        variant = "default";
      }
    };

    const handleLeave = () => {
      pointer.visible = false;
    };

    const handleVisibility = () => {
      running = document.visibilityState === "visible";
    };

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseover", handleOver);
    document.addEventListener("mouseleave", handleLeave);
    document.addEventListener("visibilitychange", handleVisibility);

    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      if (!running) return;

      // Spawn: throttled by variant, capped total count - never one
      // particle per pixel of movement, never unbounded.
      if (
        pointer.visible &&
        variant !== "text" &&
        now - lastSpawn > SPAWN_INTERVAL_BY_VARIANT[variant] &&
        particles.length < MAX_PARTICLES
      ) {
        lastSpawn = now;
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.15 + Math.random() * 0.35;
        particles.push({
          x: pointer.x,
          y: pointer.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.1, // faint upward bias, like a light spray
          size: 1.5 + Math.random() * 1.5,
          bornAt: now,
        });
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles = particles.filter((p) => {
        const age = now - p.bornAt;
        if (age > PARTICLE_LIFE_MS) return false;

        const lifeRatio = age / PARTICLE_LIFE_MS;
        p.vx *= 0.955; // drag: decelerate, never accelerate ("Settle")
        p.vy *= 0.955;
        p.x += p.vx;
        p.y += p.vy;

        const alpha = (1 - lifeRatio) * 0.5;
        const size = p.size * (1 + lifeRatio * 1.8); // mist expands as it disperses

        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${DRYDOWN_GREEN}, ${alpha})`;
        ctx.fill();
        return true;
      });

      // The precision anchor: always exactly at the real pointer
      // position, regardless of the mist trail, so the cursor stays
      // usable for actual clicking.
      if (pointer.visible && variant !== "text") {
        const isView = variant === "view";
        const isLink = variant === "link";
        const radius = isView ? 7 : isLink ? 5 : 3;
        ctx.beginPath();
        ctx.arc(pointer.x, pointer.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${DRYDOWN_GREEN}, ${isView ? 1 : isLink ? 0.85 : 0.7})`;
        ctx.fill();
      }
    };

    raf = requestAnimationFrame(draw);

    return () => {
      document.documentElement.classList.remove("custom-cursor-active");
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseover", handleOver);
      document.removeEventListener("mouseleave", handleLeave);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[10060]"
    />
  );
}
