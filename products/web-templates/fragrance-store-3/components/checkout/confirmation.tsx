"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

interface ConfirmationProps {
  orderNumber: string;
  email: string;
  total: number;
  sampleName: string;
}

/**
 * The one genuinely rare, high-emotion screen in the whole template — an
 * order only completes once per checkout. Per the improve-animations audit
 * pass, a state this rare is allowed real delight: the checkmark springs in
 * first, then the rest of the content follows with a short stagger, instead
 * of the static instant-render every other confirmation-adjacent state
 * (newsletter success, discount-applied) intentionally uses.
 */
export function Confirmation({ orderNumber, email, total, sampleName }: ConfirmationProps) {
  const reduced = usePrefersReducedMotion();

  return (
    <div className="flex flex-col items-center py-20 text-center">
      <motion.div
        initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={
          reduced
            ? { duration: 0.2 }
            : { type: "spring", duration: 0.6, bounce: 0.35 }
        }
      >
        <CheckCircle2 className="h-12 w-12 text-success" aria-hidden="true" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: reduced ? 0 : 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: reduced ? 0 : 0.25, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1 className="font-display mt-6 text-fluid-h1 font-semibold">Order confirmed</h1>
        <p className="mt-3 max-w-md text-muted-foreground">
          Order <span className="font-semibold text-foreground">{orderNumber}</span> is on its way. A confirmation
          would normally be sent to <span className="font-semibold text-foreground">{email}</span> — this is a demo
          storefront, so no email actually sends.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: reduced ? 0 : 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: reduced ? 0 : 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="mt-8 flex flex-col gap-2 border border-border bg-card px-8 py-6 text-sm"
      >
        <div className="flex justify-between gap-8">
          <span className="text-muted-foreground">Total charged</span>
          <span className="font-semibold">{formatPrice(total)}</span>
        </div>
        <div className="flex justify-between gap-8">
          <span className="text-muted-foreground">Free sample</span>
          <span className="font-semibold">{sampleName}</span>
        </div>
      </motion.div>

      <p className="mt-6 max-w-md text-xs text-muted-foreground">
        No payment was actually processed — see the README &ldquo;Honesty notes&rdquo;
        for what a real checkout integration needs.
      </p>

      <Button asChild size="lg" className="mt-8">
        <Link href="/products">Continue shopping</Link>
      </Button>
    </div>
  );
}
