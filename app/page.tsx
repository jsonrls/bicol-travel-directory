import React, { Suspense } from "react";
import Link from "next/link";
import { Compass, Sparkles, MapPin, ArrowRight, BookOpen, Clock } from "lucide-react";
import { getFeaturedListings, getAllListings, getProvinces, getCategories, getGuides } from "../lib/db";
import ListingCard from "../components/ListingCard";
import FilterBar from "../components/FilterBar";

interface HomePageProps {
  searchParams: Promise<{
    search?: string;
    province?: string;
    category?: string;
    price?: string;
    vibe?: string;
    amenities?: string;
  }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedParams = await searchParams;
  const featured = await getFeaturedListings();
  const allProvinces = await getProvinces();
  const allCategories = await getCategories();
  const allGuides = await getGuides();
  const allListings = await getAllListings();

  // Check if search parameters are active
  const hasFilters =
    resolvedParams.search ||
    resolvedParams.province ||
    resolvedParams.category ||
    resolvedParams.price ||
    resolvedParams.vibe ||
    resolvedParams.amenities;

  // Filter listings based on active parameters
  let filteredListings = [...allListings];

  if (hasFilters) {
    if (resolvedParams.search) {
      const q = resolvedParams.search.toLowerCase();
      filteredListings = filteredListings.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.shortDescription.toLowerCase().includes(q) ||
          l.city.toLowerCase().includes(q) ||
          l.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (resolvedParams.province && resolvedParams.province !== "all") {
      filteredListings = filteredListings.filter(
        (l) => l.province.toLowerCase().replace(/\s+/g, "-") === resolvedParams.province
      );
    }
    if (resolvedParams.category && resolvedParams.category !== "all") {
      filteredListings = filteredListings.filter((l) =>
        l.category.some((cat) => cat.toLowerCase() === resolvedParams.category)
      );
    }
    if (resolvedParams.price && resolvedParams.price !== "all") {
      filteredListings = filteredListings.filter((l) => l.priceRange === resolvedParams.price);
    }
    if (resolvedParams.vibe && resolvedParams.vibe !== "all") {
      filteredListings = filteredListings.filter((l) => l.vibes.includes(resolvedParams.vibe as any));
    }
    if (resolvedParams.amenities) {
      const reqAmenities = resolvedParams.amenities.split(",");
      filteredListings = filteredListings.filter((l) =>
        reqAmenities.every((req) =>
          l.amenities.some((amenity) => amenity.toLowerCase().includes(req.toLowerCase()))
        )
      );
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Editorial Header Section */}
      <section className="relative overflow-hidden border-b border-border/50 bg-card py-14 sm:py-16 lg:py-28">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#0A1D37_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mb-5 inline-flex items-center gap-1.5 rounded-full bg-secondary/10 px-3 py-1 text-[11px] font-semibold text-secondary sm:mb-6 sm:px-3.5 sm:text-xs">
            <Sparkles className="h-3.5 w-3.5 fill-secondary" />
            <span>Discover the Bicol Region</span>
          </div>
          <h1 className="mx-auto max-w-5xl font-serif text-[2.55rem] font-extrabold leading-[0.98] tracking-tight text-primary sm:text-5xl md:text-7xl lg:text-8xl">
            Uncover the Peninsula's <br />
            <span className="font-light italic text-accent">Best-Kept Secrets</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground sm:mt-6 sm:max-w-2xl sm:text-base md:text-lg">
            Explore a curated selection of luxury resorts, powder-white sand beaches, cozy eco-staycations, modern boutique hotels, and memorable food stops across southern Luzon.
          </p>
        </div>
      </section>

      {/* Filter and Search Section */}
      <section className="relative z-20 mx-auto -mt-7 w-full max-w-7xl px-4 sm:-mt-9 sm:px-6">
        <Suspense fallback={<div className="h-28 w-full animate-pulse rounded-3xl bg-card" />}>
          <FilterBar />
        </Suspense>
      </section>

      {/* Main Content Area */}
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        {hasFilters ? (
          /* Search Results Grid */
          <section className="space-y-8">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h2 className="font-serif text-3xl font-bold tracking-tight text-primary">
                Search Results ({filteredListings.length})
              </h2>
              <Link href="/" className="text-sm font-semibold text-accent hover:underline">
                Clear Filters
              </Link>
            </div>

            {filteredListings.length > 0 ? (
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {filteredListings.map((listing) => (
                  <ListingCard key={listing.slug} listing={listing} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center bg-card rounded-3xl border border-border/80">
                <Compass className="h-12 w-12 text-muted-foreground animate-bounce" />
                <h3 className="mt-4 font-serif text-xl font-bold text-primary">No destinations found</h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                  Try adjusting your filters or search keywords. You can also view all properties by resetting.
                </p>
                <Link
                  href="/"
                  className="mt-6 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-accent transition-colors"
                >
                  Reset All Filters
                </Link>
              </div>
            )}
          </section>
        ) : (
          /* Standard Editorial Discovery Sections */
          <div className="space-y-24">
            {/* Category Entry Points */}
            <section className="space-y-6">
              <div className="text-center">
                <h2 className="font-serif text-3xl font-bold tracking-tight text-primary md:text-4xl">
                  Browse by Travel Style
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Find the exact type of getaway you&apos;ve been dreaming of
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {allCategories.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/categories/${cat.slug}`}
                    className="group relative flex h-48 flex-col justify-end overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/30 to-transparent z-10" />
                    <img
                      src={cat.coverImage}
                      alt={cat.title}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="relative z-20">
                      <h3 className="font-serif text-2xl font-bold leading-[0.95] tracking-[0.04em] text-white">
                        {cat.title}
                      </h3>
                      <p className="mt-2 text-xs leading-relaxed text-white/80 line-clamp-2">
                        {cat.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* Featured Destinations (Premium Carousel or Grid) */}
            <section className="space-y-8">
              <div className="flex items-end justify-between border-b border-border pb-4">
                <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-accent">
                    Curated Editor&apos;s Choice
                  </span>
                  <h2 className="mt-1 font-serif text-3xl font-bold tracking-tight text-primary md:text-4xl">
                    Featured Stays
                  </h2>
                </div>
                <Link
                  href="/categories/resorts"
                  className="hidden sm:flex items-center gap-1 text-sm font-semibold text-accent hover:underline"
                >
                  <span>View all destinations</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {featured.slice(0, 3).map((listing) => (
                  <ListingCard key={listing.slug} listing={listing} />
                ))}
              </div>
            </section>

            {/* Province Highlights Grid */}
            <section className="space-y-8 bg-card -mx-6 px-6 py-16 sm:-mx-8 sm:px-8 md:rounded-3xl border border-border/40">
              <div className="text-center max-w-2xl mx-auto mb-12">
                <span className="text-xs font-bold uppercase tracking-widest text-secondary">
                  Geography of Bicol
                </span>
                <h2 className="mt-1 font-serif text-3xl font-bold tracking-tight text-primary md:text-4xl">
                  Explore by Province
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  The Bicol Region is made up of six unique provinces, each offering their own stunning vistas, cultural heritage, and travel adventures.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {allProvinces.map((prov) => (
                  <Link
                    key={prov.slug}
                    href={`/locations/${prov.slug}`}
                    className="group relative flex aspect-video flex-col justify-end overflow-hidden rounded-2xl p-6 shadow-sm transition-all duration-300 hover:shadow-md"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/45 to-transparent z-10" />
                    <img
                      src={prov.heroImage}
                      alt={prov.name}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-750 group-hover:scale-103"
                    />
                    <div className="relative z-20">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-accent">
                        Capital: {prov.capital}
                      </span>
                      <h3 className="font-serif text-2xl font-bold text-white mt-1">
                        {prov.name}
                      </h3>
                      <p className="mt-1 text-xs text-white/80 line-clamp-1">
                        {prov.tagline}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* Editorial Guide Blocks */}
            <section className="space-y-8">
              <div className="border-b border-border pb-4">
                <span className="text-xs font-bold uppercase tracking-widest text-accent">
                  BicolStay Magazine
                </span>
                <h2 className="mt-1 font-serif text-3xl font-bold tracking-tight text-primary md:text-4xl">
                  Trip Planning Guides
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                {allGuides.map((guide) => (
                  <article
                    key={guide.slug}
                    className="flex flex-col md:flex-row gap-6 bg-card rounded-3xl border border-border p-6 shadow-sm transition-all hover:shadow-md"
                  >
                    <div className="relative w-full md:w-1/3 aspect-square rounded-2xl overflow-hidden bg-muted flex-shrink-0">
                      <img
                        src={guide.coverImage}
                        alt={guide.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col justify-between py-2">
                      <div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {guide.readTime}
                          </span>
                          <span>•</span>
                          <span>{guide.date}</span>
                        </div>
                        <h3 className="font-serif text-xl font-bold text-primary hover:text-accent transition-colors">
                          {guide.title}
                        </h3>
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                          {guide.excerpt}
                        </p>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">
                          By {guide.author}
                        </span>
                        <Link
                          href={`/guides/${guide.slug}`}
                          className="flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
                        >
                          <span>Read Guide</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
