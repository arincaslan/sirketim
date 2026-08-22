"use client";

import { motion } from "framer-motion";

import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";
import { FAMILY_MATERIAL } from "@/lib/scent-material";
import type { ProductNotes, ScentFamily } from "@/lib/types";

const TIERS: { key: keyof ProductNotes; label: string; time: string }[] = [
  { key: "top", label: "Top", time: "First 15 minutes" },
  { key: "heart", label: "Heart", time: "30 minutes – 4 hours" },
  { key: "base", label: "Base", time: "4+ hours" },
];

interface NotesThreadProps {
  notes: ProductNotes;
  /** Tints the connecting-line nodes with this product's olfactive-family
   * color instead of the generic brand accent — see DESIGN.md's job
   * description for the family palette ("the tint for that family's filter
   * chips and notes-timeline nodes"). */
  family: ScentFamily;
}

/**
 * The note pyramid as a vertical timeline instead of a bar chart or a
 * static list — a connecting line "draws in" as you scroll (top note
 * unfolding into heart, into base), each node staggering in with its
 * tags. See DESIGN.md and lib journal post "how-a-note-pyramid-actually-
 * works" for why time, not proportion, is the honest way to represent this.
 */
export function NotesThread({ notes, family }: NotesThreadProps) {
  const reduced = usePrefersReducedMotion();
  const tint = `hsl(${FAMILY_MATERIAL[family].deep.hsl})`;

  return (
    <div className="relative pl-10">
      <motion.div
        aria-hidden="true"
        initial={reduced ? { opacity: 1 } : { scaleY: 0 }}
        whileInView={reduced ? { opacity: 1 } : { scaleY: 1 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformOrigin: "top" }}
        className="absolute bottom-4 left-[7px] top-2 w-px bg-border"
      />

      <ol className="flex flex-col gap-10">
        {TIERS.map((tier, index) => (
          <motion.li
            key={tier.key}
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: reduced ? 0 : index * 0.25 }}
            className="relative"
          >
            <span
              className="absolute -left-10 top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 bg-background"
              style={{ borderColor: tint }}
            />
            <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: tint }}>
              {tier.label} note
            </p>
            <p className="text-xs text-muted-foreground">{tier.time}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {notes[tier.key].map((note) => (
                <span
                  key={note}
                  className="rounded-pill border border-border bg-card px-3 py-1 text-sm text-foreground"
                >
                  {note}
                </span>
              ))}
            </div>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}
