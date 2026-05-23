"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, SlidersHorizontal, RotateCcw, Check, ChevronDown } from "lucide-react";
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
    <div className="w-full rounded-[2rem] border border-border/80 bg-card/95 p-4 shadow-[0_18px_40px_-28px_rgba(10,29,55,0.45)] backdrop-blur-sm sm:p-5 lg:rounded-[2.25rem] lg:p-6">
      {/* Search Input and Basic Filters */}
      <form onSubmit={handleSearchSubmit} className="flex flex-col gap-3.5 lg:flex-row lg:items-center lg:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground sm:h-5 sm:w-5" />
          <input
            type="search"
            placeholder="Search destination, keywords, or tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSearchSubmit(e);
              }
            }}
            enterKeyHint="search"
            className="h-14 w-full rounded-full border border-border/90 bg-background/95 py-3 pl-11 pr-4 text-[15px] text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent sm:pl-12 sm:pr-5 sm:text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
          {/* Province Filter */}
          {showProvinceFilter && (
            <div className="relative col-span-2 sm:col-span-1">
              <select
                value={province}
                onChange={(e) => {
                  setProvince(e.target.value);
                  applyFilters({ province: e.target.value });
                }}
                className="h-11 min-w-0 w-full appearance-none rounded-full border border-border/90 bg-background/95 px-3.5 py-2 pr-10 text-left text-[13px] font-medium text-foreground hover:border-accent focus:outline-none sm:h-14 sm:px-5 sm:pr-12 sm:text-sm"
              >
                <option value="all">All Provinces</option>
                {availableProvinces.map((prov) => (
                  <option key={prov} value={prov.toLowerCase().replace(/\s+/g, "-")}>
                    {prov}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground sm:right-4" />
            </div>
          )}

          {/* Category Filter */}
          {showCategoryFilter && (
            <div className="relative">
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  applyFilters({ category: e.target.value });
                }}
                className="h-11 min-w-0 w-full appearance-none rounded-full border border-border/90 bg-background/95 px-3.5 py-2 pr-10 text-left text-[13px] font-medium text-foreground hover:border-accent focus:outline-none sm:h-14 sm:px-5 sm:pr-12 sm:text-sm"
              >
                <option value="all">All Categories</option>
                {availableCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground sm:right-4" />
            </div>
          )}

          {/* More Filters Toggle */}
          <button
            type="button"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className={`h-11 min-w-0 justify-center rounded-full border px-3.5 py-2 text-[13px] font-semibold transition-all sm:h-14 sm:px-5 sm:text-sm ${
              showMobileFilters || hasActiveFilters
                ? "border-accent bg-accent/8 text-accent shadow-[0_8px_20px_-16px_rgba(211,84,0,0.6)]"
                : "border-border/90 bg-background/95 text-foreground hover:bg-muted"
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <SlidersHorizontal className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Refine</span>
            </span>
          </button>

          {/* Reset button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="col-span-2 flex h-12 items-center justify-center gap-2 rounded-full border border-border/90 bg-background/95 px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-accent sm:h-14 sm:w-14 sm:px-0"
              title="Reset Filters"
            >
              <RotateCcw className="h-4 w-4" />
              <span className="sm:hidden">Reset filters</span>
            </button>
          )}
        </div>
      </form>

      {/* Expanded refinement area (desktop panel & mobile toggle) */}
      {showMobileFilters && (
        <div className="animate-in fade-in slide-in-from-top-2 mt-5 border-t border-border/60 pt-5 duration-200 sm:mt-6 sm:pt-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
            {/* Price Level */}
            <div>
              <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Price Budget Level
              </h4>
              <div className="grid grid-cols-2 gap-2 xl:flex">
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
                    className={`min-h-11 rounded-full border px-3 py-2 text-center text-xs font-semibold transition-all xl:flex-1 ${
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
              <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
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
                    className={`min-h-11 rounded-full border px-3.5 py-2 text-xs font-semibold transition-all sm:px-4 ${
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
              <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
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
                      className={`flex min-h-11 items-center gap-1 rounded-full border px-3.5 py-2 text-xs font-semibold transition-all ${
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

          <div className="mt-5 flex justify-center border-t border-border/40 pt-4 sm:mt-6 sm:justify-end">
            <span className="text-center text-[11px] text-muted-foreground sm:text-xs">
              Showing matching destinations instantly
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
