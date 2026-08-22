import { PRODUCTS } from "@/lib/products";
import type { Intensity, Product, ScentFamily, Season } from "@/lib/types";

export interface QuizWeight {
  families?: Partial<Record<ScentFamily, number>>;
  intensity?: Partial<Record<Intensity, number>>;
  seasons?: Partial<Record<Season, number>>;
  noteKeywords?: string[];
}

export interface QuizOption {
  id: string;
  label: string;
  description?: string;
  weight: QuizWeight;
}

export interface QuizQuestion {
  id: string;
  axis: "Mood" | "Notes" | "Intensity" | "Occasion" | "Season" | "Style";
  prompt: string;
  subtitle: string;
  options: QuizOption[];
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "mood",
    axis: "Mood",
    prompt: "What kind of mood are you chasing?",
    subtitle: "There's no wrong answer here — go with whatever you pictured first.",
    options: [
      {
        id: "quiet-cold",
        label: "Something quiet and cold",
        description: "Stone, salt air, an empty room",
        weight: { families: { Fresh: 2, Woody: 1 }, intensity: { Light: 2 } },
      },
      {
        id: "warm-enveloping",
        label: "Something warm and enveloping",
        description: "Firelight, resin, a closed door",
        weight: { families: { Oriental: 2, Gourmand: 1 }, intensity: { Intense: 2 } },
      },
      {
        id: "untamed",
        label: "Something a little untamed",
        description: "Leather, smoke, weather",
        weight: { families: { Woody: 2, Oriental: 1 }, intensity: { Intense: 1 } },
      },
      {
        id: "soft-close",
        label: "Something soft and close to skin",
        description: "Petals, paper, quiet rooms",
        weight: { families: { Floral: 2 }, intensity: { Light: 1 } },
      },
    ],
  },
  {
    id: "notes",
    axis: "Notes",
    prompt: "Which of these pulls you in?",
    subtitle: "Trust your gut, not what you think you're 'supposed' to like.",
    options: [
      {
        id: "salt-citrus",
        label: "Salt, citrus, cold stone",
        weight: {
          families: { Fresh: 2 },
          noteKeywords: ["Sea Spray", "Grapefruit", "Bergamot", "Mint"],
        },
      },
      {
        id: "rose-iris",
        label: "Rose, iris, orchid",
        weight: {
          families: { Floral: 2 },
          noteKeywords: ["Rose", "Iris", "Orchid", "Jasmine", "Geranium"],
        },
      },
      {
        id: "amber-spice",
        label: "Amber, resin, spice",
        weight: {
          families: { Oriental: 2 },
          noteKeywords: ["Amber", "Labdanum", "Saffron", "Cardamom", "Incense"],
        },
      },
      {
        id: "leather-smoke",
        label: "Leather, smoke, tobacco",
        weight: {
          families: { Woody: 1, Gourmand: 1 },
          noteKeywords: ["Leather", "Tobacco", "Birch", "Rum", "Smoked Woods"],
        },
      },
    ],
  },
  {
    id: "intensity",
    axis: "Intensity",
    prompt: "How loud should it be?",
    subtitle: "This one changes the shortlist more than any other answer.",
    options: [
      {
        id: "barely-there",
        label: "Barely there — for me, not the room",
        weight: { intensity: { Light: 3 } },
      },
      {
        id: "noticeable-close",
        label: "Noticeable up close",
        weight: { intensity: { Moderate: 3 } },
      },
      {
        id: "fills-the-room",
        label: "Fills the room when I walk in",
        weight: { intensity: { Intense: 3 } },
      },
    ],
  },
  {
    id: "occasion",
    axis: "Occasion",
    prompt: "Where's this fragrance going to live?",
    subtitle: "Think about the version of your week you wear it most.",
    options: [
      {
        id: "everyday",
        label: "Everyday, low-key",
        weight: { intensity: { Light: 1 }, families: { Fresh: 1 } },
      },
      {
        id: "office",
        label: "The office",
        weight: { intensity: { Light: 1 }, families: { Floral: 1, Woody: 1 } },
      },
      {
        id: "nights-out",
        label: "Nights out",
        weight: { intensity: { Intense: 1 }, families: { Oriental: 1 } },
      },
      {
        id: "someone-notices",
        label: "A specific someone should notice",
        weight: { intensity: { Intense: 1 }, families: { Gourmand: 1, Oriental: 1 } },
      },
    ],
  },
  {
    id: "season",
    axis: "Season",
    prompt: "Which season are you dressing for?",
    subtitle: "Pick the one you're buying for right now.",
    options: [
      { id: "spring", label: "Spring", weight: { seasons: { Spring: 2 } } },
      { id: "summer", label: "Summer", weight: { seasons: { Summer: 2 } } },
      { id: "fall", label: "Fall", weight: { seasons: { Fall: 2 } } },
      { id: "winter", label: "Winter", weight: { seasons: { Winter: 2 } } },
    ],
  },
  {
    id: "style",
    axis: "Style",
    prompt: "Pick whichever description sits closest to you.",
    subtitle: "Last one — this just breaks any remaining tie.",
    options: [
      {
        id: "minimal-severe",
        label: "Minimal, considered, a little severe",
        weight: { families: { Woody: 1 }, intensity: { Moderate: 1 } },
      },
      {
        id: "warm-dramatic",
        label: "Warm, generous, a little dramatic",
        weight: { families: { Oriental: 1, Gourmand: 1 } },
      },
      {
        id: "easy-outdoorsy",
        label: "Easy, unfussy, outdoorsy",
        weight: { families: { Fresh: 1 } },
      },
      {
        id: "romantic-detailed",
        label: "Romantic, detail-oriented",
        weight: { families: { Floral: 1 } },
      },
    ],
  },
];

