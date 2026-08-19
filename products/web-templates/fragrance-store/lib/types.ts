export type ScentFamily =
  | "Floral"
  | "Woody"
  | "Oriental"
  | "Fresh"
  | "Gourmand";

export interface ProductSize {
  ml: number;
  price: number;
}

export interface ProductNotes {
  top: string[];
  heart: string[];
  base: string[];
}

export interface Product {
  slug: string;
  name: string;
  family: ScentFamily;
  concentration: "Eau de Parfum" | "Eau de Toilette";
  tagline: string;
  description: string;
  highlights: string[];
  notes: ProductNotes;
  image: string;
  badge?: "Bestseller" | "New" | "Limited";
  sizes: ProductSize[];
}

export interface CartLine {
  slug: string;
  name: string;
  image: string;
  family: ScentFamily;
  sizeMl: number;
  unitPrice: number;
  quantity: number;
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
