import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/producers/login-form";

export const metadata: Metadata = {
  title: "Producer sign in",
  description: "Sign in to manage your Drydown listings.",
};

export default function ProducerLoginPage() {
  return (
    <div className="container py-14 sm:py-20">
      <div className="mx-auto flex max-w-[46ch] flex-col gap-8">
        <div className="flex flex-col gap-3">
          <h1 className="font-display text-fluid-h2">Producer sign in</h1>
          <p className="text-muted-foreground">
            For fragrance houses listing on Drydown. If you are here to compare fragrances, you
            want the{" "}
            <Link href="/dupe-finder" className="underline underline-offset-2 hover:text-primary">
              Dupe Finder
            </Link>{" "}
            instead.
          </p>
        </div>

        <div className="rounded-frame border border-border bg-card p-6">
          <LoginForm />
        </div>

        <p className="text-sm text-muted-foreground">
          No account yet?{" "}
          <Link href="/producers/pricing" className="underline underline-offset-2 hover:text-primary">
            See the plans
          </Link>
          . The free tier lets you list two fragrances without paying.
        </p>
      </div>
    </div>
  );
}
