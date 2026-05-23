import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { getProvinces } from "../../lib/db";

export const metadata: Metadata = {
  title: "Browse Provinces in Bicol | BicolStay",
  description:
    "Explore Albay, Camarines Sur, Camarines Norte, Catanduanes, Masbate, and Sorsogon with curated destination picks.",
};

export default async function LocationsIndexPage() {
  const allProvinces = await getProvinces();

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-12 lg:px-8">
      <header className="mb-10 border-b border-border/60 pb-8 text-center md:text-left">
        <span className="text-xs font-bold uppercase tracking-widest text-accent">
          Browse Provinces
        </span>
        <h1 className="mt-2 font-serif text-4xl font-extrabold tracking-[0.04em] text-primary md:text-5xl">
          Explore the Bicol Region
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
          View destinations province by province and discover each area&apos;s signature landscapes,
          capital city, and travel personality.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {allProvinces.map((province) => (
          <Link
            key={province.slug}
            href={`/locations/${province.slug}`}
            className="group relative flex aspect-video flex-col justify-end overflow-hidden rounded-2xl border border-border p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
          >
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent" />
            <img
              src={province.heroImage}
              alt={province.name}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="relative z-20">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent-foreground/90">
                Capital: {province.capital}
              </span>
              <h2 className="mt-1 font-serif text-3xl font-bold leading-[0.95] tracking-[0.04em] text-white">
                {province.name}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-white/85">
                {province.tagline}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
