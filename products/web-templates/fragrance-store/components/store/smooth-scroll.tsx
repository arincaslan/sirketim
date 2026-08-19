"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Drives real momentum/inertia scrolling site-wide via Lenis, replacing the
 * old `scroll-behavior: smooth` CSS rule (which only smooths anchor-link
 * jumps, not everyday wheel/trackpad scrolling). Renders nothing — it just
 * runs the Lenis RAF loop for the lifetime of the app shell.
 */
export function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return null;
}
