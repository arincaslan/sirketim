import type { Metadata } from "next";

import { JournalGrid } from "@/components/journal/journal-grid";

export const metadata: Metadata = {
  title: "Journal",
  description: "Scent culture, ingredient origins, perfumery, rituals, and interviews.",
};

export default function JournalPage() {
  return <JournalGrid />;
}
