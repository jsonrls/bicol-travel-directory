import { provinces, categories, guides } from "./data/listingsData";
import { listings } from "./data/googleMapsListings";
import { Listing, ProvinceInfo, CategoryInfo, EditorialGuide } from "./types";

// Get all active listings
export async function getAllListings(): Promise<Listing[]> {
  return listings.filter((l) => l.status === "active");
}

// Get featured listings
export async function getFeaturedListings(): Promise<Listing[]> {
  const active = await getAllListings();
  return active.filter((l) => l.featured);
}

// Get listings by category
export async function getListingsByCategory(categorySlug: string): Promise<Listing[]> {
  if (!categorySlug) return [];
  const active = await getAllListings();
  return active.filter((l) =>
    l.category.some((cat) => cat.toLowerCase() === categorySlug.toLowerCase())
  );
}

// Get listings by province slug
export async function getListingsByProvince(provinceSlug: string): Promise<Listing[]> {
  if (!provinceSlug) return [];
  const active = await getAllListings();
  return active.filter(
    (l) => l.province.toLowerCase().replace(/\s+/g, "-") === provinceSlug.toLowerCase()
  );
}

// Get listing by slug
export async function getListingBySlug(slug: string): Promise<Listing | null> {
  if (!slug) return null;
  const active = await getAllListings();
  const listing = active.find((l) => l.slug === slug);
  return listing || null;
}

// Get related listings (excluding current listing, matching category or province)
export async function getRelatedListings(
  currentListing: Listing,
  limit: number = 3
): Promise<Listing[]> {
  const active = await getAllListings();
  return active
    .filter((l) => l.slug !== currentListing.slug) // Exclude current
    .map((l) => {
      // Calculate score based on shared categories and province
      let score = 0;
      if (l.province === currentListing.province) score += 3;
      const sharedCategories = l.category.filter((cat) =>
        currentListing.category.includes(cat)
      );
      score += sharedCategories.length * 2;
      return { listing: l, score };
    })
    .filter((item) => item.score > 0) // Must have some similarity
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.listing);
}

// Categories Metadata Query
export async function getCategories(): Promise<CategoryInfo[]> {
  return categories;
}

export async function getCategoryBySlug(slug: string): Promise<CategoryInfo | null> {
  if (!slug) return null;
  const category = categories.find((c) => c.slug === slug);
  return category || null;
}

// Provinces Metadata Query
export async function getProvinces(): Promise<ProvinceInfo[]> {
  return provinces;
}

export async function getProvinceBySlug(provinceSlug: string): Promise<ProvinceInfo | null> {
  if (!provinceSlug) return null;
  const province = provinces.find(
    (p) => p.slug === provinceSlug.toLowerCase() || p.name.toLowerCase() === provinceSlug.toLowerCase()
  );
  return province || null;
}

// Guides Query
export async function getGuides(): Promise<EditorialGuide[]> {
  return guides;
}

export async function getGuideBySlug(slug: string): Promise<EditorialGuide | null> {
  if (!slug) return null;
  const guide = guides.find((g) => g.slug === slug);
  return guide || null;
}
