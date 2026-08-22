"use client";

import { useEffect, useState } from "react";

/**
 * Tracks `prefers-reduced-motion`. Every scroll reveal and the Meridian
 * Sweep (`components/store/meridian-sweep.tsx`) read this before doing
 * anything beyond a plain opacity fade — see DESIGN.md's "States" notes on
 * each page artboard.
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
