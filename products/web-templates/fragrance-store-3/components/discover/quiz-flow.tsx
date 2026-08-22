"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { QuizProgress } from "@/components/discover/quiz-progress";
import { QuizQuestionView } from "@/components/discover/quiz-question";
import { QuizResultView } from "@/components/discover/quiz-result";
import { FAMILY_RAIL_IMAGE } from "@/lib/media";
import { FAMILY_MATERIAL } from "@/lib/scent-material";
import { QUIZ_QUESTIONS, computeQuizResult, type QuizAnswers } from "@/lib/quiz";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";
import type { ScentFamily } from "@/lib/types";

const TOTAL_STEPS = QUIZ_QUESTIONS.length;

export function QuizFlow() {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [direction, setDirection] = useState(1);
  const [complete, setComplete] = useState(false);
  const reduced = usePrefersReducedMotion();

  const currentQuestion = QUIZ_QUESTIONS[stepIndex];

  const leadingFamily: ScentFamily = useMemo(() => {
    const partial = computeQuizResult(answers);
    return partial.leadingFamily ?? "Woody";
  }, [answers]);

  const result = useMemo(() => (complete ? computeQuizResult(answers) : null), [complete, answers]);

  function goNext() {
    setDirection(1);
    if (stepIndex >= TOTAL_STEPS - 1) {
      setComplete(true);
      return;
    }
    setStepIndex((i) => i + 1);
  }

  function goBack() {
    setDirection(-1);
    setStepIndex((i) => Math.max(0, i - 1));
  }

  function handleSelect(optionId: string) {
    setAnswers((current) => ({ ...current, [currentQuestion.id]: optionId }));
    window.setTimeout(goNext, 220);
  }

  function handleRetake() {
    setAnswers({});
    setStepIndex(0);
    setComplete(false);
    setDirection(-1);
  }

  return (
    <section className="relative overflow-hidden">
      {/* Mood-reactive background — reuses the five family-rail photographs
       * from the asset manifest (see DESIGN.md's Discovery-flow artboard),
       * duotone-recolored toward whichever family the current answer mix
       * currently leads on, crossfading as answers change. Reduced motion:
       * instant swap, no crossfade. */}
      <div className="absolute inset-0 opacity-25" aria-hidden="true">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={leadingFamily}
            initial={reduced ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.6 }}
            className="absolute inset-0"
          >
            <Image
              src={FAMILY_RAIL_IMAGE[leadingFamily]}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover grayscale"
            />
            <div
              className="absolute inset-0 mix-blend-color"
              style={{ backgroundColor: `hsl(${FAMILY_MATERIAL[leadingFamily].ink.hsl})` }}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="container relative py-16">
        {!complete && (
          <div className="mx-auto max-w-2xl">
            <div className="flex items-center gap-4">
              {stepIndex > 0 && (
                <button
                  type="button"
                  onClick={goBack}
                  aria-label="Previous question"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-pill border border-border bg-card hover:bg-secondary"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
              )}
              <div className="flex-1">
                <QuizProgress current={stepIndex + 1} total={TOTAL_STEPS} />
              </div>
              <button
                type="button"
                onClick={goNext}
                className="shrink-0 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground"
              >
                Skip
              </button>
            </div>

            <div className="relative mt-10 min-h-[26rem]">
              <AnimatePresence mode="wait" custom={direction} initial={false}>
                <motion.div
                  key={currentQuestion.id}
                  custom={direction}
                  initial={reduced ? { opacity: 0 } : { opacity: 0, x: direction * 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduced ? { opacity: 0 } : { opacity: 0, x: direction * -24 }}
                  transition={{ duration: reduced ? 0.15 : 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  <QuizQuestionView
                    question={currentQuestion}
                    selected={answers[currentQuestion.id]}
                    onSelect={handleSelect}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        )}

        {complete && result && (
          <div className="mx-auto max-w-4xl">
            <QuizResultView result={result} onRetake={handleRetake} />
          </div>
        )}
      </div>
    </section>
  );
}
