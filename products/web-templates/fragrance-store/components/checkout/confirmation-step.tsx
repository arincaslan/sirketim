"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

interface ConfirmationStepProps {
  orderNumber: string;
  email: string;
  total: number;
}

export function ConfirmationStep({
  orderNumber,
  email,
  total,
}: ConfirmationStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-auto flex max-w-lg flex-col items-center gap-3 py-16 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }}
      >
        <CheckCircle2 className="h-14 w-14 text-gold" />
      </motion.div>
      <h1 className="font-serif text-3xl">Order placed</h1>
      <p className="text-muted-foreground">
        Order <span className="font-medium text-foreground">{orderNumber}</span>
        {email && (
          <>
            {" "}
            — a confirmation would normally go to{" "}
            <span className="font-medium text-foreground">{email}</span>
          </>
        )}
        .
      </p>
      <p className="text-lg font-semibold">{formatPrice(total)}</p>

      <div className="mt-3 w-full rounded-md border border-gold/40 bg-gold/10 p-3 text-xs text-muted-foreground">
        This is a template demo: no payment was charged, no email was sent,
        and this order was not transmitted anywhere or persisted server-side.
      </div>

      <Button asChild size="lg" className="mt-4">
        <Link href="/products">Continue shopping</Link>
      </Button>
    </motion.div>
  );
}
