"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Compass, Map, Layers, FileText } from "lucide-react";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="group flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="BicolStay logo"
            width={88}
            height={88}
            className="h-16 w-16 object-cover bg-transparent"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm font-medium text-foreground/80 transition-colors hover:text-accent"
          >
            <Compass className="h-4 w-4" />
            Home
          </Link>
          <div className="relative group">
            <Link
              href="/categories"
              className="flex items-center gap-1.5 text-sm font-medium text-foreground/80 transition-colors hover:text-accent"
            >
              <Layers className="h-4 w-4" />
              Categories
            </Link>
            <div className="absolute left-1/2 top-full z-10 mt-2 w-48 -translate-x-1/2 rounded-xl border border-border bg-card p-2 opacity-0 shadow-lg transition-all duration-200 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto">
              <Link
                href="/categories/resorts"
                className="block rounded-lg px-4 py-2.5 text-sm text-foreground hover:bg-muted hover:text-accent"
              >
                Resorts
              </Link>
              <Link
                href="/categories/beaches"
                className="block rounded-lg px-4 py-2.5 text-sm text-foreground hover:bg-muted hover:text-accent"
              >
                Beaches & Islands
              </Link>
              <Link
                href="/categories/staycations"
                className="block rounded-lg px-4 py-2.5 text-sm text-foreground hover:bg-muted hover:text-accent"
              >
                Staycations
              </Link>
              <Link
                href="/categories/hotels"
                className="block rounded-lg px-4 py-2.5 text-sm text-foreground hover:bg-muted hover:text-accent"
              >
                Hotels
              </Link>
              <Link
                href="/categories/food"
                className="block rounded-lg px-4 py-2.5 text-sm text-foreground hover:bg-muted hover:text-accent"
              >
                Food & Restaurants
              </Link>
            </div>
          </div>
          <div className="relative group">
            <Link
              href="/locations"
              className="flex items-center gap-1.5 text-sm font-medium text-foreground/80 transition-colors hover:text-accent"
            >
              <Map className="h-4 w-4" />
              Provinces
            </Link>
            <div className="absolute left-1/2 top-full z-10 mt-2 w-48 -translate-x-1/2 rounded-xl border border-border bg-card p-2 opacity-0 shadow-lg transition-all duration-200 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto">
              {["Albay", "Camarines Sur", "Camarines Norte", "Catanduanes", "Masbate", "Sorsogon"].map((province) => (
                <Link
                  key={province}
                  href={`/locations/${province.toLowerCase().replace(/\s+/g, "-")}`}
                  className="block rounded-lg px-4 py-2.5 text-sm text-foreground hover:bg-muted hover:text-accent"
                >
                  {province}
                </Link>
              ))}
            </div>
          </div>
          <Link
            href="/guides"
            className="flex items-center gap-1.5 text-sm font-medium text-foreground/80 transition-colors hover:text-accent"
          >
            <FileText className="h-4 w-4" />
            Guides
          </Link>
        </nav>

        {/* CTA Button */}
        <div className="hidden md:flex items-center">
          <Link
            href="/categories/resorts"
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-accent transition-colors duration-300"
          >
            Start Exploring
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-foreground hover:bg-muted md:hidden"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden border-t border-border bg-card p-6 shadow-inner animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col gap-6">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 text-base font-medium text-foreground hover:text-accent"
            >
              <Compass className="h-5 w-5 text-accent" />
              Home
            </Link>
            <Link
              href="/categories"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 text-base font-medium text-foreground hover:text-accent"
            >
              <Layers className="h-5 w-5 text-accent" />
              Categories
            </Link>

            <div className="flex flex-col gap-3">
              <span className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Layers className="h-4 w-4" /> Categories
              </span>
              <div className="grid grid-cols-2 gap-2 pl-7">
                {[
                  { name: "Resorts", path: "resorts" },
                  { name: "Beaches", path: "beaches" },
                  { name: "Staycations", path: "staycations" },
                  { name: "Hotels", path: "hotels" },
                  { name: "Food", path: "food" },
                ].map((cat) => (
                  <Link
                    key={cat.path}
                    href={`/categories/${cat.path}`}
                    onClick={() => setIsOpen(false)}
                    className="text-sm font-medium text-foreground/80 hover:text-accent py-1"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
            <Link
              href="/locations"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 text-base font-medium text-foreground hover:text-accent"
            >
              <Map className="h-5 w-5 text-accent" />
              Provinces
            </Link>

            <div className="flex flex-col gap-3">
              <span className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Map className="h-4 w-4" /> Provinces
              </span>
              <div className="grid grid-cols-2 gap-2 pl-7">
                {["Albay", "Camarines Sur", "Camarines Norte", "Catanduanes", "Masbate", "Sorsogon"].map((prov) => (
                  <Link
                    key={prov}
                    href={`/locations/${prov.toLowerCase().replace(/\s+/g, "-")}`}
                    onClick={() => setIsOpen(false)}
                    className="text-sm font-medium text-foreground/80 hover:text-accent py-1"
                  >
                    {prov}
                  </Link>
                ))}
              </div>
            </div>

            <Link
              href="/guides"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 text-base font-medium text-foreground hover:text-accent"
            >
              <FileText className="h-5 w-5 text-accent" />
              Guides
            </Link>

            <Link
              href="/categories/resorts"
              onClick={() => setIsOpen(false)}
              className="flex w-full items-center justify-center rounded-full bg-accent py-3 text-center text-sm font-semibold text-accent-foreground shadow-sm hover:bg-primary transition-colors"
            >
              Start Exploring
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
