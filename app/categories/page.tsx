import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { getCategories } from "../../lib/db";

export const metadata: Metadata = {
  title: "Browse Categories in Bicol | BicolStay",
  description:
    "Explore resorts, beaches, staycations, hotels, and food destinations across the Bicol Region.",
};

export default async function CategoriesIndexPage() {
  const allCategories = await getCategories();

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-12 lg:px-8">
      <header className="mb-10 border-b border-border/60 pb-8 text-center md:text-left">
        <span className="text-xs font-bold uppercase tracking-widest text-accent">
          Browse Categories
        </span>
        <h1 className="mt-2 font-serif text-4xl font-extrabold tracking-[0.04em] text-primary md:text-5xl">
          Explore Bicol by Travel Style
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
          Jump into the exact kind of destination you want, from white-sand beaches to city hotels
          and local food stops.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {allCategories.map((category) => (
          <Link
            key={category.slug}
            href={`/categories/${category.slug}`}
            className="group relative flex h-56 flex-col justify-end overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
          >
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-primary/85 via-primary/30 to-transparent" />
            <img
              src={category.coverImage}
              alt={category.title}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="relative z-20">
              <h2 className="font-serif text-3xl font-bold leading-[0.95] tracking-[0.04em] text-white">
                {category.title}
              </h2>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/85">
                {category.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
