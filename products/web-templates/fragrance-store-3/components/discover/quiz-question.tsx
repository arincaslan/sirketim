"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import type { QuizQuestion } from "@/lib/quiz";

interface QuizQuestionViewProps {
  question: QuizQuestion;
  selected?: string;
  onSelect: (optionId: string) => void;
}

export function QuizQuestionView({ question, selected, onSelect }: QuizQuestionViewProps) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">{question.axis}</p>
      <h1 className="font-display mt-3 text-fluid-h1 font-semibold text-balance">{question.prompt}</h1>
      <p className="mt-3 max-w-md text-muted-foreground">{question.subtitle}</p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {question.options.map((option, index) => {
          const active = selected === option.id;
          return (
            <motion.button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onSelect(option.id)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.05 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "flex min-h-[4.5rem] flex-col items-start justify-center gap-0.5 border p-4 text-left transition-colors",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card hover:border-foreground/40"
              )}
            >
              <span className="font-display text-base font-semibold">{option.label}</span>
              {option.description && (
                <span className={cn("text-xs", active ? "text-primary-foreground/80" : "text-muted-foreground")}>
                  {option.description}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
