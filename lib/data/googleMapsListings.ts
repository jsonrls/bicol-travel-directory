import fs from "node:fs";
import path from "node:path";
import { Listing, Category, PriceRange, Province, TravelVibe } from "../types";
import { categories, provinces } from "./listingsData";

type RawGoogleMapsRow = {
  id: string;
  name: string;
  categories: string;
  provinces: string;
  primaryType: string;
  rating: string;
  reviewsCount: string;
  address: string;
  phone: string;
  website: string;
  googleMapsUrl: string;
  lat: string;
  lng: string;
  priceHint: string;
  hours: string;
  plusCode: string;
};

const CSV_PATH = path.join(process.cwd(), "data", "google-maps", "bicol-google-maps-all.csv");
const VALID_PROVINCES: Province[] = [
  "Albay",
  "Camarines Sur",
  "Camarines Norte",
  "Catanduanes",
  "Masbate",
  "Sorsogon",
];

const PROVINCE_CAPITALS: Record<Province, string> = Object.fromEntries(
  provinces.map((province) => [province.name, province.capital]),
) as Record<Province, string>;

const PROVINCE_KEYWORDS: Record<Province, string[]> = {
  Albay: ["Albay", "Legazpi", "Daraga", "Tabaco", "Ligao", "Bacacay", "Tiwi", "Sto. Domingo", "Camalig", "Guinobatan"],
  "Camarines Sur": ["Camarines Sur", "Naga", "Pili", "Iriga", "Caramoan", "Tinambac", "Goa", "Nabua", "Sipocot"],
  "Camarines Norte": ["Camarines Norte", "Daet", "Vinzons", "Mercedes", "Paracale", "Jose Panganiban", "Labo", "Basud"],
  Catanduanes: ["Catanduanes", "Virac", "Baras", "Bato", "San Andres", "Gigmoto", "Bagamanoc", "Caramoran", "Pandan"],
  Masbate: ["Masbate", "Masbate City", "Mobo", "Aroroy", "Dimasalang", "Milagros", "Cawayan", "San Pascual"],
  Sorsogon: ["Sorsogon", "Sorsogon City", "Gubat", "Donsol", "Bulusan", "Irosin", "Bulan", "Matnog", "Casiguran", "Prieto Diaz"],
};

const CATEGORY_LABELS: Record<Category, string> = {
  resorts: "Resorts",
  beaches: "Beaches & Islands",
  staycations: "Staycations",
  hotels: "Hotels",
  food: "Food & Restaurants",
};

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (char === '"') {
      const nextChar = line[index + 1];
      if (inQuotes && nextChar === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      cells.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current);
  return cells;
}

function parseCsv(text: string): RawGoogleMapsRow[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length <= 1) return [];

  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    return headers.reduce<Record<string, string>>((record, header, index) => {
      record[header] = values[index] ?? "";
      return record;
    }, {}) as RawGoogleMapsRow;
  });
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}

function normalizeCategory(value: string): Category | null {
  if (value === "resorts" || value === "beaches" || value === "staycations" || value === "hotels" || value === "food") {
    return value;
  }
  return null;
}

function splitPiped(value: string): string[] {
  return value.split("|").map((item) => item.trim()).filter(Boolean);
}

function isUsefulAddress(value: string): boolean {
  if (!value) return false;
  if (/^\d+(\.\d+)?\(\d+\)$/.test(value)) return false;
  if (/^Sleeps\s+\d+/i.test(value)) return false;
  return true;
}

function guessProvince(row: RawGoogleMapsRow, address: string | null, name: string): Province {
  const provinceCandidates = splitPiped(row.provinces).filter((province): province is Province =>
    VALID_PROVINCES.includes(province as Province),
  );

  if (provinceCandidates.length === 1) return provinceCandidates[0];

  const searchText = `${name} ${address ?? ""}`.toLowerCase();
  for (const province of provinceCandidates) {
    if (PROVINCE_KEYWORDS[province].some((keyword) => searchText.includes(keyword.toLowerCase()))) {
      return province;
    }
  }

  return provinceCandidates[0] ?? "Albay";
}

