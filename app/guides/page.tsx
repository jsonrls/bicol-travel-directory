import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { getGuides } from "../../lib/db";

export const metadata: Metadata = {
  title: "Bicol Travel Guides | BicolStay",
  description:
    "Read practical Bicol travel guides covering first-timer itineraries, surf destinations, seasonal tips, and regional highlights.",
};

export default async function GuidesPage() {
  const guides = await getGuides();

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-12 lg:px-8">
      <header className="border-b border-border/60 pb-8">
        <span className="text-xs font-bold uppercase tracking-widest text-accent">
          BicolStay Magazine
        </span>
        <h1 className="mt-2 font-serif text-4xl font-extrabold tracking-tight text-primary md:text-5xl">
          Travel Guides
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
          Planning notes, local context, and destination ideas to help you make the most of your
          next trip across the Bicol region.
        </p>
      </header>

      <section className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2">
        {guides.map((guide) => (
          <article
            key={guide.slug}
            className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
          >
            <div className="relative aspect-[16/9] overflow-hidden bg-muted">
              <img src={guide.coverImage} alt={guide.title} className="h-full w-full object-cover" />
            </div>
            <div className="space-y-4 p-6">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {guide.readTime}
                </span>
                <span>{guide.date}</span>
              </div>
              <div>
                <h2 className="font-serif text-2xl font-bold text-primary">{guide.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {guide.excerpt}
                </p>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-medium text-muted-foreground">By {guide.author}</span>
                <Link
                  href={`/guides/${guide.slug}`}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-accent hover:underline"
                >
                  Read guide
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