export type QuizAnswers = Record<string, string | undefined>;

export interface QuizResult {
  top: Product;
  alternates: Product[];
  rationale: string[];
  leadingFamily: ScentFamily | null;
}

function collectWeight(answers: QuizAnswers): Required<Omit<QuizWeight, "noteKeywords">> & {
  noteKeywords: string[];
} {
  const families: Partial<Record<ScentFamily, number>> = {};
  const intensity: Partial<Record<Intensity, number>> = {};
  const seasons: Partial<Record<Season, number>> = {};
  const noteKeywords: string[] = [];

  for (const question of QUIZ_QUESTIONS) {
    const chosenId = answers[question.id];
    if (!chosenId) continue;
    const option = question.options.find((o) => o.id === chosenId);
    if (!option) continue;

    for (const [family, weight] of Object.entries(option.weight.families ?? {})) {
      families[family as ScentFamily] = (families[family as ScentFamily] ?? 0) + (weight ?? 0);
    }
    for (const [level, weight] of Object.entries(option.weight.intensity ?? {})) {
      intensity[level as Intensity] = (intensity[level as Intensity] ?? 0) + (weight ?? 0);
    }
    for (const [season, weight] of Object.entries(option.weight.seasons ?? {})) {
      seasons[season as Season] = (seasons[season as Season] ?? 0) + (weight ?? 0);
    }
    if (option.weight.noteKeywords) {
      noteKeywords.push(...option.weight.noteKeywords);
    }
  }

  return { families, intensity, seasons, noteKeywords };
}

export function computeQuizResult(answers: QuizAnswers): QuizResult {
  const accumulated = collectWeight(answers);

  const scored = PRODUCTS.map((product) => {
    let score = 0;
    score += accumulated.families[product.family] ?? 0;
    score += (accumulated.intensity[product.intensity] ?? 0) * 1.5;
    for (const season of product.seasons) {
      score += (accumulated.seasons[season] ?? 0) * 0.6;
    }
    const productNoteText = [...product.notes.top, ...product.notes.heart, ...product.notes.base]
      .join(" ")
      .toLowerCase();
    for (const keyword of accumulated.noteKeywords) {
      if (productNoteText.includes(keyword.toLowerCase())) score += 1.2;
    }
    // Small tie-break toward well-reviewed, in-stock fragrances.
    score += product.rating * 0.1;
    if (product.availability === "sold-out") score -= 5;
    return { product, score };
  }).sort((a, b) => b.score - a.score);

  const top = scored[0]?.product ?? PRODUCTS[0];
  const alternates = scored
    .slice(1)
    .filter((entry) => entry.product.family !== top.family)
    .slice(0, 2)
    .map((entry) => entry.product);

  const fallbackAlternates =
    alternates.length < 2
      ? scored
          .slice(1)
          .map((entry) => entry.product)
          .filter((product) => !alternates.includes(product))
          .slice(0, 2 - alternates.length)
      : [];

  const families = Object.entries(accumulated.families).sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0));
  const leadingFamily = (families[0]?.[0] as ScentFamily) ?? null;

  const rationale: string[] = [];
  if (leadingFamily) {
    rationale.push(`You leaned toward the ${leadingFamily.toLowerCase()} family throughout.`);
  }
  const intensityEntries = Object.entries(accumulated.intensity).sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0));
  if (intensityEntries[0]) {
    rationale.push(`Your answers pointed to a ${(intensityEntries[0][0] as string).toLowerCase()} intensity.`);
  }
  rationale.push(`${top.name} is one of the collection's highest-rated ${top.family.toLowerCase()} fragrances.`);

  return { top, alternates: [...alternates, ...fallbackAlternates], rationale, leadingFamily };
}
