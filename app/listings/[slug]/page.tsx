import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  MapPin,
  Star,
  Globe,
  Phone,
  Mail,
  Compass,
  Heart,
  ChevronLeft,
  DollarSign,
  Info,
  Calendar,
  Layers,
} from "lucide-react";
import { getListingBySlug, getRelatedListings, getAllListings } from "../../../lib/db";
import { Listing } from "../../../lib/types";
import { getPriceRangeLabel } from "../../../lib/utils";
import ListingCard from "../../../components/ListingCard";

interface ListingPageProps {
  params: Promise<{
    slug: string;
  }>;
}

function toTitleCase(value: string): string {
  return value.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
}

function getLocalTip(listing: Listing): string {
  if (listing.category.includes("beaches")) {
    return "Check tide, weather, and boat conditions before heading out, especially for island and remote shoreline stops. Bring cash, sun protection, and a dry bag for transfers.";
  }

  if (listing.category.includes("food")) {
    return "Peak meal hours can fill up quickly, so it helps to arrive a bit early for lunch or dinner. Ask the staff about house specialties and daily fresh items before ordering.";
  }

  if (listing.category.includes("hotels")) {
    return "Room rates and inclusions can change by season, so confirm check-in times, parking, and breakfast coverage directly with the property before arrival.";
  }

  if (listing.category.includes("staycations")) {
    return "Many staycation properties rely on direct messaging for confirmations, so verify arrival instructions, parking details, and quiet hours before your trip.";
  }

  if (listing.province === "Catanduanes") {
    return "Weather shifts can affect ferry and road conditions in Catanduanes, so check transport updates in advance and keep a little flexibility in your schedule.";
  }

  if (listing.province === "Masbate" || listing.province === "Sorsogon") {
    return "Travel times can stretch farther than expected in southern Bicol, so confirm your route early and avoid arriving at remote properties too close to nightfall.";
  }

  return "Confirm rates, arrival instructions, and on-site policies directly with the property before your trip. Travel insurance is also a smart backup during the rainy season from June to November.";
}

// Generate static params for all seed listings
export async function generateStaticParams() {
  const allListings = await getAllListings();
  return allListings.map((l) => ({
    slug: l.slug,
  }));
}

// Generate listing-specific SEO metadata
export async function generateMetadata({ params }: ListingPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const listing = await getListingBySlug(resolvedParams.slug);

  if (!listing) {
    return {
      title: "Destination Not Found | BicolStay",
    };
  }

  return {
    title: `${listing.name} - ${listing.city}, ${listing.province} | BicolStay`,
    description: `${listing.shortDescription} View amenities, pricing ranges, exact location, and verified booking details.`,
    openGraph: {
      title: `${listing.name} - ${listing.city}, ${listing.province} | BicolStay`,
      description: listing.shortDescription,
      type: "article",
      url: `https://bicolstay.com/listings/${resolvedParams.slug}`,
      images: [{ url: listing.heroImage }],
    },
  };
}

