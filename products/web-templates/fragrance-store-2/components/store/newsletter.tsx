"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Newsletter() {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Demo-only: no email service is wired up. This just confirms the
    // interaction locally, matching the rest of this template's "no real
    // backend" scope.
    setSubmitted(true);
  }

  return (
    <section className="bg-primary py-20 text-primary-foreground">
      <div className="container flex flex-col items-center text-center">
        <p className="font-display text-fluid-h2 font-semibold">
          First to know about restocks
        </p>
        <p className="mt-3 max-w-md text-sm text-primary-foreground/95">
          Limited-run scents sell out and don&apos;t always come back. Get an
          email before they do.
        </p>

        {submitted ? (
          <p className="mt-8 text-sm font-semibold uppercase tracking-wide">
            You&apos;re on the list.
          </p>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-8 flex w-full max-w-sm flex-col gap-3 sm:flex-row"
          >
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <Input
              id="newsletter-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@email.com"
              className="border-primary-foreground/30 bg-transparent text-primary-foreground placeholder:text-primary-foreground/60 focus-visible:ring-primary-foreground"
            />
            <Button
              type="submit"
              variant="secondary"
              className="shrink-0 bg-background text-foreground hover:bg-background/90"
            >
              Notify me
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}
