import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const ROOT = process.cwd();
const OUTPUT_DIR = path.join(ROOT, "data", "google-maps");
const JSON_OUTPUT_PATH = path.join(OUTPUT_DIR, "bicol-google-maps-all.json");
const CSV_OUTPUT_PATH = path.join(OUTPUT_DIR, "bicol-google-maps-all.csv");
const PROGRESS_OUTPUT_PATH = path.join(OUTPUT_DIR, "bicol-google-maps-progress.json");

const PROVINCES = [
  "Albay",
  "Camarines Sur",
  "Camarines Norte",
  "Catanduanes",
  "Masbate",
  "Sorsogon",
];

const CATEGORY_QUERIES = [
  {
    slug: "resorts",
    label: "Resorts",
    searchTerms: ["resort", "beach resort", "mountain resort"],
  },
  {
    slug: "beaches",
    label: "Beaches & Islands",
    searchTerms: ["beach", "island", "beach resort"],
  },
  {
    slug: "staycations",
    label: "Staycations",
    searchTerms: ["staycation", "vacation rental", "cabin resort", "villa"],
  },
  {
    slug: "hotels",
    label: "Hotels",
    searchTerms: ["hotel", "inn", "boutique hotel"],
  },
  {
    slug: "food",
    label: "Food & Restaurants",
    searchTerms: ["restaurant", "cafe", "seafood restaurant"],
  },
];

const PLACE_LINK_SELECTOR = 'a[href*="/maps/place/"], a[href*="/place/"]';
const CATEGORY_FILTER = process.env.GMAP_CATEGORY?.split(",").map((value) => value.trim());
const PROVINCE_FILTER = process.env.GMAP_PROVINCE?.split(",").map((value) => value.trim());
const SEARCH_TERM_FILTER = process.env.GMAP_TERM?.split(",").map((value) => value.trim());
const MAX_PLACES = Number(process.env.GMAP_MAX_PLACES || 0);

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function readJsonIfExists(filePath) {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw error;
  }
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function parseCoordinates(url = "") {
  const match =
    url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) ||
    url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (!match) return null;
  return { lat: Number(match[1]), lng: Number(match[2]) };
}

function parseCid(url = "") {
  const match = url.match(/!1s0x[0-9a-f]+:0x([0-9a-f]+)/i);
  return match ? match[1] : null;
}

function parseReviewCount(text = "") {
  const match = text.replace(/,/g, "").match(/(\d+)/);
  return match ? Number(match[1]) : null;
}