export default async function ListingPage({ params }: ListingPageProps) {
  const resolvedParams = await params;
  const listing = await getListingBySlug(resolvedParams.slug);

  if (!listing) {
    notFound();
  }

  const relatedListings = await getRelatedListings(listing, 3);
  const displayName = toTitleCase(listing.name);
  const localTip = getLocalTip(listing);
  const priceSymbol = getPriceRangeLabel(listing.priceRange);
  const websiteLabel =
    listing.contactLinks.website?.includes("google.com/maps") ? "Google Maps Listing" : "Official Website";

  // Structured Data (JSON-LD) for Search Engine Crawlers
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": listing.category.includes("food") ? "Restaurant" : "TouristAttraction",
      "name": displayName,
    "description": listing.shortDescription,
    "image": [listing.heroImage, ...listing.gallery],
    "address": {
      "@type": "PostalAddress",
      "addressLocality": listing.city,
      "addressRegion": listing.province,
      "addressCountry": "PH",
    },
    "geo": listing.coordinates
      ? {
          "@type": "GeoCoordinates",
          "latitude": listing.coordinates.lat,
          "longitude": listing.coordinates.lng,
        }
      : undefined,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": listing.rating,
      "reviewCount": listing.reviewsCount,
    },
  };

  return (
    <article className="min-h-screen bg-background">
      {/* JSON-LD Structured Data Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Navigation Breadcrumbs */}
      <div className="bg-card border-b border-border/50 py-4">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back to Directory</span>
            </Link>
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
              <Link href="/" className="hover:text-primary transition-colors">
                Bicol
              </Link>
              <span>/</span>
              <Link
                href={`/locations/${listing.province.toLowerCase().replace(/\s+/g, "-")}`}
                className="hover:text-primary transition-colors"
              >
                {listing.province}
              </Link>
              <span>/</span>
              <span className="text-foreground font-medium truncate max-w-[200px]">{displayName}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Immersive Photo Gallery */}
      <section className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-3xl overflow-hidden shadow-sm">
          {/* Main Hero Image */}
          <div className="md:col-span-2 aspect-[16/10] w-full overflow-hidden bg-muted">
            <img
              src={listing.heroImage}
              alt={`${listing.name} main view`}
              className="h-full w-full object-cover object-center transition-transform duration-700 hover:scale-102"
            />
          </div>

          {/* Sub-gallery images */}
          <div className="flex flex-col gap-4 aspect-[16/10] md:h-full">
            {listing.gallery.slice(0, 2).map((img, idx) => (
              <div key={idx} className="relative flex-1 overflow-hidden bg-muted rounded-2xl md:rounded-none">
                <img
                  src={img}
                  alt={`${listing.name} gallery ${idx + 1}`}
                  className="h-full w-full object-cover object-center transition-transform duration-500 hover:scale-105"
                />
              </div>
            ))}
            {listing.gallery.length === 0 && (
              <div className="flex-1 bg-card border border-border flex items-center justify-center text-xs text-muted-foreground italic rounded-2xl md:rounded-none">
                No additional gallery images available
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Core Detail Grid */}
      <section className="mx-auto max-w-7xl px-6 py-8 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Info Column */}
          <div className="lg:col-span-2 space-y-10">
            {/* Header info */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                {listing.category.map((cat) => (
                  <Link
                    key={cat}
                    href={`/categories/${cat}`}
                    className="inline-flex items-center rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary hover:bg-secondary/20 transition-colors"
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </Link>
                ))}
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 text-accent" />
                  {listing.city}, {listing.province}
                </span>
              </div>

              <h1 className="font-serif text-3xl font-extrabold tracking-tight text-primary sm:text-4xl md:text-5xl leading-tight">
                {displayName}
              </h1>

              {/* Review summary & vibe tags */}
              <div className="flex flex-wrap items-center gap-4 border-t border-b border-border/60 py-4">
                <div className="flex items-center gap-1.5">
                  <Star className="h-5 w-5 fill-accent text-accent" />
                  <span className="text-sm font-bold text-primary">{listing.rating.toFixed(1)}</span>
                  <span className="text-xs text-muted-foreground">({listing.reviewsCount} reviews)</span>
                </div>
                <span className="hidden sm:inline text-border">|</span>
                <div className="flex flex-wrap gap-1.5">
                  {listing.vibes.map((vibe) => (
                    <span
                      key={vibe}
                      className="inline-flex items-center rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent capitalize"
                    >
                      {vibe} Vibe
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Description section */}
            <div className="space-y-4">
              <h2 className="font-serif text-2xl font-bold text-primary">Overview</h2>
              <p className="text-base leading-relaxed text-foreground/90 whitespace-pre-line">
                {listing.fullDescription}
              </p>
            </div>

            {/* Amenities Section */}
            <div className="space-y-4 border-t border-border/50 pt-8">
              <h2 className="font-serif text-2xl font-bold text-primary">Amenities Offered</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {listing.amenities.map((amenity) => (
                  <div key={amenity} className="flex items-start gap-2.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary/15 text-secondary flex-shrink-0 mt-0.5">
                      ✓
                    </span>
                    <span className="text-sm font-medium text-foreground">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Location / Map Section */}
            {(listing.address || listing.coordinates) && (
              <div className="space-y-4 border-t border-border/50 pt-8">
                <h2 className="font-serif text-2xl font-bold text-primary">Location Details</h2>
                <p className="text-sm text-muted-foreground">
                  Find this destination using its mapped address in Google Maps.
                </p>
                <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-inner sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Address</span>
                    <span className="text-sm font-semibold text-primary">
                      {listing.address || `${listing.city}, ${listing.province}`}
                    </span>
                  </div>
                  <a
                    href={
                      listing.coordinates
                        ? `https://www.google.com/maps/search/?api=1&query=${listing.coordinates.lat},${listing.coordinates.lng}`
                        : listing.contactLinks.website || "#"
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-primary px-4 py-2 text-center text-xs font-semibold text-primary-foreground hover:bg-accent transition-colors"
                  >
                    Open in Google Maps
                  </a>
                </div>
              </div>
            )}

            {/* Ideal tags */}
            <div className="space-y-3 border-t border-border/50 pt-8">
              <h3 className="text-xs font-bold uppercase tracking-widest text-primary">
                Ideal For & Keywords
              </h3>
              <div className="flex flex-wrap gap-2">
                {listing.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-lg bg-card border border-border px-3 py-1.5 text-xs font-medium text-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Booking / Contact Column */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-3xl border border-border bg-card p-6 shadow-sm space-y-6">
              {/* Price guidance block */}
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Price Guidance
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="font-serif text-3xl font-extrabold text-primary">{priceSymbol}</span>
                  <span className="text-sm font-semibold text-accent">{listing.priceGuidance}</span>
                </div>
              </div>

              {/* Booking CTA Call */}
              <div className="space-y-3 pt-4 border-t border-border/60">
                <h3 className="text-xs font-bold uppercase tracking-widest text-primary">
                  Direct Inbound Bookings
                </h3>
                <p className="text-xs text-muted-foreground">
                  BicolStay connects you directly to the owners. Use the links below to secure your bookings without service fees.
                </p>

                <div className="flex flex-col gap-2">
                  {listing.contactLinks.website && (
                    <a
                      href={listing.contactLinks.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground hover:border-accent hover:text-accent transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Globe className="h-4 w-4" /> {websiteLabel}
                      </span>
                      <span className="text-xs text-muted-foreground">→</span>
                    </a>
                  )}
                  {listing.contactLinks.facebook && (
                    <a
                      href={listing.contactLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground hover:border-accent hover:text-accent transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg> Facebook Page
                      </span>
                      <span className="text-xs text-muted-foreground">→</span>
                    </a>
                  )}
                  {listing.contactLinks.instagram && (
                    <a
                      href={listing.contactLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground hover:border-accent hover:text-accent transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg> Instagram Account
                      </span>
                      <span className="text-xs text-muted-foreground">→</span>
                    </a>
                  )}
                  {listing.contactLinks.phone && (
                    <a
                      href={`tel:${listing.contactLinks.phone}`}
                      className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground hover:border-accent hover:text-accent transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Phone className="h-4 w-4" /> Call: {listing.contactLinks.phone}
                      </span>
                    </a>
                  )}
                  {listing.contactLinks.email && (
                    <a
                      href={`mailto:${listing.contactLinks.email}`}
                      className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground hover:border-accent hover:text-accent transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Mail className="h-4 w-4" /> Email Enquiries
                      </span>
                    </a>
                  )}
                </div>
              </div>

              {/* Safety notice / local tips */}
              <div className="rounded-2xl bg-secondary/5 border border-secondary/15 p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-secondary uppercase tracking-wider">
                  <Info className="h-4 w-4" />
                  <span>Local Tip & Policy</span>
                </div>
                <p className="text-[11px] leading-relaxed text-primary">
                  {localTip}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related/Nearby Destinations to increase Internal SEO Linking */}
      {relatedListings.length > 0 && (
        <section className="bg-card border-t border-border/50 py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 space-y-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-accent">
                Internal Discovery
              </span>
              <h2 className="mt-1 font-serif text-3xl font-bold tracking-tight text-primary">
                Destinations You May Also Like
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Similar getaways in the Bicol region with matched vibes or provinces.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {relatedListings.map((related) => (
                <ListingCard key={related.slug} listing={related} />
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
