export type PriceRange = "budget" | "mid-range" | "luxury";

export type TravelVibe = "family" | "romantic" | "barkada" | "budget";

export type Category = "resorts" | "beaches" | "staycations" | "hotels" | "food";

export type Province =
  | "Albay"
  | "Camarines Sur"
  | "Camarines Norte"
  | "Catanduanes"
  | "Masbate"
  | "Sorsogon";

export interface ContactLinks {
  website?: string;
  facebook?: string;
  instagram?: string;
  phone?: string;
  email?: string;
}

export interface Listing {
  slug: string;
  name: string;
  category: Category[];
  province: Province;
  city: string;
  address?: string;
  shortDescription: string;
  fullDescription: string;
  amenities: string[];
  priceRange: PriceRange;
  priceGuidance: string; // e.g. "₱1,500 - ₱3,500 per night"
  heroImage: string;
  gallery: string[];
  coordinates?: {
    lat: number;
    lng: number;
  };
  contactLinks: ContactLinks;
  featured: boolean;
  tags: string[];
  status: "active" | "inactive";
  vibes: TravelVibe[];
  rating: number; // e.g. 4.8
  reviewsCount: number; // e.g. 124
}

export interface ProvinceInfo {
  slug: string;
  name: Province;
  tagline: string;
  description: string;
  heroImage: string;
  capital: string;
  attractions: string[];
}

export interface CategoryInfo {
  slug: Category;
  title: string;
  description: string;
  coverImage: string;
}

export interface EditorialGuide {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  readTime: string;
  author: string;
  date: string;
  tags: string[];
}
