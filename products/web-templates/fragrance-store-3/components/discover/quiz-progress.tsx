interface QuizProgressProps {
  current: number;
  total: number;
}

export function QuizProgress({ current, total }: QuizProgressProps) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Step {current} of {total}
      </p>
      <div className="mt-2 flex gap-1.5" role="progressbar" aria-valuenow={current} aria-valuemin={1} aria-valuemax={total}>
        {Array.from({ length: total }).map((_, index) => (
          <span
            key={index}
            className={`h-1 flex-1 rounded-pill transition-colors ${
              index < current ? "bg-primary" : "bg-border"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
