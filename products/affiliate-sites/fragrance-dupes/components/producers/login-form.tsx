"use client";

import { useState } from "react";
import { Info } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";

/**
 * Producer sign-in.
 *
 * There is no authentication behind this. No database, no Auth.js wiring
 * (PRODUCER-PROGRAM.md §8 items 2-3, and the TODO in lib/producer-session.ts
 * marking exactly where `auth()` plugs in). Submitting says so rather than
 * spinning, redirecting, or showing a generic "invalid credentials" error
 * that would send a real producer hunting for a password problem they do not
 * have.
 *
 * Email-link sign-in rather than passwords, deliberately: the eventual
 * account holders are small businesses, and a magic link removes password
 * storage and reset flows from a solo-operated site's responsibilities.
 */
export function LoginForm() {
  const [email, setEmail] = useState("");
  const [attempted, setAttempted] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setAttempted(true);
      }}
      className="flex flex-col gap-5"
    >
      <label className="flex flex-col gap-2">
        <span className="text-sm font-semibold">Work email</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@yourfragrancehouse.com"
          className="w-full rounded-frame border border-border bg-card px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25"
        />
      </label>

      <Button type="submit" disabled={!email.includes("@")}>
        Email me a sign-in link
      </Button>

      {attempted && (
        <div role="status" className="flex gap-3 rounded-frame border border-primary/30 bg-secondary/50 p-4">
          <Info weight="fill" className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
          <p className="text-sm leading-relaxed text-foreground/85">
            Producer sign-in is not live yet. This site has no account system connected, so no
            email was sent and no account was created or looked up. The form is here so the flow
            can be reviewed before the authentication behind it is built.
          </p>
        </div>
      )}
    </form>
  );
}
