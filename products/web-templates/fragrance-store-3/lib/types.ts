export type ScentFamily = "Floral" | "Woody" | "Oriental" | "Fresh" | "Gourmand";

export type GenderExpression = "Feminine" | "Masculine" | "Unisex";

export type Intensity = "Light" | "Moderate" | "Intense";

export type Season = "Spring" | "Summer" | "Fall" | "Winter";

export type Concentration = "Eau de Parfum" | "Eau de Toilette";

export type Availability = "in-stock" | "low-stock" | "preorder" | "sold-out";

export interface ProductSize {
  ml: number;
  price: number;
  /** A discovery-size vial — surfaced separately in the UI as "Sample". */
  isSample?: boolean;
}

export interface ProductNotes {
  top: string[];
  heart: string[];
  base: string[];
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  body: string;
  verified: boolean;
}

export interface Product {
  slug: string;
  name: string;
  /** The place/atmosphere this fragrance is built around — "scent as a
   * place" is the concept the whole catalog is written around. */
  place: string;
  family: ScentFamily;
  gender: GenderExpression;
  intensity: Intensity;
  seasons: Season[];
  concentration: Concentration;
  tagline: string;
  story: string;
  description: string;
  highlights: string[];
  notes: ProductNotes;
  longevity: "4–6 hours" | "6–8 hours" | "8+ hours";
  sillage: "Intimate" | "Moderate" | "Room-filling";
  ingredientsNote: string;
  sustainabilityNote: string;
  sizes: ProductSize[];
  badge?: "Signature" | "New" | "Limited";
  availability: Availability;
  rating: number;
  reviewCount: number;
  reviews: Review[];
  /** Lower = closer to the top of "Bestsellers" sort. */
  popularityRank: number;
  /** Lower = closer to the top of "Newest" sort. */
  newnessRank: number;
}

export interface CartLine {
  slug: string;
  name: string;
  family: ScentFamily;
  sizeMl: number;
  isSample?: boolean;
  unitPrice: number;
  quantity: number;
}

export interface WishlistLine {
  slug: string;
  addedAt: number;
}

export interface ShippingDetails {
  fullName: string;
  email: string;
  phone: string;
  address1: string;
  address2: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
}

export interface PaymentDetails {
  cardName: string;
  cardNumber: string;
  expiry: string;
  cvc: string;
}

export interface JournalPost {
  slug: string;
  title: string;
  category: "Culture" | "Ingredients" | "Perfumery" | "Rituals" | "Interviews" | "Seasonal";
  excerpt: string;
  body: string[];
  readingTimeMinutes: number;
  publishedAt: string;
  featured?: boolean;
}