function guessCity(name: string, address: string | null, province: Province): string {
  const searchText = `${name}, ${address ?? ""}`;
  for (const keyword of PROVINCE_KEYWORDS[province]) {
    if (keyword === province) continue;
    const pattern = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (pattern.test(searchText)) return keyword;
  }

  if (address) {
    const segments = address
      .split(",")
      .map((segment) => segment.trim())
      .filter(Boolean)
      .filter((segment) => !/^\d+(\.\d+)?\(\d+\)$/.test(segment))
      .filter((segment) => !/^[A-Z0-9+]{4,}$/.test(segment));

    const provinceSegmentIndex = segments.findIndex((segment) =>
      segment.toLowerCase().includes(province.toLowerCase()),
    );

    if (provinceSegmentIndex > 0) return segments[provinceSegmentIndex - 1];
    if (segments.length > 1) return segments[segments.length - 1];
    if (segments.length === 1) return segments[0];
  }

  return PROVINCE_CAPITALS[province];
}

function parsePriceRange(priceHint: string, categoriesForListing: Category[]): PriceRange {
  const numbers = [...priceHint.matchAll(/\d[\d,]*/g)].map((match) => Number(match[0].replace(/,/g, "")));
  const max = numbers.length > 0 ? Math.max(...numbers) : 0;

  if (max >= 5000) return "luxury";
  if (max >= 1200) return "mid-range";
  if (max > 0) return "budget";

  if (categoriesForListing.includes("hotels") || categoriesForListing.includes("staycations")) return "mid-range";
  if (categoriesForListing.includes("resorts")) return "mid-range";
  if (categoriesForListing.includes("food") || categoriesForListing.includes("beaches")) return "budget";
  return "budget";
}

function deriveVibes(categoriesForListing: Category[], priceRange: PriceRange): TravelVibe[] {
  const vibes: TravelVibe[] = [];
  if (categoriesForListing.includes("beaches") || categoriesForListing.includes("food")) vibes.push("barkada");
  if (categoriesForListing.includes("staycations") || categoriesForListing.includes("hotels")) vibes.push("romantic");
  if (categoriesForListing.includes("resorts")) vibes.push("family");
  if (priceRange === "budget" || categoriesForListing.includes("food")) vibes.push("budget");
  return unique(vibes).slice(0, 3);
}

function choosePrimaryCategory(categoriesForListing: Category[]): Category {
  const order: Category[] = ["resorts", "beaches", "staycations", "hotels", "food"];
  return order.find((category) => categoriesForListing.includes(category)) ?? "resorts";
}

function buildShortDescription(name: string, primaryType: string | null, city: string, province: Province, priceHint: string, hours: string): string {
  const typeText = primaryType || "Google Maps destination";
  const priceText = priceHint ? ` with pricing around ${priceHint}` : "";
  const hoursText = hours ? ` Currently listed as ${hours}.` : ".";
  return `${name} is a ${typeText.toLowerCase()} in ${city}, ${province}${priceText}${hoursText}`;
}

function buildFullDescription(
  name: string,
  categoryList: Category[],
  primaryType: string | null,
  city: string,
  province: Province,
  address: string | null,
  priceHint: string,
  hours: string,
  rating: number,
  reviewsCount: number,
): string {
  const categoryText = categoryList.map((category) => CATEGORY_LABELS[category]).join(", ");
  const typeText = primaryType ? `${primaryType.toLowerCase()}` : "destination";
  const addressText = address ? `Google Maps places it around ${address}. ` : "";
  const priceText = priceHint ? `Pricing guidance currently shows ${priceHint}. ` : "Pricing guidance is best checked directly on Google Maps. ";
  const hoursText = hours ? `Hours listed on Google Maps: ${hours}. ` : "";
  const ratingText =
    reviewsCount > 0
      ? `It currently carries a ${rating.toFixed(1)} rating from ${reviewsCount} Google Maps reviews.`
      : rating > 0
        ? `It currently carries a ${rating.toFixed(1)} Google Maps rating.`
        : "Review details should be confirmed directly on Google Maps.";

  return `${name} is part of our ${categoryText} coverage for ${city}, ${province}. This ${typeText} was imported from our Google Maps Bicol dataset. ${addressText}${priceText}${hoursText}${ratingText}`;
}

