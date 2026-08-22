"use client";

import { useState, type FormEvent } from "react";
import { Check } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    setError(null);
    // UI-only — see README "Honesty notes." No provider is wired up.
    setSubmitted(true);
  }

  return (
    <section className="border-t border-border bg-secondary/40 py-16">
      <div className="container max-w-xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Journal &amp; new places</p>
        <h2 className="font-display mt-3 text-fluid-h2 font-semibold text-balance">
          New releases, sent when there&apos;s actually something to say.
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          No weekly filler. A note when a new place launches, and nothing else.
        </p>

        {submitted ? (
          <p className="mt-6 flex items-center justify-center gap-2 text-sm font-medium text-success">
            <Check className="h-4 w-4" /> You&apos;re on the list.
          </p>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="mx-auto mt-6 flex max-w-sm flex-col gap-2 sm:flex-row">
            <Label htmlFor="newsletter-email" className="sr-only">
              Email address
            </Label>
            <Input
              id="newsletter-email"
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-describedby={error ? "newsletter-error" : undefined}
              aria-invalid={!!error}
              className="text-center sm:text-left"
            />
            <Button type="submit" className="shrink-0">
              Subscribe
            </Button>
          </form>
        )}
        {error && (
          <p id="newsletter-error" role="alert" className="mt-2 text-xs text-destructive">
            {error}
          </p>
        )}
      </div>
    </section>
  );
}