function parseRating(text = "") {
  const match = text.match(/(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : null;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeText(value) {
  return value?.replace(/\s+/g, " ").trim() || null;
}

function isTypeCandidate(value) {
  return /restaurant|cafe|buffet|hotel|resort|beach|island|villa|inn|hostel|lodging|rental|camp|park|bar|diner|grill|eatery|bakery|tourist/i.test(value);
}

function isAmenityCandidate(value) {
  return /free parking|free wi-fi|air-conditioned|breakfast|pool|wifi|pet-friendly|room service|bar|restaurant|kid-friendly|parking/i.test(value);
}

function cleanBulletPrefix(value) {
  return value.replace(/^[·•]\s*/, "").trim();
}

async function acceptConsentIfPresent(page) {
  const consentSelectors = [
    'button:has-text("Accept all")',
    'button:has-text("I agree")',
    'button:has-text("Accept")',
  ];

  for (const selector of consentSelectors) {
    const button = page.locator(selector).first();
    if (await button.count()) {
      try {
        await button.click({ timeout: 3000 });
        await page.waitForTimeout(2000);
        return;
      } catch {
        // Ignore and try the next selector.
      }
    }
  }
}

async function waitForResults(page) {
  await page.waitForLoadState("domcontentloaded");
  await acceptConsentIfPresent(page);
  await page.waitForTimeout(3500);

  const feed = page.locator('[role="feed"]').first();
  if (await feed.count()) {
    await feed.waitFor({ timeout: 15000 });
    return feed;
  }

  const fallback = page.locator('div[role="main"]').first();
  await fallback.waitFor({ timeout: 15000 });
  return fallback;
}

async function collectResultCards(page) {
  const container = await waitForResults(page);
  let stablePasses = 0;
  let previousCount = 0;

  while (stablePasses < 6) {
    const count = await page.locator(".Nv2PK").count();
    if (count > previousCount) {
      previousCount = count;
      stablePasses = 0;
    } else {
      stablePasses += 1;
    }

    await container.evaluate((node) => {
      node.scrollBy(0, node.scrollHeight);
    });
    await page.waitForTimeout(1800);
  }

  const cards = await page.locator(".Nv2PK").evaluateAll((nodes) =>
    nodes.map((node) => {
      const spanTexts = [...node.querySelectorAll("span")]
        .map((span) => span.textContent?.replace(/\s+/g, " ").trim() || "")
        .filter(Boolean);

      const dedupedSpans = [];
      for (const text of spanTexts) {
        if (dedupedSpans[dedupedSpans.length - 1] !== text) dedupedSpans.push(text);
      }

      return {
        name: node.querySelector(".qBF1Pd")?.textContent?.trim() || node.getAttribute("aria-label") || "",
        href: node.querySelector("a.hfpxzc")?.href || "",
        starsAria: node.querySelector('[role="img"][aria-label*="stars"]')?.getAttribute("aria-label") || "",
        ratingText: node.querySelector(".MW4etd")?.textContent?.trim() || "",
        fullText: node.textContent?.replace(/\s+/g, " ").trim() || "",
        spans: dedupedSpans,
      };
    }).filter((item) => item.href && item.name),
  );

  const deduped = [];
  const seen = new Set();

  for (const card of cards) {
    const normalized = card.href.split("?")[0];
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    deduped.push(card);
  }

  return deduped;
}

function buildPlaceFromCard(card, category, province, searchTerm) {
  const coordinates = parseCoordinates(card.href);
  const cid = parseCid(card.href);
  const spans = (card.spans || []).map((value) => normalizeText(value)).filter(Boolean);
  const priceHint = spans.find((value) => /^₱/.test(value)) || null;
  const primaryType = spans.find((value) => isTypeCandidate(value) && !/^open\b|^closed\b/i.test(value)) || null;
  const address = spans.find((value) => {
    if (!value) return false;
    const cleaned = cleanBulletPrefix(value);
    if (cleaned === primaryType) return false;
    if (cleaned === card.name) return false;
    if (/^\d+(\.\d+)?$/.test(cleaned)) return false;
    if (/^₱/.test(cleaned)) return false;
    if (/^open\b|^closed\b/i.test(cleaned)) return false;
    if (isAmenityCandidate(cleaned)) return false;
    if (cleaned === "·") return false;
    return /^[·•]/.test(value) || /\d/.test(cleaned) || /st\b|road\b|ave\b|highway\b|blvd\b|boulevard\b|poblacion\b|barangay\b|brgy\b/i.test(cleaned);
  }) || null;
  const hours = spans.find((value) => /^open\b|^closed\b/i.test(value)) || null;
  const reviewMatch = card.fullText.match(/\(([\d,]+)\)/);

  return {
    id: cid || slugify(`${card.name}-${province}`),
    slug: slugify(card.name),
    name: card.name,
    searchCategory: category.slug,
    searchCategoryLabel: category.label,
    searchProvince: province,
    matchedSearchTerm: searchTerm,
    googleMapsUrl: card.href,
    coordinates,
    primaryType,
    address: address ? cleanBulletPrefix(address) : null,
    phone: null,
    website: null,
    websiteLabel: null,
    plusCode: null,
    hours,
    priceHint,
    rating: parseRating(card.starsAria || card.ratingText || ""),
    reviewsCount: reviewMatch ? Number(reviewMatch[1].replace(/,/g, "")) : null,
    heroImage: null,
    sourceLink: card.href,
    scrapedAt: new Date().toISOString(),
    cardText: card.fullText,
  };
}

async function scrapeQuery(page, category, province, searchTerm, collected) {
  const query = `${searchTerm} in ${province}, Bicol Region, Philippines`;
  const url = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;

  console.log(`Searching: ${query}`);
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });

  const cards = await collectResultCards(page);
  const scopedCards = MAX_PLACES > 0 ? cards.slice(0, MAX_PLACES) : cards;
  console.log(`Found ${cards.length} result cards for ${query}${MAX_PLACES > 0 ? `, keeping first ${scopedCards.length}` : ""}`);

  for (const card of scopedCards) {
    const place = buildPlaceFromCard(card, category, province, searchTerm);
    const existing = collected.get(place.id);
    if (existing) {
      existing.categories = unique([...(existing.categories || []), category.slug]);
      existing.categoryLabels = unique([...(existing.categoryLabels || []), category.label]);
      existing.provinces = unique([...(existing.provinces || []), province]);
      existing.searchTerms = unique([...(existing.searchTerms || []), searchTerm]);
      existing.googleMapsUrl = place.googleMapsUrl || existing.googleMapsUrl;
      existing.coordinates = place.coordinates || existing.coordinates;
      existing.address = place.address || existing.address;
      existing.primaryType = place.primaryType || existing.primaryType;
      existing.rating = place.rating ?? existing.rating;
      existing.reviewsCount = place.reviewsCount ?? existing.reviewsCount;
      existing.hours = place.hours || existing.hours;
      existing.priceHint = place.priceHint || existing.priceHint;
      existing.cardText = place.cardText || existing.cardText;
      existing.scrapedAt = place.scrapedAt;
      continue;
    }

    collected.set(place.id, {
      ...place,
      categories: [category.slug],
      categoryLabels: [category.label],
      provinces: [province],
      searchTerms: [searchTerm],
    });
  }
}

async function writeOutputs(items) {
  const summary = CATEGORY_QUERIES.map((category) => ({
    slug: category.slug,
    label: category.label,
    count: items.filter((item) => item.categories.includes(category.slug)).length,
  }));

  await fs.writeFile(
    JSON_OUTPUT_PATH,
    `${JSON.stringify({ generatedAt: new Date().toISOString(), total: items.length, summary, items }, null, 2)}\n`,
    "utf8",
  );

  const csvHeaders = [
    "id",
    "name",
    "categories",
    "provinces",
    "primaryType",
    "rating",
    "reviewsCount",
    "address",
    "phone",
    "website",
    "googleMapsUrl",
    "lat",
    "lng",
    "priceHint",
    "hours",
    "plusCode",
  ];

  const csvRows = [
    csvHeaders.join(","),
    ...items.map((item) =>
      csvHeaders
        .map((header) => {
          let value = item[header];
          if (header === "categories") value = (item.categories || []).join("|");
          if (header === "provinces") value = (item.provinces || []).join("|");
          if (header === "lat") value = item.coordinates?.lat ?? "";
          if (header === "lng") value = item.coordinates?.lng ?? "";
          const safe = String(value ?? "").replace(/"/g, '""');
          return `"${safe}"`;
        })
        .join(","),
    ),
  ];

  await fs.writeFile(CSV_OUTPUT_PATH, `${csvRows.join("\n")}\n`, "utf8");

  return summary;
}

async function writeProgress(progress) {
  await fs.writeFile(PROGRESS_OUTPUT_PATH, `${JSON.stringify(progress, null, 2)}\n`, "utf8");
}

async function main() {
  await ensureDir(OUTPUT_DIR);

  const existingOutput = await readJsonIfExists(JSON_OUTPUT_PATH);
  const existingProgress = (await readJsonIfExists(PROGRESS_OUTPUT_PATH)) || { completedQueries: [] };
  const completedQueries = new Set(existingProgress.completedQueries || []);

  const browser = await chromium.launch({ headless: process.env.HEADFUL !== "1" });
  const context = await browser.newContext({
    locale: "en-PH",
    timezoneId: "Asia/Manila",
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  });
  const page = await context.newPage();
  const collected = new Map(
    (existingOutput?.items || []).map((item) => [item.id, item]),
  );

  try {
    for (const category of CATEGORY_QUERIES) {
      if (CATEGORY_FILTER?.length && !CATEGORY_FILTER.includes(category.slug)) continue;

      for (const province of PROVINCES) {
        if (PROVINCE_FILTER?.length && !PROVINCE_FILTER.includes(province)) continue;

        for (const searchTerm of category.searchTerms) {
          if (SEARCH_TERM_FILTER?.length && !SEARCH_TERM_FILTER.includes(searchTerm)) continue;
          const queryKey = `${category.slug}::${province}::${searchTerm}`;
          if (completedQueries.has(queryKey)) {
            console.log(`Skipping completed query: ${queryKey}`);
            continue;
          }

          await scrapeQuery(page, category, province, searchTerm, collected);
          await writeOutputs([...collected.values()].sort((a, b) => a.name.localeCompare(b.name)));
          completedQueries.add(queryKey);
          await writeProgress({
            updatedAt: new Date().toISOString(),
            completedQueries: [...completedQueries].sort(),
          });
          await page.waitForTimeout(1500);
        }
      }
    }
  } finally {
    await browser.close();
  }

  const items = [...collected.values()].sort((a, b) => a.name.localeCompare(b.name));
  const summary = await writeOutputs(items);

  console.log(`Saved ${items.length} unique places to ${OUTPUT_DIR}`);
  console.log(summary);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