function buildAmenities(primaryType: string | null, hours: string, priceHint: string, hasCoordinates: boolean): string[] {
  const amenities = [
    primaryType,
    hours ? `Hours: ${hours}` : null,
    priceHint ? `Google Maps pricing: ${priceHint}` : null,
    hasCoordinates ? "Coordinates available" : null,
    "Google Maps listing",
  ].filter(Boolean) as string[];

  return unique(amenities);
}

function buildTags(categoriesForListing: Category[], primaryType: string | null, city: string, province: Province, hours: string, priceHint: string): string[] {
  return unique([
    ...categoriesForListing.map((category) => CATEGORY_LABELS[category]),
    primaryType || "",
    city,
    province,
    priceHint,
    hours ? hours.split("·")[0].trim() : "",
  ].filter(Boolean)).slice(0, 8);
}

function buildGallery(primaryCategory: Category, province: Province): string[] {
  const categoryImage = categories.find((category) => category.slug === primaryCategory)?.coverImage;
  const provinceImage = provinces.find((item) => item.name === province)?.heroImage;
  return unique([categoryImage, provinceImage].filter(Boolean) as string[]);
}

function loadGoogleMapsListings(): Listing[] {
  const rawCsv = fs.readFileSync(CSV_PATH, "utf8");
  const rows = parseCsv(rawCsv);
  const slugCounts = new Map<string, number>();

  return rows.map((row, index) => {
    const categoriesForListing = splitPiped(row.categories)
      .map(normalizeCategory)
      .filter((value): value is Category => value !== null);

    const primaryCategory = choosePrimaryCategory(categoriesForListing);
    const cleanAddress = isUsefulAddress(row.address) ? row.address : null;
    const province = guessProvince(row, cleanAddress, row.name);
    const city = guessCity(row.name, cleanAddress, province);
    const priceGuidance = row.priceHint || "Check Google Maps for latest pricing details";
    const priceRange = parsePriceRange(row.priceHint, categoriesForListing);
    const vibes = deriveVibes(categoriesForListing, priceRange);
    const heroImage =
      categories.find((category) => category.slug === primaryCategory)?.coverImage ||
      provinces.find((item) => item.name === province)?.heroImage ||
      categories[0].coverImage;
    const gallery = buildGallery(primaryCategory, province);
    const baseSlug = slugify(row.name || `listing-${index + 1}`);
    const slugIndex = slugCounts.get(baseSlug) ?? 0;
    slugCounts.set(baseSlug, slugIndex + 1);
    const slug = slugIndex === 0 ? baseSlug : `${baseSlug}-${row.id.slice(0, 6)}`;
    const rating = Number(row.rating) || 0;
    const reviewsCount = Number(row.reviewsCount) || 0;
    const featured = rating >= 4.7 && reviewsCount >= 25;

    return {
      slug,
      name: row.name,
      category: categoriesForListing.length > 0 ? categoriesForListing : [primaryCategory],
      province,
      city,
      address: cleanAddress ?? undefined,
      shortDescription: buildShortDescription(row.name, row.primaryType || null, city, province, row.priceHint, row.hours),
      fullDescription: buildFullDescription(
        row.name,
        categoriesForListing.length > 0 ? categoriesForListing : [primaryCategory],
        row.primaryType || null,
        city,
        province,
        cleanAddress,
        row.priceHint,
        row.hours,
        rating,
        reviewsCount,
      ),
      amenities: buildAmenities(row.primaryType || null, row.hours, row.priceHint, Boolean(row.lat && row.lng)),
      priceRange,
      priceGuidance,
      heroImage,
      gallery,
      coordinates:
        row.lat && row.lng
          ? {
              lat: Number(row.lat),
              lng: Number(row.lng),
            }
          : undefined,
      contactLinks: {
        website: row.website || row.googleMapsUrl,
        phone: row.phone || undefined,
      },
      featured,
      tags: buildTags(categoriesForListing.length > 0 ? categoriesForListing : [primaryCategory], row.primaryType || null, city, province, row.hours, row.priceHint),
      status: "active",
      vibes,
      rating,
      reviewsCount,
    };
  });
}

export const listings: Listing[] = loadGoogleMapsListings();
