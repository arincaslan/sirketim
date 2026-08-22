import type { InputHTMLAttributes } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  error?: string;
  wrapperClassName?: string;
}

export function FormField({ label, name, error, wrapperClassName, className, ...props }: FormFieldProps) {
  const errorId = `${name}-error`;
  return (
    <div className={cn("flex flex-col gap-1.5", wrapperClassName)}>
      <Label htmlFor={name}>
        {label}
        {props.required && <span aria-hidden="true"> *</span>}
      </Label>
      <Input
        id={name}
        name={name}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className={cn(error && "border-destructive focus-visible:ring-destructive", className)}
        {...props}
      />
      {error && (
        <p id={errorId} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
