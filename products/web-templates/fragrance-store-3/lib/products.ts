import type { Product, ScentFamily } from "@/lib/types";

export const SCENT_FAMILIES: ScentFamily[] = [
  "Floral",
  "Woody",
  "Oriental",
  "Fresh",
  "Gourmand",
];

export const FAMILY_INFO: Record<ScentFamily, { description: string; mood: string }> = {
  Floral: {
    description: "Petals, green stems, and powder — worn close, never sweet.",
    mood: "A cold greenhouse in February",
  },
  Woody: {
    description: "Cedar, vetiver, and stone — dry, grounded, built to last.",
    mood: "A museum stairwell at closing time",
  },
  Oriental: {
    description: "Resin, spice, and amber — dense, warm, unhurried.",
    mood: "A drawing room at dusk",
  },
  Fresh: {
    description: "Salt, citrus, and cold air — clean without going generic.",
    mood: "The tideline at six in the morning",
  },
  Gourmand: {
    description: "Tonka, smoke, and dark fruit — warm without tipping to candy.",
    mood: "A private library at midnight",
  },
};

/**
 * Ten fragrances, two per olfactive family, each written around a specific
 * remembered place rather than a mood word or an ingredient list — "scent
 * as a place" is the concept the whole catalog is built on. Original to
 * this template; no names, notes, or copy are shared with the sibling
 * templates (`fragrance-store` / "Ambre", `fragrance-store-2` / "Nocturne").
 */
