import React, { Suspense } from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProvinceBySlug, getListingsByProvince, getProvinces } from "../../../lib/db";
import ListingCard from "../../../components/ListingCard";
import FilterBar from "../../../components/FilterBar";
import LocationClientPage from "./LocationClientPage";

interface LocationPageProps {
  params: Promise<{
    province: string;
  }>;
}

// Generate static params for all 6 Bicol provinces for SSG
export async function generateStaticParams() {
  const allProvinces = await getProvinces();
  return allProvinces.map((prov) => ({
    province: prov.slug,
  }));
}

// Generate province-specific SEO metadata
export async function generateMetadata({ params }: LocationPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const provinceInfo = await getProvinceBySlug(resolvedParams.province);

  if (!provinceInfo) {
    return {
      title: "Province Not Found | BicolStay",
    };
  }

  return {
    title: `Travel Guide to ${provinceInfo.name} | Resorts, Hotels & Beaches`,
    description: `${provinceInfo.tagline}. ${provinceInfo.description} Discover top-rated destinations and local attractions in ${provinceInfo.name}.`,
    openGraph: {
      title: `Travel Guide to ${provinceInfo.name} | Resorts, Hotels & Beaches`,
      description: provinceInfo.description,
      url: `https://bicolstay.com/locations/${resolvedParams.province}`,
    },
  };
}

export default async function LocationPage({ params }: LocationPageProps) {
  const resolvedParams = await params;
  const provinceInfo = await getProvinceBySlug(resolvedParams.province);
  if (!provinceInfo) {
    notFound();
  }

  const listings = await getListingsByProvince(resolvedParams.province);

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-12 lg:px-8">
      {/* Province Editorial Hero Header */}
      <header className="relative overflow-hidden rounded-3xl bg-card border border-border/40 p-8 md:p-12 mb-10">
        <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(#0A1D37_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="max-w-2xl space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent">
                Province of Bicol
              </span>
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                Capital: {provinceInfo.capital}
              </span>
            </div>
            <h1 className="font-serif text-4xl font-extrabold tracking-tight text-primary md:text-5xl lg:text-6xl">
              {provinceInfo.name}
            </h1>
            <p className="font-serif text-lg md:text-xl font-light italic text-secondary leading-relaxed">
              {provinceInfo.tagline}
            </p>
            <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
              {provinceInfo.description}
            </p>
          </div>

          {/* Key attractions box */}
          <div className="w-full lg:w-80 rounded-2xl border border-border bg-background p-6 flex-shrink-0 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-3">
              Must-Visit Attractions
            </h3>
            <ul className="space-y-2">
              {provinceInfo.attractions.map((attraction) => (
                <li key={attraction} className="flex items-center gap-2 text-sm text-foreground/80 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent flex-shrink-0" />
                  <span>{attraction}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </header>

      {/* Dynamic filtering and results listing */}
      <Suspense fallback={<div className="h-64 w-full bg-card rounded-3xl animate-pulse" />}>
        <LocationClientPage listings={listings} provinceName={provinceInfo.name} />
      </Suspense>
    </div>
  );
}
