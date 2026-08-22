import type { Metadata } from "next";

import { QuizFlow } from "@/components/discover/quiz-flow";

export const metadata: Metadata = {
  title: "Discover your scent",
  description: "Six short questions and a curated fragrance recommendation.",
};

export default function DiscoverPage() {
  return <QuizFlow />;
}
