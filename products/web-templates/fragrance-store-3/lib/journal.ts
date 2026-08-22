import type { JournalPost } from "@/lib/types";

export const JOURNAL_CATEGORIES: JournalPost["category"][] = [
  "Culture",
  "Ingredients",
  "Perfumery",
  "Rituals",
  "Interviews",
  "Seasonal",
];

export const JOURNAL_POSTS: JournalPost[] = [
  {
    slug: "why-scent-remembers-places",
    title: "Why Scent Remembers Places, Not Events",
    category: "Culture",
    excerpt:
      "Memory researchers have a name for it: the Proust phenomenon. Smell is the only sense with a direct line to the brain's memory center — which is exactly why we built this catalog around places instead of moods.",
    readingTimeMinutes: 6,
    publishedAt: "2026-07-28",
    featured: true,
    body: [
      "Every other sense gets routed through the thalamus first — a kind of switchboard that files information before it reaches memory or emotion. Smell skips that step entirely. Olfactory signals travel straight to the amygdala and hippocampus, the brain's emotion and memory centers, which is why a smell can put you back in a specific room faster and more completely than a photograph of that same room ever could.",
      "That's the practical reason this entire collection is organized around remembered places rather than adjectives. 'Woody' or 'floral' describes an ingredient list. 'A museum stairwell after closing' describes an experience your brain already has a file for, even if you've never stood in that exact stairwell — the cold stone, the particular quality of afternoon light through a skylight, the sense of being somewhere usually full of people and finding it empty.",
      "We ask every perfumer we work with the same opening question before a formula gets built: not 'what should this smell like,' but 'where does this happen.' Amber Room started as a single sentence — a locked drawing room at dusk, curtains drawn, the fire nearly out — and every ingredient decision after that had to earn its place in that specific room, not just in the abstract category of 'oriental.'",
      "It's a harder brief than it sounds. Most fragrance development starts from an accord — a base structure that's already known to work — and adjusts from there. Building from a place means starting with constraints that have nothing to do with perfumery convention: what does cold stone smell adjacent to, is there a version of 'firelight' that isn't a literal smoke note, what makes a heart note read as 'dusk' instead of just 'evening.' It takes longer. We think it's worth it.",
    ],
  },
  {
    slug: "sourcing-iris-root",
    title: "The Three-Year Wait Behind a Single Iris Note",
    category: "Ingredients",
    excerpt:
      "Orris butter — the extract behind Dust & Marble's powdery, stone-cold heart — is one of the most expensive raw materials in perfumery, and almost all of that cost is time, not rarity.",
    readingTimeMinutes: 5,
    publishedAt: "2026-06-19",
    body: [
      "Iris root doesn't smell like much when it's harvested. The rhizomes are dug up, cleaned, and then — this is the part that makes orris butter so expensive — left to dry and age for a minimum of two to three years before they're ready for extraction. During that time, compounds called irones develop slowly inside the root, and it's the irones that give aged orris its signature cold, powdery, faintly carrot-and-violet character.",
      "There's no way to speed this up. Fresh iris root extract smells thin and vegetal, nothing like the material perfumers actually want. So a three-year-old batch of rhizomes, harvested and then simply left in dry storage, is worth dramatically more than a batch dug up last season — not because of scarcity, but because someone had to tie up capital in a raw material for three years before it became useful.",
      "By the time it's extracted (typically by solvent extraction to produce a concrete, then further refined into the butter), the yield is brutally small: it takes roughly a ton of dried rhizomes to produce a single kilogram of orris butter. That ratio, multiplied by three years of aging, is why iris is often quoted alongside natural rose and jasmine as one of the three most expensive materials a perfumer can reach for.",
      "In Dust & Marble, iris root isn't a supporting note — it's most of the heart. We use it at a concentration high enough that the aging cost shows up directly in the retail price, which is part of why that fragrance sits toward the top of the Woody family's price range. We'd rather say that plainly than hide it in a vague 'premium ingredients' line.",
    ],
  },
  {
    slug: "how-a-note-pyramid-actually-works",
    title: "Top, Heart, Base: What the Pyramid Actually Describes",
    category: "Perfumery",
    excerpt:
      "The classic 'note pyramid' is often drawn as a static triangle, which is a little misleading — it's really a timeline. Here's what's actually happening on your skin during the first eight hours of a wear.",
    readingTimeMinutes: 7,
    publishedAt: "2026-05-11",
    body: [
      "Every fragrance is a mixture of molecules with wildly different volatility — the technical word for how quickly a compound evaporates at skin temperature. Top notes are built from the most volatile molecules: citrus oils, light aldehydes, some fruit esters. They hit your nose within seconds of application and are largely gone within fifteen to thirty minutes, which is exactly why a fragrance can smell dramatically different in the bottle than it does an hour into wearing it.",
      "Heart notes (sometimes called 'middle notes') are the next tier down in volatility — florals, spices, some green and herbal materials. These typically emerge as the top notes fade and hold the center of the fragrance for one to four hours, depending on concentration and the specific molecules involved. This is usually what people mean when they describe a fragrance's overall character, since it's the phase most people spend the most time smelling, both on themselves and on others.",
      "Base notes are the least volatile: woods, resins, musks, amber materials, vanilla-adjacent molecules. These can take thirty minutes to an hour to become fully perceptible and then hold on for hours afterward — often the only thing left on a piece of fabric the next morning. Base notes also do quiet structural work throughout the whole wear: many of them act as fixatives, physically slowing the evaporation of the more volatile top and heart materials.",
      "The reason we animate the notes thread on every product page as a vertical timeline instead of a static triangle graphic is that the triangle shape (wide top, narrow base) was originally about the proportion of ingredients by note category, not about time — and that visual convention gets misread constantly as 'the base is the smallest part.' It usually isn't. A base-heavy fragrance like Coach House or The Reading Room can have a base accord that's a larger percentage of the formula than its top notes; it's just less overpowering because those molecules are released more slowly.",
    ],
  },
  {
    slug: "the-two-spray-rule",
    title: "The Two-Spray Rule, and Other Application Habits Worth Keeping",
    category: "Rituals",
    excerpt:
      "More fragrance is not more effective. A short list of habits that actually change how a scent performs over a full day, gathered from customer support tickets and our own testing.",
    readingTimeMinutes: 4,
    publishedAt: "2026-04-02",
    body: [
      "Pulse points get recommended constantly — wrists, neck, behind the ears — mostly because they run slightly warmer than the rest of your skin, and heat accelerates the release of fragrance molecules. It's real advice, but it's incomplete: pulse points are also high-friction areas that get washed, rubbed against clothing, and exposed to hand sanitizer repeatedly through the day, all of which strip fragrance faster than an area like the forearm or chest.",
      "Moisturized skin holds fragrance measurably longer than dry skin. Fragrance molecules bind to oils and lipids on the skin's surface; dry skin has less for them to bind to, so a scent both fades faster and can smell 'thinner' on dry skin than the exact same product does on well-moisturized skin. An unscented lotion applied before your fragrance is the single highest-leverage habit for longevity, ahead of reapplying more product.",
      "Two sprays from roughly six inches away, aimed at clothing or skin rather than into the air, is enough for the vast majority of eau de parfum concentrations at normal room distance. Spraying more doesn't make a fragrance perform proportionally longer — it mostly raises the initial intensity, which fades at close to the same rate, meaning you get a stronger first twenty minutes and not much else for the trade-off.",
      "Storage matters more than people expect. Heat, light, and temperature swings all accelerate the breakdown of fragrance molecules, especially citrus and other top-note materials. A bathroom shelf next to a hot shower is close to the worst place to keep a bottle; a closed drawer or box away from a window will keep any of our fragrances performing as intended for years longer.",
    ],
  },
  {
    slug: "interview-the-nose-behind-amber-room",
    title: "An Interview With the Perfumer Behind Amber Room",
    category: "Interviews",
    excerpt:
      "We sat down with the independent perfumer who developed our best-selling fragrance to talk about labdanum, restraint, and why the brief was 'a room, not a person.'",
    readingTimeMinutes: 8,
    publishedAt: "2026-03-15",
    body: [
      "Q: The brief for Amber Room was famously just one paragraph describing a room, not an ingredient list. What do you do with that as a starting point?",
      "A: Honestly, it's easier than an ingredient list, once you get past the discomfort of not having one. An ingredient list tells me what to use. A room tells me what it has to feel like, and then I have to go find the materials that get there — which usually means throwing out my first three attempts, because the 'correct' oriental accord on paper felt too polished, too much like a fragrance and not enough like a room with a fire dying in it.",
      "Q: Labdanum does most of the structural work in the final formula. Why that material specifically?",
      "A: Labdanum has this quality that's hard to get from cleaner, more 'perfumery' amber bases — a slight animalic warmth, almost like leather or old wood smoke, underneath the resinous sweetness. Synthetic amber accords are often built to remove exactly that quality because it can read as 'dirty' to some noses. I wanted it left in. A drawing room that's been lived in for decades has some of that same complexity — it's not a clean smell, and it shouldn't be.",
      "Q: Was rose otto always part of the plan, or did it come in later to soften something?",
      "A: Later, and you've guessed correctly why. Early versions leaned so hard into the labdanum's darker side that it stopped feeling like a room and started feeling like an accord demonstration. Rose otto at a low dose doesn't sweeten it so much as it adds a sense of a person having recently been in the room — perfume left on a scarf, that kind of presence. That was the note that made the brief click into place for me.",
      "Q: What's the actual failure rate on a brief like this before something works?",
      "A: For Amber Room, eleven formula revisions over about five months. That's actually fast for a brief this specific. The ones that take longer are usually the cold, quiet ones — Cold Chapel took closer to nine months, because 'quiet' is much harder to formulate toward than 'warm and dense.' Warmth forgives more mistakes.",
    ],
  },
  {
    slug: "dressing-a-fragrance-for-winter",
    title: "Dressing a Fragrance for Winter: Layering Notes, Not Just Clothes",
    category: "Seasonal",
    excerpt:
      "Cold air changes how fragrance actually performs on skin — not just what feels appropriate to wear. A practical look at why heavier scents read differently once the temperature drops.",
    readingTimeMinutes: 5,
    publishedAt: "2026-01-08",
    body: [
      "Fragrance molecules evaporate more slowly in cold, dry air than in warm, humid air — which is part of the reason a dense, resinous fragrance like Amber Room or a smoky woody like Coach House can feel almost restrained in July and expansive in December, despite being the exact same formula. Cold air also carries scent differently at close range, which is why winter fragrances tend to lean into richer base notes: they're not fighting to project through humidity the way a summer citrus has to.",
      "This is also why the 'wear lighter scents in summer, heavier in winter' advice, while a cliché, has real chemistry behind it. A fresh, citrus-forward fragrance like Low Tide is built from highly volatile top-note materials that perform exactly as intended in warm weather — bright, then fading within a few hours as the heat accelerates their evaporation. In cold weather, that same fragrance can feel like it barely registers, because the top notes never fully 'open' without ambient warmth helping them along.",
      "Layering across the collection is a legitimate way to extend a lighter fragrance's range into colder months, not just a marketing suggestion. Cold Chapel worn under Coach House, applied roughly fifteen minutes apart so each has time to settle, gives you Cold Chapel's crisp opening for the first half hour before Coach House's leather-and-birch base takes over for the rest of the day — effectively borrowing a longevity profile that neither fragrance has entirely on its own.",
      "If you only own one bottle and winter has arrived, the simplest adjustment is application site: move from wrists (exposed to cold air and gloves) to the inside of a scarf or collar, where body heat is trapped and sustained closer to the fragrance for longer. It's a small change that measurably extends perceived longevity without buying a second bottle.",
    ],
  },
];

export function getAllJournalPosts(): JournalPost[] {
  return [...JOURNAL_POSTS].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export function getJournalPostBySlug(slug: string): JournalPost | undefined {
  return JOURNAL_POSTS.find((post) => post.slug === slug);
}

export function getFeaturedJournalPost(): JournalPost {
  return JOURNAL_POSTS.find((post) => post.featured) ?? JOURNAL_POSTS[0];
}

export function getRelatedJournalPosts(slug: string, count = 3): JournalPost[] {
  const current = getJournalPostBySlug(slug);
  if (!current) return [];
  return JOURNAL_POSTS.filter((post) => post.slug !== slug && post.category === current.category)
    .concat(JOURNAL_POSTS.filter((post) => post.slug !== slug && post.category !== current.category))
    .slice(0, count);
}
