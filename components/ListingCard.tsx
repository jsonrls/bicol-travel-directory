import React from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Star } from "lucide-react";
import { Listing } from "../lib/types";

interface ListingCardProps {
  listing: Listing;
}

export default function ListingCard({ listing }: ListingCardProps) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
      {/* Listing Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        <img
          src={listing.heroImage}
          alt={listing.name}
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {/* Featured Badge */}
        {listing.featured && (
          <div className="absolute left-4 top-4 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground shadow-sm">
            Featured Choice
          </div>
        )}
        {/* Rating Badge */}
        <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-background/90 backdrop-blur-sm px-2.5 py-1 text-xs font-semibold text-primary shadow-sm">
          <Star className="h-3 w-3 fill-accent text-accent" />
          <span>{listing.rating.toFixed(1)}</span>
        </div>
      </div>

      {/* Listing Content */}
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center justify-between">
          {/* Location */}
          <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <MapPin className="h-3 w-3 text-accent" />
            <span>
              {listing.city}, {listing.province}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="mt-3 text-xl font-bold leading-snug text-primary group-hover:text-accent transition-colors">
          <Link href={`/listings/${listing.slug}`}>
            <span className="absolute inset-0 z-10" />
            {listing.name}
          </Link>
        </h3>

        {/* Short Description */}
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-2">
          {listing.shortDescription}
        </p>

        {/* Vibe & Category Tags */}
        <div className="mt-auto pt-4 flex flex-wrap gap-1.5">
          {listing.vibes.map((vibe) => (
            <span
              key={vibe}
              className="inline-flex items-center rounded-full bg-secondary/10 px-2.5 py-0.5 text-xs font-medium text-secondary"
            >
              #{vibe}
            </span>
          ))}
          {listing.tags.slice(0, 1).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
