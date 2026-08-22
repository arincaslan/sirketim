"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Pencil } from "lucide-react";

import { cn } from "@/lib/utils";

interface CheckoutSectionProps {
  index: number;
  title: string;
  status: "active" | "completed" | "upcoming";
  summary?: ReactNode;
  onEdit?: () => void;
  children: ReactNode;
}

/**
 * Meridian's checkout pattern: a progressive accordion. Each section collapses
 * to an editable summary row once completed, rather than fully replacing
 * the previous step (Ambre's wizard) or leaving everything permanently open
 * (Nocturne's continuous scroll) — see DESIGN.md.
 */
export function CheckoutSection({ index, title, status, summary, onEdit, children }: CheckoutSectionProps) {
  return (
    <div className={cn("border border-border bg-card", status === "upcoming" && "opacity-50")}>
      <div className="flex items-center justify-between gap-4 p-6">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-pill text-xs font-bold",
              status === "completed" ? "bg-success text-success-foreground" : "bg-secondary text-foreground"
            )}
          >
            {status === "completed" ? <Check className="h-3.5 w-3.5" /> : index}
          </span>
          <h2 className="font-display text-lg font-semibold">{title}</h2>
        </div>
        {status === "completed" && onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary hover:underline"
          >
            <Pencil className="h-3.5 w-3.5" /> Edit
          </button>
        )}
      </div>

      <AnimatePresence initial={false}>
        {status === "active" && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border p-6">{children}</div>
          </motion.div>
        )}
        {status === "completed" && summary && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border px-6 pb-6 pt-4 text-sm text-muted-foreground">{summary}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