export const PRODUCTS: Product[] = [
  {
    slug: "paper-orchid",
    name: "Paper Orchid",
    place: "A florist's back room, cold concrete, brown paper and twine",
    family: "Floral",
    gender: "Feminine",
    intensity: "Light",
    seasons: ["Spring", "Summer"],
    concentration: "Eau de Toilette",
    tagline: "Cut stems and cold concrete, wrapped in brown paper.",
    story:
      "Paper Orchid opens on crushed fig leaf — the smell of stems, not flowers, the first ten minutes after a delivery is cut. White orchid and tuberose arrive without any sweetness attached, held down by blonde wood so the whole thing stays cool through the dry-down.",
    description:
      "Built to smell like the work of flowers rather than the finished bouquet: green, slightly bitter top notes give way to a white floral heart that never turns candied, settling into a quiet blonde-wood and musk base. Wears close to the skin — this is not a room-filler.",
    highlights: [
      "Green, stem-first opening — not a sweet floral",
      "White orchid and tuberose without the usual sugar",
      "Light enough to reapply through the day",
    ],
    notes: {
      top: ["Crushed Fig Leaf", "Bergamot"],
      heart: ["White Orchid", "Tuberose"],
      base: ["Blonde Woods", "White Musk"],
    },
    longevity: "4–6 hours",
    sillage: "Intimate",
    ingredientsNote:
      "Tuberose absolute is steam-distilled in small batches from a single grower; blonde woods accord is IFRA-compliant and phthalate-free.",
    sustainabilityNote:
      "Bottle is 40% post-consumer recycled glass; outer carton is FSC-certified, uncoated stock, soy ink.",
    sizes: [
      { ml: 2, price: 9, isSample: true },
      { ml: 30, price: 72 },
      { ml: 50, price: 104 },
      { ml: 100, price: 148 },
    ],
    badge: "New",
    availability: "in-stock",
    rating: 4.6,
    reviewCount: 128,
    popularityRank: 6,
    newnessRank: 1,
    reviews: [
      {
        id: "r1",
        author: "M. Alden",
        rating: 5,
        date: "2026-06-02",
        title: "Not what I expected from a floral",
        body: "I usually avoid florals because they read sweet on my skin. This is genuinely green and a little cold — reminds me of the flower shop by my old apartment. Light but noticeable up close.",
        verified: true,
      },
      {
        id: "r2",
        author: "Priya S.",
        rating: 4,
        date: "2026-05-14",
        title: "Beautiful but doesn't last",
        body: "Gorgeous first two hours, then it's mostly gone. Reapply from the 30ml if you want it through a full workday. Still buying the 100 because I love it that much.",
        verified: true,
      },
    ],
  },
  {
    slug: "greenhouse-winter-wing",
    name: "Greenhouse (Winter Wing)",
    place: "The unheated wing of a glasshouse in February, fogged panes",
    family: "Floral",
    gender: "Unisex",
    intensity: "Moderate",
    seasons: ["Fall", "Winter"],
    concentration: "Eau de Parfum",
    tagline: "Fogged glass, cold soil, geraniums that refused to quit.",
    story:
      "Geranium and jasmine sambac at the heart of Winter Wing read more mineral than pretty — the effect we wanted was the smell of a greenhouse's forgotten corner, glass gone opaque with condensation, the heat pipes running but not reaching every bench.",
    description:
      "A vegetal, slightly bitter floral that leans into cold rather than warmth: mandarin and green stem notes up top, geranium and jasmine sambac holding the center, vetiver and musk keeping the base dry instead of sweet. Reads more unisex than most florals in the collection.",
    highlights: [
      "One of two 'Signature' fragrances in the collection",
      "Geranium-forward — unusual, not a rose or jasmine clone",
      "Vetiver base keeps it dry through a full wear",
    ],
    notes: {
      top: ["Crushed Stem Accord", "Mandarin"],
      heart: ["Geranium", "Jasmine Sambac"],
      base: ["Vetiver", "White Musk"],
    },
    longevity: "6–8 hours",
    sillage: "Moderate",
    ingredientsNote:
      "Geranium oil sourced from Grasse; jasmine sambac absolute hand-picked at dawn per traditional harvest timing.",
    sustainabilityNote: "Bottle is 40% post-consumer recycled glass; refill pouch available at checkout.",
    sizes: [
      { ml: 2, price: 10, isSample: true },
      { ml: 30, price: 86 },
      { ml: 50, price: 122 },
      { ml: 100, price: 176 },
    ],
    badge: "Signature",
    availability: "in-stock",
    rating: 4.8,
    reviewCount: 302,
    popularityRank: 2,
    newnessRank: 8,
    reviews: [
      {
        id: "r1",
        author: "Devon K.",
        rating: 5,
        date: "2026-01-20",
        title: "My winter signature for three years running",
        body: "Every year I try to replace this with something new and every year I come back. The geranium is the whole story — green and a little sharp, nothing like a typical floral.",
        verified: true,
      },
      {
        id: "r2",
        author: "Anonymous",
        rating: 5,
        date: "2025-12-11",
        title: "Compliments every single time",
        body: "Wore this to a December wedding and three strangers asked what it was. Sits close but projects when you move. Worth the full price, no discount needed.",
        verified: true,
      },
    ],
  },
  {
    slug: "dust-and-marble",
    name: "Dust & Marble",
    place: "An empty museum stairwell after closing, sun through a skylight",
    family: "Woody",
    gender: "Unisex",
    intensity: "Moderate",
    seasons: ["Fall", "Winter", "Spring"],
    concentration: "Eau de Parfum",
    tagline: "Stone dust and cold marble, lit by a single skylight.",
    story:
      "Cardamom and pink pepper open dry, almost powdery, before cedar and iris root settle into something closer to architecture than perfume — the specific quiet of a stairwell nobody uses at 6pm, dust visible in one shaft of light.",
    description:
      "A dry, mineral woody built around cedar and iris root rather than sweetness: cardamom and pink pepper at the top, a chalky iris heart, vetiver and ambrette in the base. Reads calm and a little severe — closer to stone than to skin.",
    highlights: [
      "Iris root is genuinely expensive to source — the powder-and-stone effect shows it",
      "No vanilla, no amber — a woody with nothing sweet in it",
      "Layers well under Copper Coast for a longer evening wear",
    ],
    notes: {
      top: ["Cardamom", "Pink Pepper"],
      heart: ["Cedar", "Iris Root"],
      base: ["Vetiver", "Ambrette Seed"],
    },
    longevity: "8+ hours",
    sillage: "Moderate",
    ingredientsNote: "Iris root (orris) is aged three years before extraction, per traditional method — the main cost driver in this formula.",
    sustainabilityNote: "Cedar sourced from FSC-certified Virginia stock; bottle uses 40% post-consumer recycled glass.",
    sizes: [
      { ml: 2, price: 11, isSample: true },
      { ml: 30, price: 92 },
      { ml: 50, price: 134 },
      { ml: 100, price: 192 },
    ],
    badge: "Signature",
    availability: "in-stock",
    rating: 4.7,
    reviewCount: 245,
    popularityRank: 3,
    newnessRank: 6,
    reviews: [
      {
        id: "r1",
        author: "T. Nakamura",
        rating: 5,
        date: "2026-03-08",
        title: "Exactly the 'cold stone' brief delivered",
        body: "I work in a converted warehouse and this fits the space perfectly — dry, a little dusty, never sweet. The iris is doing a lot of work here.",
        verified: true,
      },
      {
        id: "r2",
        author: "Renata O.",
        rating: 4,
        date: "2026-02-19",
        title: "Sophisticated but not for everyone",
        body: "This is a 'you'll either love it or find it too austere' scent. I love it. My partner finds it cold. Sillage is moderate, exactly as described.",
        verified: true,
      },
    ],
  },
  {
    slug: "coach-house",
    name: "Coach House",
    place: "A stable's tack room, saddle leather, hay, and oiled wood",
    family: "Woody",
    gender: "Masculine",
    intensity: "Intense",
    seasons: ["Fall", "Winter"],
    concentration: "Eau de Parfum",
    tagline: "Saddle leather, hay dust, and oiled wood in a locked tack room.",
    story:
      "Juniper and black pepper open sharp before a real leather accord and birch tar take over — the actual smell of a working tack room, not a cologne-counter idea of 'leather.' Oakmoss and tobacco leaf hold the base down for hours.",
    description:
      "The most intense woody in the collection: juniper and black pepper up top, a smoked-leather-and-birch heart, oakmoss and tobacco leaf underneath. Built for cold weather and heavy fabric — this is not an office scent.",
    highlights: [
      "Real leather accord, not a synthetic 'suede' wash",
      "Birch tar gives it genuine smoke, not a candle's version of smoke",
      "The longest-wearing scent in the collection at 8+ hours",
    ],
    notes: {
      top: ["Juniper Berry", "Black Pepper"],
      heart: ["Leather Accord", "Birch Tar"],
      base: ["Oakmoss", "Tobacco Leaf"],
    },
    longevity: "8+ hours",
    sillage: "Room-filling",
    ingredientsNote: "Birch tar used at a restrained, IFRA-compliant dose — enough for smoke, not soot.",
    sustainabilityNote: "Oakmoss sourced from an EU-compliant supplier under the current IFRA atranol/chloroatranol limits.",
    sizes: [
      { ml: 2, price: 11, isSample: true },
      { ml: 30, price: 98 },
      { ml: 50, price: 142 },
      { ml: 100, price: 205 },
    ],
    availability: "sold-out",
    rating: 4.5,
    reviewCount: 87,
    popularityRank: 7,
    newnessRank: 4,
    reviews: [
      {
        id: "r1",
        author: "J. Okafor",
        rating: 5,
        date: "2025-11-30",
        title: "Worth the wait for restock",
        body: "Bought a backup bottle the moment I saw 'low stock' last time — glad I did. This is the real deal for leather lovers, not the thin 'leather-adjacent' stuff most brands sell.",
        verified: true,
      },
      {
        id: "r2",
        author: "Anonymous",
        rating: 4,
        date: "2025-10-22",
        title: "Strong — start with two sprays",
        body: "This has real projection. Fantastic in cold weather with a wool coat. Definitely test the sample first if you're sensitive to smoke notes.",
        verified: true,
      },
    ],
  },
  {
    slug: "amber-room",
    name: "Amber Room",
    place: "A locked drawing room at dusk, dying firelight, velvet curtains",
    family: "Oriental",
    gender: "Feminine",
    intensity: "Intense",
    seasons: ["Fall", "Winter"],
    concentration: "Eau de Parfum",
    tagline: "Dying firelight and velvet, an amber necklace left on the sill.",
    story:
      "Cinnamon bark and blood orange open Amber Room hot, then labdanum and rose otto settle into a heart that doesn't move for hours. The base is dense amber resin and real vanilla pod — no shortcuts, no synthetic sweetener standing in for the real thing.",
    description:
      "Our most-reordered fragrance: a spiced, resinous oriental built on labdanum and amber resin, softened by rose otto and finished with vanilla pod. Dense and warm without being cloying — meant to still be there the next morning.",
    highlights: [
      "The collection's #1 bestseller, by a wide margin",
      "Real vanilla pod, not a one-note vanillin substitute",
      "Skin-scent longevity — still detectable 10+ hours later",
    ],
    notes: {
      top: ["Cinnamon Bark", "Blood Orange"],
      heart: ["Labdanum", "Rose Otto"],
      base: ["Amber Resin", "Vanilla Pod"],
    },
    longevity: "8+ hours",
    sillage: "Room-filling",
    ingredientsNote: "Rose otto steam-distilled in the Rose Valley, Bulgaria; vanilla pods sourced direct-trade from Madagascar.",
    sustainabilityNote: "Vanilla sourced through a direct-trade cooperative that pays growers above commodity-market rate.",
    sizes: [
      { ml: 2, price: 12, isSample: true },
      { ml: 30, price: 105 },
      { ml: 50, price: 152 },
      { ml: 100, price: 219 },
    ],
    badge: "Signature",
    availability: "in-stock",
    rating: 4.9,
    reviewCount: 411,
    popularityRank: 1,
    newnessRank: 9,
    reviews: [
      {
        id: "r1",
        author: "C. Whitfield",
        rating: 5,
        date: "2026-04-11",
        title: "Everything everyone says it is",
        body: "Five bottles deep over three years. It's warm without being heavy, and it lasts on my skin longer than anything else I own. The one fragrance I'd replace all others with.",
        verified: true,
      },
      {
        id: "r2",
        author: "Han S.",
        rating: 5,
        date: "2026-03-27",
        title: "Genuinely photographs as advertised",
        body: "The 'firelight in an old room' description is not marketing fluff — that's exactly the mood. Rose keeps it from going full incense. My mother-in-law asked to steal the bottle.",
        verified: true,
      },
      {
        id: "r3",
        author: "Anonymous",
        rating: 4,
        date: "2026-02-02",
        title: "Intense — sample first",
        body: "Beautiful but genuinely room-filling. Wonderful for going out in winter, too much for a small office. Get the sample before committing to the 100ml.",
        verified: true,
      },
    ],
  },
  {
    slug: "copper-coast",
    name: "Copper Coast",
    place: "A shipping port at low tide, hot copper pipe, spice crates opened",
    family: "Oriental",
    gender: "Masculine",
    intensity: "Intense",
    seasons: ["Summer", "Fall"],
    concentration: "Eau de Parfum",
    tagline: "Hot copper pipe and cracked spice crates on the dock at noon.",
    story:
      "Saffron and green cardamom hit first, sharp against a heart of oud and incense — then a custom copper-amber accord and sandalwood settle in, metallic and warm at once, like standing near sun-heated copper pipe on a working dock.",
    description:
      "A spiced, smoky oriental built around a genuinely unusual copper-amber accord — metallic-warm rather than sweet-warm. Saffron and cardamom up top, oud and incense at the heart. Limited production run; this batch will not be repeated exactly.",
    highlights: [
      "A custom 'copper-amber' accord unique to this fragrance",
      "Limited run — accepting preorders for the next batch",
      "Pairs the collection's rarest oud sourcing with real incense resin",
    ],
    notes: {
      top: ["Saffron", "Green Cardamom"],
      heart: ["Oud", "Incense Resin"],
      base: ["Copper-Amber Accord", "Sandalwood"],
    },
    longevity: "8+ hours",
    sillage: "Room-filling",
    ingredientsNote: "Oud sourced from a sustainably managed Agarwood plantation, not wild-harvested stock.",
    sustainabilityNote: "Plantation-grown oud only — no wild Aquilaria harvesting anywhere in this formula.",
    sizes: [
      { ml: 2, price: 13, isSample: true },
      { ml: 30, price: 115 },
      { ml: 50, price: 168 },
      { ml: 100, price: 242 },
    ],
    badge: "Limited",
    availability: "preorder",
    rating: 4.7,
    reviewCount: 63,
    popularityRank: 9,
    newnessRank: 2,
    reviews: [
      {
        id: "r1",
        author: "Marcus T.",
        rating: 5,
        date: "2026-05-30",
        title: "Preordered the moment I tried the sample",
        body: "Nothing else in my collection smells like this. The metallic edge on the amber is genuinely novel — not just 'oud number four.'",
        verified: true,
      },
      {
        id: "r2",
        author: "Anonymous",
        rating: 4,
        date: "2026-05-02",
        title: "Bold — glad it's a small run",
        body: "This is a statement scent, not an everyday one. Loving mine but I understand why they cap the batch size.",
        verified: false,
      },
    ],
  },
  {
    slug: "low-tide",
    name: "Low Tide",
    place: "The tideline at six in the morning, wet granite, drying seaweed",
    family: "Fresh",
    gender: "Unisex",
    intensity: "Light",
    seasons: ["Spring", "Summer"],
    concentration: "Eau de Toilette",
    tagline: "Wet granite and drying seaweed at the tideline, before anyone's awake.",
    story:
      "Sea spray and grapefruit open cold, then fig leaf and a salt accord take over — meant to read like the smell of a coastline at low tide, not a swimming pool or a 'clean laundry' cliché. Driftwood and ambrette hold the base down.",
    description:
      "A coastal fresh built on a genuine salt accord rather than a generic aquatic note: sea spray and grapefruit up top, fig leaf and salt at the heart, driftwood and ambrette seed underneath. Reads outdoors, not indoors.",
    highlights: [
      "Salt accord reads as coastline, not laundry-aisle 'clean'",
      "Fig leaf heart note gives it texture most fresh scents skip",
      "Light enough to layer under anything in the collection",
    ],
    notes: {
      top: ["Sea Spray Accord", "Grapefruit"],
      heart: ["Fig Leaf", "Salt Accord"],
      base: ["Driftwood", "Ambrette Seed"],
    },
    longevity: "4–6 hours",
    sillage: "Intimate",
    ingredientsNote: "Salt accord is a proprietary mineral-marine base — no ambroxan overload, unlike most 'ocean' fragrances.",
    sustainabilityNote: "Bottle is 40% post-consumer recycled glass; ships in a reusable cotton pouch, no plastic sleeve.",
    sizes: [
      { ml: 2, price: 8, isSample: true },
      { ml: 30, price: 68 },
      { ml: 50, price: 98 },
      { ml: 100, price: 139 },
    ],
    availability: "in-stock",
    rating: 4.4,
    reviewCount: 176,
    popularityRank: 5,
    newnessRank: 7,
    reviews: [
      {
        id: "r1",
        author: "Sam R.",
        rating: 5,
        date: "2026-06-15",
        title: "My whole summer in a bottle",
        body: "I live nowhere near the coast and this makes me feel like I do for a few hours every morning. Not overly 'clean' smelling like most ocean scents.",
        verified: true,
      },
      {
        id: "r2",
        author: "Anonymous",
        rating: 3,
        date: "2026-05-19",
        title: "Nice but fades fast",
        body: "Lovely opening, gone in about four hours on my skin. Great for a morning application before a beach day, not a full-day scent for me.",
        verified: true,
      },
    ],
  },
  {
    slug: "cold-chapel",
    name: "Cold Chapel",
    place: "A stone chapel, door left open in early spring, cool air and wax",
    family: "Fresh",
    gender: "Unisex",
    intensity: "Light",
    seasons: ["Spring", "Summer", "Fall"],
    concentration: "Eau de Toilette",
    tagline: "Cool stone air and beeswax, door left open in early spring.",
    story:
      "Bergamot and mint open crisp before lavender and green tea settle into something closer to architecture than garden — cold stone, a little beeswax, air that hasn't warmed up yet. White musk and cedar hold the base without adding weight.",
    description:
      "A quiet, mineral-green fresh: bergamot and mint at the top, lavender and green tea at the heart, white musk and cedar underneath. The lightest scent in the collection alongside Paper Orchid, but colder and less floral.",
    highlights: [
      "Green tea heart keeps the lavender from reading 'soap'",
      "One of the most versatile scents — office to evening",
      "Newest release in the Fresh family",
    ],
    notes: {
      top: ["Bergamot", "Mint"],
      heart: ["Lavender", "Green Tea"],
      base: ["White Musk", "Cedar"],
    },
    longevity: "4–6 hours",
    sillage: "Intimate",
    ingredientsNote: "Lavender sourced from a single high-altitude Provence grower, harvested at peak linalool content.",
    sustainabilityNote: "Bottle is 40% post-consumer recycled glass; carton uses soy ink on FSC-certified stock.",
    sizes: [
      { ml: 2, price: 8, isSample: true },
      { ml: 30, price: 70 },
      { ml: 50, price: 101 },
      { ml: 100, price: 144 },
    ],
    badge: "New",
    availability: "in-stock",
    rating: 4.6,
    reviewCount: 54,
    popularityRank: 8,
    newnessRank: 3,
    reviews: [
      {
        id: "r1",
        author: "Elin V.",
        rating: 5,
        date: "2026-07-01",
        title: "Instant favorite for hot weather",
        body: "Cooling and quiet without smelling like a bar of soap, which is my usual problem with lavender scents. Green tea note is the trick that makes it work.",
        verified: true,
      },
      {
        id: "r2",
        author: "Anonymous",
        rating: 4,
        date: "2026-06-24",
        title: "Great layering base",
        body: "I've started wearing this under Coach House on cold days for a fresh-then-warm effect through the day. Works really well.",
        verified: false,
      },
    ],
  },
  {
    slug: "the-reading-room",
    name: "The Reading Room",
    place: "A private library at midnight, old paper, dark rum, a dying candle",
    family: "Gourmand",
    gender: "Masculine",
    intensity: "Intense",
    seasons: ["Fall", "Winter"],
    concentration: "Eau de Parfum",
    tagline: "Old paper, dark rum, and a candle burning down to nothing.",
    story:
      "Bergamot and cardamom open The Reading Room before tobacco flower and a dark rum accord take the center — genuinely boozy without tipping sweet. Tonka bean and leather hold the base for a long, warm dry-down.",
    description:
      "A tobacco-and-rum gourmand built for cold months: bergamot and cardamom at the top, tobacco flower and dark rum at the heart, tonka bean and leather underneath. Warm and a little decadent without ever reading as a dessert.",
    highlights: [
      "Genuinely boozy rum accord, built without added sugar-sweetness",
      "Tonka bean base reads warm, not candy-sweet",
      "One of the longest-wearing scents in the whole collection",
    ],
    notes: {
      top: ["Bergamot", "Cardamom"],
      heart: ["Tobacco Flower", "Dark Rum Accord"],
      base: ["Tonka Bean", "Leather"],
    },
    longevity: "8+ hours",
    sillage: "Moderate",
    ingredientsNote: "Tonka bean sourced from Venezuela; rum accord built without any added sucrose or vanillin overload.",
    sustainabilityNote: "Tobacco flower absolute from a certified sustainable grower cooperative in Turkey.",
    sizes: [
      { ml: 2, price: 11, isSample: true },
      { ml: 30, price: 95 },
      { ml: 50, price: 138 },
      { ml: 100, price: 198 },
    ],
    badge: "Signature",
    availability: "in-stock",
    rating: 4.8,
    reviewCount: 289,
    popularityRank: 4,
    newnessRank: 10,
    reviews: [
      {
        id: "r1",
        author: "Ola B.",
        rating: 5,
        date: "2026-01-05",
        title: "Not sweet — that's the whole point",
        body: "If you've been burned by 'gourmand' fragrances that smell like dessert, this is the antidote. Tobacco and rum, genuinely, with a dry leather finish.",
        verified: true,
      },
      {
        id: "r2",
        author: "Anonymous",
        rating: 5,
        date: "2025-12-28",
        title: "Best cold-weather scent I own",
        body: "Wore this through an entire snowstorm weekend and it held up beautifully. Warm without being cloying. Will be a repeat purchase every winter.",
        verified: true,
      },
    ],
  },
  {
    slug: "fig-and-ember",
    name: "Fig & Ember",
    place: "A late-summer bonfire in a fig orchard, smoke through ripe fruit",
    family: "Gourmand",
    gender: "Feminine",
    intensity: "Moderate",
    seasons: ["Summer", "Fall"],
    concentration: "Eau de Parfum",
    tagline: "Smoke drifting through a fig orchard on the last warm night.",
    story:
      "Fig nectar and blood orange open sweet-but-not-candied, then smoked woods and praline settle into the heart — the actual effect of standing near a dying bonfire while ripe figs are still warm on the branch. Vanilla and benzoin close it out slowly.",
    description:
      "A fruited gourmand balanced by real smoke: fig nectar and blood orange at the top, smoked woods and praline at the heart, vanilla and benzoin at the base. Limited-batch; this is the smallest production run in the collection.",
    highlights: [
      "Fig nectar without the usual coconut-suncream cliché",
      "Real smoked-woods accord, not a synthetic 'campfire' note",
      "Small-batch — production capped intentionally",
    ],
    notes: {
      top: ["Fig Nectar", "Blood Orange"],
      heart: ["Smoked Woods", "Praline Accord"],
      base: ["Vanilla", "Benzoin"],
    },
    longevity: "6–8 hours",
    sillage: "Moderate",
    ingredientsNote: "Benzoin resin sourced from Laos; praline accord built from real hazelnut extract, not a synthetic base alone.",
    sustainabilityNote: "Small production batches by design — reduces unsold inventory rather than a specific certification claim.",
    sizes: [
      { ml: 2, price: 10, isSample: true },
      { ml: 30, price: 89 },
      { ml: 50, price: 129 },
      { ml: 100, price: 185 },
    ],
    badge: "Limited",
    availability: "low-stock",
    rating: 4.5,
    reviewCount: 41,
    popularityRank: 10,
    newnessRank: 5,
    reviews: [
      {
        id: "r1",
        author: "Greta L.",
        rating: 5,
        date: "2026-08-02",
        title: "Grabbed a backup at 'low stock'",
        body: "The fig here isn't the usual sunscreen-coconut thing — it's genuinely fruity with real smoke underneath. Bought a second bottle as soon as I saw the stock warning.",
        verified: true,
      },
      {
        id: "r2",
        author: "Anonymous",
        rating: 4,
        date: "2026-07-20",
        title: "Lovely transitional scent",
        body: "Perfect for late summer into fall. Doesn't read heavy despite the smoke note. Wish the batches were bigger, honestly.",
        verified: true,
      },
    ],
  },
];

