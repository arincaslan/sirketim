"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

/**
 * Shared scroll-reveal wrapper for marketing/editorial surfaces. Plays once
 * per element, fully reduced-motion safe (renders in its final state with
 * no motion at all rather than a faster version of the same animation).
 * See DESIGN.md §5 "Settle."
 */
export function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "li";
}) {
  const shouldReduceMotion = useReducedMotion();
  const Component = motion[as];

  if (shouldReduceMotion) {
    const Static = as;
    return <Static className={className}>{children}</Static>;
  }

  return (
    <Component
      initial={{ opacity: 0, transform: "translateY(16px) scale(0.98)" }}
      whileInView={{ opacity: 1, transform: "translateY(0px) scale(1)" }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay, ease: [0.23, 1, 0.32, 1] }}
      className={className}
    >
      {children}
    </Component>
  );
}
