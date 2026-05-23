import React, { Suspense } from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug, getListingsByCategory, getCategories } from "../../../lib/db";
import ListingCard from "../../../components/ListingCard";
import FilterBar from "../../../components/FilterBar";
import CategoryClientPage from "./CategoryClientPage";

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Generate static params for all categories for SSG
export async function generateStaticParams() {
  const allCategories = await getCategories();
  return allCategories.map((cat) => ({
    slug: cat.slug,
  }));
}

// Generate page-specific SEO metadata
export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const categoryInfo = await getCategoryBySlug(resolvedParams.slug);

  if (!categoryInfo) {
    return {
      title: "Category Not Found | BicolStay",
    };
  }

  return {
    title: `Best ${categoryInfo.title} in Bicol | BicolStay Curated Directory`,
    description: `${categoryInfo.description} Find prices, locations, amenities, and contact information for top-rated spots.`,
    openGraph: {
      title: `Best ${categoryInfo.title} in Bicol | BicolStay Curated Directory`,
      description: categoryInfo.description,
      url: `https://bicolstay.com/categories/${resolvedParams.slug}`,
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const resolvedParams = await params;
  const categoryInfo = await getCategoryBySlug(resolvedParams.slug);
  if (!categoryInfo) {
    notFound();
  }

  const listings = await getListingsByCategory(resolvedParams.slug);

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-12 lg:px-8">
      {/* Category Header */}
      <header className="mb-10 text-center md:text-left border-b border-border/60 pb-8">
        <span className="text-xs font-bold uppercase tracking-widest text-accent">
          Vertical Directory
        </span>
        <h1 className="mt-1 font-serif text-4xl font-extrabold tracking-tight text-primary md:text-5xl">
          {categoryInfo.title} in Bicol
        </h1>
        <p className="mt-3 max-w-2xl text-base text-muted-foreground leading-relaxed">
          {categoryInfo.description} Browse our handpicked selections and filter by budget or vibe.
        </p>
      </header>

      {/* Filter and listings container */}
      <Suspense fallback={<div className="h-64 w-full bg-card rounded-3xl animate-pulse" />}>
        <CategoryClientPage listings={listings} categorySlug={resolvedParams.slug} />
      </Suspense>
    </div>
  );
}
