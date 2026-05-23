"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { Compass } from "lucide-react";
import { Listing } from "../../../lib/types";
import ListingCard from "../../../components/ListingCard";
import FilterBar from "../../../components/FilterBar";

interface LocationClientPageProps {
  listings: Listing[];
  provinceName: string;
}

export default function LocationClientPage({ listings, provinceName }: LocationClientPageProps) {
  const searchParams = useSearchParams();

  // Read current active URL filters
  const search = searchParams.get("search");
  const category = searchParams.get("category");
  const price = searchParams.get("price");
  const vibe = searchParams.get("vibe");
  const amenities = searchParams.get("amenities");

  // Perform filtering
  let filtered = [...listings];

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.shortDescription.toLowerCase().includes(q) ||
        l.city.toLowerCase().includes(q) ||
        l.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  if (category && category !== "all") {
    filtered = filtered.filter((l) =>
      l.category.some((cat) => cat.toLowerCase() === category)
    );
  }

  if (price && price !== "all") {
    filtered = filtered.filter((l) => l.priceRange === price);
  }

  if (vibe && vibe !== "all") {
    filtered = filtered.filter((l) => l.vibes.includes(vibe as any));
  }

  if (amenities) {
    const reqAmenities = amenities.split(",");
    filtered = filtered.filter((l) =>
      reqAmenities.every((req) =>
        l.amenities.some((amenity) => amenity.toLowerCase().includes(req.toLowerCase()))
      )
    );
  }

  return (
    <div className="space-y-10">
      {/* Search and Filters, hide Province dropdown since it is set */}
      <FilterBar showProvinceFilter={false} />

      {/* Results grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-primary">
            Showing {filtered.length} {filtered.length === 1 ? "destination" : "destinations"} in {provinceName}
          </h2>
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((listing) => (
              <ListingCard key={listing.slug} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-3xl border border-border/80">
            <Compass className="h-12 w-12 text-muted-foreground animate-bounce" />
            <h3 className="mt-4 font-serif text-xl font-bold text-primary">No destinations match your filters</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm">
              Try adjusting your selections above, or clear refinements to see all properties in {provinceName}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
