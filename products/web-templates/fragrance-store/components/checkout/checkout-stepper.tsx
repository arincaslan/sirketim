"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

const STEPS = ["Shipping", "Payment", "Review"];

export function CheckoutStepper({ currentStep }: { currentStep: number }) {
  return (
    <ol className="flex items-center justify-center gap-2 sm:gap-4">
      {STEPS.map((label, index) => {
        const isComplete = index < currentStep;
        const isActive = index === currentStep;
        return (
          <li key={label} className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
                  isComplete && "border-primary bg-primary text-primary-foreground",
                  isActive && !isComplete && "border-primary text-primary",
                  !isActive &&
                    !isComplete &&
                    "border-border text-muted-foreground"
                )}
              >
                {isComplete ? <Check className="h-3.5 w-3.5" /> : index + 1}
              </span>
              <span
                className={cn(
                  "hidden text-sm font-medium sm:inline",
                  isActive || isComplete
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div className="h-px w-6 bg-border sm:w-12" />
            )}
          </li>
        );
      })}
    </ol>
  );
}
