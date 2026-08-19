"use client";

import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * UI-only signup form: on submit it just shows a confirmation message.
 * There is no backend wired up, so nothing is actually sent or stored —
 * see the README before treating this as a working mailing-list capture.
 */
export function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email) return;
    setSubmitted(true);
  }

  return (
    <section className="border-t border-border bg-primary text-primary-foreground">
      <div className="container flex flex-col items-center gap-4 py-16 text-center">
        <Mail className="h-6 w-6 text-gold" />
        <h2 className="font-serif text-2xl sm:text-3xl">
          Get first access to new scents
        </h2>
        <p className="max-w-md text-sm text-primary-foreground/70">
          Occasional notes on new releases and small-batch restocks. No spam,
          unsubscribe anytime.
        </p>

        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.p
              key="thanks"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 text-sm font-medium text-gold"
            >
              Thanks — you&apos;re on the list.
            </motion.p>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit}
              className="mt-2 flex w-full max-w-sm flex-col gap-2 sm:flex-row"
            >
              <Input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="bg-background text-foreground"
              />
              <Button type="submit" variant="gold">
                Sign up
              </Button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
