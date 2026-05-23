"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, SlidersHorizontal, RotateCcw, Check } from "lucide-react";
import { PriceRange, TravelVibe } from "../lib/types";

interface FilterBarProps {
  showCategoryFilter?: boolean;
  showProvinceFilter?: boolean;
  availableProvinces?: string[];
  availableCategories?: string[];
}

export default function FilterBar({
  showCategoryFilter = true,
  showProvinceFilter = true,
  availableProvinces = ["Albay", "Camarines Sur", "Camarines Norte", "Catanduanes", "Masbate", "Sorsogon"],
  availableCategories = ["resorts", "beaches", "staycations", "hotels", "food"],
}: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // State mapping
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [province, setProvince] = useState(searchParams.get("province") || "all");
  const [category, setCategory] = useState(searchParams.get("category") || "all");
  const [price, setPrice] = useState<PriceRange | "all">((searchParams.get("price") as PriceRange) || "all");
  const [vibe, setVibe] = useState<TravelVibe | "all">((searchParams.get("vibe") as TravelVibe) || "all");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    searchParams.get("amenities") ? searchParams.get("amenities")!.split(",") : []
  );
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const amenitiesList = [
    { label: "Beach Front", value: "Beach" },
    { label: "Pool", value: "Pool" },
    { label: "Wi-Fi", value: "Wi-Fi" },
    { label: "Spa & Massage", value: "Spa" },
    { label: "Sports & Surf", value: "Surf" },
  ];

  // Sync state with URL params on back/forward navigation
  useEffect(() => {
    setSearch(searchParams.get("search") || "");
    setProvince(searchParams.get("province") || "all");
    setCategory(searchParams.get("category") || "all");
    setPrice((searchParams.get("price") as PriceRange) || "all");
    setVibe((searchParams.get("vibe") as TravelVibe) || "all");
    setSelectedAmenities(searchParams.get("amenities") ? searchParams.get("amenities")!.split(",") : []);
  }, [searchParams]);

  // Apply filters by pushing new query string
  const applyFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    // Update query params based on keys
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "all" || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters({ search });
  };

  const toggleAmenity = (amenity: string) => {
    let nextAmenities: string[];
    if (selectedAmenities.includes(amenity)) {
      nextAmenities = selectedAmenities.filter((a) => a !== amenity);
    } else {
      nextAmenities = [...selectedAmenities, amenity];
    }
    setSelectedAmenities(nextAmenities);
    applyFilters({ amenities: nextAmenities.length > 0 ? nextAmenities.join(",") : null });
  };

  const resetFilters = () => {
    setSearch("");
    setProvince("all");
    setCategory("all");
    setPrice("all");
    setVibe("all");
    setSelectedAmenities([]);
    router.push(pathname, { scroll: false });
  };

  const hasActiveFilters =
    searchParams.has("search") ||
    searchParams.has("province") ||
    searchParams.has("category") ||
    searchParams.has("price") ||
    searchParams.has("vibe") ||
    searchParams.has("amenities");

  return (
    <div className="w-full bg-card rounded-3xl border border-border p-6 shadow-sm">
      {/* Search Input and Basic Filters */}
      <form onSubmit={handleSearchSubmit} className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search destination, keywords, or tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border border-border bg-background py-3.5 pl-12 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Province Filter */}
          {showProvinceFilter && (
            <select
              value={province}
              onChange={(e) => {
                setProvince(e.target.value);
                applyFilters({ province: e.target.value });
              }}
              className="rounded-full border border-border bg-background px-5 py-3 text-sm font-medium text-foreground hover:border-accent focus:outline-none"
            >
              <option value="all">All Provinces</option>
              {availableProvinces.map((prov) => (
                <option key={prov} value={prov.toLowerCase().replace(/\s+/g, "-")}>
                  {prov}
                </option>
              ))}
            </select>
          )}

          {/* Category Filter */}
          {showCategoryFilter && (
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                applyFilters({ category: e.target.value });
              }}
              className="rounded-full border border-border bg-background px-5 py-3 text-sm font-medium text-foreground hover:border-accent focus:outline-none"
            >
              <option value="all">All Categories</option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          )}

          {/* More Filters Toggle */}
          <button
            type="button"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className={`flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-medium transition-all ${
              showMobileFilters || hasActiveFilters
                ? "border-accent bg-accent/5 text-accent"
                : "border-border bg-background text-foreground hover:bg-muted"
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Refine</span>
          </button>

          {/* Reset button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-background text-muted-foreground hover:bg-muted hover:text-accent transition-colors"
              title="Reset Filters"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          )}
        </div>
      </form>

      {/* Expanded refinement area (desktop panel & mobile toggle) */}
      {showMobileFilters && (
        <div className="mt-6 border-t border-border/60 pt-6 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Price Level */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Price Budget Level
              </h4>
              <div className="flex gap-2">
                {[
                  { value: "all", label: "Any" },
                  { value: "budget", label: "₱ Budget" },
                  { value: "mid-range", label: "₱₱ Mid" },
                  { value: "luxury", label: "₱₱₱ Luxe" },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => {
                      setPrice(item.value as any);
                      applyFilters({ price: item.value });
                    }}
                    className={`flex-1 rounded-full py-2 text-center text-xs font-semibold border transition-all ${
                      price === item.value
                        ? "border-accent bg-accent text-accent-foreground shadow-sm"
                        : "border-border bg-background text-foreground hover:bg-muted"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Travel Vibe */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Travel Vibe
              </h4>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "all", label: "Any Vibe" },
                  { value: "family", label: "Family" },
                  { value: "romantic", label: "Romantic" },
                  { value: "barkada", label: "Barkada" },
                  { value: "budget", label: "Backpacker" },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => {
                      setVibe(item.value as any);
                      applyFilters({ vibe: item.value });
                    }}
                    className={`rounded-full px-4 py-2 text-xs font-semibold border transition-all ${
                      vibe === item.value
                        ? "border-secondary bg-secondary text-secondary-foreground shadow-sm"
                        : "border-border bg-background text-foreground hover:bg-muted"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Key Amenities */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Key Amenities
              </h4>
              <div className="flex flex-wrap gap-2">
                {amenitiesList.map((amenity) => {
                  const active = selectedAmenities.includes(amenity.value);
                  return (
                    <button
                      key={amenity.value}
                      type="button"
                      onClick={() => toggleAmenity(amenity.value)}
                      className={`flex items-center gap-1 rounded-full px-3.5 py-2 text-xs font-semibold border transition-all ${
                        active
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-border bg-background text-foreground hover:bg-muted"
                      }`}
                    >
                      {active && <Check className="h-3 w-3" />}
                      <span>{amenity.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2 border-t border-border/40 pt-4">
            <span className="text-xs text-muted-foreground">
              Showing matching destinations instantly
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
