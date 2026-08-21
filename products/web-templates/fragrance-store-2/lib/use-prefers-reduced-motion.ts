"use client";

import { useEffect, useState } from "react";

/**
 * Tracks `prefers-reduced-motion`. Used to skip/soften scroll-triggered
 * reveals and pause the marquee ticker for users who've asked for less
 * motion, rather than assuming everyone wants the full animated version.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    const listener = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener("change", listener);
    return () => query.removeEventListener("change", listener);
  }, []);

  return reduced;
}