export function getAllProducts(): Product[] {
  return PRODUCTS;
}

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((product) => product.slug === slug);
}

/** The size shown as "the" price on grid cards and badges — the middle (50ml) bottle. */
export function getDefaultSize(product: Product) {
  return product.sizes.find((size) => size.ml === 50) ?? product.sizes[1] ?? product.sizes[0];
}

export function getSampleSize(product: Product) {
  return product.sizes.find((size) => size.isSample);
}

export function getFullSizes(product: Product) {
  return product.sizes.filter((size) => !size.isSample);
}

export function getStartingPrice(product: Product): number {
  return Math.min(...getFullSizes(product).map((size) => size.price));
}

export function getRelatedProducts(slug: string, count = 4): Product[] {
  const current = getProductBySlug(slug);
  if (!current) return [];

  const sameFamily = PRODUCTS.filter(
    (product) => product.slug !== slug && product.family === current.family
  );
  const others = PRODUCTS.filter(
    (product) => product.slug !== slug && product.family !== current.family
  );

  return [...sameFamily, ...others].slice(0, count);
}

/** "Complete the ritual" cross-sell: a different family and a different
 * concentration than the current product, so it reads as a genuine pairing
 * rather than a near-duplicate of what the shopper is already looking at. */
export function getCrossSellProducts(slug: string, count = 3): Product[] {
  const current = getProductBySlug(slug);
  if (!current) return [];
  return PRODUCTS.filter(
    (product) => product.slug !== slug && product.family !== current.family
  )
    .sort((a, b) => a.popularityRank - b.popularityRank)
    .slice(0, count);
}

export type SortOption = "featured" | "newest" | "bestsellers" | "price-asc" | "price-desc" | "rating";

export function sortProducts(products: Product[], sort: SortOption): Product[] {
  const list = [...products];
  switch (sort) {
    case "newest":
      return list.sort((a, b) => a.newnessRank - b.newnessRank);
    case "bestsellers":
      return list.sort((a, b) => a.popularityRank - b.popularityRank);
    case "price-asc":
      return list.sort((a, b) => getStartingPrice(a) - getStartingPrice(b));
    case "price-desc":
      return list.sort((a, b) => getStartingPrice(b) - getStartingPrice(a));
    case "rating":
      return list.sort((a, b) => b.rating - a.rating);
    case "featured":
    default:
      return list.sort((a, b) => a.popularityRank - b.popularityRank);
  }
}

export function getBestsellers(count = 4): Product[] {
  return sortProducts(PRODUCTS, "bestsellers").slice(0, count);
}

export function getLimitedEdition(): Product | undefined {
  return PRODUCTS.find((product) => product.badge === "Limited" && product.availability !== "sold-out")
    ?? PRODUCTS.find((product) => product.badge === "Limited");
}
