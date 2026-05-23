import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card text-foreground">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4 lg:gap-8">
          {/* Brand/Editorial statement */}
          <div className="md:col-span-2 pr-0 md:pr-12">
            <Link href="/" className="inline-flex items-center">
              <Image
                src="/logo.png"
                alt="BicolStay logo"
                width={88}
                height={88}
                className="h-32 w-32 object-cover bg-transparent"
              />
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground max-w-sm">
              Discover Bicol&apos;s majestic volcanoes, powder-white sand beach camps, and architectural forest boutiques. Your premium curated guide to the southern peninsula of Luzon, Philippines.
            </p>
            <div className="mt-6">
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                Designed for Discovery
              </span>
              <p className="mt-1 text-xs text-muted-foreground">
                © {new Date().getFullYear()} BicolStay. Curated with care for domestic travelers.
              </p>
            </div>
          </div>

          {/* Quick Links: Categories */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Destinations
            </h3>
            <ul className="mt-4 space-y-2">
              {[
                { name: "Luxury Resorts", path: "resorts" },
                { name: "Beaches & Islands", path: "beaches" },
                { name: "Eco Staycations", path: "staycations" },
                { name: "Boutique Hotels", path: "hotels" },
                { name: "Food & Restaurants", path: "food" },
              ].map((link) => (
                <li key={link.path}>
                  <Link
                    href={`/categories/${link.path}`}
                    className="text-sm text-foreground/80 hover:text-accent transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links: Provinces */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Provinces
            </h3>
            <ul className="mt-4 space-y-2">
              {["Albay", "Camarines Sur", "Camarines Norte", "Catanduanes", "Masbate", "Sorsogon"].map((province) => (
                <li key={province}>
                  <Link
                    href={`/locations/${province.toLowerCase().replace(/\s+/g, "-")}`}
                    className="text-sm text-foreground/80 hover:text-accent transition-colors"
                  >
                    {province}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-border/60 pt-8 flex flex-col md:flex-row justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            BicolStay is an independent directory. All photos belong to their respective owners. Support local eco-tourism.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-xs text-muted-foreground hover:text-accent transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-xs text-muted-foreground hover:text-accent transition-colors">
              Terms of Use
            </Link>
            <Link href="/contact" className="text-xs text-muted-foreground hover:text-accent transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
